// script.js

// ---- Nakshatra name mapping (English -> Sanskrit/Telugu/Tamil) ----
// Display format: English / Sanskrit / Telugu / Tamil
const NAKSHATRA_MAP = {
  "Aardra": { "sa": "आर्द्रा", "te": "ఆరుద్ర", "ta": "திருவாதிரை" },
  "Anuradha": { "sa": "अनुराधा", "te": "అనురాధ", "ta": "அனுஷம்" },
  "Apabharani": { "sa": "भरणी", "te": "భరణి", "ta": "பரணி" },
  "Ashresha": { "sa": "आश्लेषा", "te": "ఆశ్లేష", "ta": "ஆயில்யம்" },
  "Ashwini": { "sa": "अश्विनी", "te": "అశ్విని", "ta": "அசுவினி" },
  "Chitra": { "sa": "चित्रा", "te": "చిత్ర", "ta": "சித்திரை" },
  "Hasta": { "sa": "हस्त", "te": "హస్త", "ta": "ஹஸ்தம்" },
  "Jyeshtaa": { "sa": "ज्येष्ठा", "te": "జ్యేష్ట", "ta": "கேட்டை" },
  "Krutthika": { "sa": "कृत्तिका", "te": "కృత్తిక", "ta": "கிருத்திகை" },
  "Magha": { "sa": "मघा", "te": "మఘ", "ta": "மகம்" },
  "Mrugasheersham": { "sa": "मृगशीर्षा", "te": "మృగశిర", "ta": "மிருகசீரிடம்" },
  "Mula": { "sa": "मूल", "te": "మూల", "ta": "மூலம்" },
  "Poorvaashada": { "sa": "पूर्वाषाढा", "te": "పూర్వాషాఢ", "ta": "பூராடம்" },
  "Poorvaphalguni": { "sa": "पूर्व फाल्गुनी", "te": "పూర్వ ఫల్గుని", "ta": "பூரம்" },
  "Poorvaproshtapada": { "sa": "पूर्वभाद्रपदा", "te": "పూర్వాభాద్ర", "ta": "பூரட்டாதி" },
  "Punarvasu": { "sa": "पुनर्वसू", "te": "పునర్వసు", "ta": "புனர்பூசம்" },
  "Pushya": { "sa": "पुष्य", "te": "పుష్య", "ta": "பூசம்" },
  "Revathi": { "sa": "रेवती", "te": "రేవతి", "ta": "ரேவதி" },
  "Rohini": { "sa": "रोहिणी", "te": "రోహిణి", "ta": "ரோகிணி" },
  "Shatabhishak": { "sa": "शतभिषा", "te": "శతభిష", "ta": "சதயம்" },
  "Shravana": { "sa": "श्रवण", "te": "శ్రవణ", "ta": "திருவோணம்" },
  "Shravishta": { "sa": "धनिष्ठा", "te": "ధనిష్ఠ", "ta": "அவிட்டம்" },
  "Swaathi": { "sa": "स्वाति", "te": "స్వాతి", "ta": "சுவாதி" },
  "Uttaraashada": { "sa": "उत्तराषाढा", "te": "ఉత్తరాషాఢ", "ta": "உத்திராடம்" },
  "Uttaraphalguni": { "sa": "उत्तर फाल्गुनी", "te": "ఉత్తర ఫల్గుని", "ta": "உத்திரம்" },
  "Uttaraproshtapada": { "sa": "उत्तरभाद्रपदा", "te": "ఉత్తరాభాద్ర", "ta": "உத்திரட்டாதி" },
  "Vishaakha": { "sa": "विशाखा", "te": "విశాఖ", "ta": "விசாகம்" }
};

// Normalize keys so minor spacing differences still match
function normalizeKey(s) {
  return String(s || "").trim();
}

function formatNakshatraDisplay(englishName) {
  const key = normalizeKey(englishName);
  const m = NAKSHATRA_MAP[key];
  if (!m) return key; // fallback to English only if not found
  return `${key} / ${m.sa} / ${m.te} / ${m.ta}`;
}

// ---- Utilities ----

// Create a Date in local time from numeric components
function makeLocalDate(y, m, d, hh, mm) {
  // JS months are 0-based
  return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), 0, 0);
}

// Format a Date like the panchangam text: "YYYY/MM/DD HH:MM"
function formatDateTime(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${hh}:${mm}`;
}

// Format a Date like "YYYY/MM/DD" (local)
function formatDateYMD(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

// Format time as HH:MM:SS
function formatHMSFromDate(dt) {
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// Parse "HH:MM:SS"
function parseHMS(hms) {
  const m = String(hms).trim().match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  return { h: Number(m[1]), mi: Number(m[2]), s: Number(m[3]) };
}

// ---- Interval parsing ----

// Parse a single interval line
// Example: "Prathama: 2025/12/04 15:14 to 2025/12/05 11:26"
function parseIntervalLine(line) {
  const re = /^(.+?):\s*(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}) to (\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})$/;
  const m = line.trim().match(re);
  if (!m) return null;

  const name = m[1].trim();
  const start = makeLocalDate(m[2], m[3], m[4], m[5], m[6]);
  const end = makeLocalDate(m[7], m[8], m[9], m[10], m[11]);

  return { name, start, end };
}

// Find current and next interval for a given "now"
function findCurrentAndNext(intervals, now) {
  let current = null;
  let next = null;

  for (let i = 0; i < intervals.length; i++) {
    const iv = intervals[i];
    if (now >= iv.start && now < iv.end) {
      current = iv;
      next = intervals[i + 1] || null;
      break;
    }
  }

  return { current, next };
}

// Nicely format remaining time
function formatTimeRemaining(end, now) {
  const ms = end - now;
  if (ms <= 0) return "Ended just now";

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0 && minutes <= 0) return "Ending now";
  if (hours === 0) return `${minutes} minutes remaining`;
  if (minutes === 0) return `${hours} hours remaining`;

  return `${hours} hours ${minutes} minutes remaining`;
}

// ---- Parsing helpers ----

// Extract the lines belonging to a section starting with a label like "Thithi details"
function extractSection(lines, startLabel) {
  const startIdx = lines.findIndex(l => l.trim().startsWith(startLabel));
  if (startIdx === -1) return [];

  const out = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Stop when we hit another "details:" header (for a different section)
    if (/details\s*:$/i.test(trimmed) && !trimmed.startsWith(startLabel)) break;

    out.push(line);
  }
  return out;
}

// From the section lines, build interval objects for each valid line
function getIntervalsFromSection(sectionLines) {
  const intervals = [];
  for (const raw of sectionLines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.toLowerCase().startsWith("next ")) continue; // skip "Next Tithi" etc.

    const iv = parseIntervalLine(line);
    if (iv) intervals.push(iv);
  }
  return intervals;
}

// Get a simple "Label : Value" header line (e.g. "Samvatsaram : Vishwaavasu")
function getHeaderValue(lines, label) {
  const lowerLabel = label.toLowerCase();
  const line = lines.find(l => l.trim().toLowerCase().startsWith(lowerLabel));
  if (!line) return null;
  const parts = line.split(":");
  if (parts.length < 2) return null;
  return parts[1].trim();
}

// Get backend timestamp line: "Date and time created: 2025/12/01 15:15:42"
function getBackendTimestamp(lines) {
  const line = lines.find(l =>
    l.trim().toLowerCase().startsWith("date and time created")
  );
  if (!line) return null;
  const parts = line.split(":");
  if (parts.length < 2) return null;
  return parts.slice(1).join(":").trim();
}

/**
 * Parse "Vaasaram details" lines into a map keyed by "YYYY/MM/DD"
 * Expected line format:
 * 2026/01/06: Tuesday, Bhowma, Sunrise: 07:50:43, Sunset: 16:42:54, Aparaanha kaalam: 13:00:00 to 15:00:00
 */
function parseVaasaramDetailsMap(sectionLines) {

  const map = new Map();

  let currentDate = null;
  let currentObj = null;

  for (const rawLine of sectionLines) {

    const line = String(rawLine)
      .replace(/\u00A0/g, " ")
      .trim();

    if (!line) continue;
    if (line.startsWith("=")) continue;

    const dateMatch =
      line.match(/^(\d{4}\/\d{2}\/\d{2})\s*:\s*([^,]+)\s*,\s*(.+)$/);

    if (dateMatch) {

      currentDate = dateMatch[1];

      currentObj = {
        weekday: dateMatch[2].trim(),
        vasaram: dateMatch[3].trim(),
        sunrise: null,
        sunset: null,
        aparahna: null,
        maadhyaanhika: null
      };

      map.set(currentDate, currentObj);
      continue;
    }

    if (!currentObj) continue;

    let m;

    m = line.match(/^Sunrise:\s*(.+)$/i);
    if (m) {
      currentObj.sunrise = m[1].trim();
      continue;
    }

    m = line.match(/^Sunset:\s*(.+)$/i);
    if (m) {
      currentObj.sunset = m[1].trim();
      continue;
    }

    m = line.match(/^Maadhyaanhika\s+kaalam:\s*(.+)$/i);
    if (m) {
      currentObj.maadhyaanhika = m[1].trim();
      continue;
    }

    m = line.match(/^Aparaanha\s+kaalam:\s*(.+)$/i);
    if (m) {
      currentObj.aparahna = m[1].trim();
      continue;
    }
  }

  return map;
}


// ---- View toggle (Instantaneous vs Range) ----

function setView(mode) {
  const instant = document.getElementById("instant-view");
  const range = document.getElementById("range-view");
  const btnInstant = document.getElementById("btn-instant");
  const btnRange = document.getElementById("btn-range");
  const subline = document.getElementById("view-subline");

  const isRange = mode === "range";

  if (instant) instant.style.display = isRange ? "none" : "block";
  if (range) range.style.display = isRange ? "block" : "none";

  if (btnInstant) btnInstant.setAttribute("aria-pressed", String(!isRange));
  if (btnRange) btnRange.setAttribute("aria-pressed", String(isRange));

  if (subline) {
    subline.textContent = isRange
      ? "🌙 Chaandramaanam Panchangam • Range View"
      : "🌙 Chaandramaanam Panchangam • Instantaneous View";
  }

  try { localStorage.setItem("pdx_view_mode", mode); } catch(e) {}
}

function initViewToggle() {
  const btnInstant = document.getElementById("btn-instant");
  const btnRange = document.getElementById("btn-range");

  if (btnInstant) btnInstant.addEventListener("click", () => setView("instant"));
  if (btnRange) btnRange.addEventListener("click", () => setView("range"));

  let saved = "instant";
  try {
    const v = localStorage.getItem("pdx_view_mode");
    if (v === "range" || v === "instant") saved = v;
  } catch(e) {}

  setView(saved);
}

// ---- Main ----

async function main() {
  initViewToggle();

  const statusEl = document.getElementById("status");
  const nowDisplay = document.getElementById("now-display");
  const backendDisplay = document.getElementById("backend-time");
  const rangeTextEl = document.getElementById("range-text");

  try {
    const res = await fetch("panchangam.txt");
    if (!res.ok) throw new Error("Could not load panchangam.txt");
    const text = await res.text();

    // Range View: publish EVERYTHING as-is
    if (rangeTextEl) rangeTextEl.textContent = text;

    const lines = text.split(/\r?\n/);

    // --- Header info (Samvatsaram, Ayanam, etc.) ---
    const samvatsaramVal = getHeaderValue(lines, "Samvatsaram");
    const ayanamVal      = getHeaderValue(lines, "Ayanam");
    const ruthuVal       = getHeaderValue(lines, "Ruthu");
    const masamVal       = getHeaderValue(lines, "Masam");
    const pakshamVal     = getHeaderValue(lines, "Paksham");

    const samEl = document.getElementById("samvatsaram");
    const ayaEl = document.getElementById("ayanam");
    const rutEl = document.getElementById("ruthu");
    const masEl = document.getElementById("masam");
    const pakEl = document.getElementById("paksham");

    if (samEl) samEl.textContent = samvatsaramVal || "–";
    if (ayaEl) ayaEl.textContent = ayanamVal || "–";
    if (rutEl) rutEl.textContent = ruthuVal || "–";
    if (masEl) masEl.textContent = masamVal || "–";
    if (pakEl) pakEl.textContent = pakshamVal || "–";

    // --- Backend time stamp ---
    const backendTs = getBackendTimestamp(lines);
    if (backendDisplay) {
      backendDisplay.textContent = backendTs
        ? `(Panchangam back-end time stamp: ${backendTs})`
        : "";
    }

    // --- Interval sections ---
    const tithiSection  = extractSection(lines, "Thithi details");
    const nakSection    = extractSection(lines, "Nakshatram details");
    const yogaSection   = extractSection(lines, "Yogam details");
    const karanaSection = extractSection(lines, "Karanam details");

    const tithiIntervals  = getIntervalsFromSection(tithiSection);
    const nakIntervals    = getIntervalsFromSection(nakSection);
    const yogaIntervals   = getIntervalsFromSection(yogaSection);
    const karanaIntervals = getIntervalsFromSection(karanaSection);

    const now = new Date();

    if (nowDisplay) {
      nowDisplay.textContent = `Current time (your browser): ${now.toLocaleString()}`;
    }

    // --- Vaasaram + Sunrise/Sunset/Noon + Aparaanha (AS IS) ---
    const vasEl = document.getElementById("vasaram-today");
    const sunriseEl = document.getElementById("sunrise-time");
    const sunsetEl = document.getElementById("sunset-time");
    const noonEl = document.getElementById("noon-time");
    const aparahnaEl = document.getElementById("aparahna-time");
    const maadhyaanhikaEl = document.getElementById("maadhyaanhika-time");

    let vasSection = extractSection(lines, "Vaasaram details");
    if (!vasSection.length) vasSection = extractSection(lines, "Vasaram details");

    const vasMap = parseVaasaramDetailsMap(vasSection);
    const todayKey = formatDateYMD(now);
    const todayObj = vasMap.get(todayKey);

    if (!todayObj) {
      if (vasEl) vasEl.textContent = "Not available";
      if (sunriseEl) sunriseEl.textContent = "–";
      if (sunsetEl) sunsetEl.textContent = "–";
      if (noonEl) noonEl.textContent = "–";
      if (aparahnaEl) aparahnaEl.textContent = "–";
    } else {
      if (vasEl) {
        if (todayObj.weekday && todayObj.vasaram) {
          vasEl.textContent = `${todayObj.weekday}, ${todayObj.vasaram}`;
        } else {
          vasEl.textContent = todayObj.raw || "Not available";
        }
      }

      // Aparaanha kaalam: publish time range AS IS (do not change)
      if (maadhyaanhikaEl) {
        maadhyaanhikaEl.textContent =
          todayObj.maadhyaanhika
            ? todayObj.maadhyaanhika
            : "–";
      }
      
      if (aparahnaEl) {
        aparahnaEl.textContent =
          todayObj.aparahna
            ? todayObj.aparahna
            : "–";
      }

      if (todayObj.sunrise && todayObj.sunset) {
        if (sunriseEl) sunriseEl.textContent = todayObj.sunrise;
        if (sunsetEl) sunsetEl.textContent = todayObj.sunset;

        const s = parseHMS(todayObj.sunrise);
        const e = parseHMS(todayObj.sunset);

        if (s && e) {
          const sunriseDt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), s.h, s.mi, s.s);
          const sunsetDt  = new Date(now.getFullYear(), now.getMonth(), now.getDate(), e.h, e.mi, e.s);

          const noonMs = sunriseDt.getTime() + Math.floor((sunsetDt.getTime() - sunriseDt.getTime()) / 2);
          const noonDt = new Date(noonMs);

          if (noonEl) noonEl.textContent = formatHMSFromDate(noonDt);
        } else {
          if (noonEl) noonEl.textContent = "–";
        }
      } else {
        if (sunriseEl) sunriseEl.textContent = "–";
        if (sunsetEl) sunsetEl.textContent = "–";
        if (noonEl) noonEl.textContent = "–";
      }
    }

    // ----- Tithi -----
    const { current: tithiCur, next: tithiNext } = findCurrentAndNext(tithiIntervals, now);
    const tCurEl = document.getElementById("tithi-current");
    const tRemEl = document.getElementById("tithi-remaining");
    const tNextEl = document.getElementById("tithi-next");

    if (tCurEl) tCurEl.textContent = tithiCur ? tithiCur.name : "Not in range";
    if (tRemEl) tRemEl.textContent = tithiCur ? formatTimeRemaining(tithiCur.end, now) : "";
    if (tNextEl) {
      tNextEl.textContent = tithiNext
        ? `${tithiNext.name} (starts: ${formatDateTime(tithiNext.start)})`
        : "–";
    }

    // ----- Nakshatra (MULTI-LANGUAGE DISPLAY) -----
    const { current: nakCur, next: nakNext } = findCurrentAndNext(nakIntervals, now);
    const nCurEl = document.getElementById("nak-current");
    const nRemEl = document.getElementById("nak-remaining");
    const nNextEl = document.getElementById("nak-next");

    if (nCurEl) nCurEl.textContent = nakCur ? formatNakshatraDisplay(nakCur.name) : "Not in range";
    if (nRemEl) nRemEl.textContent = nakCur ? formatTimeRemaining(nakCur.end, now) : "";
    if (nNextEl) {
      nNextEl.textContent = nakNext
        ? `${formatNakshatraDisplay(nakNext.name)} (starts: ${formatDateTime(nakNext.start)})`
        : "–";
    }

    // ----- Yogam -----
    const { current: yogaCur, next: yogaNext } = findCurrentAndNext(yogaIntervals, now);
    const yCurEl = document.getElementById("yoga-current");
    const yRemEl = document.getElementById("yoga-remaining");
    const yNextEl = document.getElementById("yoga-next");

    if (yCurEl) yCurEl.textContent = yogaCur ? yogaCur.name : "Not in range";
    if (yRemEl) yRemEl.textContent = yogaCur ? formatTimeRemaining(yogaCur.end, now) : "";
    if (yNextEl) {
      yNextEl.textContent = yogaNext
        ? `${yogaNext.name} (starts: ${formatDateTime(yogaNext.start)})`
        : "–";
    }

    // ----- Karanam -----
    const { current: karCur, next: karNext } = findCurrentAndNext(karanaIntervals, now);
    const kCurEl = document.getElementById("karana-current");
    const kRemEl = document.getElementById("karana-remaining");
    const kNextEl = document.getElementById("karana-next");

    if (kCurEl) kCurEl.textContent = karCur ? karCur.name : "Not in range";
    if (kRemEl) kRemEl.textContent = karCur ? formatTimeRemaining(karCur.end, now) : "";
    if (kNextEl) {
      kNextEl.textContent = karNext
        ? `${karNext.name} (starts: ${formatDateTime(karNext.start)})`
        : "–";
    }

    if (statusEl) {
      statusEl.textContent = "Panchangam loaded from panchangam.txt";
    }

  } catch (err) {
    console.error(err);
    if (statusEl) {
      statusEl.textContent = "Error loading panchangam data. Check console.";
    }
    const rangeTextEl2 = document.getElementById("range-text");
    if (rangeTextEl2) {
      rangeTextEl2.textContent = "Error loading panchangam.txt. Please check that the file exists in the same folder.";
    }
  }
}

main();
