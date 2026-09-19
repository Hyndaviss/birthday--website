// Romantic Background Music Engine (Procedural Web Audio + Custom Audio Support)
let audioCtx = null;
let isPlaying = false;
let musicInterval = null;
let customAudio = null;

// Warm romantic chord progression: Cmaj7 - Am9 - Fmaj7 - Gadd9
const chords = [
  [261.63, 329.63, 392.00, 493.88], // C E G B (Cmaj7)
  [220.00, 261.63, 329.63, 392.00], // A C E G (Am7)
  [174.61, 220.00, 261.63, 329.63], // F A C E (Fmaj7)
  [196.00, 246.94, 293.66, 392.00]  // G B D G (G)
];

const melodyNotes = [
  523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88,
  440.00, 523.25, 659.25, 587.33, 440.00, 392.00, 440.00, 493.88
];

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play soft piano/music-box chime tone
function playNote(freq, time, duration = 1.2, gainValue = 0.05, type = 'sine') {
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);

  // Soft lowpass filter for warm romantic feel
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(gainValue, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

let chordIndex = 0;
let melodyStep = 0;

function scheduleRomanticMusic() {
  if (!isPlaying || !audioCtx) return;

  const now = audioCtx.currentTime;
  const currentChord = chords[chordIndex % chords.length];

  // Play arpeggio chord notes
  currentChord.forEach((noteFreq, i) => {
    playNote(noteFreq, now + i * 0.22, 2.5, 0.04, 'triangle');
  });

  // Play sweet high music box note
  const melodyNote = melodyNotes[melodyStep % melodyNotes.length];
  playNote(melodyNote, now + 0.45, 1.8, 0.045, 'sine');
  playNote(melodyNotes[(melodyStep + 2) % melodyNotes.length], now + 0.9, 1.6, 0.035, 'sine');

  chordIndex++;
  melodyStep = (melodyStep + 1) % melodyNotes.length;
}

function startBgm() {
  if (customAudio && customAudio.src) {
    customAudio.play().then(() => {
      isPlaying = true;
      updateMusicButtonUI(true);
    }).catch(e => {
      console.log('Audio autoplay prevented or error:', e);
      startProceduralBgm();
    });
    return;
  }
  startProceduralBgm();
}

function startProceduralBgm() {
  initAudioContext();
  isPlaying = true;
  scheduleRomanticMusic();
  musicInterval = setInterval(scheduleRomanticMusic, 1800);
  updateMusicButtonUI(true);
}

function stopBgm() {
  isPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  if (customAudio) {
    customAudio.pause();
  }
  updateMusicButtonUI(false);
}

function toggleBgm() {
  if (isPlaying) {
    stopBgm();
  } else {
    startBgm();
  }
}

function updateMusicButtonUI(playing) {
  const btn = document.getElementById('musicToggleBtn');
  const icon = document.getElementById('musicIcon');
  const label = document.getElementById('musicLabel');
  if (btn && icon && label) {
    if (playing) {
      btn.classList.add('playing');
      icon.innerHTML = '🎵';
      label.textContent = 'Pause Music';
    } else {
      btn.classList.remove('playing');
      icon.innerHTML = '🔇';
      label.textContent = 'Play Music';
    }
  }
}

// User can upload their own favorite romantic mp3
function handleCustomMusicUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  if (!customAudio) {
    customAudio = new Audio();
    customAudio.loop = true;
  }
  
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }

  customAudio.src = url;
  customAudio.play().then(() => {
    isPlaying = true;
    updateMusicButtonUI(true);
    if (typeof showToast === 'function') {
      showToast(`🎵 Playing: ${file.name}`);
    }
  }).catch(err => {
    console.error(err);
    if (typeof showToast === 'function') {
      showToast('Could not play uploaded audio file.', 'error');
    }
  });
}
