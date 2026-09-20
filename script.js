// ==========================================
// BIRTHDAY WEBSITE JAVASCRIPT LOGIC
// ==========================================

// --- 1. IndexedDB Helper for Photo Storage ---
const DB_NAME = 'BirthdayMemoriesDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function dbSavePhoto(photoObj) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(photoObj);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function dbGetAllPhotos() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbDeletePhoto(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

// --- 2. Default Configuration & State ---
const DEFAULT_LETTER = `To the most wonderful person in my world,

Happy Birthday My Love! ❤️

From the moment you entered my life, every day has felt warmer, brighter, and so much more meaningful.

Nuvvu na life loki vachaka prathi kshanam chala special ga anipisthundi. Nee navvu, nee prema, naatho nuvvu unde aa caring nature... ivanni naaku entho viluvainavi. You are not just my boyfriend; you are my best friend, my safe place, and my favorite reason to smile.

Thank you for always standing by me, understanding me even when I don't say a word, and making life so magical.

On your special day, I wish you endless happiness, good health, peace, and massive success in everything you pursue. May all your dreams come true!

I promise to hold your hand through everything, celebrate all your victories, and love you more and more with every single heartbeat.

Forever and always yours,
With all my love ❤️`;

let currentPhotos = [];
let currentLightboxIndex = 0;

// --- 3. App Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  initFloatingHearts();
  initConfetti();
  loadSettings();
  loadLetter();
  await loadPhotos();
  initUploadHandlers();
  updateCountdown();
  setInterval(updateCountdown, 1000);
});

// --- 4. Personalization & Settings ---
function loadSettings() {
  const bfName = localStorage.getItem('bf_name') || 'My Love';
  const senderName = localStorage.getItem('sender_name') || 'Forever Yours';
  const bdayDate = localStorage.getItem('bf_bday') || '2026-10-24';

  const bfNameEls = document.querySelectorAll('.dynamic-bf-name');
  bfNameEls.forEach(el => el.textContent = bfName);

  const senderEls = document.querySelectorAll('.dynamic-sender-name');
  senderEls.forEach(el => el.textContent = senderName);

  const nameInput = document.getElementById('settingBfName');
  const senderInput = document.getElementById('settingSenderName');
  const dateInput = document.getElementById('settingBdayDate');

  if (nameInput) nameInput.value = bfName;
  if (senderInput) senderInput.value = senderName;
  if (dateInput) dateInput.value = bdayDate;
}

function saveSettings() {
  const nameInput = document.getElementById('settingBfName');
  const senderInput = document.getElementById('settingSenderName');
  const dateInput = document.getElementById('settingBdayDate');

  if (nameInput && nameInput.value.trim()) {
    localStorage.setItem('bf_name', nameInput.value.trim());
  }
  if (senderInput && senderInput.value.trim()) {
    localStorage.setItem('sender_name', senderInput.value.trim());
  }
  if (dateInput && dateInput.value) {
    localStorage.setItem('bf_bday', dateInput.value);
  }

  loadSettings();
  closeSettingsModal();
  updateCountdown();
  showToast('✨ Settings updated successfully!');
}

function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'flex';
}

function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';
}

// --- 5. Editable Love Letter Logic ---
function loadLetter() {
  const savedLetter = localStorage.getItem('customBirthdayLetter') || DEFAULT_LETTER;
  const paperEl = document.getElementById('letterPaperContent');
  const editBox = document.getElementById('letterEditBox');

  if (paperEl) paperEl.textContent = savedLetter;
  if (editBox) editBox.value = savedLetter;
}

function toggleLetterEdit() {
  const paperEl = document.getElementById('letterPaperContent');
  const editBox = document.getElementById('letterEditBox');
  const editBtn = document.getElementById('btnEditLetter');
  const saveBtn = document.getElementById('btnSaveLetter');

  if (editBox.style.display === 'block') {
    // Currently editing -> Cancel / View mode
    editBox.style.display = 'none';
    paperEl.style.display = 'block';
    editBtn.innerHTML = '✏️ Edit Letter';
    saveBtn.style.display = 'none';
  } else {
    // Switch to Edit Mode
    editBox.value = paperEl.textContent;
    paperEl.style.display = 'none';
    editBox.style.display = 'block';
    editBox.focus();
    editBtn.innerHTML = '❌ Cancel';
    saveBtn.style.display = 'inline-flex';
  }
}

function saveLetter() {
  const paperEl = document.getElementById('letterPaperContent');
  const editBox = document.getElementById('letterEditBox');
  const editBtn = document.getElementById('btnEditLetter');
  const saveBtn = document.getElementById('btnSaveLetter');

  const content = editBox.value.trim();
  if (!content) {
    showToast('Letter cannot be empty!', 'error');
    return;
  }

  localStorage.setItem('customBirthdayLetter', content);
  paperEl.textContent = content;

  editBox.style.display = 'none';
  paperEl.style.display = 'block';
  editBtn.innerHTML = '✏️ Edit Letter';
  saveBtn.style.display = 'none';

  fireConfettiBurst();
  showToast('💌 Your romantic letter has been saved!');
}

function resetLetter() {
  if (confirm('Are you sure you want to reset the letter to default?')) {
    localStorage.removeItem('customBirthdayLetter');
    loadLetter();
    const paperEl = document.getElementById('letterPaperContent');
    const editBox = document.getElementById('letterEditBox');
    const editBtn = document.getElementById('btnEditLetter');
    const saveBtn = document.getElementById('btnSaveLetter');

    editBox.style.display = 'none';
    paperEl.style.display = 'block';
    editBtn.innerHTML = '✏️ Edit Letter';
    saveBtn.style.display = 'none';

    showToast('Letter reset to default!');
  }
}

// --- 6. Photo Album & Upload Logic ---
const SAMPLE_PHOTOS = [
  {
    id: 'photo_real_1',
    dataUrl: 'assets/images/photo1.jpg',
    caption: 'NO NAZARRR....',
    date: '15/09/2026',
    tag: 'Bujjuluuu',
    timestamp: 1
  },
  {
    id: 'photo_real_2',
    dataUrl: 'assets/images/photo2.jpg',
    caption: 'BEACH WINDS',
    date: '14/04/2026',
    tag: 'us togetherr',
    timestamp: 2
  },
  {
    id: 'photo_real_3',
    dataUrl: 'assets/images/photo3.jpg',
    caption: 'HANDSOME',
    date: '08/09/2026',
    tag: 'Bangaraaluuuu...',
    timestamp: 3
  },
  {
    id: 'photo_real_4',
    dataUrl: 'assets/images/photo4.jpg',
    caption: 'MANDI..LONG TIME MEET',
    date: '27/08/2026',
    tag: 'Just our time',
    timestamp: 4
  },
  {
    id: 'photo_real_5',
    dataUrl: 'assets/images/photo5.jpg',
    caption: 'A DAY OUT WITH MINE',
    date: '2025',
    tag: 'A very special day to us ...',
    timestamp: 5
  }
];

async function loadPhotos() {
  try {
    currentPhotos = await dbGetAllPhotos();
    
    // Auto-sync actual photos to IndexedDB on first load / upgrade
    if (!localStorage.getItem('actual_photos_v3')) {
      for (let p of currentPhotos) {
        if (p.id.startsWith('photo_sample_')) {
          await dbDeletePhoto(p.id);
        }
      }
      for (const photo of SAMPLE_PHOTOS) {
        await dbSavePhoto(photo);
      }
      localStorage.setItem('actual_photos_v3', 'true');
      currentPhotos = await dbGetAllPhotos();
    } else if (currentPhotos.length === 0) {
      for (const photo of SAMPLE_PHOTOS) {
        await dbSavePhoto(photo);
      }
      currentPhotos = await dbGetAllPhotos();
    }
    renderGallery();
  } catch (err) {
    console.error('Error loading photos from IndexedDB:', err);
    currentPhotos = SAMPLE_PHOTOS;
    renderGallery();
  }
}

function renderGallery() {
  const gallery = document.getElementById('photoGalleryGrid');
  if (!gallery) return;

  if (currentPhotos.length === 0) {
    gallery.innerHTML = `
      <div class="gallery-empty">
        <div class="gallery-empty-icon">📸</div>
        <h3>No photos uploaded yet!</h3>
        <p style="color: var(--text-secondary); margin-top: 6px;">
          Use the upload box above to add sweet photos of you two! They will be safely stored right here.
        </p>
      </div>
    `;
    return;
  }

  // Generate Polaroid Cards with slight random organic tilt
  gallery.innerHTML = currentPhotos.map((photo, idx) => {
    // Deterministic organic rotation based on index
    const tilts = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.4];
    const rot = tilts[idx % tilts.length];

    return `
      <div class="polaroid-card" style="--rot: ${rot}deg;" onclick="openLightbox(${idx})">
        <div class="polaroid-actions" onclick="event.stopPropagation()">
          <button class="card-action-btn" title="View Fullscreen" onclick="openLightbox(${idx})">🔍</button>
          <button class="card-action-btn" title="Delete Photo" onclick="deletePhoto('${photo.id}')">🗑️</button>
        </div>
        <div class="polaroid-img-box">
          <img class="polaroid-img" src="${photo.dataUrl}" alt="${photo.caption || 'Our Memory'}" loading="lazy" />
        </div>
        <div class="polaroid-caption">${escapeHtml(photo.caption || 'A Sweet Memory ❤️')}</div>
        <div class="polaroid-meta">
          <span class="polaroid-date">${photo.date || 'Forever Moment'}</span>
          <span class="polaroid-tag">${escapeHtml(photo.tag || 'Us')}</span>
        </div>
      </div>
    `;
  }).join('');
}

function initUploadHandlers() {
  const dropZone = document.getElementById('uploadDropZone');
  const fileInput = document.getElementById('photoFileInput');

  if (!dropZone || !fileInput) return;

  // Drag & drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploadedFiles(files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  });
}

function triggerPhotoInput() {
  const input = document.getElementById('photoFileInput');
  if (input) input.click();
}

async function processUploadedFiles(files) {
  const captionInput = document.getElementById('uploadCaption');
  const dateInput = document.getElementById('uploadDate');
  const tagInput = document.getElementById('uploadTag');

  const caption = captionInput ? captionInput.value.trim() : '';
  const date = dateInput ? dateInput.value : '';
  const tag = tagInput ? tagInput.value.trim() : 'Sweet Memory';

  let addedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;

    const dataUrl = await readFileAsDataUrl(file);
    const photoObj = {
      id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      dataUrl: dataUrl,
      caption: caption || `Our Special Memory #${currentPhotos.length + 1}`,
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tag: tag || 'Together',
      timestamp: Date.now()
    };

    await dbSavePhoto(photoObj);
    currentPhotos.unshift(photoObj);
    addedCount++;
  }

  if (addedCount > 0) {
    renderGallery();
    if (captionInput) captionInput.value = '';
    if (dateInput) dateInput.value = '';
    fireConfettiBurst();
    showToast(`🎉 ${addedCount} photo(s) added to your memories album!`);
  } else {
    showToast('Please select valid image files!', 'error');
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

async function deletePhoto(id) {
  if (confirm('Delete this photo from the album?')) {
    await dbDeletePhoto(id);
    currentPhotos = currentPhotos.filter(p => p.id !== id);
    renderGallery();
    showToast('Photo removed.');
  }
}

// --- 7. Lightbox Viewer ---
function openLightbox(index) {
  if (index < 0 || index >= currentPhotos.length) return;
  currentLightboxIndex = index;
  const photo = currentPhotos[index];

  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const meta = document.getElementById('lightboxMeta');

  img.src = photo.dataUrl;
  caption.textContent = photo.caption || 'Our Memory';
  meta.textContent = `${photo.date || ''} • ${photo.tag || ''}`;

  modal.style.display = 'flex';
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.style.display = 'none';
}

function navLightbox(direction) {
  let newIdx = currentLightboxIndex + direction;
  if (newIdx < 0) newIdx = currentPhotos.length - 1;
  if (newIdx >= currentPhotos.length) newIdx = 0;
  openLightbox(newIdx);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeSettingsModal();
  } else if (e.key === 'ArrowRight') {
    navLightbox(1);
  } else if (e.key === 'ArrowLeft') {
    navLightbox(-1);
  }
});

// --- 8. Interactive Cake Candle Blowout ---
let candlesBlown = false;

function blowCandles() {
  if (candlesBlown) {
    relightCandles();
    return;
  }

  candlesBlown = true;
  const candles = document.querySelectorAll('.candle');
  candles.forEach(c => c.classList.add('blown-out'));

  const btn = document.getElementById('cakeActionBtn');
  if (btn) btn.innerHTML = '✨ Relight Candles ✨';

  const wishCard = document.getElementById('wishUnlockedCard');
  if (wishCard) wishCard.style.display = 'block';

  // Mega celebration
  fireConfettiBurst(200);
  setTimeout(() => fireConfettiBurst(150), 400);
  setTimeout(() => fireConfettiBurst(100), 800);

  showToast('🎂 May all your birthday wishes come true, my love! ❤️');
}

function relightCandles() {
  candlesBlown = false;
  const candles = document.querySelectorAll('.candle');
  candles.forEach(c => c.classList.remove('blown-out'));

  const btn = document.getElementById('cakeActionBtn');
  if (btn) btn.innerHTML = '🎂 Blow Out The Candles! 💨';

  const wishCard = document.getElementById('wishUnlockedCard');
  if (wishCard) wishCard.style.display = 'none';

  showToast('Candles relit!');
}

// --- 9. Live Countdown Timer ---
function updateCountdown() {
  const bdayStr = localStorage.getItem('bf_bday') || '2026-10-24';
  const targetDate = new Date(bdayStr);
  const now = new Date();

  // Set birthday year to current year or next year
  targetDate.setFullYear(now.getFullYear());
  if (targetDate.getTime() < now.getTime() - 86400000) {
    targetDate.setFullYear(now.getFullYear() + 1);
  }

  const diff = targetDate.getTime() - now.getTime();

  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minsEl = document.getElementById('countMins');
  const secsEl = document.getElementById('countSecs');
  const titleEl = document.getElementById('countdownTitle');

  if (diff <= 0 && diff > -86400000) {
    if (titleEl) titleEl.textContent = '🎉 IT IS YOUR BIRTHDAY TODAY! 🎉';
    if (daysEl) daysEl.textContent = '00';
    if (hoursEl) hoursEl.textContent = '00';
    if (minsEl) minsEl.textContent = '00';
    if (secsEl) secsEl.textContent = '00';
    return;
  }

  if (titleEl) titleEl.textContent = 'COUNTDOWN TO YOUR SPECIAL DAY';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
  if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
}

// --- 10. Canvas Confetti System ---
let confettiCanvas, confettiCtx;
let confettiParticles = [];

function initConfetti() {
  confettiCanvas = document.getElementById('confettiCanvas');
  if (!confettiCanvas) return;
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
  requestAnimationFrame(renderConfetti);
}

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function fireConfettiBurst(count = 120) {
  const colors = ['#ff5e8e', '#ff758c', '#ffd166', '#c77dff', '#ffffff', '#ff9ebb'];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.45;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    confettiParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      life: 1,
      decay: Math.random() * 0.015 + 0.008,
      isHeart: Math.random() > 0.5
    });
  }
}

function renderConfetti() {
  if (!confettiCtx || !confettiCanvas) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.22; // gravity
    p.rotation += p.rotSpeed;
    p.life -= p.decay;

    if (p.life <= 0 || p.y > confettiCanvas.height) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.globalAlpha = p.life;
    confettiCtx.fillStyle = p.color;

    if (p.isHeart) {
      // Draw tiny heart particle
      drawSmallHeart(confettiCtx, 0, 0, p.size);
    } else {
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }

    confettiCtx.restore();
  }

  requestAnimationFrame(renderConfetti);
}

function drawSmallHeart(ctx, x, y, size) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
  ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
}

// --- 11. Ambient Floating Hearts Background ---
let heartsCanvas, heartsCtx;
let floatingHearts = [];

function initFloatingHearts() {
  heartsCanvas = document.getElementById('heartsCanvas');
  if (!heartsCanvas) return;
  heartsCtx = heartsCanvas.getContext('2d');
  resizeHeartsCanvas();
  window.addEventListener('resize', resizeHeartsCanvas);

  for (let i = 0; i < 30; i++) {
    floatingHearts.push(createHeartParticle());
  }

  requestAnimationFrame(renderFloatingHearts);
}

function resizeHeartsCanvas() {
  if (!heartsCanvas) return;
  heartsCanvas.width = window.innerWidth;
  heartsCanvas.height = window.innerHeight;
}

function createHeartParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight + window.innerHeight * 0.2,
    size: Math.random() * 14 + 8,
    speedY: Math.random() * 0.8 + 0.3,
    speedX: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.35 + 0.15,
    hue: Math.random() > 0.4 ? '340' : '300' // Pink to purple hues
  };
}

function renderFloatingHearts() {
  if (!heartsCtx || !heartsCanvas) return;
  heartsCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);

  floatingHearts.forEach(h => {
    h.y -= h.speedY;
    h.x += h.speedX;

    if (h.y < -30) {
      h.y = heartsCanvas.height + 20;
      h.x = Math.random() * heartsCanvas.width;
    }

    heartsCtx.save();
    heartsCtx.globalAlpha = h.opacity;
    heartsCtx.fillStyle = `hsl(${h.hue}, 85%, 65%)`;
    drawSmallHeart(heartsCtx, h.x, h.y, h.size);
    heartsCtx.restore();
  });

  requestAnimationFrame(renderFloatingHearts);
}

// --- 12. Toast Notification ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '💖'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
