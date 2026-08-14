# AI Skin Doctor - Complete AI-Powered Web Application

AI Skin Doctor is an intelligent, full-stack AI dermatologist assistant capable of analyzing skin photos, video keyframes, and spoken symptoms to generate educational preliminary assessments.

---

## 🌟 Key Features

* **Voice Description (Speech Input)**: Speak symptoms freely using browser `SpeechRecognition` API with real-time transcript streaming.
* **Multimodal Uploads (Photos & Video)**: Upload multiple skin photos or short video clips. Automatically extracts video keyframes using HTML5 Canvas.
* **Patient Questionnaire**: Fitzpatrick skin tone scale, skin type selector, duration slider, and interactive symptom checkboxes.
* **Gemini 2.5 Flash Vision Analysis**: Secure Express backend proxies `@google/genai` to analyze visual lesion features, symmetry, and color variations with structured JSON output.
* **Annotated Image Canvas**: Highlights lesion boundaries and focal regions directly on the uploaded skin photo.
* **AI Risk Meter Gauge**: Animated risk gauge (Low, Moderate, High, Urgent) with AI confidence score.
* **Multilingual Voice Readout**: Listen to assessment readouts in 7 languages (English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi) using browser `SpeechSynthesis` API.
* **Interactive AI Chat Assistant**: Ask follow-up questions ("Can I use Vitamin C?", "Will this spread?", "Is sunscreen safe?") with session memory.
* **Skin Progress Tracker**: Upload Before & After photos to evaluate healing trends, improvement percentages, texture changes, and swelling reduction.
* **PDF Report Generation**: Download printable PDF reports with patient profile, condition findings, recommendations, and emergency red flags.
* **Nearby Dermatologists Finder**: Find verified skin doctors, clinics, and specialty hospitals with direct Google Maps directions.
* **100% Free & Browser-Private**: Uses local IndexedDB & LocalStorage for storage—no external cloud databases required.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, jsPDF
* **Backend**: Node.js, Express.js (`server.ts`), `tsx` runner, `esbuild` CommonJS compiler
* **AI Engine**: Google Gemini 2.5 Flash via `@google/genai` TypeScript SDK
* **Browser Capabilities**: `SpeechRecognition`, `SpeechSynthesis`, HTML5 Video, Canvas API, IndexedDB

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file or export the key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🚢 Free Tier Deployment Guide

### Frontend (Netlify or Vercel)
* Build Command: `npm run build`
* Output Directory: `dist`

### Backend (Render Free Tier or Cloud Run)
* Environment Variable: Set `GEMINI_API_KEY` in environment secrets.
* Build Command: `npm run build`
* Start Command: `npm run start`

---

## ⚠️ Medical Disclaimer

*AI Skin Doctor is strictly an educational tool intended for preliminary self-awareness and health literacy. It does NOT provide formal medical diagnosis or treatment advice. Always seek the advice of a qualified board-certified dermatologist for medical skin concerns.*
