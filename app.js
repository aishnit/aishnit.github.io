// Nitya's Birthday Countdown Logic

// 1. Configuration & Timezone Target
// Target: July 19th, 2026, 00:00:00 IST (Indian Standard Time)
// IST is UTC + 5:30. ISO representation: "2026-07-19T00:00:00+05:30"
const TARGET_DATE_STR = "2026-07-19T00:00:00+05:30";
const targetTime = new Date(TARGET_DATE_STR).getTime();

// Compliments for popped balloons
const COMPLIMENTS = [
  "You make my heart smile! 💖",
  "Nitya, you are absolute magic. ✨",
  "Every second with you is a dream. 🌸",
  "Your laugh is my favorite soundtrack. 🎶",
  "I'm the luckiest guy to have you in my life. 🥰",
  "You're prettier than a field of pink peonies. 💐",
  "My absolute favorite place is inside your warm hugs. 🤗",
  "You are my sunshine on a cloudy day. ☀️",
  "You make the world a much brighter place. 🌟",
  "I love you more than words can say. 💕"
];

// 2. State & Audio variables
let audioCtx = null;
let musicInterval = null;
let isPlaying = false;
let delayNode = null;
let feedbackGain = null;
let masterVolume = null;

// Love letter text
const LOVE_LETTER_TEXT = `My Dearest Nitya,

From the moment you walked into my life, everything became brighter, softer, and infinitely more beautiful. You have this magical way of turning ordinary days into wonderful adventures and simple moments into lasting memories.

Your kindness, your gorgeous smile, and your gentle soul inspire me every single day. I cherish every laugh we share, every conversation, and every dream we build together.

Happy Birthday, my princess. I hope this year brings you as much happiness, warmth, and love as you bring into my heart every single day.

Forever & Always yours,`;

// 3. Setup Canvas for Background Animation (Hearts and Sparkles)
const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");
let particles = [];
let confettiParticles = [];
let celebrationMode = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Heart Particle Class
class HeartParticle {
  constructor() {
    this.reset();
    // randomize vertical position initially to spread them out
    this.y = Math.random() * canvas.height;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = Math.random() * 12 + 6;
    this.speedY = Math.random() * 1.2 + 0.4;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.scale = Math.random() * 0.5 + 0.5;
    this.swaySpeed = Math.random() * 0.02 + 0.01;
    this.swayOffset = Math.random() * Math.PI * 2;
  }

  update() {
    this.y -= this.speedY;
    this.swayOffset += this.swaySpeed;
    this.x += Math.sin(this.swayOffset) * 0.4;

    if (this.y < -20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = "#ff8da1";

    // Draw a path of a heart
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5, -7, -15, -7, -15, 0);
    ctx.bezierCurveTo(-15, 7, -5, 12, 0, 18);
    ctx.bezierCurveTo(5, 12, 15, 7, 15, 0);
    ctx.bezierCurveTo(15, -7, 5, -7, 0, 0);
    ctx.fill();
    ctx.restore();
  }
}

// Confetti Particle Class
class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.color = `hsl(${Math.random() * 60 + 320}, 100%, 75%)`; // Pink/Magenta range
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// Initialize particles
for (let i = 0; i < 35; i++) {
  particles.push(new HeartParticle());
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background hearts
  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  // Draw confetti if celebration mode is active
  if (celebrationMode) {
    if (confettiParticles.length < 150 && Math.random() < 0.3) {
      confettiParticles.push(new ConfettiParticle());
    }
    confettiParticles.forEach((cp, index) => {
      cp.update();
      cp.draw();
      if (cp.y > canvas.height + 20) {
        confettiParticles.splice(index, 1);
      }
    });
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 4. Procedural Audio Manager (Web Audio API Synth)
function initAudio() {
  if (audioCtx) return;
  
  // Initialize context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // Create delay loop nodes for high-quality music box reverb-echo effect
  delayNode = audioCtx.createDelay();
  delayNode.delayTime.value = 0.35;

  feedbackGain = audioCtx.createGain();
  feedbackGain.gain.value = 0.45;

  masterVolume = audioCtx.createGain();
  masterVolume.gain.value = 0.04; // Soft background level

  // Connect delay nodes feedback loop
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);

  // Master routing
  masterVolume.connect(audioCtx.destination);
  delayNode.connect(masterVolume);
}

// Play a single music box chime
function playChime(freq, time, duration = 1.0) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Pure sine wave sounds like a music box
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, time);

  // Fast envelope (plucked sound)
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(0.25, time + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(gainNode);
  gainNode.connect(masterVolume);
  gainNode.connect(delayNode); // Send to echo channel

  osc.start(time);
  osc.stop(time + duration + 0.1);
}

// Procedural music box playlist notes (sweet pentatonic theme)
// Each item represents [frequency, relative beat timing]
const SONG_NOTES = [
  [523.25, 0],   // C5
  [659.25, 1],   // E5
  [783.99, 2],   // G5
  [880.00, 3],   // A5
  [1046.50, 4],  // C6
  [880.00, 5],   // A5
  [783.99, 6],   // G5
  [659.25, 7],   // E5
  [587.33, 8],   // D5
  [523.25, 9],   // C5
  [659.25, 10],  // E5
  [783.99, 11],  // G5
  [880.00, 12],  // A5
  [783.99, 13],  // G5
  [659.25, 14],  // E5
  [523.25, 15]   // C5
];

let songIndex = 0;
function startMusicLoop() {
  if (musicInterval) return;

  const tempo = 600; // time in ms per beat
  musicInterval = setInterval(() => {
    if (audioCtx.state === "suspended") return;

    const [freq, _] = SONG_NOTES[songIndex];
    const now = audioCtx.currentTime;
    
    // Play melody note
    playChime(freq, now, 1.2);

    // Occasional gentle harmony bass note on beat 0, 4, 8, 12
    if (songIndex % 4 === 0) {
      const bassFreq = freq / 2; // one octave below
      playChime(bassFreq, now, 1.8);
    }

    songIndex = (songIndex + 1) % SONG_NOTES.length;
  }, tempo);
}

// Custom synthesised sound effects for interactions
function playPopSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  
  // Bubble pop synth sound: fast downward pitch sweep
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
  
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.09);

  // Play a quick delay chime as extra magical feedback
  setTimeout(() => {
    playChime(1174.66, audioCtx.currentTime, 0.5); // D6 chime
  }, 30);
}

function playBlowSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  
  // Blow sound: White noise simulation
  const bufferSize = audioCtx.sampleRate * 0.25; // 0.25 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.linearRampToValueAtTime(200, now + 0.25);
  
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  
  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  noiseNode.start(now);
  noiseNode.stop(now + 0.26);
}

// 5. Countdown Implementation
const daysVal = document.getElementById("days");
const hoursVal = document.getElementById("hours");
const minutesVal = document.getElementById("minutes");
const secondsVal = document.getElementById("seconds");

const countdownWrapper = document.getElementById("countdown-wrapper");
const birthdayWrapper = document.getElementById("birthday-wrapper");

function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    // Birthday has arrived!
    clearInterval(countdownInterval);
    triggerBirthdayCelebration();
  } else {
    // Normal countdown math
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysVal.textContent = String(days).padStart(2, "0");
    hoursVal.textContent = String(hours).padStart(2, "0");
    minutesVal.textContent = String(minutes).padStart(2, "0");
    secondsVal.textContent = String(seconds).padStart(2, "0");
  }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Run immediately

function triggerBirthdayCelebration() {
  countdownWrapper.style.display = "none";
  birthdayWrapper.classList.add("active");
  celebrationMode = true;

  // Fire an initial burst of confetti particles
  for (let i = 0; i < 80; i++) {
    confettiParticles.push(new ConfettiParticle());
  }

  // Set faster upbeat tempo for celebration music if playing
  if (isPlaying) {
    // Speed up a bit!
    clearInterval(musicInterval);
    musicInterval = null;
    
    // Switch to playing standard sweet arpeggios
    const fastNotes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25];
    let fastIndex = 0;
    musicInterval = setInterval(() => {
      const now = audioCtx.currentTime;
      playChime(fastNotes[fastIndex], now, 0.8);
      if (fastIndex === 0) {
        playChime(261.63, now, 1.5); // C4 bass chime
      }
      fastIndex = (fastIndex + 1) % fastNotes.length;
    }, 350);
  }
}

// 6. Enter Screen Button Trigger
const landingScreen = document.getElementById("landing-screen");
const heartBtn = document.getElementById("enter-btn");
const musicWidget = document.getElementById("music-toggle");

heartBtn.addEventListener("click", () => {
  landingScreen.classList.add("hidden");
  
  // Initialize and play ambient audio
  initAudio();
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  isPlaying = true;
  musicWidget.classList.add("playing");
  startMusicLoop();
});

// Music Widget Toggler
musicWidget.addEventListener("click", () => {
  if (!audioCtx) {
    initAudio();
  }
  
  if (isPlaying) {
    audioCtx.suspend();
    isPlaying = false;
    musicWidget.classList.remove("playing");
  } else {
    audioCtx.resume();
    isPlaying = true;
    musicWidget.classList.add("playing");
    startMusicLoop();
  }
});

// 7. Balloon Pop Mini-Game Logic
const balloonCanvas = document.getElementById("balloon-canvas");
const popNote = document.getElementById("pop-note");
const popNoteText = document.getElementById("pop-note-text");
const popNoteClose = document.getElementById("pop-note-close");

// Color array for colorful balloons
const BALLOON_COLORS = [
  "#ff9eb5", // pastel pink
  "#ffb37e", // pastel orange
  "#ffd17e", // pastel yellow
  "#a6e5ff", // pastel blue
  "#c8b3ff", // pastel purple
  "#b3ffd6"  // pastel green
];

function spawnBalloon() {
  if (document.hidden) return; // Don't spawn when tab is hidden
  
  const balloon = document.createElement("div");
  balloon.className = "balloon";
  
  // Random color
  const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  balloon.style.backgroundColor = color;
  balloon.style.color = color; // Used for the knot currentColor border
  
  // Random horizontal position
  const leftPos = Math.random() * (balloonCanvas.clientWidth - 60);
  balloon.style.left = `${leftPos}px`;
  
  // Random float speed
  const duration = Math.random() * 3 + 4; // 4s to 7s
  balloon.style.animationDuration = `${duration}s`;
  
  // String attachment
  const string = document.createElement("div");
  string.className = "balloon-string";
  balloon.appendChild(string);
  
  // Balloon pop action
  balloon.addEventListener("click", () => {
    playPopSound();
    
    // Create pop particles
    createPopExplosion(balloon.offsetLeft + 25, balloon.offsetTop + 32, color);
    
    // Remove balloon
    balloon.remove();
    
    // Show random love card
    const randomMsg = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    popNoteText.textContent = randomMsg;
    popNote.classList.add("active");
  });
  
  balloonCanvas.appendChild(balloon);
  
  // Auto remove when animation finished
  setTimeout(() => {
    if (balloon.parentNode === balloonCanvas) {
      balloon.remove();
    }
  }, duration * 1000);
}

// Particle explosion when balloon popped
function createPopExplosion(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const bit = document.createElement("div");
    bit.style.position = "absolute";
    bit.style.left = `${x}px`;
    bit.style.top = `${y}px`;
    bit.style.width = "6px";
    bit.style.height = "6px";
    bit.style.borderRadius = "50%";
    bit.style.backgroundColor = color;
    bit.style.pointerEvents = "none";
    
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    balloonCanvas.appendChild(bit);
    
    let life = 30;
    const particleInterval = setInterval(() => {
      life--;
      const curLeft = parseFloat(bit.style.left);
      const curTop = parseFloat(bit.style.top);
      bit.style.left = `${curLeft + vx}px`;
      bit.style.top = `${curTop + vy + 0.5}px`; // Add slight gravity
      bit.style.opacity = life / 30;
      
      if (life <= 0) {
        clearInterval(particleInterval);
        bit.remove();
      }
    }, 16);
  }
}

// Periodically spawn balloons
setInterval(spawnBalloon, 1500);

popNoteClose.addEventListener("click", () => {
  popNote.classList.remove("active");
});

// 8. Birthday Cake Interactions (Blowing out candles)
const candles = document.querySelectorAll(".candle");
let blownOutCount = 0;
const letterWrapper = document.getElementById("letter-wrapper");

candles.forEach((candle) => {
  // Flame element
  const flame = candle.querySelector(".flame");
  
  const blowOutAction = () => {
    if (candle.classList.contains("blown-out")) return;
    
    candle.classList.add("blown-out");
    playBlowSound();
    blownOutCount++;
    
    // Check if all are blown out
    if (blownOutCount === candles.length) {
      setTimeout(() => {
        // Dim instruction, reveal letter
        document.getElementById("cake-instruction").textContent = "All candles blown out! Make a wish... 💖";
        letterWrapper.classList.add("active");
        
        // Extra special audio chime sweep
        if (audioCtx) {
          const now = audioCtx.currentTime;
          const sweep = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
          sweep.forEach((freq, idx) => {
            playChime(freq, now + idx * 0.08, 1.5);
          });
        }
      }, 800);
    }
  };

  // Event listeners for candles
  flame.addEventListener("click", blowOutAction);
  candle.addEventListener("click", blowOutAction);
});

// 9. Letter Unfolding Interaction
const envelope = document.getElementById("envelope");
const waxSeal = document.getElementById("wax-seal");
const letterTextContainer = document.getElementById("letter-text");

waxSeal.addEventListener("click", (e) => {
  e.stopPropagation(); // Avoid triggering double click on envelope
  openLetter();
});

envelope.addEventListener("click", () => {
  if (!envelope.classList.contains("open")) {
    openLetter();
  }
});

function openLetter() {
  envelope.classList.add("open");
  playChime(783.99, audioCtx.currentTime, 1.2); // G5 chime

  // Typewriter effect or scroll animation
  letterTextContainer.textContent = "";
  let textIndex = 0;
  
  function typeWriter() {
    if (textIndex < LOVE_LETTER_TEXT.length) {
      letterTextContainer.textContent += LOVE_LETTER_TEXT.charAt(textIndex);
      textIndex++;
      
      // Gentle clicking sound on text drawing (very light noise)
      if (textIndex % 4 === 0 && audioCtx) {
        const now = audioCtx.currentTime;
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.type = "sine";
        clickOsc.frequency.setValueAtTime(2000, now);
        clickGain.gain.setValueAtTime(0.005, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        clickOsc.connect(clickGain);
        clickGain.connect(audioCtx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.03);
      }
      
      // Vary typing speed slightly for handwriting feel
      const delay = LOVE_LETTER_TEXT.charAt(textIndex - 1) === '\n' ? 300 : Math.random() * 30 + 20;
      setTimeout(typeWriter, delay);
    } else {
      // Append signature
      const sig = document.createElement("div");
      sig.className = "letter-signature";
      sig.textContent = "Your Love 💖";
      sig.style.opacity = 0;
      sig.style.transition = "opacity 2s ease";
      letterTextContainer.appendChild(sig);
      setTimeout(() => {
        sig.style.opacity = 1;
      }, 500);
    }
  }
  
  // Delay a bit for CSS transitions
  setTimeout(typeWriter, 800);
}
