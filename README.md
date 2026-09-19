# 🎂 Romantic Birthday Website for Boyfriend

A beautiful, interactive, and romantic birthday website designed for celebrating your boyfriend's birthday. It features photo album uploads, persistent storage, a customizable love letter, an interactive birthday cake with blowable candles, ambient background music, and sparkling celebration animations!

---

## 🌟 Key Features

1. 💌 **Editable Love Letter (Nene Edit Chesukune Letter)**:
   - Click the **"✏️ Edit Letter"** button to write your own personal birthday message or feelings.
   - Click **"💾 Save Letter"** to save it directly. It will remain saved in your browser even if you refresh or reopen the page!
   - You can also reset it back to the default message anytime.

2. 📸 **Photo Memories Album (Photos Upload)**:
   - Click **"➕ Choose Photos & Upload"** or drag & drop pictures of you two.
   - Enter an optional caption, date, or tag (like *"Our First Date"*, *"Vacation"*, *"Goofy Us"*).
   - Photos are displayed in romantic **Polaroid frames** with realistic tilts, captions, and tape stickers.
   - Includes **Fullscreen Lightbox Viewer** with Next/Previous slideshow.
   - All uploaded photos are saved safely in your browser's **IndexedDB** storage (no upload limits!).

3. 🎂 **Interactive Virtual Birthday Cake**:
   - Realistic 3D-styled cake with glowing, flickering candles.
   - Click the candles or the button to **blow them out** with smoke effects, celebratory confetti shower, and a secret birthday wish card!

4. 🎶 **Romantic Background Music Engine**:
   - Built-in soothing acoustic/piano romantic melody that plays with zero external downloads.
   - Option to click **"🎧 Song"** in the top navigation to upload and play your favorite Telugu or romantic MP3 song!

5. ⚙️ **Personalization Settings**:
   - Click the **"⚙️ Personalize"** button in the top menu to change:
     - **Boyfriend's Name / Nickname**
     - **Your Name / Signature**
     - **Birthday Date** (for the live countdown timer)

---

## 🚀 How to Open and Use the Website

### Method 1: Instant Direct Open (Easiest)
1. Navigate to the folder:  
   `C:\Users\HYNDAVI\.gemini\antigravity\scratch\birthday-website\`
2. Double-click **`index.html`** to open it directly in Google Chrome, Microsoft Edge, or any web browser.
3. Everything works immediately offline!

### Method 2: Local HTTP Server (Python)
If you prefer running a local server:
```powershell
cd C:\Users\HYNDAVI\.gemini\antigravity\scratch\birthday-website
python -m http.server 8080
```
Then open your browser and visit: `http://localhost:8080`

---

## 🌐 How to Send this Website as a Link to Your Boyfriend (Free Online Hosting)

If you want to send him a live link on WhatsApp so he can open it on his phone:

### Option A: Netlify Drop (Takes 30 seconds, No Coding)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the whole `birthday-website` folder onto the page.
3. In seconds, Netlify will generate a free live website link (e.g. `https://sweet-birthday-love.netlify.app`).
4. Copy the link and send it to your boyfriend on his birthday!

### Option B: GitHub Pages / Vercel
1. Create a free GitHub repository.
2. Push or upload these files (`index.html`, `style.css`, `script.js`, `music.js`).
3. Enable GitHub Pages in Repository Settings > Pages.

---

## 📁 File Structure
- **`index.html`**: Main website structure, romantic letter envelope, polaroid gallery, and virtual cake.
- **`style.css`**: Romantic glassmorphic styling, animations, floating hearts, and responsive design.
- **`script.js`**: IndexedDB photo storage, editable letter system, live countdown, confetti effects.
- **`music.js`**: Web Audio romantic music synthesizer + custom MP3 player.
