// ========== DOM Elements ==========
const redLight = document.getElementById("redLight");
const yellowLight = document.getElementById("yellowLight");
const greenLight = document.getElementById("greenLight");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const countdownNumber = document.getElementById("countdownNumber");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const brightnessSlider = document.getElementById("brightnessSlider");
const eventLog = document.getElementById("eventLog");
const pedestrianBtn = document.getElementById("pedestrianBtn");
const pedestrianIndicator = document.getElementById("pedestrianIndicator");
const themeToggle = document.getElementById("themeToggle");
const manualControls = document.getElementById("manualControls");

// Mode buttons
const manualModeBtn = document.getElementById("manualModeBtn");
const autoModeBtn = document.getElementById("autoModeBtn");
const nightModeBtn = document.getElementById("nightModeBtn");
const emergencyModeBtn = document.getElementById("emergencyModeBtn");
const modeBtns = [manualModeBtn, autoModeBtn, nightModeBtn, emergencyModeBtn];

// Manual buttons
const btnRed = document.getElementById("btnRed");
const btnYellow = document.getElementById("btnYellow");
const btnGreen = document.getElementById("btnGreen");

// ========== State ==========
let currentMode = "manual"; // manual, auto, night, emergency
let currentLight = null; // red, yellow, green
let autoInterval = null;
let countdownInterval = null;
let countdownValue = 0;
let isSequenceRunning = false;
let pedestrianRequested = false;
let sequenceVersion = 0;

// ========== Theme ==========
let savedTheme = "dark";
try { savedTheme = localStorage.getItem("theme") === "light" ? "light" : "dark"; } catch {}
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.setAttribute("aria-label", savedTheme === "dark" ? "Byt till ljust tema" : "Byt till mörkt tema");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch {}
  themeToggle.setAttribute("aria-label", next === "dark" ? "Byt till ljust tema" : "Byt till mörkt tema");
  addLog(`Tema bytt till ${next === "dark" ? "mörkt" : "ljust"} läge`, "system");
});

// ========== Brightness ==========
brightnessSlider.addEventListener("input", () => {
  const val = brightnessSlider.value / 100;
  [redLight, yellowLight, greenLight].forEach((light) => { light.style.filter = `brightness(${val})`; });
  document.getElementById("brightnessValue").textContent = `${brightnessSlider.value} %`;
  updateSliderTrack(brightnessSlider);
});

function updateSliderTrack(slider) {
  const progress = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.setProperty("--progress", `${progress}%`);
}

// ========== Speed Slider ==========
speedSlider.addEventListener("input", () => {
  const val = speedSlider.value;
  speedValue.textContent = `${val} s / fas`;
  updateSliderTrack(speedSlider);
  // Restart auto cycle if running
  if (currentMode === "auto" && autoInterval) {
    stopAutoCycle();
    startAutoCycle();
  }
});

// ========== Core Light Control ==========
function setLights(red, yellow, green) {
  redLight.setAttribute("data-state", red ? "on" : "off");
  yellowLight.setAttribute("data-state", yellow ? "on" : "off");
  greenLight.setAttribute("data-state", green ? "on" : "off");
  const phase = red && yellow ? "red-yellow" : red ? "red" : yellow ? "yellow" : green ? "green" : "off";
  document.getElementById("scene").dataset.signal = phase;
  document.querySelectorAll(".phase").forEach((item) => {
    const active = item.dataset.phase === phase;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });

  // Remove blink class when setting explicitly
  redLight.classList.remove("blink");
  yellowLight.classList.remove("blink");
  greenLight.classList.remove("blink");
}

function updateStatus(light, text) {
  statusDot.className = "status-dot " + light;
  statusText.textContent = text;
  document.getElementById("trafficLight").setAttribute("aria-label", `Trafikljus: ${text}`);
  currentLight = light;
  updateManualButtons();
}

function updateManualButtons() {
  btnRed.classList.toggle("active", currentLight === "red");
  btnYellow.classList.toggle("active", currentLight === "yellow");
  btnGreen.classList.toggle("active", currentLight === "green");
  [btnRed, btnYellow, btnGreen].forEach((btn) => btn.setAttribute("aria-pressed", String(btn.classList.contains("active"))));
}

// ========== Manual Mode ==========
function setManualState(color) {
  if (currentMode !== "manual" || isSequenceRunning) return;

  switch (color) {
    case "red":
      setLights(true, false, false);
      updateStatus("red", "Rött ljus");
      addLog("Manuell: Rött ljus", "red");
      break;
    case "yellow":
      setLights(false, true, false);
      updateStatus("yellow", "Gult ljus");
      addLog("Manuell: Gult ljus", "yellow");
      break;
    case "green":
      setLights(false, false, true);
      updateStatus("green", "Grönt ljus");
      addLog("Manuell: Grönt ljus", "green");
      break;
  }
}

// ========== Sequences ==========
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function goSequence() {
  if (isSequenceRunning || currentMode !== "manual") return;
  isSequenceRunning = true;
  const version = ++sequenceVersion;
  setSequenceButtonsDisabled(true);
  addLog("Kör-sekvens startad", "green");

  // Red + Yellow (preparing to go)
  setLights(true, true, false);
  updateStatus("yellow", "Rött + Gult");
  await delay(1500);
  if (version !== sequenceVersion) return;

  // Green
  setLights(false, false, true);
  updateStatus("green", "Grönt ljus — Kör!");
  addLog("Grönt ljus — Kör!", "green");

  isSequenceRunning = false;
  setSequenceButtonsDisabled(false);
  addLog("Kör-sekvens klar", "system");
}

async function stopSequence() {
  if (isSequenceRunning || currentMode !== "manual") return;
  isSequenceRunning = true;
  const version = ++sequenceVersion;
  setSequenceButtonsDisabled(true);
  addLog("Stopp-sekvens startad", "red");

  // Start from green
  setLights(false, false, true);
  updateStatus("green", "Grönt ljus");
  await delay(1000);
  if (version !== sequenceVersion) return;

  // Yellow (warning)
  setLights(false, true, false);
  updateStatus("yellow", "Gult ljus — Sakta ner");
  addLog("Gult ljus — Sakta ner", "yellow");
  await delay(2000);
  if (version !== sequenceVersion) return;

  // Red
  setLights(true, false, false);
  updateStatus("red", "Rött ljus — Stopp!");
  addLog("Rött ljus — Stopp!", "red");

  isSequenceRunning = false;
  setSequenceButtonsDisabled(false);
  addLog("Stopp-sekvens klar", "system");
}

function setSequenceButtonsDisabled(disabled) {
  document.querySelectorAll(".seq-btn, .light-btn").forEach((btn) => {
    btn.disabled = disabled;
  });
}

// ========== Auto Cycle ==========
const AUTO_PHASES = [
  { name: "red", lights: [true, false, false], status: "Rött ljus", statusClass: "red" },
  { name: "red-yellow", lights: [true, true, false], status: "Rött + Gult", statusClass: "yellow" },
  { name: "green", lights: [false, false, true], status: "Grönt ljus", statusClass: "green" },
  { name: "yellow", lights: [false, true, false], status: "Gult ljus", statusClass: "yellow" },
];

let autoPhaseIndex = 0;

function startAutoCycle() {
  autoPhaseIndex = 0;
  runAutoPhase();

  function runAutoPhase() {
    if (currentMode !== "auto") return;

    const phase = AUTO_PHASES[autoPhaseIndex];
    setLights(...phase.lights);
    updateStatus(phase.statusClass, `Auto: ${phase.status}`);
    addLog(`Auto: ${phase.status}`, phase.statusClass === "yellow" ? "yellow" : phase.name === "green" ? "green" : "red");

    // Determine duration: red-yellow is shorter
    const baseDuration = parseInt(speedSlider.value) * 1000;
    const duration = phase.name === "red-yellow" ? Math.min(baseDuration, 2000) : baseDuration;

    // Handle pedestrian request during red phase
    let actualDuration = duration;
    if (phase.name === "red" && pedestrianRequested) {
      actualDuration = Math.max(duration, 5000);
      pedestrianIndicator.className = "pedestrian-indicator walk";
      addLog("Fotgängare: Gå!", "pedestrian");
      pedestrianRequested = false;
      pedestrianBtn.classList.remove("requested");
    } else if (phase.name === "green") {
      pedestrianIndicator.className = "pedestrian-indicator";
    }

    // Countdown
    startCountdown(actualDuration / 1000);

    autoInterval = setTimeout(() => {
      autoPhaseIndex = (autoPhaseIndex + 1) % AUTO_PHASES.length;
      runAutoPhase();
    }, actualDuration);
  }
}

function stopAutoCycle() {
  clearTimeout(autoInterval);
  autoInterval = null;
  stopCountdown();
}

// ========== Night Mode (Blinking Yellow) ==========
function startNightMode() {
  setLights(false, true, false);
  yellowLight.classList.add("blink");
  updateStatus("night", "Nattläge — Blinkande gult");
  addLog("Nattläge aktiverat", "yellow");
}

function stopNightMode() {
  yellowLight.classList.remove("blink");
  setLights(false, false, false);
}

// ========== Emergency Mode (Flashing Red) ==========
function startEmergency() {
  setLights(true, false, false);
  redLight.classList.add("blink");
  updateStatus("emergency", "NÖDLÄGE — Blinkande rött");
  addLog("NÖDLÄGE aktiverat!", "red");
}

function stopEmergency() {
  redLight.classList.remove("blink");
  setLights(false, false, false);
}

// ========== Mode Switching ==========
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (mode === currentMode) return;

    // Stop current mode
    stopCurrentMode();

    // Switch
    currentMode = mode;
    modeBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", String(b === btn));
    });
    btn.classList.add("active");

    // Update UI visibility
    manualControls.style.display = mode === "manual" ? "block" : "none";
    const modeLabels = { manual: "Manuell styrning", auto: "Automatisk cykel", night: "Nattläge", emergency: "Nödläge" };
    const modeHints = { manual: "Du styr signalerna. Välj ett ljus nedan.", auto: "Signalerna växlar automatiskt i en löpande cykel.", night: "Gult ljus blinkar kontinuerligt.", emergency: "Rött ljus blinkar kontinuerligt." };
    const modeDescriptions = { auto: "Följ fasföljden under signalen. Justera faslängden för att ändra tempot i simuleringen.", night: "Simuleringen är i nattläge. Byt till Manuell eller Auto för att återgå till en vanlig signalcykel.", emergency: "Nödläget är aktivt. Välj ett annat driftläge för att avsluta den blinkande signalen." };
    document.getElementById("sceneMode").textContent = modeLabels[mode];
    document.getElementById("modeHint").textContent = modeHints[mode];
    document.getElementById("modeDescription").hidden = mode === "manual";
    document.getElementById("modeDescriptionText").textContent = modeDescriptions[mode] || "";
    document.getElementById("countdownNote").textContent = mode === "auto" ? "Automatisk växling" : mode === "manual" ? "Styrs manuellt" : "Kontinuerlig signal";

    // Start new mode
    switch (mode) {
      case "manual":
        setLights(false, false, false);
        updateStatus("", "Manuellt läge");
        addLog("Manuellt läge aktiverat", "system");
        break;
      case "auto":
        startAutoCycle();
        break;
      case "night":
        startNightMode();
        break;
      case "emergency":
        startEmergency();
        break;
    }
  });
});

function stopCurrentMode() {
  sequenceVersion++;
  isSequenceRunning = false;
  setSequenceButtonsDisabled(false);
  switch (currentMode) {
    case "auto":
      stopAutoCycle();
      break;
    case "night":
      stopNightMode();
      break;
    case "emergency":
      stopEmergency();
      break;
  }
  stopCountdown();
}

// ========== Countdown ==========
function startCountdown(seconds) {
  stopCountdown();
  countdownValue = Math.ceil(seconds);
  countdownNumber.textContent = countdownValue;

  countdownInterval = setInterval(() => {
    countdownValue--;
    if (countdownValue <= 0) {
      countdownNumber.textContent = "--";
      stopCountdown();
    } else {
      countdownNumber.textContent = countdownValue;
    }
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  countdownNumber.textContent = "--";
}

// ========== Pedestrian ==========
pedestrianBtn.addEventListener("click", () => {
  if (pedestrianRequested) return;

  pedestrianRequested = true;
  pedestrianBtn.classList.add("requested");
  pedestrianIndicator.className = "pedestrian-indicator waiting";
  addLog("Fotgängare begärd — väntar på rött", "pedestrian");

  // In manual mode, give immediate feedback
  if (currentMode === "manual") {
    setTimeout(() => {
      pedestrianIndicator.className = "pedestrian-indicator walk";
      addLog("Fotgängare: Gå!", "pedestrian");
      setTimeout(() => {
        pedestrianIndicator.className = "pedestrian-indicator";
        pedestrianBtn.classList.remove("requested");
        pedestrianRequested = false;
      }, 4000);
    }, 2000);
  }
});

// ========== Event Log ==========
function addLog(message, type = "system") {
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;

  const time = new Date().toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const timestamp = document.createElement("span");
  timestamp.className = "log-time";
  timestamp.textContent = time;
  const messageElement = document.createElement("span");
  messageElement.className = "log-message";
  messageElement.textContent = message;
  entry.append(timestamp, messageElement);
  eventLog.appendChild(entry);
  eventLog.scrollTop = eventLog.scrollHeight;

  // Keep max 50 entries
  while (eventLog.children.length > 50) {
    eventLog.removeChild(eventLog.firstChild);
  }
  document.getElementById("logCount").textContent = eventLog.children.length;
}

function clearLog() {
  eventLog.innerHTML = "";
  addLog("Logg rensad", "system");
}

// ========== Keyboard Shortcuts ==========
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.target.matches("input, textarea, select, [contenteditable]")) return;

  switch (e.key) {
    case "1":
    case "r":
      setManualState("red");
      break;
    case "2":
    case "y":
      setManualState("yellow");
      break;
    case "3":
    case "g":
      setManualState("green");
      break;
    case "a":
      autoModeBtn.click();
      break;
    case "n":
      nightModeBtn.click();
      break;
    case "e":
      emergencyModeBtn.click();
      break;
    case "p":
      pedestrianBtn.click();
      break;
  }
});

// ========== Init ==========
addLog("Signal startad — system redo", "system");
setLights(true, false, false);
updateStatus("red", "Rött ljus — Stopp");
addLog("Manuell styrning aktiverad", "system");
updateSliderTrack(speedSlider);
updateSliderTrack(brightnessSlider);
