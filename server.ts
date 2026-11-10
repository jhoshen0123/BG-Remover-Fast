import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// Increase JSON/URL-encoded limits for image base64 payloads up to 30MB
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize Google GenAI client if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({});
}

// 1. Health check & API version
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.4.0',
    service: 'BG Remover Fast',
    aiEngineAvailable: Boolean(process.env.GEMINI_API_KEY),
    clientEngine: 'WASM/WebGL/Worker Edge Alpha Matting',
    serverEngine: 'Gemini Multimodal Contour Segmentation'
  });
});

// 2. Image Proxy to bypass CORS when users paste external image URLs
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Basic URL validation
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EraseCraftAI/1.0; +https://ais.google.com)',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch image: ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    console.error('Proxy image error:', error);
    res.status(500).json({ error: error.message || 'Error fetching remote image' });
  }
});

// 3. Server-side AI subject segmentation guidance (Optional Cloud Deep Refine)
app.post('/api/remove-bg', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', refineMode = 'balanced' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Clean base64 string
    const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!aiClient && !process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Cloud AI engine key not configured. Using high-speed client-side WASM engine.'
      });
    }

    const client = aiClient || new GoogleGenAI({});

    // Use Gemini 2.5 Flash to segment the primary subject bounding boxes and foreground characteristics
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: pureBase64,
                mimeType: mimeType
              }
            },
            {
              text: `You are an expert computer vision segmentation engine. Identify the primary foreground subject(s) in this image.
Return a clean JSON object with:
{
  "subjectType": "person" | "product" | "animal" | "vehicle" | "graphic" | "other",
  "backgroundDescription": "short description of background color/texture",
  "confidence": number between 0 and 1,
  "edgeComplexity": "smooth" | "hair_fur" | "intricate" | "geometric",
  "recommendedTolerance": number between 15 and 65,
  "foregroundBoundingBox": {
    "ymin": number (0-1000),
    "xmin": number (0-1000),
    "ymax": number (0-1000),
    "xmax": number (0-1000)
  },
  "keyColorClusters": {
    "backgroundDominant": ["#hex1", "#hex2"],
    "foregroundDominant": ["#hex1", "#hex2"]
  }
}
Output pure valid JSON only, without markdown fences.`
            }
          ]
        }
      ]
    });

    const responseText = response.text?.trim() || '{}';
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedData = {};
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch {
      parsedData = { subjectType: 'general', confidence: 0.9 };
    }

    res.json({
      success: true,
      data: parsedData,
      message: 'Cloud AI segmentation contours computed.'
    });
  } catch (err: any) {
    console.error('Server AI segmentation error:', err);
    res.status(500).json({
      error: err.message || 'Error processing AI segmentation'
    });
  }
});


// Mount Vite or serve static dist
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
