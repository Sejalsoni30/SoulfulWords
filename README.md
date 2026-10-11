# SoulfulWords 🌿

> *Memories Never Fade — Poetry That Lasts Forever*

**SoulfulWords** is a modern, responsive Single Page Application (SPA) designed to showcase, explore, and share heartfelt Shayri (poetry) in both **Hindi** and **English**. Built with an emerald dark-green aesthetic, glassmorphism UI, interactive 3D card tilt, emotional particles, and real-time database synchronization via **Firebase Cloud Firestore**.

---

## ✨ Features

- 🌿 **Bilingual Poetry**: Full support for both Hindi (हिंदी) and English shayris with dedicated typography.
- ☁️ **Cloud Database**: Real-time storage and live streaming powered by **Firebase Cloud Firestore**.
- 💚 **Interactive Like System**: Community like counter synchronized with Firestore atomic increments.
- 🎨 **Luxury Aesthetic**: Emerald and dark-green gradient styling, night-sky background, glassmorphism cards, and interactive hover effects.
- 🎭 **Floating Particles & Animations**: Canvas starfield, floating emotion stickers, and 3D card tilt based on cursor movement.
- 📱 **Fully Responsive**: Optimized for desktops, tablets, and mobile screens.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6+)
- **Database**: Google Firebase Cloud Firestore (v10 Compat SDK)
- **Fonts**: Google Fonts (*Cinzel Decorative*, *Playfair Display*, *Lato*, *Hind*)

---

## 🚀 Getting Started

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Sejalsoni30/SoulfulWords.git
   ```
2. Setup your Firebase credentials:
   - Copy `config.example.js` to `config.js`:
     ```bash
     cp config.example.js config.js
     ```
   - Enter your Firebase project credentials in `config.js` (this file is git-ignored for safety).
   - Alternatively, a `.env.example` file is provided for environment variable reference.
3. Open `index.html` directly in your browser:
   - Double-click `index.html`, or
   - Use VS Code Live Server / any local HTTP server.

---

## 🌐 Deploy to Vercel (Fast & Free)

Deploying to **Vercel** takes less than 1 minute:

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Import the repository **`Sejalsoni30/SoulfulWords`**.
4. Settings are automatically pre-configured via `vercel.json` and `package.json`:
   - **Framework Preset**: `Other`
   - **Build Command**: `node build.js` (or leave default `npm run build`)
   - **Output Directory**: `.`
5. *(Optional)* In **Environment Variables**, you can add custom Firebase keys (or leave empty to use project defaults).
6. Click **"Deploy"**! Your site is live instantly with an SSL-secured URL.

---

## 🚀 Deploy to Render (Static Site 100% Free)

You can deploy to **Render** in two easy ways:

### Method A: Blueprint (1-Click Automatic via `render.yaml`)
1. Go to [render.com](https://render.com) and log in with GitHub.
2. Click **"New +"** → **"Blueprint"**.
3. Select your repository `SoulfulWords`. Render will automatically detect `render.yaml` and configure everything.
4. Click **"Apply"**!

### Method B: Manual Static Site
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **"New +"** → **"Static Site"**.
3. Connect your GitHub repository `Sejalsoni30/SoulfulWords`.
4. Configure settings:
   - **Name**: `soulfulwords`
   - **Branch**: `main`
   - **Build Command**: `node build.js`
   - **Publish Directory**: `.`
5. Click **"Create Static Site"**. Your application will build and deploy on Render's global CDN!

---

## 📝 License

Distributed under the MIT License. Feel free to use and contribute!
