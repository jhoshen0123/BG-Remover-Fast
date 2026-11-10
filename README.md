# BG Remover Fast – 100% Free AI Background Remover

An ultra-fast, 100% free, privacy-first AI background removal web application built with React, TypeScript, and Tailwind CSS. Built to be completely free forever for everyone, with original HD resolution exports, unlimited batch processing, and zero watermarks or paywalls.

---

## 1. AI Inference Architecture & Technical Decision

### Chosen Approach: Hybrid Architecture with Client-Side Default

BG Remover Fast employs a **dual-tier inference engine**:

1. **Client-Side High-Speed Engine (Default & 100% Private)**
   - **How it works**: Uses HTML5 Canvas, WebGL shaders, and intelligent boundary-color saliency segmentation with morphological edge dilation and continuous Laplacian alpha matting.
   - **Why this was chosen**:
     - **Zero Server Cost**: Computations run on the user's local CPU/GPU via WebGL/WASM.
     - **Absolute Privacy**: Image pixels **never leave the user's device**. Ideal for medical records, sensitive documents, and personal photos.
     - **Instant Processing**: Sub-second execution latency without queueing or network bandwidth constraints.
   - **Model & Algorithmic License**: Permissive **MIT / Apache 2.0**. Commercial use is 100% unrestricted.

2. **Server-Side AI Deep Refine (Cloud Mode)**
   - **How it works**: Accessible via `/api/remove-bg`, utilizing multimodal vision segmentation to compute intricate contour guidance for difficult, fuzzy textures (complex wisps of hair, animal fur, transparent glass).
   - **Privacy Policy**: Ephemeral memory processing; images are processed in RAM and automatically purged immediately. No images are ever saved to disk or logged.

### Model Commercial Licensing Notice
- **RMBG-1.4 / BiRefNet**: While high quality, BRIA AI's RMBG weights require a commercial enterprise agreement for commercial SaaS distribution.
- **U2-Net / MODNet**: Permissive open-source models (Apache 2.0 / MIT) that can be deployed commercially without royalties.
- **EraseCraft Client Engine**: Built with open-source algorithms and MIT-licensed image processing libraries, ensuring 100% commercial freedom for users and sellers.

---

## 2. Core Features

- **Multi-source Inputs**: Drag-and-drop, native file picker, paste from clipboard (`Ctrl+V`), and external image URL fetcher with an anti-CORS proxy.
- **Supported Formats**: JPG, PNG, WebP, SVG, and HEIC up to 25 MB with automatic HD memory handling.
- **Interactive Before/After Slider**: Split-screen draggable comparison slider to inspect edges before exporting.
- **Manual Refine Brush**: Real-time Erase and Restore brushes with configurable brush diameter and undo/redo history.
- **Background Replacer**:
  - Transparent checkerboard
  - Curated solid colors (Off-white, Passport Blue, Studio Grey, Deep Black, etc.)
  - Radial & linear studio gradients
  - Blurred original background (with intensity slider)
  - Custom uploaded background images
- **Effects & Shadow Studio**:
  - Drop shadow (blur, opacity, X/Y offset, color)
  - 3D ground contact shadow
  - Sticker outline / border (popular for YouTube thumbnails and stickers)
- **Presets & Crop**:
  - 1:1 Square (Instagram / Profile Avatars)
  - 4:5 Portrait (Social posts)
  - 16:9 Landscape (YouTube Thumbnails)
  - 9:16 Vertical (TikTok / Reels)
  - Standard Passport Photo (2x2" framing with white or blue background)
  - E-Commerce Product Studio (White background with 15% center padding)
- **Batch Processing**:
  - Drag and drop up to 20 images at once.
  - Concurrent processing queue with status indicators.
  - 1-Click "Download All as ZIP" archive.
- **Bilingual Interface**: Full native support for **English** and **Bangla (বাংলা)**.
- **Dark / Light Mode**: Theme toggling with smooth transitions.

---

## 3. Getting Started

### Prerequisites
- Node.js 18+ or Node.js 20+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```
