/* ================================================================
   SHADOW DUNGEON — O SELO DE VAHL
   Arquivo único gerado a partir dos módulos em js/.
   Estrutura: index.html + script.js + style.css
   ================================================================ */

/* ----------------------------------------------------------------
   MÓDULO: core.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — CORE
   Canvas, utilidades, save, áudio procedural e TODO o conteúdo do jogo.
   ================================================================ */
'use strict';

// ---------------------------------------------------------------
// CANVAS / VIEW
// ---------------------------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const VIEW = { w: 0, h: 0, dpr: 1 };

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    VIEW.dpr = dpr;
    VIEW.w = Math.max(320, window.innerWidth);
    VIEW.h = Math.max(320, window.innerHeight);
    canvas.width = Math.round(VIEW.w * dpr);
    canvas.height = Math.round(VIEW.h * dpr);
    canvas.style.width = VIEW.w + 'px';
    canvas.style.height = VIEW.h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const normAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
const angleDiff = (a, b) => Math.abs(normAngle(a - b));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
const fmt = n => {
    n = Math.round(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
};
const fmtTime = s => {
    s = Math.max(0, Math.floor(s));
    const m = Math.floor(s / 60), r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
};
const hexToRgba = (hex, a) => {
    if (!hex || hex[0] !== '#') return `rgba(255,255,255,${a})`;
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const shade = (hex, amt) => {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    const r = clamp(((n >> 16) & 255) + amt, 0, 255);
    const g = clamp(((n >> 8) & 255) + amt, 0, 255);
    const b = clamp((n & 255) + amt, 0, 255);
    return `rgb(${r},${g},${b})`;
};
const hash2 = (x, y) => {
    let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
};
function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, Math.max(0, Math.min(w, h) / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
}
function glowCircle(c, x, y, r, color, alpha = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexToRgba(color, alpha));
    g.addColorStop(0.45, hexToRgba(color, alpha * 0.42));
    g.addColorStop(1, hexToRgba(color, 0));
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fill();
}

// ---------------------------------------------------------------
// SAVE / PROGRESSO
// ---------------------------------------------------------------
const SAVE_VERSION = 3;
const SAVE_KEY = 'shadowDungeonSave_v3';
const LEGACY_KEY = 'shadowDungeonMeta';

function defaultSave() {
    return {
        version: SAVE_VERSION,
        coins: 0,
        souls: 0,
        totalKills: 0,
        bossesKilled: 0,
        bestWave: 1,
        bestScore: 0,
        runs: 0,
        playtime: 0,
        meta: {
            hp: 0, dmg: 0, speed: 0, mana: 0, crit: 0, lifesteal: 0,
            thorns: 0, xp: 0, gold: 0, armor: 0, cooldown: 0, dash: 0
        },
        unlocked: {
            classes: ['warrior'],
            weapons: ['twilight'],
            skills: ['nova', 'spear', 'meteor', 'chains'],
            relics: [],
            cosmetics: []
        },
        selected: {
            classId: 'warrior',
            weaponId: 'twilight',
            skills: ['nova', 'spear', 'meteor', 'chains'],
            difficulty: 'normal',
            modifiers: []
        },
        settings: {
            master: 0.85, music: 0.55, sfx: 0.85,
            shake: 1, particles: 1, damageNumbers: true,
            flash: true, autoAttack: false, invertAim: false,
            showFps: false, colorblind: false
        },
        stats: {
            runs: 0, kills: 0, bosses: 0, chests: 0, coinsEarned: 0,
            highestLevel: 1, bestCombo: 0, storyFragments: 0,
            playtime: 0, deaths: 0, elites: 0, skillsUsed: 0,
            damageDealt: 0, damageTaken: 0, itemsFound: 0,
            perfectWaves: 0, goldEarned: 0,
            classesPlayed: []
        },
        achievements: {},
        codex: { enemies: {}, bosses: {}, story: {}, biomes: {} },
        storySeen: [],
        lastRun: null,
        tutorialSeen: false
    };
}

function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

function sanitizeSave(raw) {
    const d = defaultSave();
    if (!isObj(raw)) return d;

    const num = (v, fallback, min = 0, max = 1e12) =>
        (typeof v === 'number' && isFinite(v)) ? clamp(v, min, max) : fallback;

    d.coins = num(raw.coins, 0);
    d.souls = num(raw.souls, 0);
    d.totalKills = num(raw.totalKills, 0);
    d.bossesKilled = num(raw.bossesKilled, 0);
    d.bestWave = num(raw.bestWave, 1, 1, 9999);
    d.bestScore = num(raw.bestScore, 0);
    d.runs = num(raw.runs, 0);
    d.playtime = num(raw.playtime, 0);
    d.tutorialSeen = !!raw.tutorialSeen;

    if (isObj(raw.meta)) {
        for (const k in d.meta) d.meta[k] = Math.floor(num(raw.meta[k], 0, 0, 50));
    }
    if (isObj(raw.unlocked)) {
        for (const key of ['classes', 'weapons', 'skills', 'relics', 'cosmetics']) {
            const src = raw.unlocked[key];
            if (Array.isArray(src)) {
                const valid = src.filter(v => typeof v === 'string' && v.length < 40);
                if (valid.length) d.unlocked[key] = [...new Set([...d.unlocked[key], ...valid])];
            }
        }
    }
    if (isObj(raw.selected)) {
        const s = raw.selected;
        if (CLASSES[s.classId]) d.selected.classId = s.classId;
        if (WEAPONS[s.weaponId]) d.selected.weaponId = s.weaponId;
        if (Array.isArray(s.skills)) {
            const valid = s.skills.filter(id => SKILLS[id]);
            d.selected.skills = [...new Set(valid)].slice(0, 4);
        }
        if (['normal', 'nightmare', 'abyss'].includes(s.difficulty)) d.selected.difficulty = s.difficulty;
        if (Array.isArray(s.modifiers)) {
            d.selected.modifiers = s.modifiers.filter(id => MODIFIERS[id]).slice(0, 3);
        }
    }
    if (isObj(raw.settings)) {
        for (const k of ['master', 'music', 'sfx', 'shake', 'particles']) {
            d.settings[k] = num(raw.settings[k], d.settings[k], 0, 1);
        }
        for (const k of ['damageNumbers', 'flash', 'autoAttack', 'invertAim', 'showFps', 'colorblind']) {
            if (typeof raw.settings[k] === 'boolean') d.settings[k] = raw.settings[k];
        }
    }
    if (isObj(raw.stats)) {
        for (const k in d.stats) {
            if (Array.isArray(d.stats[k])) {
                if (Array.isArray(raw.stats[k])) d.stats[k] = raw.stats[k].filter(v => typeof v === 'string' && CLASSES[v]);
            } else if (k === 'bestCombo' || k === 'highestLevel' || k === 'playtime') {
                d.stats[k] = num(raw.stats[k], d.stats[k]);
            } else {
                d.stats[k] = num(raw.stats[k], 0);
            }
        }
    }
    if (isObj(raw.achievements)) {
        for (const k in raw.achievements) if (raw.achievements[k] === true) d.achievements[k] = true;
    }
    if (isObj(raw.codex)) {
        for (const section of ['enemies', 'bosses', 'story', 'biomes']) {
            if (isObj(raw.codex[section])) {
                for (const k in raw.codex[section]) if (raw.codex[section][k] === true) d.codex[section][k] = true;
            }
        }
    }
    if (Array.isArray(raw.storySeen)) d.storySeen = raw.storySeen.filter(v => typeof v === 'string').slice(0, 100);
    if (isObj(raw.lastRun)) d.lastRun = raw.lastRun;

    // Compatibilidade: nunca deixa o jogador com loadout vazio/inválido.
    if (!d.unlocked.classes.includes(d.selected.classId)) d.selected.classId = 'warrior';
    if (!d.unlocked.weapons.includes(d.selected.weaponId)) d.selected.weaponId = 'twilight';
    if (!d.selected.skills.length) d.selected.skills = ['nova'];
    d.selected.skills = d.selected.skills.filter(id => d.unlocked.skills.includes(id));
    if (!d.selected.skills.length) d.selected.skills = ['nova'];
    if (!d.unlocked.skills.includes('nova')) d.unlocked.skills.push('nova');
    if (!d.unlocked.weapons.includes('twilight')) d.unlocked.weapons.push('twilight');
    if (!d.unlocked.classes.includes('warrior')) d.unlocked.classes.push('warrior');
    return d;
}

let SAVE = defaultSave();

function loadSave() {
    let raw = null;
    try {
        const txt = localStorage.getItem(SAVE_KEY);
        if (txt) raw = JSON.parse(txt);
    } catch (e) { raw = null; }

    if (!raw) {
        try {
            const legacy = localStorage.getItem(LEGACY_KEY);
            if (legacy) {
                const m = JSON.parse(legacy);
                const migrated = defaultSave();
                migrated.coins = Math.max(0, Number(m.coins) || 0);
                migrated.totalKills = Math.max(0, Number(m.totalKills) || 0);
                migrated.bestWave = Math.max(1, Number(m.bestWave) || 1);
                if (isObj(m.levels)) {
                    for (const k in migrated.meta) {
                        if (typeof m.levels[k] === 'number') migrated.meta[k] = Math.floor(clamp(m.levels[k], 0, 50));
                    }
                }
                raw = migrated;
            }
        } catch (e) { raw = null; }
    }
    SAVE = sanitizeSave(raw);
}

let saveTimer = 0;
function saveProgress(immediate = true) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE));
    } catch (e) { /* armazenamento indisponível não deve quebrar o jogo */ }
}
function cacheProgress() { saveTimer = 0.6; }

function settings() { return SAVE.settings; }

// ---------------------------------------------------------------
// ÁUDIO PROCEDURAL
// ---------------------------------------------------------------
const THEME_DEFS = {
    menu:      { root: 110.0, scale: [0, 3, 5, 7, 10, 12], beat: 0.85, pad: 0.10, bell: 0.07, drums: false },
    catacumbas:{ root: 82.41, scale: [0, 3, 5, 7, 10, 12], beat: 0.92, pad: 0.12, bell: 0.06, drums: true },
    floresta:  { root: 98.0,  scale: [0, 2, 3, 7, 9, 12],  beat: 0.78, pad: 0.09, bell: 0.10, drums: false },
    cavernas:  { root: 73.42, scale: [0, 3, 5, 6, 10, 12], beat: 1.0,  pad: 0.12, bell: 0.05, drums: false },
    infernal:  { root: 65.41, scale: [0, 1, 5, 6, 8, 12],  beat: 0.66, pad: 0.13, bell: 0.07, drums: true },
    abismo:    { root: 55.0,  scale: [0, 1, 4, 6, 8, 11],  beat: 0.74, pad: 0.14, bell: 0.09, drums: true },
    boss:      { root: 55.0,  scale: [0, 1, 6, 7, 11, 12], beat: 0.40, pad: 0.16, bell: 0.10, drums: true }
};

const Sound = {
    ctx: null,
    master: null,
    musicBus: null,
    sfxBus: null,
    noiseBuf: null,
    theme: 'menu',
    nextBeat: 0,
    beatCount: 0,
    lastBoss: false,

    ensure() {
        if (this.ctx) {
            if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
            return;
        }
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.musicBus = this.ctx.createGain();
            this.sfxBus = this.ctx.createGain();
            this.musicBus.connect(this.master);
            this.sfxBus.connect(this.master);
            this.master.connect(this.ctx.destination);
            const len = Math.floor(this.ctx.sampleRate * 1.6);
            const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < len; i++) {
                const white = Math.random() * 2 - 1;
                last = (last + white * 0.02) * 0.995;
                data[i] = last * 4;
            }
            this.noiseBuf = buf;
            this.applyVolumes();
            this.nextBeat = this.ctx.currentTime + 0.2;
        } catch (e) { this.ctx = null; }
    },

    applyVolumes() {
        if (!this.ctx) return;
        const s = settings();
        this.master.gain.setTargetAtTime(s.master, this.ctx.currentTime, 0.05);
        this.musicBus.gain.setTargetAtTime(s.music * 0.7, this.ctx.currentTime, 0.08);
        this.sfxBus.gain.setTargetAtTime(s.sfx, this.ctx.currentTime, 0.03);
    },

    note(freq, dur, type, vol, when = 0, dest = null, detune = 0) {
        if (!this.ctx) return;
        try {
            const t = this.ctx.currentTime + when;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = type || 'sine';
            o.frequency.setValueAtTime(Math.max(20, freq), t);
            if (detune) o.detune.value = detune;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + Math.min(0.08, dur * 0.25));
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g);
            g.connect(dest || this.sfxBus);
            o.start(t);
            o.stop(t + dur + 0.02);
        } catch (e) {}
    },

    noise(dur, vol, freq = 1200, q = 1, type = 'lowpass', when = 0) {
        if (!this.ctx || !this.noiseBuf) return;
        try {
            const t = this.ctx.currentTime + when;
            const src = this.ctx.createBufferSource();
            src.buffer = this.noiseBuf;
            const f = this.ctx.createBiquadFilter();
            f.type = type;
            f.frequency.setValueAtTime(freq, t);
            f.Q.value = q;
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            src.connect(f); f.connect(g); g.connect(this.sfxBus);
            src.start(t); src.stop(t + dur + 0.02);
        } catch (e) {}
    },

    setTheme(name) {
        if (!THEME_DEFS[name]) name = 'menu';
        if (this.theme === name) return;
        this.theme = name;
        this.nextBeat = this.ctx ? this.ctx.currentTime + 0.15 : 0;
    },

    update() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (now + 0.1 < this.nextBeat) return;
        const def = THEME_DEFS[this.theme] || THEME_DEFS.menu;
        if (this.nextBeat < now) this.nextBeat = now + 0.05;
        this.scheduleBeat(def, this.nextBeat - now);
        this.nextBeat += def.beat;
        this.beatCount++;
    },

    scheduleBeat(def, when) {
        const b = this.beatCount;
        const root = def.root;
        const scale = def.scale;
        // Pad grave em 4 tempos
        if (b % 4 === 0) {
            const degree = scale[Math.floor(Math.random() * 3)];
            const f = root * Math.pow(2, degree / 12);
            this.note(f, def.beat * 3.8, 'sine', def.pad, when, this.musicBus, -7);
            this.note(f * 1.5, def.beat * 3.6, 'triangle', def.pad * 0.35, when + 0.05, this.musicBus, 5);
        }
        // Sino / melodia esparsa
        if (Math.random() < (def.bell || 0.06)) {
            const deg = scale[Math.floor(Math.random() * scale.length)];
            const oct = b % 8 === 0 ? 2 : 3;
            const f = root * Math.pow(2, (deg + 12 * (oct - 1)) / 12);
            this.note(f, def.beat * 1.4, 'sine', 0.045, when, this.musicBus);
            this.note(f * 2.01, def.beat * 1.0, 'sine', 0.018, when + 0.02, this.musicBus);
        }
        // Pulso / percussão
        if (def.drums && b % 2 === 0) {
            this.noise(0.09, 0.06, 90, 0.8, 'lowpass', when);
        }
        if (this.theme === 'boss' && b % 4 === 2) {
            this.note(root * 0.5, 0.22, 'sawtooth', 0.07, when, this.musicBus);
        }
    },

    // --- efeitos -------------------------------------------------
    play(id, extra = 1) {
        if (!this.ctx || settings().master <= 0 || settings().sfx <= 0) return;
        const v = clamp(extra, 0.15, 2);
        switch (id) {
            case 'slash':
                this.noise(0.10, 0.12 * v, 2600, 1.2, 'highpass');
                this.note(320, 0.10, 'sawtooth', 0.05 * v);
                break;
            case 'hit':
                this.noise(0.07, 0.17 * v, 700, 0.9, 'lowpass');
                this.note(150, 0.08, 'square', 0.08 * v, 0, null, -30);
                break;
            case 'crit':
                this.noise(0.12, 0.22 * v, 1800, 1.1);
                this.note(660, 0.16, 'triangle', 0.10 * v);
                this.note(990, 0.22, 'sine', 0.06 * v, 0.02);
                break;
            case 'dash':
                this.noise(0.16, 0.10 * v, 1200, 0.5, 'bandpass');
                this.note(520, 0.14, 'sine', 0.05 * v, 0, null, 400);
                break;
            case 'skill':
                this.note(220, 0.24, 'triangle', 0.08 * v);
                this.note(440, 0.30, 'sine', 0.05 * v, 0.04);
                break;
            case 'fire':
                this.noise(0.35, 0.18 * v, 900, 0.6, 'lowpass');
                this.note(110, 0.28, 'sawtooth', 0.05 * v);
                break;
            case 'ice':
                this.note(880, 0.24, 'sine', 0.07 * v);
                this.note(1320, 0.32, 'sine', 0.05 * v, 0.03);
                this.noise(0.16, 0.06 * v, 4200, 1.4, 'highpass');
                break;
            case 'lightning':
                this.noise(0.18, 0.20 * v, 3800, 0.7, 'highpass');
                this.note(180, 0.16, 'square', 0.07 * v);
                break;
            case 'void':
                this.note(70, 0.5, 'sawtooth', 0.07 * v, 0, null, -10);
                this.note(140, 0.6, 'sine', 0.05 * v, 0.02);
                break;
            case 'heal':
                this.note(440, 0.25, 'sine', 0.07 * v);
                this.note(660, 0.3, 'sine', 0.05 * v, 0.05);
                this.note(880, 0.35, 'sine', 0.04 * v, 0.1);
                break;
            case 'coin':
                this.note(940, 0.09, 'sine', 0.045 * v);
                this.note(1420, 0.13, 'sine', 0.03 * v, 0.04);
                break;
            case 'level':
                [440, 554, 659, 880].forEach((f, i) => this.note(f, 0.4, 'triangle', 0.07 * v, i * 0.08));
                break;
            case 'boss':
                this.note(55, 1.2, 'sawtooth', 0.14 * v);
                this.note(58, 1.2, 'sawtooth', 0.10 * v, 0, null, 12);
                this.noise(0.8, 0.16 * v, 200, 1.2, 'lowpass');
                break;
            case 'hurt':
                this.note(180, 0.18, 'square', 0.09 * v, 0, null, -80);
                this.noise(0.12, 0.12 * v, 500, 0.8);
                break;
            case 'death':
                this.note(220, 0.7, 'sawtooth', 0.10 * v);
                this.note(110, 1.1, 'sine', 0.08 * v, 0.1);
                this.noise(0.6, 0.12 * v, 300, 0.8);
                break;
            case 'ui':
                this.note(620, 0.05, 'triangle', 0.035 * v);
                break;
            case 'confirm':
                this.note(520, 0.09, 'triangle', 0.05 * v);
                this.note(780, 0.14, 'sine', 0.04 * v, 0.04);
                break;
            case 'denied':
                this.note(180, 0.12, 'square', 0.05 * v);
                this.note(140, 0.16, 'square', 0.04 * v, 0.06);
                break;
            case 'chest':
                this.noise(0.22, 0.12 * v, 800, 0.6);
                this.note(330, 0.3, 'triangle', 0.06 * v);
                this.note(660, 0.35, 'sine', 0.05 * v, 0.08);
                break;
            case 'shield':
                this.note(300, 0.28, 'sine', 0.07 * v);
                this.note(450, 0.32, 'triangle', 0.04 * v, 0.03);
                break;
            case 'meteor':
                this.noise(0.5, 0.22 * v, 400, 0.6, 'lowpass');
                this.note(70, 0.5, 'sine', 0.10 * v);
                break;
            case 'arrow':
                this.noise(0.08, 0.07 * v, 2200, 1.2, 'highpass');
                break;
            case 'explosion':
                this.noise(0.55, 0.28 * v, 500, 0.5, 'lowpass');
                this.note(60, 0.45, 'sine', 0.12 * v);
                break;
            case 'wave':
                this.note(260, 0.5, 'triangle', 0.08 * v);
                this.note(390, 0.55, 'sine', 0.06 * v, 0.1);
                break;
            case 'victory':
                [523, 659, 784, 1047].forEach((f, i) => this.note(f, 0.6, 'triangle', 0.06 * v, i * 0.1));
                break;
            case 'teleport':
                this.note(110, 0.35, 'sine', 0.08 * v);
                this.note(880, 0.35, 'triangle', 0.05 * v, 0, null, 600);
                this.noise(0.25, 0.08 * v, 2400, 0.7, 'highpass');
                break;
        }
    }
};

// Inicializa áudio no primeiro gesto (política dos navegadores)
['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => Sound.ensure(), { once: true }));

// ---------------------------------------------------------------
// CLASSES
// ---------------------------------------------------------------
const CLASSES = {
    warrior: {
        id: 'warrior', name: 'Guerreiro das Sombras', short: 'Guerreiro',
        title: 'Sentinela da Lâmina', icon: 'sword', color: '#e8c46a', accent: '#ff9f43',
        cost: 0, difficulty: 'Equilibrado',
        desc: 'Um veterano que trocou a luz por uma lâmina. Converte cada combo em uma sentença de morte.',
        passive: 'Dança das Lâminas',
        passiveDesc: 'O terceiro golpe do combo libera uma onda de choque e causa +40% de dano.',
        base: { maxHp: 130, maxMana: 60, speed: 232, damage: 1.05, crit: 0.08, critDmg: 1.9, armor: 0.08, lifesteal: 0, skillPower: 1.0, attackSpeed: 1.0, manaRegen: 2.6, regen: 0 },
        tags: ['Corpo a corpo', 'Combo', 'Resistente']
    },
    mage: {
        id: 'mage', name: 'Mago do Abismo', short: 'Mago',
        title: 'Cartógrafo do Vazio', icon: 'orb', color: '#9b7bff', accent: '#4dabff',
        cost: 0, difficulty: 'Complexo',
        desc: 'Lê as fissuras do Abismo como páginas de um grimório. Frágil, mas capaz de apagar exércitos.',
        passive: 'Ressonância Arcana',
        passiveDesc: '+45% de poder mágico, +80% de mana e recarga de mana acelerada. Armas causam -18% de dano.',
        base: { maxHp: 88, maxMana: 135, speed: 216, damage: 0.82, crit: 0.09, critDmg: 1.85, armor: 0.02, lifesteal: 0, skillPower: 1.45, attackSpeed: 0.92, manaRegen: 5.2, regen: 0 },
        tags: ['Magia', 'Controle', 'Frágil']
    },
    assassin: {
        id: 'assassin', name: 'Assassino Espectral', short: 'Assassino',
        title: 'Sombra que Respira', icon: 'dagger', color: '#5ef2c2', accent: '#a5ffdf',
        cost: 350, difficulty: 'Ágil',
        desc: 'Não luta: desaparece, escolhe o ângulo e encerra o combate em um único movimento.',
        passive: 'Passo Fantasma',
        passiveDesc: '+20% de crítico, +35% de dano crítico e dash com recarga 25% menor. Críticos concedem 15% de velocidade por 2s.',
        base: { maxHp: 98, maxMana: 75, speed: 268, damage: 0.95, crit: 0.20, critDmg: 2.3, armor: 0.03, lifesteal: 0.02, skillPower: 0.95, attackSpeed: 1.18, manaRegen: 3.2, regen: 0 },
        tags: ['Crítico', 'Mobilidade', 'Precisão']
    },
    guardian: {
        id: 'guardian', name: 'Guardião Rúnico', short: 'Guardião',
        title: 'Muralha do Selo', icon: 'shield', color: '#e3b341', accent: '#61c0ff',
        cost: 500, difficulty: 'Resistente',
        desc: 'Carrega as runas que mantêm o Abismo selado. Cada ferida é uma lição gravada na pedra.',
        passive: 'Selo Protetor',
        passiveDesc: 'Recebe 22% menos dano, começa cada onda com 30 de escudo e recupera 25 de escudo após 6s sem levar dano.',
        base: { maxHp: 160, maxMana: 85, speed: 205, damage: 0.94, crit: 0.06, critDmg: 1.8, armor: 0.22, lifesteal: 0, skillPower: 1.0, attackSpeed: 0.95, manaRegen: 2.8, regen: 0.4 },
        tags: ['Tanque', 'Escudo', 'Runas']
    },
    hunter: {
        id: 'hunter', name: 'Caçador de Almas', short: 'Caçador',
        title: 'Coletor de Últimos Suspiros', icon: 'bow', color: '#ff7b6b', accent: '#ffd166',
        cost: 650, difficulty: 'Sustentável',
        desc: 'Cada criatura abatida deixa um fio de alma preso em sua lâmina. Ele coleciona todos.',
        passive: 'Colheita de Almas',
        passiveDesc: 'Cura 8% do dano causado, +20% de XP e cada abate concede +3% de dano por 6s (acumula até 8 vezes).',
        base: { maxHp: 112, maxMana: 95, speed: 242, damage: 1.0, crit: 0.10, critDmg: 1.95, armor: 0.05, lifesteal: 0.06, skillPower: 1.05, attackSpeed: 1.04, manaRegen: 3.6, regen: 0.3 },
        tags: ['Sustento', 'XP', 'Escalada']
    },
    cursed: {
        id: 'cursed', name: 'Cavaleiro Amaldiçoado', short: 'Cavaleiro',
        title: 'Herdeiro da Coroa Partida', icon: 'crown', color: '#ff4d6d', accent: '#ff9f43',
        cost: 900, difficulty: 'Arriscado',
        desc: 'A armadura não o protege; ela o devora. Quanto mais próxima a morte, mais forte o golpe.',
        passive: 'Pacto de Sangue',
        passiveDesc: '+18% de dano e +15% de poder mágico, mas recebe +14% de dano. Abates curam 2 de vida e concedem 8 de escudo.',
        base: { maxHp: 118, maxMana: 105, speed: 228, damage: 1.18, crit: 0.10, critDmg: 2.0, armor: -0.02, lifesteal: 0.02, skillPower: 1.15, attackSpeed: 1.0, manaRegen: 3.2, regen: 0 },
        tags: ['Alto risco', 'Dano', 'Sangue']
    }
};

// ---------------------------------------------------------------
// ARMAS
// ---------------------------------------------------------------
const WEAPONS = {
    twilight: {
        id: 'twilight', name: 'Espada do Crepúsculo', type: 'sword', icon: 'sword',
        rarity: 'uncommon', cost: 0, color: '#a7d8ff', accent: '#e8f6ff',
        desc: 'Lâmina equilibrada forjada entre o último dia e a primeira noite.',
        damage: 25, reach: 104, arc: 2.35, cooldown: 0.43, knockback: 220,
        combo: [1, 1.05, 1.5], kind: 'arc', critBonus: 0, lifestealBonus: 0,
        special: 'Combo versátil; o terceiro golpe é mais amplo.'
    },
    daggers: {
        id: 'daggers', name: 'Adagas Gêmeas', type: 'daggers', icon: 'dagger',
        rarity: 'rare', cost: 380, color: '#6ff2c8', accent: '#d7fff5',
        desc: 'Duas lâminas curtas que mordem duas vezes antes do inimigo piscar.',
        damage: 13, reach: 74, arc: 1.35, cooldown: 0.24, knockback: 100,
        combo: [1, 1, 1.25], kind: 'arc', critBonus: 0.10, lifestealBonus: 0,
        hits: 2, special: 'Dois golpes por ataque, alcance curto e +10% de crítico.'
    },
    axe: {
        id: 'axe', name: 'Machado Sangrento', type: 'axe', icon: 'axe',
        rarity: 'rare', cost: 520, color: '#ff6b4a', accent: '#ffd2c2',
        desc: 'O gume nunca seca. O sangue que escorre alimenta o próximo corte.',
        damage: 38, reach: 112, arc: 1.95, cooldown: 0.66, knockback: 320,
        combo: [1, 1.25], kind: 'arc', critBonus: 0.02, lifestealBonus: 0.02,
        bleed: 8, special: 'Causa sangramento; golpes lentos e largos.'
    },
    hammer: {
        id: 'hammer', name: 'Martelo do Vazio', type: 'hammer', icon: 'hammer',
        rarity: 'epic', cost: 820, color: '#b48cff', accent: '#efe4ff',
        desc: 'Um fragmento de silêncio comprimido em metal. O impacto esquece o som.',
        damage: 52, reach: 118, arc: 1.7, cooldown: 0.92, knockback: 480,
        combo: [1, 1.35], kind: 'arc', critBonus: 0, lifestealBonus: 0,
        shockwave: 0.6, stun: 0.7, special: 'Cada golpe gera onda de choque e atordoa.'
    },
    spear: {
        id: 'spear', name: 'Lança Espectral', type: 'spear', icon: 'spear',
        rarity: 'rare', cost: 560, color: '#7bb8ff', accent: '#d9efff',
        desc: 'Alcança através da névoa e deixa um rastro que ainda corta.',
        damage: 30, reach: 172, arc: 0.62, cooldown: 0.50, knockback: 200,
        combo: [1, 1.1, 1.4], kind: 'thrust', critBonus: 0.04, lifestealBonus: 0,
        pierce: true, special: 'Estocada longa que atravessa vários inimigos.'
    },
    scythe: {
        id: 'scythe', name: 'Foice da Ceifa', type: 'scythe', icon: 'scythe',
        rarity: 'epic', cost: 900, color: '#79ffb0', accent: '#d9ffe8',
        desc: 'Colhe vida em arcos amplos. A fome da lâmina é anterior ao Abismo.',
        damage: 33, reach: 136, arc: 2.95, cooldown: 0.68, knockback: 260,
        combo: [1, 1.2], kind: 'arc', critBonus: 0.03, lifestealBonus: 0.06,
        special: 'Varredura quase completa e +6% de roubo de vida.'
    },
    abyss_blade: {
        id: 'abyss_blade', name: 'Lâmina do Abismo', type: 'greatsword', icon: 'sword',
        rarity: 'legendary', cost: 1650, color: '#d16bff', accent: '#ffe0ff',
        desc: 'A espada lembra de cada alma que já devorou. Às vezes, elas atacam por você.',
        damage: 36, reach: 124, arc: 1.85, cooldown: 0.52, knockback: 300,
        combo: [1, 1.15, 1.6], kind: 'arc', critBonus: 0.05, lifestealBonus: 0.02,
        wave: true, special: 'Cada golpe libera uma onda de energia do Abismo.'
    },
    staff: {
        id: 'staff', name: 'Cetro do Eclipse', type: 'staff', icon: 'staff',
        rarity: 'legendary', cost: 1500, color: '#ffd166', accent: '#fff3c4',
        desc: 'Um eclipse engarrafado na ponta de um cetro. Dispara fragmentos de noite.',
        damage: 21, reach: 560, arc: 0.4, cooldown: 0.44, knockback: 90,
        combo: [1, 1, 1.3], kind: 'ranged', critBonus: 0.06, lifestealBonus: 0,
        special: 'Ataque à distância com projéteis perfurantes.'
    }
};

// ---------------------------------------------------------------
// HABILIDADES
// ---------------------------------------------------------------
const SKILLS = {
    nova: {
        id: 'nova', name: 'Nova Sombria', school: 'shadow', icon: 'nova', color: '#b06bff',
        desc: 'Libera uma explosão de trevas ao redor, causando dano e retardando inimigos.',
        mana: 18, cooldown: 4.2, cost: 0, rarity: 'common',
        formula: 'Dano em área + lentidão por 2s.'
    },
    spear: {
        id: 'spear', name: 'Lança Espectral', school: 'shadow', icon: 'spear', color: '#7bb8ff',
        desc: 'Projeta uma lança fantasma que atravessa todos os inimigos no caminho.',
        mana: 22, cooldown: 4.8, cost: 0, rarity: 'common',
        formula: 'Projétil perfurante de alto alcance.'
    },
    meteor: {
        id: 'meteor', name: 'Chuva de Meteoros', school: 'fire', icon: 'meteor', color: '#ff7a3d',
        desc: 'Invoca cinco meteoros sobre a área do cursor. Cada impacto causa dano em área.',
        mana: 38, cooldown: 9.0, cost: 0, rarity: 'rare',
        formula: '5 impactos telegrafados + queimadura.'
    },
    chains: {
        id: 'chains', name: 'Correntes do Abismo', school: 'void', icon: 'chain', color: '#8d6bff',
        desc: 'Correntes espectrais prendem até cinco inimigos e descarregam energia entre eles.',
        mana: 30, cooldown: 8.0, cost: 0, rarity: 'rare',
        formula: 'Corrente em até 5 alvos + eletricidade.'
    },
    frost: {
        id: 'frost', name: 'Explosão de Gelo', school: 'ice', icon: 'ice', color: '#7fe7ff',
        desc: 'Congela o ar em uma explosão de estilhaços, congelando inimigos próximos.',
        mana: 26, cooldown: 6.5, cost: 380, rarity: 'rare',
        formula: 'Dano em área + congelamento.'
    },
    flames: {
        id: 'flames', name: 'Chamas Infernais', school: 'fire', icon: 'fire', color: '#ff9f43',
        desc: 'Cospe uma cone de fogo que incendeia tudo à frente.',
        mana: 24, cooldown: 5.0, cost: 420, rarity: 'rare',
        formula: 'Cone de dano + queimadura por 4s.'
    },
    storm: {
        id: 'storm', name: 'Tempestade Elétrica', school: 'lightning', icon: 'bolt', color: '#ffe66d',
        desc: 'Uma tempestade persegue os inimigos próximos por alguns segundos.',
        mana: 34, cooldown: 9.5, cost: 480, rarity: 'epic',
        formula: 'Relâmpagos automáticos por 3s.'
    },
    shield: {
        id: 'shield', name: 'Escudo Arcano', school: 'arcane', icon: 'shield', color: '#61c0ff',
        desc: 'Tecer uma barreira de runas que absorve dano e reflete uma parte.',
        mana: 28, cooldown: 11.0, cost: 320, rarity: 'rare',
        formula: 'Escudo de 70 + reflexo por 6s.'
    },
    blink: {
        id: 'blink', name: 'Teleporte', school: 'void', icon: 'blink', color: '#c46bff',
        desc: 'Desaparece e reaparece na direção do cursor, ferindo quem ficou para trás.',
        mana: 20, cooldown: 5.5, cost: 350, rarity: 'rare',
        formula: 'Teleporte + dano + invulnerabilidade.'
    },
    drain: {
        id: 'drain', name: 'Drenagem Vital', school: 'blood', icon: 'drain', color: '#ff4d6d',
        desc: 'Conecta-se à alma do inimigo mais próximo, drenando vida para você.',
        mana: 25, cooldown: 7.0, cost: 450, rarity: 'rare',
        formula: 'Dano contínuo + cura de 60%.'
    },
    runes: {
        id: 'runes', name: 'Runas Explosivas', school: 'arcane', icon: 'rune', color: '#e8c46a',
        desc: 'Inscreve três runas no chão que explodem quando inimigos se aproximam.',
        mana: 30, cooldown: 8.5, cost: 520, rarity: 'epic',
        formula: '3 armadilhas explosivas.'
    },
    summon: {
        id: 'summon', name: 'Invocação: Lobo Espectral', school: 'summon', icon: 'wolf', color: '#a8ffdf',
        desc: 'Invoca um lobo das sombras que caça os inimigos por 14 segundos.',
        mana: 36, cooldown: 14.0, cost: 750, rarity: 'epic',
        formula: 'Aliado espectral por 14s.'
    },
    supreme: {
        id: 'supreme', name: 'Suprema: Eclipse', school: 'void', icon: 'eclipse', color: '#ff7ae0',
        desc: 'Apaga a luz da masmorra e executa todos os inimigos ao redor. Cura 20% da vida máxima.',
        mana: 60, cooldown: 30.0, cost: 1300, rarity: 'legendary',
        formula: 'Dano massivo em tela + cura.'
    }
};

// ---------------------------------------------------------------
// INIMIGOS
// ---------------------------------------------------------------
const ENEMY_DEFS = {
    skeleton: {
        id: 'skeleton', name: 'Esqueleto', draw: 'skeleton', ai: 'melee',
        hp: 36, speed: 76, damage: 9, range: 56, atkCd: 1.15, telegraph: 0.38,
        xp: 15, coins: 1, size: 22, color: '#d8d4c2', threat: 1, minWave: 1,
        desc: 'Restos de um soldado que esqueceu como morrer. Ataca em grupos.'
    },
    wraith: {
        id: 'wraith', name: 'Espectro', draw: 'wraith', ai: 'blink',
        hp: 30, speed: 96, damage: 11, range: 58, atkCd: 1.3, telegraph: 0.3,
        xp: 20, coins: 1, size: 21, color: '#9b8cff', threat: 2, minWave: 2,
        desc: 'Uma lembrança raivosa. Pisca pelo espaço e evita o combate direto.'
    },
    spider: {
        id: 'spider', name: 'Aranha Gigante', draw: 'spider', ai: 'leap',
        hp: 42, speed: 92, damage: 10, range: 62, atkCd: 1.5, telegraph: 0.45,
        xp: 22, coins: 2, size: 26, color: '#9c6b4f', threat: 2, minWave: 3,
        desc: 'Tecelã das catacumbas. Salta sobre a presa e deixa veneno no chão.'
    },
    cultist: {
        id: 'cultist', name: 'Cultista', draw: 'cultist', ai: 'ranged',
        hp: 34, speed: 66, damage: 8, range: 320, atkCd: 2.0, telegraph: 0.55,
        xp: 24, coins: 2, size: 22, color: '#c04dff', threat: 2, minWave: 3,
        desc: 'Sussurra para o Abismo e recebe fogo de volta. Mantém distância.'
    },
    bomber: {
        id: 'bomber', name: 'Criatura Explosiva', draw: 'bomber', ai: 'bomber',
        hp: 30, speed: 112, damage: 26, range: 48, atkCd: 2.4, telegraph: 0.8,
        xp: 18, coins: 1, size: 23, color: '#ff7a3d', threat: 2, minWave: 4,
        desc: 'Uma bolsa de carne e fogo. Corre para perto e detona.'
    },
    assassin: {
        id: 'assassin', name: 'Assassino', draw: 'assassin', ai: 'assassin',
        hp: 40, speed: 118, damage: 16, range: 66, atkCd: 1.8, telegraph: 0.4,
        xp: 30, coins: 3, size: 21, color: '#5ef2c2', threat: 3, minWave: 5,
        desc: 'Flanqueia, desaparece na fumaça e ataca pelas costas.'
    },
    golem: {
        id: 'golem', name: 'Golem de Ruína', draw: 'golem', ai: 'slam',
        hp: 105, speed: 46, damage: 20, range: 78, atkCd: 2.2, telegraph: 0.75,
        xp: 38, coins: 4, size: 30, color: '#87949c', threat: 3, minWave: 6,
        desc: 'Pedra animada por um selo rachado. O punho cria crateras.'
    },
    healer: {
        id: 'healer', name: 'Sacerdote Caído', draw: 'healer', ai: 'support',
        hp: 38, speed: 58, damage: 5, range: 280, atkCd: 2.6, telegraph: 0.5,
        xp: 28, coins: 2, size: 22, color: '#7dffb0', threat: 3, minWave: 6,
        desc: 'Cura os inimigos próximos e lança preces corrompidas.'
    },
    summoner: {
        id: 'summoner', name: 'Invocador do Vazio', draw: 'summoner', ai: 'summoner',
        hp: 55, speed: 60, damage: 10, range: 340, atkCd: 2.4, telegraph: 0.7,
        xp: 42, coins: 4, size: 24, color: '#c46bff', threat: 4, minWave: 8,
        desc: 'Rasga portais menores e chama servos para lutar em seu lugar.'
    },
    invisible: {
        id: 'invisible', name: 'Espreitador Invisível', draw: 'invisible', ai: 'invisible',
        hp: 34, speed: 124, damage: 18, range: 62, atkCd: 1.4, telegraph: 0.35,
        xp: 34, coins: 3, size: 21, color: '#a7d8ff', threat: 4, minWave: 9,
        desc: 'Uma distorção no ar. Só se revela quando é tarde demais.'
    },
    brute: {
        id: 'brute', name: 'Brutamontes do Abismo', draw: 'brute', ai: 'charge',
        hp: 140, speed: 72, damage: 24, range: 80, atkCd: 2.0, telegraph: 0.65,
        xp: 55, coins: 6, size: 32, color: '#ff9f43', threat: 4, minWave: 7,
        desc: 'Elite. Carrega em linha reta e esmaga tudo que encontra.'
    }
};

// ---------------------------------------------------------------
// CHEFES
// ---------------------------------------------------------------
const BOSS_DEFS = [
    {
        id: 'executioner', name: 'O Carrasco Esquecido', draw: 'executioner',
        title: 'Aquele que ainda espera pela ordem', hp: 720, speed: 58,
        damage: 20, size: 48, color: '#c0392b', accent: '#ffb36b', wave: 5,
        desc: 'Um carrasco sem rosto que nunca recebeu permissão para parar de cortar.',
        quote: 'A sentença nunca foi revogada.'
    },
    {
        id: 'spider_queen', name: 'A Rainha das Aranhas', draw: 'spider_queen',
        title: 'Mãe dos Fios Vermelhos', hp: 1500, speed: 74,
        damage: 24, size: 54, color: '#b56439', accent: '#ff7ad1', wave: 10,
        desc: 'Ela teceu as catacumbas com seda e ossos. Cada fio leva à sua boca.',
        quote: 'Venha. O ninho está quente.'
    },
    {
        id: 'faceless_knight', name: 'O Cavaleiro Sem Rosto', draw: 'faceless_knight',
        title: 'Herói de uma guerra perdida', hp: 2700, speed: 88,
        damage: 30, size: 50, color: '#8fa6c4', accent: '#9fe8ff', wave: 15,
        desc: 'Sua armadura guarda o vazio de um nome que ninguém mais lembra.',
        quote: 'Se eu não tenho rosto, nada pode me julgar.'
    },
    {
        id: 'abyss_dragon', name: 'O Dragão Abissal', draw: 'dragon',
        title: 'A Boca do Abismo', hp: 4300, speed: 62,
        damage: 38, size: 64, color: '#ff4d2e', accent: '#ffd166', wave: 20,
        desc: 'Não dorme: sonha. E o sonho dele é fome.',
        quote: 'Tudo o que cai, cai para dentro de mim.'
    },
    {
        id: 'void_guardian', name: 'O Guardião do Vazio', draw: 'void_guardian',
        title: 'Sentinela do Último Selo', hp: 6200, speed: 70,
        damage: 44, size: 58, color: '#b06bff', accent: '#ff7ae0', wave: 25,
        desc: 'O guardião não impede a entrada do Abismo. Ele impede a saída.',
        quote: 'Ninguém atravessa o selo. Nem você.'
    }
];

// ---------------------------------------------------------------
// BIOMAS
// ---------------------------------------------------------------
const BIOMES = [
    {
        id: 'catacumbas', name: 'Catacumbas de Vahl', short: 'Catacumbas',
        desc: 'Corredores de pedra encharcados de história e poeira. As tochas ainda ardem por lealdade.',
        floor: '#1a1922', floor2: '#211f2b', wall: '#2b2838', wallLight: '#3a3550',
        fog: '#4d3d78', light: '#ffb36b', particle: 'ember',
        ambient: 0.50, accent: '#a98bff', music: 'catacumbas',
        props: ['bone', 'skull', 'pillar', 'torch', 'crystal', 'rune', 'coffin', 'chain']
    },
    {
        id: 'floresta', name: 'Floresta Corrompida', short: 'Floresta',
        desc: 'Árvores negras crescem sobre altares esquecidos. Luzes verdes observam entre as raízes.',
        floor: '#111a15', floor2: '#16221b', wall: '#1d2b22', wallLight: '#2d4433',
        fog: '#356b4c', light: '#7dffb0', particle: 'firefly',
        ambient: 0.42, accent: '#62ffa8', music: 'floresta',
        props: ['tree', 'root', 'mushroom', 'bone', 'torch', 'rune', 'crystal', 'altar']
    },
    {
        id: 'cavernas', name: 'Cavernas Congeladas', short: 'Cavernas',
        desc: 'O gelo guarda criaturas em posições de agonia. O vento assobia nomes antigos.',
        floor: '#121a24', floor2: '#172231', wall: '#1d2c3e', wallLight: '#31516b',
        fog: '#5a8db3', light: '#7fe7ff', particle: 'snow',
        ambient: 0.54, accent: '#7fe7ff', music: 'cavernas',
        props: ['crystal', 'ice', 'bone', 'pillar', 'torch', 'rune', 'frozen']
    },
    {
        id: 'infernal', name: 'Fortaleza Infernal', short: 'Infernal',
        desc: 'Uma forja que nunca esfriou. Correntes arrastam brasas e o ar queima por dentro.',
        floor: '#1d1111', floor2: '#261616', wall: '#311b1b', wallLight: '#552b25',
        fog: '#b3412b', light: '#ff7a3d', particle: 'ember',
        ambient: 0.47, accent: '#ff7a3d', music: 'infernal',
        props: ['lava', 'chain', 'skull', 'pillar', 'torch', 'rune', 'forge', 'spikes']
    },
    {
        id: 'abismo', name: 'Abismos Mágicos', short: 'Abismo',
        desc: 'Não há chão, apenas a ilusão dele. Runas flutuantes mantêm o mundo unido por um fio.',
        floor: '#140f22', floor2: '#1b1430', wall: '#251c3e', wallLight: '#3d2c66',
        fog: '#7a4ab8', light: '#d16bff', particle: 'void',
        ambient: 0.60, accent: '#d16bff', music: 'abismo',
        props: ['rune', 'crystal', 'voidstone', 'pillar', 'torch', 'altar', 'chain', 'portal']
    }
];

// ---------------------------------------------------------------
// RELÍQUIAS (risco x recompensa)
// ---------------------------------------------------------------
const RELICS = {
    abyss_heart: {
        id: 'abyss_heart', name: 'Coração do Abismo', icon: 'heart', rarity: 'epic',
        desc: '+25% de dano, mas +15% de dano recebido.',
        flavor: 'Ele bate no ritmo de algo que nunca nasceu.'
    },
    cursed_coin: {
        id: 'cursed_coin', name: 'Moeda Amaldiçoada', icon: 'coin', rarity: 'rare',
        desc: '+45% de moedas, -20 de vida máxima.',
        flavor: 'Cara: riqueza. Coroa: dívida.'
    },
    void_eye: {
        id: 'void_eye', name: 'Olho do Vazio', icon: 'eye', rarity: 'epic',
        desc: '+35% de poder mágico, -8% de velocidade.',
        flavor: 'Ele pisca quando você pisca. Um segundo depois.'
    },
    blood_chalice: {
        id: 'blood_chalice', name: 'Cálice de Sangue', icon: 'drain', rarity: 'rare',
        desc: '+8% de roubo de vida, cura de corações -25%.',
        flavor: 'Sempre há mais espaço dentro.'
    },
    storm_core: {
        id: 'storm_core', name: 'Núcleo da Tempestade', icon: 'bolt', rarity: 'epic',
        desc: 'Ataques têm 20% de chance de liberar uma corrente elétrica.',
        flavor: 'Um trovão engolido e mantido vivo.'
    },
    frozen_soul: {
        id: 'frozen_soul', name: 'Alma Congelada', icon: 'ice', rarity: 'rare',
        desc: 'Ataques congelam inimigos. +12% de dano contra alvos congelados.',
        flavor: 'Ainda implora por calor.'
    },
    phoenix_feather: {
        id: 'phoenix_feather', name: 'Pluma da Fênix Morta', icon: 'feather', rarity: 'legendary',
        desc: 'Revive uma vez por run com 45% da vida. -20 de vida máxima.',
        flavor: 'A morte é só uma chama que esqueceu de apagar.'
    },
    gambler_die: {
        id: 'gambler_die', name: 'Dado do Apostador', icon: 'dice', rarity: 'rare',
        desc: '+18% de crítico e +35% de dano crítico, -10% de dano base.',
        flavor: 'Todas as faces mostram um sorriso.'
    },
    giant_belt: {
        id: 'giant_belt', name: 'Cinto do Gigante', icon: 'belt', rarity: 'epic',
        desc: '+35 de vida máxima e +10% de armadura, -8% de crítico.',
        flavor: 'Ajustado para alguém que já foi uma montanha.'
    },
    merchant_seal: {
        id: 'merchant_seal', name: 'Selo do Mercador', icon: 'seal', rarity: 'rare',
        desc: 'Preços na loja da run -25%, mas inimigos causam +10% de dano.',
        flavor: 'Toda compra inclui uma pequena maldição.'
    }
};

// ---------------------------------------------------------------
// MODIFICADORES DE PARTIDA
// ---------------------------------------------------------------
const MODIFIERS = {
    frenzy: {
        id: 'frenzy', name: 'Frenesi', icon: 'bolt', color: '#ff9f43',
        desc: 'Inimigos se movem 20% mais rápido. Recompensa: +20% de moedas.',
        apply: { enemySpeed: 1.2, gold: 1.2 }
    },
    fragile: {
        id: 'fragile', name: 'Cristal', icon: 'ice', color: '#7fe7ff',
        desc: 'Você recebe +30% de dano. Recompensa: +30% de dano causado.',
        apply: { damageTaken: 1.3, damage: 1.3 }
    },
    elite: {
        id: 'elite', name: 'Caçada de Elites', icon: 'crown', color: '#ffd166',
        desc: 'Elites aparecem com o dobro de frequência. Recompensa: +35% de XP.',
        apply: { elites: 2, xp: 1.35 }
    },
    greed: {
        id: 'greed', name: 'Ganância', icon: 'coin', color: '#e8c46a',
        desc: 'Cofres e moedas são maiores, mas mercadores cobram +20%.',
        apply: { gold: 1.4, prices: 1.2 }
    },
    ironman: {
        id: 'ironman', name: 'Ferro e Cinza', icon: 'shield', color: '#b0bec5',
        desc: 'Sem cura por corações. Recompensa: +50% de escudo e +25% de XP.',
        apply: { noHearts: true, shield: 1.5, xp: 1.25 }
    }
};

// ---------------------------------------------------------------
// DIFICULDADES
// ---------------------------------------------------------------
const DIFFICULTIES = {
    normal: {
        id: 'normal', name: 'Normal', short: 'Normal', color: '#6fe7a0',
        desc: 'A descida padrão. Inimigos equilibrados e recompensas normais.',
        hp: 1.0, dmg: 1.0, xp: 1.0, gold: 1.0, elite: 0.10, score: 1.0
    },
    nightmare: {
        id: 'nightmare', name: 'Pesadelo', short: 'Pesadelo', color: '#ff9f43',
        desc: 'Inimigos +55% de vida e +35% de dano. Recompensas +35%.',
        hp: 1.55, dmg: 1.35, xp: 1.25, gold: 1.35, elite: 0.20, score: 1.5
    },
    abyss: {
        id: 'abyss', name: 'Abismo', short: 'Abismo', color: '#ff4d6d',
        desc: 'Inimigos +120% de vida e +75% de dano. Recompensas +70%.',
        hp: 2.2, dmg: 1.75, xp: 1.6, gold: 1.7, elite: 0.32, score: 2.25
    }
};

// ---------------------------------------------------------------
// MELHORIAS PERMANENTES
// ---------------------------------------------------------------
const META_UPGRADES = [
    { key: 'hp', name: 'Coração de Pedra', icon: 'heart', desc: '+18 Vida Máx', max: 15, cost: l => Math.round(22 + l * 20 + l * l * 2) },
    { key: 'dmg', name: 'Lâmina Afiada', icon: 'sword', desc: '+8% Dano', max: 15, cost: l => Math.round(28 + l * 24 + l * l * 2) },
    { key: 'speed', name: 'Botas de Vento', icon: 'boots', desc: '+4% Velocidade', max: 10, cost: l => Math.round(18 + l * 16 + l * l) },
    { key: 'mana', name: 'Frasco Eterno', icon: 'mana', desc: '+22 Mana Máx', max: 12, cost: l => Math.round(20 + l * 18 + l * l) },
    { key: 'crit', name: 'Olho de Águia', icon: 'eye', desc: '+2.5% Crítico', max: 12, cost: l => Math.round(32 + l * 26 + l * l * 2) },
    { key: 'lifesteal', name: 'Sangue Fresco', icon: 'drain', desc: '+1.5% Roubo de Vida', max: 10, cost: l => Math.round(35 + l * 28 + l * l * 2) },
    { key: 'thorns', name: 'Couraça Viva', icon: 'thorns', desc: '+5 Dano Refletido', max: 10, cost: l => Math.round(24 + l * 18 + l * l) },
    { key: 'xp', name: 'Cabeça Brilhante', icon: 'xp', desc: '+10% XP', max: 12, cost: l => Math.round(22 + l * 18 + l * l) },
    { key: 'gold', name: 'Mãos de Ouro', icon: 'coin', desc: '+10% Moedas', max: 12, cost: l => Math.round(20 + l * 16 + l * l) },
    { key: 'armor', name: 'Pele de Pedra', icon: 'shield', desc: '+2% Armadura', max: 12, cost: l => Math.round(30 + l * 24 + l * l * 2) },
    { key: 'cooldown', name: 'Selos Arcanos', icon: 'rune', desc: '-3% Recarga de Habilidades', max: 10, cost: l => Math.round(40 + l * 32 + l * l * 2) },
    { key: 'dash', name: 'Passo Relâmpago', icon: 'boots', desc: '-4% Recarga do Dash', max: 10, cost: l => Math.round(20 + l * 16 + l * l) }
];

// ---------------------------------------------------------------
// MELHORIAS DA RUN
// ---------------------------------------------------------------
const UPGRADES_POOL = [
    { id: 'dmg', name: 'Força Bruta', icon: 'sword', rarity: 'common', category: 'combate', desc: '+18% de dano de ataque.', max: 8, apply: p => p.upg.damagePct += 0.18 },
    { id: 'hp', name: 'Vitalidade', icon: 'heart', rarity: 'common', category: 'sobrevivencia', desc: '+25 vida máxima e cura 25.', max: 8, apply: p => { p.upg.hpMax += 25; p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: 'speed', name: 'Passo Ágil', icon: 'boots', rarity: 'common', category: 'sobrevivencia', desc: '+9% de velocidade.', max: 6, apply: p => p.upg.speedPct += 0.09 },
    { id: 'crit', name: 'Oitenta ou Oitenta', icon: 'eye', rarity: 'rare', category: 'combate', desc: '+7% de chance crítica.', max: 8, apply: p => p.upg.critChance += 0.07 },
    { id: 'critDmg', name: 'Golpe Certeiro', icon: 'dagger', rarity: 'rare', category: 'combate', desc: '+25% de dano crítico.', max: 6, apply: p => p.upg.critDamage += 0.25 },
    { id: 'atkSpeed', name: 'Reflexos', icon: 'bolt', rarity: 'common', category: 'combate', desc: '+12% de velocidade de ataque.', max: 6, apply: p => p.upg.attackSpeedPct += 0.12 },
    { id: 'manaRegen', name: 'Fluxo Mágico', icon: 'mana', rarity: 'common', category: 'magia', desc: '+35% de regeneração de mana.', max: 6, apply: p => p.upg.manaRegenPct += 0.35 },
    { id: 'lifesteal', name: 'Vampirismo', icon: 'drain', rarity: 'rare', category: 'sobrevivencia', desc: '+4% de roubo de vida.', max: 5, apply: p => p.upg.lifestealPct += 0.04 },
    { id: 'thorns', name: 'Espinhos', icon: 'thorns', rarity: 'common', category: 'sobrevivencia', desc: '+12 de dano refletido.', max: 6, apply: p => p.upg.thorns += 12 },
    { id: 'maxMana', name: 'Reserva Arcana', icon: 'mana', rarity: 'common', category: 'magia', desc: '+20 de mana máxima.', max: 6, apply: p => p.upg.manaMax += 20 },
    { id: 'dashCd', name: 'Relâmpago', icon: 'boots', rarity: 'rare', category: 'sobrevivencia', desc: '-15% de recarga do dash.', max: 4, apply: p => p.upg.dashCdPct += 0.15 },
    { id: 'healing', name: 'Coração Jovem', icon: 'heart', rarity: 'common', category: 'sobrevivencia', desc: '+40% de cura por drops.', max: 4, apply: p => p.upg.healingPct += 0.4 },
    { id: 'dashDmg', name: 'Investida Gigante', icon: 'bolt', rarity: 'rare', category: 'combate', desc: 'O dash causa dano e empurra inimigos.', max: 4, apply: p => p.upg.dashDamage += 25 },
    { id: 'ricochet', name: 'Ricochete', icon: 'sword', rarity: 'rare', category: 'combate', desc: 'Ataques acertam +1 alvo próximo.', max: 4, apply: p => p.upg.bonusTargets += 1 },
    { id: 'regenHp', name: 'Regeneração', icon: 'heart', rarity: 'rare', category: 'sobrevivencia', desc: '+0.8 de vida por segundo.', max: 5, apply: p => p.upg.regen += 0.8 },
    { id: 'armor', name: 'Pele de Ferro', icon: 'shield', rarity: 'rare', category: 'sobrevivencia', desc: '+5% de armadura.', max: 5, apply: p => p.upg.armor += 0.05 },
    { id: 'skillPower', name: 'Foco Arcano', icon: 'orb', rarity: 'rare', category: 'magia', desc: '+16% de poder mágico.', max: 6, apply: p => p.upg.skillPowerPct += 0.16 },
    { id: 'cooldown', name: 'Selos Rápidos', icon: 'rune', rarity: 'epic', category: 'magia', desc: '-8% de recarga de habilidades.', max: 4, apply: p => p.upg.cooldownPct += 0.08 },
    { id: 'xp', name: 'Mente Afiada', icon: 'xp', rarity: 'common', category: 'cacador', desc: '+12% de XP.', max: 4, apply: p => p.upg.xpPct += 0.12 },
    { id: 'gold', name: 'Faro do Ouro', icon: 'coin', rarity: 'common', category: 'cacador', desc: '+15% de moedas.', max: 4, apply: p => p.upg.goldPct += 0.15 },
    { id: 'magnet', name: 'Ímã Rúnico', icon: 'magnet', rarity: 'common', category: 'cacador', desc: '+35% de raio de coleta.', max: 4, apply: p => p.upg.magnetPct += 0.35 },
    { id: 'dodge', name: 'Passo Fantasma', icon: 'blink', rarity: 'epic', category: 'sobrevivencia', desc: '+6% de chance de esquiva.', max: 4, apply: p => p.upg.dodge += 0.06 },
    { id: 'area', name: 'Eco Sombrio', icon: 'nova', rarity: 'rare', category: 'magia', desc: '+12% de área de habilidades.', max: 4, apply: p => p.upg.areaPct += 0.12 },
    { id: 'elementalFire', name: 'Brasa Eterna', icon: 'fire', rarity: 'epic', category: 'magia', desc: 'Seus ataques incendeiam inimigos.', max: 1, apply: p => p.upg.fireOnHit = true },
    { id: 'elementalIce', name: 'Toque Glacial', icon: 'ice', rarity: 'epic', category: 'magia', desc: 'Seus ataques retardam inimigos.', max: 1, apply: p => p.upg.iceOnHit = true },
    { id: 'elementalBolt', name: 'Condutor', icon: 'bolt', rarity: 'epic', category: 'magia', desc: 'Ataques têm 15% de chance de criar uma corrente.', max: 1, apply: p => p.upg.chainChance += 0.15 },
    { id: 'execute', name: 'Ceifador', icon: 'scythe', rarity: 'epic', category: 'combate', desc: '+35% de dano contra inimigos abaixo de 30% de vida.', max: 2, apply: p => p.upg.execute += 0.35 },
    { id: 'revenge', name: 'Fúria Ferida', icon: 'crown', rarity: 'rare', category: 'combate', desc: '+30% de dano quando abaixo de 40% de vida.', max: 2, apply: p => p.upg.lowHpDamage += 0.30 },
    { id: 'summon', name: 'Vínculo Espectral', icon: 'wolf', rarity: 'epic', category: 'invocacao', desc: 'Invocação dura +6s e causa +30% de dano.', max: 3, apply: p => { p.upg.summonBonus += 1; p.upg.summonDamage += 0.3; } }
];

// ---------------------------------------------------------------
// EQUIPAMENTOS
// ---------------------------------------------------------------
const RARITIES = {
    common:    { id: 'common', name: 'Comum', color: '#9aa4ad', affixes: 1, mult: 1.0, weight: 46 },
    uncommon:  { id: 'uncommon', name: 'Incomum', color: '#72d572', affixes: 2, mult: 1.25, weight: 28 },
    rare:      { id: 'rare', name: 'Raro', color: '#5fa8ff', affixes: 3, mult: 1.6, weight: 15 },
    epic:      { id: 'epic', name: 'Épico', color: '#b06bff', affixes: 4, mult: 2.1, weight: 7 },
    legendary: { id: 'legendary', name: 'Lendário', color: '#ffb347', affixes: 5, mult: 2.8, weight: 3 },
    mythic:    { id: 'mythic', name: 'Mítico', color: '#ff5f7a', affixes: 6, mult: 3.7, weight: 1 }
};

const EQUIP_SLOTS = [
    { id: 'weapon', name: 'Arma', icon: 'sword' },
    { id: 'armor', name: 'Armadura', icon: 'armor' },
    { id: 'helm', name: 'Elmo', icon: 'helm' },
    { id: 'boots', name: 'Botas', icon: 'boots' },
    { id: 'ring', name: 'Anel', icon: 'ring' },
    { id: 'amulet', name: 'Amuleto', icon: 'amulet' }
];

const ITEM_BASES = {
    weapon: ['Lâmina Rachada', 'Espada do Crepúsculo', 'Foice de Osso', 'Machado Ritual', 'Lança do Selo', 'Cetro Partido'],
    armor: ['Couraça de Placas', 'Manto do Abismo', 'Armadura Rúnica', 'Peitoral de Escamas', 'Túnica da Noite'],
    helm: ['Elmo do Carrasco', 'Capuz Sombrio', 'Coroa Rachada', 'Máscara de Osso', 'Diadema Arcano'],
    boots: ['Botas de Couro', 'Grevas do Vazio', 'Passos Silenciosos', 'Botas Rúnicas', 'Pés de Cinza'],
    ring: ['Anel de Obsidiana', 'Selo de Prata', 'Anel do Eclipse', 'Aliança Amaldiçoada', 'Aro de Sangue'],
    amulet: ['Amuleto de Osso', 'Colar do Abismo', 'Talismã Rúnico', 'Pingente do Vigia', 'Olho de Vidro']
};

const AFFIXES = [
    { key: 'damagePct', name: 'Dano', suffix: '% de dano', min: 4, max: 11, pct: true },
    { key: 'maxHpPct', name: 'Vida', suffix: '% de vida máxima', min: 5, max: 13, pct: true },
    { key: 'critChance', name: 'Crítico', suffix: '% de crítico', min: 2, max: 6, pct: true },
    { key: 'critDamage', name: 'Dano Crítico', suffix: '% de dano crítico', min: 8, max: 22, pct: true },
    { key: 'armor', name: 'Armadura', suffix: '% de armadura', min: 2, max: 6, pct: true },
    { key: 'moveSpeed', name: 'Velocidade', suffix: '% de velocidade', min: 2, max: 7, pct: true },
    { key: 'attackSpeed', name: 'Ataque', suffix: '% de velocidade de ataque', min: 4, max: 10, pct: true },
    { key: 'skillPower', name: 'Magia', suffix: '% de poder mágico', min: 5, max: 14, pct: true },
    { key: 'lifesteal', name: 'Roubo de Vida', suffix: '% de roubo de vida', min: 1, max: 4, pct: true },
    { key: 'thorns', name: 'Reflexo', suffix: ' de dano refletido', min: 4, max: 14, pct: false },
    { key: 'maxMana', name: 'Mana', suffix: ' de mana máxima', min: 8, max: 24, pct: false },
    { key: 'regen', name: 'Regeneração', suffix: ' de vida por segundo', min: 0.2, max: 1.1, pct: false, dec: 1 },
    { key: 'goldPct', name: 'Ouro', suffix: '% de moedas', min: 5, max: 18, pct: true },
    { key: 'xpPct', name: 'Experiência', suffix: '% de XP', min: 4, max: 14, pct: true }
];

const UNIQUE_EFFECTS = {
    echo: { name: 'Eco', desc: '15% de chance de repetir 50% do dano do ataque.', color: '#9b7bff' },
    vampiric: { name: 'Vampírico', desc: '+3% de roubo de vida e cura 2 ao abater.', color: '#ff4d6d' },
    thornmail: { name: 'Coroa de Espinhos', desc: 'Reflete 25% do dano recebido.', color: '#b06bff' },
    quickstep: { name: 'Passo Rápido', desc: '+8% de velocidade e -8% de recarga do dash.', color: '#5ef2c2' },
    arcanist: { name: 'Arcanista', desc: '+15% de poder mágico e +15 de mana máxima.', color: '#61c0ff' },
    executioner: { name: 'Execução', desc: '+30% de dano contra inimigos abaixo de 35% da vida.', color: '#ff9f43' },
    hoarder: { name: 'Acumulador', desc: '+20% de moedas encontradas.', color: '#e8c46a' },
    frostbite: { name: 'Mordida Gélida', desc: 'Ataques retardam os inimigos.', color: '#7fe7ff' },
    infernal: { name: 'Núcleo Infernal', desc: 'Ataques incendeiam os inimigos.', color: '#ff7a3d' },
    stormbound: { name: 'Tempestade Presa', desc: '18% de chance de liberar uma corrente elétrica.', color: '#ffe66d' },
    phoenix: { name: 'Coração da Fênix', desc: 'Revive uma vez por run com 30% de vida.', color: '#ff7ae0' },
    greed: { name: 'Ganância', desc: '+25% de moedas e +10% de XP.', color: '#ffd166' }
};

const SETS = {
    shadow: {
        id: 'shadow', name: 'Traje das Sombras', color: '#9b7bff',
        pieces: ['Manto Sombrio', 'Capuz Sombrio', 'Passos Silenciosos', 'Anel de Obsidiana', 'Colar do Abismo'],
        bonus2: '+10% de dano e +5% de velocidade.',
        bonus3: '+20% de dano crítico e 10% de chance de esquiva.',
        apply2: p => { p.setBonus.damagePct += 0.10; p.setBonus.speedPct += 0.05; },
        apply3: p => { p.setBonus.critDamage += 0.20; p.setBonus.dodge += 0.10; }
    },
    abyss: {
        id: 'abyss', name: 'Pacto do Abismo', color: '#b06bff',
        pieces: ['Manto do Abismo', 'Coroa Rachada', 'Grevas do Vazio', 'Anel do Eclipse', 'Amuleto de Osso'],
        bonus2: '+15% de poder mágico.',
        bonus3: '+25 de mana máxima e -8% de recarga.',
        apply2: p => { p.setBonus.skillPowerPct += 0.15; },
        apply3: p => { p.setBonus.maxMana += 25; p.setBonus.cooldownPct += 0.08; }
    },
    frost: {
        id: 'frost', name: 'Legado Glacial', color: '#7fe7ff',
        pieces: ['Armadura Rúnica', 'Diadema Arcano', 'Botas Rúnicas', 'Anel de Prata', 'Talismã Rúnico'],
        bonus2: '+12% de armadura e +3% de roubo de vida.',
        bonus3: 'Ataques congelam inimigos; +15% de dano contra congelados.',
        apply2: p => { p.setBonus.armor += 0.12; p.setBonus.lifesteal += 0.03; },
        apply3: p => { p.setBonus.frostOnHit = true; p.setBonus.frostDamage += 0.15; }
    }
};

// ---------------------------------------------------------------
// CONQUISTAS
// ---------------------------------------------------------------
const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'Primeiro Sangue', icon: 'sword', desc: 'Derrote seu primeiro inimigo.', reward: 30, check: s => s.stats.kills >= 1 },
    { id: 'kill_100', name: 'Ceifador', icon: 'scythe', desc: 'Derrote 100 inimigos.', reward: 120, check: s => s.stats.kills >= 100 },
    { id: 'kill_1000', name: 'Lenda das Catacumbas', icon: 'crown', desc: 'Derrote 1.000 inimigos.', reward: 500, check: s => s.stats.kills >= 1000 },
    { id: 'wave_5', name: 'Sobrevivente', icon: 'rune', desc: 'Alcance a onda 5.', reward: 60, check: s => s.bestWave >= 5 },
    { id: 'wave_10', name: 'Além da Névoa', icon: 'orb', desc: 'Alcance a onda 10.', reward: 150, check: s => s.bestWave >= 10 },
    { id: 'wave_20', name: 'O Abismo Olha de Volta', icon: 'eclipse', desc: 'Alcance a onda 20.', reward: 400, check: s => s.bestWave >= 20 },
    { id: 'boss_1', name: 'Carrasco Derrubado', icon: 'axe', desc: 'Derrote um chefe.', reward: 100, check: s => s.stats.bosses >= 1 },
    { id: 'boss_5', name: 'Caçador de Coroas', icon: 'crown', desc: 'Derrote 5 chefes.', reward: 350, check: s => s.stats.bosses >= 5 },
    { id: 'level_10', name: 'Poder Ascendente', icon: 'xp', desc: 'Alcance o nível 10 em uma run.', reward: 120, check: s => s.stats.highestLevel >= 10 },
    { id: 'level_20', name: 'Ascensão', icon: 'nova', desc: 'Alcance o nível 20 em uma run.', reward: 400, check: s => s.stats.highestLevel >= 20 },
    { id: 'rich', name: 'Fortuna Sombria', icon: 'coin', desc: 'Acumule 1.000 moedas.', reward: 100, check: s => s.coins >= 1000 || s.stats.coinsEarned >= 1000 },
    { id: 'collector', name: 'Colecionador', icon: 'chest', desc: 'Encontre 10 equipamentos.', reward: 150, check: s => (s.stats.itemsFound || 0) >= 10 },
    { id: 'explorer', name: 'Cartógrafo', icon: 'map', desc: 'Abra 5 baús.', reward: 100, check: s => s.stats.chests >= 5 },
    { id: 'loremaster', name: 'Vozes do Passado', icon: 'book', desc: 'Encontre 5 fragmentos de história.', reward: 200, check: s => s.stats.storyFragments >= 5 },
    { id: 'all_classes', name: 'Todos os Rostos', icon: 'mask', desc: 'Jogue com as 6 classes.', reward: 500, check: s => s.stats.classesPlayed.length >= 6 },
    { id: 'untouchable', name: 'Intocável', icon: 'shield', desc: 'Complete uma onda sem receber dano.', reward: 200, check: s => (s.stats.perfectWaves || 0) >= 1 },
    { id: 'combo_25', name: 'Fúria Encadeada', icon: 'bolt', desc: 'Alcance um combo de 25.', reward: 180, check: s => s.stats.bestCombo >= 25 }
];

// ---------------------------------------------------------------
// HISTÓRIA / CÓDICE
// ---------------------------------------------------------------
const STORY = [
    { id: 'intro', title: 'O Selo de Vahl', text: 'Há mil anos, os reis de Vahl selaram o Abismo sob uma fortaleza. O selo exigia um guardião vivo. Ninguém perguntou o que aconteceria quando ele morresse.' },
    { id: 'frag1', title: 'Diário do Vigia — I', text: 'A décima vigília. As tochas ardem azuis. O capelão diz que é um bom sinal. O capelão mente mal.' },
    { id: 'frag2', title: 'Diário do Vigia — II', text: 'Encontrei uma porta que não estava na planta. Atrás dela, uma sala com centenas de coroas. Todas do mesmo tamanho. Nenhuma cabeça.' },
    { id: 'frag3', title: 'Inscrição nas Catacumbas', text: 'NÃO CHORE PELOS MORTOS. ELES NÃO FORAM EMBORA. ELES SÓ APRENDERAM A ESPERAR.' },
    { id: 'frag4', title: 'Carta do Carrasco', text: 'Perdi a conta. O rei prometeu que a próxima execução seria a última. O rei está morto. A promessa não.' },
    { id: 'frag5', title: 'Seda e Ossos', text: 'A Rainha tece com o que encontra. Ela já encontrou muitos heróis. Os fios vermelhos são lembranças que ainda se mexem.' },
    { id: 'frag6', title: 'O Nome Apagado', text: 'O Cavaleiro Sem Rosto guarda um espelho. Quem olha vê o próprio nome desaparecer, letra por letra.' },
    { id: 'frag7', title: 'A Fome do Dragão', text: 'O Dragão Abissal não come carne. Ele devora possibilidades. Cada futuro que ele engole vira mais uma escama.' },
    { id: 'frag8', title: 'O Último Selo', text: 'O Guardião do Vazio não guarda uma porta. Guarda o lado de dentro. E, por algum motivo, ele parece aliviado que você tenha chegado.' }
];

const CODEX_BIOMES = {
    catacumbas: 'As Catacumbas de Vahl são o primeiro nível do selo. Suas paredes foram talhadas com nomes de soldados que nunca voltaram.',
    floresta: 'A Floresta Corrompida cresceu sobre um cemitério de altares. Suas raízes bebem memória, não água.',
    cavernas: 'As Cavernas Congeladas guardam criaturas em suspensão. O gelo não é frio; é medo cristalizado.',
    infernal: 'A Fortaleza Infernal foi a forja do selo. Ainda produz correntes para um exército que não existe.',
    abismo: 'O Abismo Mágico é onde a realidade é opcional. Ilhas flutuantes giram ao redor de runas que ninguém escreveu.'
};

// Textos de ajuda / tutorial
const TUTORIAL_STEPS = [
    'WASD ou setas para mover. O mouse define a direção dos ataques.',
    'Clique esquerdo para atacar. Clique direito para um golpe pesado.',
    'SHIFT ou ESPAÇO para o dash — ele concede invulnerabilidade breve.',
    'Use Q, E, R e F para as habilidades equipadas. G interage com baús, altares e mercadores quando estiver perto.',
    'Pressione I para abrir o inventário, ESC para pausar. Colete moedas e sobreviva até o chefe da onda 5.'
];

// Carrega o progresso somente depois que todo o conteúdo (classes, armas,
// habilidades, modificadores) foi declarado — sanitizeSave depende disso.
loadSave();


/* ----------------------------------------------------------------
   MÓDULO: effects.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — EFEITOS, PROJÉTEIS E PARTÍCULAS
   ================================================================ */
'use strict';

// ---------------------------------------------------------------
// PARTÍCULA
// ---------------------------------------------------------------
class Particle {
    constructor(x, y, color, opts = {}) {
        this.x = x; this.y = y;
        this.vx = opts.vx !== undefined ? opts.vx : rand(-90, 90);
        this.vy = opts.vy !== undefined ? opts.vy : rand(-90, 90);
        this.life = opts.life !== undefined ? opts.life : rand(0.28, 0.7);
        this.maxLife = this.life;
        this.color = color;
        this.size = opts.size !== undefined ? opts.size : rand(1.5, 4.2);
        this.gravity = opts.gravity || 0;
        this.drag = opts.drag !== undefined ? opts.drag : 2.5;
        this.glow = !!opts.glow;
        this.kind = opts.kind || 'spark';
        this.rot = rand(0, TAU);
        this.spin = rand(-6, 6);
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        const d = Math.exp(-this.drag * dt);
        this.vx *= d; this.vy *= d;
        this.rot += this.spin * dt;
        this.life -= dt;
    }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalAlpha = a;
        if (this.kind === 'smoke') {
            c.fillStyle = hexToRgba(this.color, 0.24);
            c.beginPath();
            c.arc(this.x, this.y, this.size * (1.4 + (1 - a) * 2.2), 0, TAU);
            c.fill();
        } else if (this.kind === 'shard') {
            c.translate(this.x, this.y);
            c.rotate(this.rot);
            c.fillStyle = this.color;
            c.beginPath();
            c.moveTo(0, -this.size * 1.4);
            c.lineTo(this.size * 0.65, 0);
            c.lineTo(0, this.size);
            c.lineTo(-this.size * 0.65, 0);
            c.closePath();
            c.fill();
        } else if (this.kind === 'rune') {
            c.translate(this.x, this.y);
            c.rotate(this.rot);
            c.strokeStyle = this.color;
            c.lineWidth = 1.2;
            c.beginPath();
            c.rect(-this.size, -this.size, this.size * 2, this.size * 2);
            c.stroke();
        } else {
            if (this.glow) {
                c.shadowBlur = 10;
                c.shadowColor = this.color;
            }
            c.fillStyle = this.color;
            c.beginPath();
            c.arc(this.x, this.y, Math.max(0.4, this.size * a), 0, TAU);
            c.fill();
        }
        c.restore();
    }
}

// ---------------------------------------------------------------
// TEXTO FLUTUANTE
// ---------------------------------------------------------------
class FloatingText {
    constructor(x, y, text, color, isCrit = false) {
        this.x = x + rand(-5, 5);
        this.y = y;
        this.text = text;
        this.color = color;
        this.isCrit = isCrit;
        this.life = isCrit ? 1.05 : 0.8;
        this.maxLife = this.life;
        this.vy = isCrit ? -52 : -38;
        this.vx = rand(-8, 8);
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 38 * dt;
        this.life -= dt;
    }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalAlpha = a;
        c.font = this.isCrit ? '800 20px Georgia, serif' : '700 14px Segoe UI, sans-serif';
        c.textAlign = 'center';
        c.lineWidth = 3;
        c.strokeStyle = 'rgba(0,0,0,0.75)';
        c.strokeText(this.text, this.x, this.y);
        c.fillStyle = this.color;
        c.fillText(this.text, this.x, this.y);
        if (this.isCrit) {
            c.globalAlpha = a * 0.6;
            c.font = '700 9px Segoe UI, sans-serif';
            c.fillStyle = '#fff3c4';
            c.fillText('CRÍTICO', this.x, this.y - 20);
        }
        c.restore();
    }
}

// ---------------------------------------------------------------
// ARCO DE ESPADA
// ---------------------------------------------------------------
class SlashEffect {
    constructor(x, y, angle, radius, arc, color, opts = {}) {
        this.x = x; this.y = y;
        this.angle = angle;
        this.radius = radius;
        this.arc = arc;
        this.color = color || '#a7d8ff';
        this.life = opts.life || 0.22;
        this.maxLife = this.life;
        this.dir = opts.dir || 1;
        this.width = opts.width || 18;
        this.heavy = !!opts.heavy;
    }
    update(dt) { this.life -= dt; }
    draw(c) {
        const t = 1 - clamp(this.life / this.maxLife, 0, 1);
        const a = clamp(this.life / this.maxLife, 0, 1);
        const start = this.angle - this.arc / 2 * this.dir;
        const end = this.angle + this.arc / 2 * this.dir;
        c.save();
        c.translate(this.x, this.y);
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = a * 0.9;
        const grad = c.createRadialGradient(0, 0, this.radius * 0.18, 0, 0, this.radius);
        grad.addColorStop(0, hexToRgba(this.color, 0));
        grad.addColorStop(0.45, hexToRgba(this.color, 0.32));
        grad.addColorStop(0.82, hexToRgba(this.color, 0.95));
        grad.addColorStop(1, hexToRgba(this.color, 0));
        c.fillStyle = grad;
        c.beginPath();
        c.arc(0, 0, this.radius * (0.75 + t * 0.3), Math.min(start, end), Math.max(start, end));
        c.arc(0, 0, this.radius * 0.25, Math.max(start, end), Math.min(start, end), true);
        c.closePath();
        c.fill();
        c.globalAlpha = a * 0.75;
        c.strokeStyle = '#ffffff';
        c.lineWidth = this.heavy ? 4 : 2;
        c.beginPath();
        c.arc(0, 0, this.radius * 0.92, Math.min(start, end), Math.max(start, end));
        c.stroke();
        c.restore();
    }
}

// ---------------------------------------------------------------
// ONDA DE CHOQUE
// ---------------------------------------------------------------
class Shockwave {
    constructor(x, y, radius, color, opts = {}) {
        this.x = x; this.y = y;
        this.maxRadius = radius;
        this.radius = opts.startRadius || radius * 0.25;
        this.color = color;
        this.life = opts.life || 0.4;
        this.maxLife = this.life;
        this.width = opts.width || 4;
        this.delay = opts.delay || 0;
    }
    update(dt) {
        if (this.delay > 0) { this.delay -= dt; return; }
        const t = 1 - clamp(this.life / this.maxLife, 0, 1);
        this.radius = lerp(this.radius, this.maxRadius, 0.16 + t * 0.12);
        this.life -= dt;
    }
    get alive() { return this.delay > 0 || this.life > 0; }
    draw(c) {
        if (this.delay > 0) return;
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = a * 0.85;
        c.strokeStyle = this.color;
        c.lineWidth = this.width * a + 0.5;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, TAU);
        c.stroke();
        c.globalAlpha = a * 0.22;
        c.lineWidth = this.width * 3;
        c.stroke();
        c.restore();
    }
}

// ---------------------------------------------------------------
// EXPLOSÃO TELEGRAFADA (meteoros, magias de chefe, armadilhas)
// ---------------------------------------------------------------
class DelayedBlast {
    constructor(x, y, radius, delay, damage, opts = {}) {
        this.x = x; this.y = y;
        this.radius = radius;
        this.delay = delay;
        this.timer = delay;
        this.damage = damage;
        this.hostile = !!opts.hostile;
        this.friendly = !!opts.friendly;
        this.color = opts.color || '#ff7a3d';
        this.style = opts.style || 'rune';
        this.knockback = opts.knockback || 0;
        this.stun = opts.stun || 0;
        this.source = opts.source || null;
        this.exploded = false;
        this.life = 0;
        this.maxLife = 0.45;
        this.rot = rand(0, TAU);
        this.label = opts.label || '';
    }
    update(dt, game) {
        if (!this.exploded) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.exploded = true;
                this.life = this.maxLife;
                game.explode(this.x, this.y, this.radius, this.damage, {
                    hostile: this.hostile, friendly: this.friendly,
                    color: this.color, style: this.style, source: this.source,
                    knockback: this.knockback, stun: this.stun
                });
            }
        } else {
            this.life -= dt;
        }
    }
    get alive() { return !this.exploded || this.life > 0; }
    draw(c) {
        if (!this.exploded) {
            const p = clamp(1 - this.timer / Math.max(0.001, this.delay), 0, 1);
            const pulse = 1 + Math.sin(this.timer * 16) * 0.03;
            c.save();
            c.translate(this.x, this.y);
            c.globalAlpha = 0.25 + p * 0.5;
            c.strokeStyle = this.color;
            c.lineWidth = 2;
            c.setLineDash([6, 6]);
            c.beginPath(); c.arc(0, 0, this.radius, 0, TAU); c.stroke();
            c.setLineDash([]);
            c.globalAlpha = 0.10 + p * 0.24;
            c.fillStyle = this.color;
            c.beginPath(); c.arc(0, 0, this.radius * p * pulse, 0, TAU); c.fill();
            c.globalAlpha = 0.7;
            c.strokeStyle = this.color;
            c.lineWidth = 1.2;
            c.rotate(this.rot + p * 2);
            for (let i = 0; i < 6; i++) {
                c.rotate(TAU / 6);
                c.beginPath(); c.moveTo(this.radius * 0.28, 0); c.lineTo(this.radius * 0.42, 0); c.stroke();
            }
            if (this.style === 'meteor') {
                const fall = clamp(1 - this.timer / Math.max(0.3, this.delay), 0, 1);
                c.globalAlpha = 0.95;
                c.rotate(-this.rot);
                c.translate(0, -this.radius * (2.2 - fall * 2.2));
                c.fillStyle = '#ffb36b';
                c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
                c.fillStyle = this.color;
                c.beginPath(); c.arc(-3, -3, 5, 0, TAU); c.fill();
                c.globalAlpha = 0.35;
                c.strokeStyle = this.color;
                c.lineWidth = 5;
                c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -55); c.stroke();
            }
            if (this.label) {
                c.rotate(-this.rot);
                c.globalAlpha = 0.9;
                c.fillStyle = this.color;
                c.font = '700 11px Segoe UI, sans-serif';
                c.textAlign = 'center';
                c.fillText(this.label, 0, -this.radius - 8);
            }
            c.restore();
        } else {
            const a = clamp(this.life / this.maxLife, 0, 1);
            c.save();
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, this.x, this.y, this.radius * (1.2 + (1 - a) * 0.6), this.color, a * 0.5);
            c.globalAlpha = a * 0.9;
            c.strokeStyle = '#ffffff';
            c.lineWidth = 2.5;
            c.beginPath(); c.arc(this.x, this.y, this.radius * (1 - a) * 0.9 + 8, 0, TAU); c.stroke();
            c.restore();
        }
    }
}

// ---------------------------------------------------------------
// RAIO / CORRENTE
// ---------------------------------------------------------------
class BeamEffect {
    constructor(x1, y1, x2, y2, color, opts = {}) {
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.color = color || '#ffe66d';
        this.life = opts.life || 0.22;
        this.maxLife = this.life;
        this.width = opts.width || 3;
        this.bolt = opts.bolt !== false;
        this.seed = Math.random() * 100;
    }
    update(dt) { this.life -= dt; }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = a;
        c.strokeStyle = this.color;
        c.shadowBlur = 14;
        c.shadowColor = this.color;
        c.lineWidth = this.width;
        c.beginPath();
        if (this.bolt) {
            const steps = 7;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const nx = lerp(this.x1, this.x2, t) + (i && i < steps ? rand(-9, 9) : 0);
                const ny = lerp(this.y1, this.y2, t) + (i && i < steps ? rand(-9, 9) : 0);
                if (i === 0) c.moveTo(nx, ny); else c.lineTo(nx, ny);
            }
        } else {
            c.moveTo(this.x1, this.y1); c.lineTo(this.x2, this.y2);
        }
        c.stroke();
        c.globalAlpha = a * 0.35;
        c.lineWidth = this.width * 3.5;
        c.stroke();
        c.restore();
    }
}

class ChainEffect {
    constructor(points, color) {
        this.points = points;
        this.color = color || '#ffe66d';
        this.life = 0.32;
        this.maxLife = this.life;
        this.bolts = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.bolts.push({ a: points[i], b: points[i + 1], off: rand(-12, 12) });
        }
    }
    update(dt) { this.life -= dt; }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = a;
        c.strokeStyle = this.color;
        c.shadowBlur = 12;
        c.shadowColor = this.color;
        c.lineWidth = 2.4;
        for (const b of this.bolts) {
            c.beginPath();
            c.moveTo(b.a.x, b.a.y);
            const mx = (b.a.x + b.b.x) / 2 + b.off;
            const my = (b.a.y + b.b.y) / 2 - b.off;
            c.quadraticCurveTo(mx, my, b.b.x, b.b.y);
            c.stroke();
        }
        c.restore();
    }
}

// ---------------------------------------------------------------
// HABILIDADES PERSISTENTES
// ---------------------------------------------------------------
class RuneTrap {
    constructor(x, y, damage, owner) {
        this.x = x; this.y = y;
        this.damage = damage;
        this.owner = owner;
        this.arm = 0.35;
        this.life = 8;
        this.triggered = false;
        this.radius = 48;
        this.t = 0;
    }
    update(dt, game) {
        this.t += dt;
        if (this.triggered) { this.life -= dt; return; }
        this.arm -= dt;
        this.life -= dt;
        if (this.arm <= 0) {
            let target = game.nearestEnemy(this.x, this.y, this.radius);
            if (target || this.life <= 0) {
                this.triggered = true;
                this.life = 0.3;
                game.explode(this.x, this.y, 92, this.damage, {
                    friendly: true, color: '#e8c46a', style: 'rune', source: this.owner
                });
            }
        }
    }
    get alive() { return this.life > 0; }
    draw(c) {
        if (this.triggered) return;
        const ready = this.arm <= 0;
        const p = 0.5 + Math.sin(this.t * 5) * 0.5;
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.t * 0.4);
        c.globalAlpha = ready ? 0.85 : 0.35;
        c.strokeStyle = '#e8c46a';
        c.lineWidth = 2;
        c.setLineDash([5, 5]);
        c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.stroke();
        c.setLineDash([]);
        for (let i = 0; i < 4; i++) {
            c.rotate(TAU / 4);
            c.beginPath();
            c.moveTo(8, 0); c.lineTo(16, 0); c.lineTo(12, 7);
            c.stroke();
        }
        c.globalAlpha = 0.22 + p * 0.2;
        glowCircle(c, 0, 0, 34, '#e8c46a', 0.5);
        c.restore();
    }
}

class StormField {
    constructor(player, duration, power, color) {
        this.player = player;
        this.life = duration;
        this.maxLife = duration;
        this.power = power;
        this.color = color || '#ffe66d';
        this.tick = 0;
        this.t = 0;
    }
    update(dt, game) {
        this.life -= dt;
        this.t += dt;
        this.tick -= dt;
        if (this.tick <= 0) {
            this.tick = 0.16;
            const candidates = game.enemies.filter(e => e.hp > 0 && e.spawnTimer <= 0 &&
                dist(e.x, e.y, this.player.x, this.player.y) < 460);
            if (candidates.length) {
                const e = pick(candidates);
                const dmg = this.power * rand(0.8, 1.2);
                game.damageEnemy(e, dmg, {
                    crit: false, color: this.color, source: this.player,
                    lifesteal: true, silentText: Math.random() > 0.5, shake: 1
                });
                game.effects.push(new BeamEffect(
                    this.player.x + rand(-20, 20), this.player.y - 110,
                    e.x, e.y, this.color, { life: 0.18, width: 3 }
                ));
                game.addParticles(e.x, e.y, 5, this.color, { glow: true, size: 2.5 });
                Sound.play('lightning', 0.5);
            }
        }
    }
    get alive() { return this.life > 0; }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.translate(this.player.x, this.player.y - 92);
        c.globalAlpha = a * 0.28;
        c.fillStyle = '#1a1a2e';
        c.beginPath();
        for (let i = 0; i < 6; i++) {
            const ang = i / 6 * TAU + this.t * 0.3;
            const r = 70 + Math.sin(this.t * 4 + i) * 12;
            c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        c.closePath(); c.fill();
        c.globalAlpha = a * 0.7;
        c.strokeStyle = this.color;
        c.lineWidth = 1.4;
        c.beginPath(); c.arc(0, 0, 76, 0, TAU); c.stroke();
        c.restore();
    }
}

class DrainBeam {
    constructor(player, target, power, color) {
        this.player = player;
        this.target = target;
        this.power = power;
        this.color = color || '#ff4d6d';
        this.life = 1.6;
        this.maxLife = this.life;
        this.tick = 0;
        this.totalHeal = 0;
    }
    update(dt, game) {
        this.life -= dt;
        if (!this.target || this.target.hp <= 0 || this.target.dead) { this.life = 0; return; }
        this.tick -= dt;
        if (this.tick <= 0) {
            this.tick = 0.12;
            const dmg = this.power * 0.12;
            game.damageEnemy(this.target, dmg, {
                source: this.player, color: this.color, silentText: true, lifesteal: false
            });
            const heal = dmg * 0.6;
            game.healPlayer(heal, false);
            this.totalHeal += heal;
            game.addParticles(this.target.x, this.target.y, 2, this.color, { glow: true, vx: (this.player.x - this.target.x) * 0.4, vy: (this.player.y - this.target.y) * 0.4, size: 2 });
        }
    }
    get alive() { return this.life > 0 && this.target && this.target.hp > 0; }
    draw(c) {
        if (!this.target) return;
        const a = clamp(this.life / this.maxLife, 0, 1) * (0.55 + Math.sin(this.life * 22) * 0.2);
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = a;
        c.strokeStyle = this.color;
        c.shadowBlur = 15;
        c.shadowColor = this.color;
        c.lineWidth = 3;
        c.beginPath();
        const mx = (this.player.x + this.target.x) / 2 + Math.sin(this.life * 8) * 18;
        const my = (this.player.y + this.target.y) / 2 + Math.cos(this.life * 8) * 18;
        c.moveTo(this.player.x, this.player.y - 12);
        c.quadraticCurveTo(mx, my, this.target.x, this.target.y);
        c.stroke();
        c.restore();
    }
}

// ---------------------------------------------------------------
// PROJÉTEIS DO JOGADOR
// ---------------------------------------------------------------
class PlayerProjectile {
    constructor(x, y, angle, opts = {}) {
        this.x = x; this.y = y;
        this.angle = angle;
        this.speed = opts.speed || 720;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.damage = opts.damage || 20;
        this.radius = opts.radius || 10;
        this.life = opts.life || 1.2;
        this.maxLife = this.life;
        this.color = opts.color || '#a7d8ff';
        this.type = opts.type || 'bolt';
        this.pierce = opts.pierce === true ? 999 : (opts.pierce || 0);
        this.source = opts.source || null;
        this.hits = new Set();
        this.trail = [];
        this.knockback = opts.knockback || 0;
        this.crit = !!opts.crit;
        this.spin = 0;
    }
    update(dt, game) {
        this.life -= dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.spin += dt * 12;
        this.trail.push({ x: this.x, y: this.y, life: 0.16 });
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= dt;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
        if (Math.random() < 0.4) game.addParticles(this.x, this.y, 1, this.color, { glow: true, size: 2, life: 0.2, drag: 5 });
        if (this.x < game.player.x - 1400 || this.x > game.player.x + 1400 ||
            this.y < game.player.y - 1400 || this.y > game.player.y + 1400) this.life = 0;
        if (this.life <= 0) return;

        for (const e of game.enemies) {
            if (e.hp <= 0 || e.spawnTimer > 0 || this.hits.has(e)) continue;
            if (dist(this.x, this.y, e.x, e.y) > e.size + this.radius + 6) continue;
            this.hits.add(e);
            game.damageEnemy(e, this.damage, {
                crit: this.crit, source: this.source, color: this.color,
                knockback: this.knockback, lifesteal: true
            });
            if (this.source) this.source.onHitEnemy(e, this.damage, game, this.crit);
            if (this.pierce > 0) this.pierce--;
            else { this.life = 0; break; }
        }
    }
    get alive() { return this.life > 0; }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = a;
        for (const t of this.trail) {
            c.globalAlpha = (t.life / 0.16) * 0.28;
            c.fillStyle = this.color;
            c.beginPath(); c.arc(t.x, t.y, this.radius * 0.6, 0, TAU); c.fill();
        }
        c.globalAlpha = 1;
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.shadowBlur = 16;
        c.shadowColor = this.color;
        if (this.type === 'spear') {
            c.strokeStyle = this.color;
            c.lineWidth = 4;
            c.beginPath(); c.moveTo(-26, 0); c.lineTo(18, 0); c.stroke();
            c.fillStyle = '#ffffff';
            c.beginPath(); c.moveTo(30, 0); c.lineTo(8, -7); c.lineTo(12, 0); c.lineTo(8, 7); c.closePath(); c.fill();
        } else if (this.type === 'wave') {
            c.strokeStyle = this.color;
            c.lineWidth = 5;
            c.beginPath(); c.arc(-12, 0, 26, -1.0, 1.0); c.stroke();
            c.globalAlpha = 0.4;
            c.lineWidth = 12; c.stroke();
        } else if (this.type === 'arrow') {
            c.strokeStyle = '#e8dcc0'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(-18, 0); c.lineTo(10, 0); c.stroke();
            c.fillStyle = this.color;
            c.beginPath(); c.moveTo(16, 0); c.lineTo(6, -5); c.lineTo(6, 5); c.closePath(); c.fill();
        } else {
            c.fillStyle = this.color;
            c.beginPath(); c.ellipse(0, 0, 12, 5.5, 0, 0, TAU); c.fill();
            c.fillStyle = '#ffffff';
            c.beginPath(); c.arc(4, 0, 2.6, 0, TAU); c.fill();
        }
        c.restore();
    }
}

// ---------------------------------------------------------------
// PROJÉTEIS INIMIGOS
// ---------------------------------------------------------------
class EnemyProjectile {
    constructor(x, y, angle, damage, opts = {}) {
        this.x = x; this.y = y;
        this.angle = angle;
        this.speed = opts.speed || 230;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.damage = damage;
        this.life = opts.life || 4;
        this.maxLife = this.life;
        this.radius = opts.radius || 8;
        this.color = opts.color || '#c46bff';
        this.type = opts.type || 'void';
        this.homing = opts.homing || 0;
        this.trail = [];
        this.dead = false;
        this.source = opts.source || null;
    }
    update(dt, game) {
        if (this.dead) return;
        this.life -= dt;
        if (this.homing > 0) {
            const target = Math.atan2(game.player.y - this.y, game.player.x - this.x);
            const diff = normAngle(target - this.angle);
            this.angle += clamp(diff, -this.homing * dt, this.homing * dt);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.trail.push({ x: this.x, y: this.y, life: 0.2 });
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= dt;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
        if (this.life <= 0) { this.dead = true; return; }
        if (dist(this.x, this.y, game.player.x, game.player.y) < game.player.size * 0.7 + this.radius) {
            game.player.takeDamage(this.damage, game, this.source);
            this.dead = true;
        }
    }
    get alive() { return !this.dead && this.life > 0; }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (const t of this.trail) {
            c.globalAlpha = (t.life / 0.2) * 0.22;
            c.fillStyle = this.color;
            c.beginPath(); c.arc(t.x, t.y, this.radius * 0.8, 0, TAU); c.fill();
        }
        c.globalAlpha = a;
        glowCircle(c, this.x, this.y, this.radius * 3, this.color, 0.5);
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.fillStyle = this.color;
        c.shadowBlur = 12;
        c.shadowColor = this.color;
        if (this.type === 'arrow') {
            c.strokeStyle = '#e8dcc0'; c.lineWidth = 2.5;
            c.beginPath(); c.moveTo(-16, 0); c.lineTo(12, 0); c.stroke();
            c.fillStyle = this.color;
            c.beginPath(); c.moveTo(18, 0); c.lineTo(8, -4); c.lineTo(8, 4); c.closePath(); c.fill();
        } else if (this.type === 'web') {
            c.strokeStyle = this.color; c.lineWidth = 1.2;
            for (let i = 0; i < 4; i++) {
                c.rotate(Math.PI / 4);
                c.beginPath(); c.moveTo(-this.radius, 0); c.lineTo(this.radius, 0); c.stroke();
            }
        } else if (this.type === 'bone') {
            c.fillStyle = '#e8e0cc';
            c.fillRect(-10, -2, 20, 4);
            c.beginPath(); c.arc(-10, 0, 4, 0, TAU); c.fill();
            c.beginPath(); c.arc(10, 0, 4, 0, TAU); c.fill();
        } else {
            c.beginPath(); c.arc(0, 0, this.radius, 0, TAU); c.fill();
            c.fillStyle = '#ffffff';
            c.beginPath(); c.arc(2, 0, this.radius * 0.35, 0, TAU); c.fill();
        }
        c.restore();
    }
}


/* ----------------------------------------------------------------
   MÓDULO: player.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — JOGADOR
   ================================================================ */
'use strict';

class Player {
    constructor(loadout = {}, runMods = {}) {
        this.classId = CLASSES[loadout.classId] ? loadout.classId : 'warrior';
        this.weaponId = WEAPONS[loadout.weaponId] ? loadout.weaponId : 'twilight';
        this.skills = (loadout.skills || ['nova']).filter(id => SKILLS[id]).slice(0, 4);
        if (!this.skills.length) this.skills = ['nova'];
        this.runMods = runMods || {};
        this.upg = this.defaultUpg();
        this.gear = { weapon: null, armor: null, helm: null, boots: null, ring: null, amulet: null };
        this.backpack = [];
        this.relics = [];
        this.flags = {};
        this.setCounts = {};
        this.setBonus = {};
        this.size = 22;

        this.level = 1;
        this.xp = 0;
        this.xpToNext = 48;
        this.pendingLevelUps = 0;

        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.aim = 0;
        this.facing = 1;
        this.isMoving = false;
        this.anim = 0;

        this.attackCd = 0;
        this.heavyCd = 0;
        this.dashCd = 0;
        this.dashTimer = 0;
        this.ghostTimer = 0;
        this.iframes = 0;
        this.hurtTimer = 0;
        this.attackAnim = 0;
        this.attackAnimMax = 0.25;
        this.attackDir = 1;
        this.swingAngle = 0;
        this.comboStep = 0;
        this.comboTimer = 0;
        this.shield = 0;
        this.shieldTimer = 0;
        this.reflectTimer = 0;
        this.reflectPct = 0.35;
        this.timeSinceHit = 99;
        this.dead = false;

        this.skillCd = {};
        this.buffs = [];
        this.killStacks = 0;
        this.killStackTimer = 0;
        this.ghosts = [];
        this.phoenixUsed = false;
        this.dashHit = new Set();
        this.footTimer = 0;

        this.recalc(false);
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        if (this.classId === 'guardian') this.shield = 30 * (this.runMods.shield || 1);
    }

    defaultUpg() {
        return {
            damagePct: 0, hpMax: 0, speedPct: 0, critChance: 0, critDamage: 0,
            attackSpeedPct: 0, manaRegenPct: 0, manaMax: 0, lifestealPct: 0,
            thorns: 0, healingPct: 0, dashCdPct: 0, dashDamage: 0,
            bonusTargets: 0, regen: 0, armor: 0, skillPowerPct: 0,
            cooldownPct: 0, xpPct: 0, goldPct: 0, magnetPct: 0, dodge: 0,
            areaPct: 0, fireOnHit: false, iceOnHit: false, chainChance: 0,
            execute: 0, lowHpDamage: 0, summonBonus: 0, summonDamage: 0
        };
    }

    // =============================================================
    // STATS / EQUIPAMENTO
    // =============================================================
    recalc(preserveHp = true) {
        const cls = CLASSES[this.classId] || CLASSES.warrior;
        const b = cls.base;
        const meta = SAVE.meta;
        const upg = this.upg;

        const gs = {};
        const add = (k, v) => { gs[k] = (gs[k] || 0) + (Number(v) || 0); };
        this.flags = {};
        this.setCounts = {};
        for (const slot in this.gear) {
            const item = this.gear[slot];
            if (!item) continue;
            if (item.stats) for (const k in item.stats) add(k, item.stats[k]);
            if (item.unique && UNIQUE_EFFECTS[item.unique]) this.flags[item.unique] = true;
            if (item.setId) this.setCounts[item.setId] = (this.setCounts[item.setId] || 0) + 1;
        }

        this.setBonus = {
            damagePct: 0, speedPct: 0, critDamage: 0, dodge: 0, skillPowerPct: 0,
            maxMana: 0, cooldownPct: 0, armor: 0, lifesteal: 0, frostOnHit: false,
            frostDamage: 0
        };
        for (const setId in this.setCounts) {
            const set = SETS[setId];
            if (!set) continue;
            if (this.setCounts[setId] >= 2) set.apply2(this);
            if (this.setCounts[setId] >= 3) set.apply3(this);
        }
        const sb = this.setBonus;

        const rel = {
            damagePct: 0, damageTaken: 0, maxHpFlat: 0, maxHpPct: 0,
            skillPowerPct: 0, speedPct: 0, lifesteal: 0, critChance: 0,
            critDamage: 0, armor: 0, maxMana: 0, cooldownPct: 0,
            healMult: 1, goldPct: 0, xpPct: 0, execute: 0,
            fireOnHit: false, iceOnHit: false, chainChance: 0, dodge: 0,
            phoenix: false, prices: 1, enemyDamage: 1
        };
        const has = id => this.relics.includes(id);
        if (has('abyss_heart')) { rel.damagePct += 0.25; rel.damageTaken += 0.15; }
        if (has('cursed_coin')) { rel.goldPct += 0.45; rel.maxHpFlat -= 20; }
        if (has('void_eye')) { rel.skillPowerPct += 0.35; rel.speedPct -= 0.08; }
        if (has('blood_chalice')) { rel.lifesteal += 0.08; rel.healMult -= 0.25; }
        if (has('storm_core')) rel.chainChance += 0.20;
        if (has('frozen_soul')) { rel.iceOnHit = true; }
        if (has('phoenix_feather')) { rel.phoenix = true; rel.maxHpFlat -= 20; }
        if (has('gambler_die')) { rel.critChance += 0.18; rel.critDamage += 0.35; rel.damagePct -= 0.10; }
        if (has('giant_belt')) { rel.maxHpFlat += 35; rel.armor += 0.10; rel.critChance -= 0.08; }
        if (has('merchant_seal')) { rel.prices -= 0.25; rel.enemyDamage += 0.10; }

        for (const f in this.flags) {
            if (f === 'vampiric') rel.lifesteal += 0.03;
            if (f === 'quickstep') { rel.speedPct += 0.08; rel.cooldownPct += 0.08; }
            if (f === 'arcanist') { rel.skillPowerPct += 0.15; rel.maxMana += 15; }
            if (f === 'executioner') rel.execute += 0.30;
            if (f === 'hoarder') rel.goldPct += 0.20;
            if (f === 'frostbite') rel.iceOnHit = true;
            if (f === 'infernal') rel.fireOnHit = true;
            if (f === 'stormbound') rel.chainChance += 0.18;
            if (f === 'phoenix') rel.phoenix = true;
            if (f === 'greed') { rel.goldPct += 0.25; rel.xpPct += 0.10; }
        }

        const mods = this.runMods;
        const pct = v => (Number(v) || 0) / 100;

        const maxHp = Math.max(40, Math.round(
            (b.maxHp + meta.hp * 18 + upg.hpMax + (gs.maxHpFlat || 0) + rel.maxHpFlat) *
            (1 + pct(gs.maxHpPct) + (sb.maxHpPct || 0) + rel.maxHpPct)
        ));
        const maxMana = Math.max(20, Math.round(
            b.maxMana + meta.mana * 22 + upg.manaMax + (gs.maxMana || 0) + sb.maxMana + rel.maxMana
        ));

        const speed = Math.max(90, b.speed * (1 + meta.speed * 0.04 + upg.speedPct +
            pct(gs.moveSpeed) + sb.speedPct + rel.speedPct) * (mods.speed || 1));
        const damage = b.damage * (1 + meta.dmg * 0.08 + upg.damagePct +
            pct(gs.damagePct) + sb.damagePct + rel.damagePct) * (mods.damage || 1);
        const skillPower = b.skillPower * (1 + upg.skillPowerPct +
            pct(gs.skillPower) + sb.skillPowerPct + rel.skillPowerPct);
        const critChance = clamp(b.crit + meta.crit * 0.025 + upg.critChance +
            pct(gs.critChance) + rel.critChance, 0, 0.85);
        const critDamage = b.critDmg + upg.critDamage + pct(gs.critDamage) +
            sb.critDamage + rel.critDamage;
        const attackSpeed = Math.min(3, b.attackSpeed * (1 + upg.attackSpeedPct + pct(gs.attackSpeed)));
        const armor = clamp(b.armor + meta.armor * 0.02 + upg.armor + pct(gs.armor) +
            sb.armor + rel.armor + (mods.armor || 0), -0.25, 0.7);
        const lifesteal = clamp(b.lifesteal + meta.lifesteal * 0.015 + upg.lifestealPct +
            pct(gs.lifesteal) + sb.lifesteal + rel.lifesteal, 0, 0.6);
        const cooldownMult = clamp(1 - (meta.cooldown * 0.03 + upg.cooldownPct +
            pct(gs.cooldownPct) + sb.cooldownPct + rel.cooldownPct), 0.38, 1.25);
        let dashCdMult = clamp(1 - (meta.dash * 0.04 + upg.dashCdPct + (this.flags.quickstep ? 0.08 : 0)), 0.35, 1.2);
        if (this.classId === 'assassin') dashCdMult *= 0.75;

        const oldMax = this.maxHp || maxHp;
        const ratio = oldMax > 0 ? clamp(this.hp / oldMax, 0, 1) : 1;

        this.stats = {
            maxHp, maxMana, moveSpeed: speed, damageMult: damage, skillPower,
            critChance, critDamage, attackSpeed, armor, lifesteal,
            manaRegen: b.manaRegen * (1 + upg.manaRegenPct),
            cooldownMult, dashCdMult, dashCdMax: 1.0 * dashCdMult,
            thorns: meta.thorns * 5 + upg.thorns + (gs.thorns || 0),
            regen: b.regen + upg.regen + (gs.regen || 0),
            healingPct: 1 + upg.healingPct + (rel.healMult - 1),
            xpMult: (1 + meta.xp * 0.10 + upg.xpPct + pct(gs.xpPct) + rel.xpPct) * (mods.xp || 1),
            goldMult: (1 + meta.gold * 0.10 + upg.goldPct + pct(gs.goldPct) + rel.goldPct) * (mods.gold || 1),
            magnet: 95 * (1 + upg.magnetPct),
            dodge: clamp(upg.dodge + sb.dodge + rel.dodge, 0, 0.5),
            areaMult: 1 + upg.areaPct,
            bonusTargets: upg.bonusTargets,
            dashDamage: upg.dashDamage,
            execute: upg.execute + rel.execute,
            lowHpDamage: upg.lowHpDamage,
            fireOnHit: upg.fireOnHit || rel.fireOnHit,
            iceOnHit: upg.iceOnHit || rel.iceOnHit,
            chainChance: upg.chainChance + rel.chainChance,
            frostDamage: sb.frostDamage,
            summonBonus: upg.summonBonus,
            summonDamage: upg.summonDamage,
            damageTakenMult: (1 + rel.damageTaken + (this.classId === 'cursed' ? 0.14 : 0)) *
                (mods.damageTaken || 1) * (rel.enemyDamage || 1),
            shieldMax: this.classId === 'guardian' ? 30 * (mods.shield || 1) : 0,
            prices: rel.prices,
            phoenix: rel.phoenix || this.flags.phoenix
        };
        this.maxHp = maxHp;
        this.maxMana = maxMana;
        this.weaponDamageMod = this.classId === 'mage' ? 0.82 : 1;

        if (preserveHp) this.hp = clamp(Math.round(maxHp * ratio), 1, maxHp);
        else this.hp = Math.min(this.hp || maxHp, maxHp);
        this.mana = clamp(this.mana === undefined ? maxMana : this.mana, 0, maxMana);
    }

    equipItem(item) {
        if (!item || !this.gear.hasOwnProperty(item.slot)) return null;
        const old = this.gear[item.slot];
        this.gear[item.slot] = item;
        const idx = this.backpack.indexOf(item);
        if (idx >= 0) this.backpack.splice(idx, 1);
        if (old) this.backpack.push(old);
        this.recalc(true);
        return old;
    }

    addItem(item) {
        if (this.backpack.length >= 24) return false;
        this.backpack.push(item);
        return true;
    }

    addRelic(id) {
        if (!RELICS[id] || this.relics.includes(id)) return false;
        this.relics.push(id);
        this.recalc(true);
        return true;
    }

    applyUpgrade(up) {
        const oldMax = this.maxHp;
        up.apply(this);
        this.recalc(true);
        if (this.maxHp > oldMax) {
            this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - oldMax));
        }
    }

    // =============================================================
    // MULTIPLICADORES DINÂMICOS
    // =============================================================
    buffMult(stat) {
        let m = 1;
        for (const b of this.buffs) if (b.stat === stat) m *= b.mult;
        return m;
    }
    getMoveSpeed() { return this.stats.moveSpeed * this.buffMult('speed'); }
    getDamageMult() {
        let m = this.stats.damageMult * this.buffMult('damage');
        if (this.killStacks > 0) m *= 1 + this.killStacks * 0.03;
        if (this.stats.lowHpDamage > 0 && this.hp < this.maxHp * 0.4) m *= 1 + this.stats.lowHpDamage;
        return m;
    }
    getSkillPower() { return this.stats.skillPower * this.buffMult('damage'); }
    getAttackSpeed() { return this.stats.attackSpeed * this.buffMult('attackSpeed'); }
    getCooldown(id) { return this.skillCd[id] || 0; }

    addBuff(id, stat, mult, time) {
        const existing = this.buffs.find(b => b.id === id);
        if (existing) { existing.mult = Math.max(existing.mult, mult); existing.time = Math.max(existing.time, time); }
        else this.buffs.push({ id, stat, mult, time });
    }

    // =============================================================
    // UPDATE
    // =============================================================
    update(game, dt) {
        const t = game.time;
        if (this.dead) return;
        this.anim += dt;

        this.attackCd = Math.max(0, this.attackCd - dt);
        this.heavyCd = Math.max(0, this.heavyCd - dt);
        this.dashCd = Math.max(0, this.dashCd - dt);
        this.iframes = Math.max(0, this.iframes - dt);
        this.hurtTimer = Math.max(0, this.hurtTimer - dt);
        this.reflectTimer = Math.max(0, this.reflectTimer - dt);
        this.timeSinceHit += dt;
        this.attackAnim = Math.max(0, this.attackAnim - dt);
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) this.comboStep = 0;
        for (const id in this.skillCd) if (this.skillCd[id] > 0) this.skillCd[id] = Math.max(0, this.skillCd[id] - dt);

        for (let i = this.buffs.length - 1; i >= 0; i--) {
            this.buffs[i].time -= dt;
            if (this.buffs[i].time <= 0) this.buffs.splice(i, 1);
        }
        if (this.killStacks > 0) {
            this.killStackTimer -= dt;
            if (this.killStackTimer <= 0) this.killStacks = 0;
        }

        const keys = game.keys;
        let ix = 0, iy = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) iy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) iy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) ix -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) ix += 1;
        if (ix && iy) { ix *= 0.7071; iy *= 0.7071; }
        this.isMoving = ix !== 0 || iy !== 0;

        this.aim = game.aimAngle;
        if (Math.cos(this.aim) < -0.06) this.facing = -1;
        else if (Math.cos(this.aim) > 0.06) this.facing = 1;

        if (game.dashQueued) {
            game.dashQueued = false;
            if (this.dashCd <= 0 && !this.dead) this.doDash(game, ix, iy);
        }

        const speed = this.getMoveSpeed();
        if (this.dashTimer > 0) {
            this.dashTimer -= dt;
            this.ghostTimer -= dt;
            this.x += this.dashVX * dt;
            this.y += this.dashVY * dt;
            if (this.ghostTimer <= 0) {
                this.ghostTimer = 0.028;
                this.ghosts.push({ x: this.x, y: this.y, angle: this.aim, life: 0.24, maxLife: 0.24, color: CLASSES[this.classId].color });
            }
            if (this.stats.dashDamage > 0) {
                for (const e of game.enemies) {
                    if (e.hp <= 0 || this.dashHit.has(e)) continue;
                    if (dist(this.x, this.y, e.x, e.y) < this.size + e.size + 8) {
                        this.dashHit.add(e);
                        game.damageEnemy(e, this.stats.dashDamage * this.getDamageMult(), {
                            source: this, color: '#7fe7ff', knockback: 260, lifesteal: true
                        });
                    }
                }
            }
            if (Math.random() < 0.5) {
                game.addParticles(this.x, this.y + 8, 1, CLASSES[this.classId].color, {
                    glow: true, size: 2.5, life: 0.24, vx: rand(-15, 15), vy: rand(-10, 10)
                });
            }
        } else {
            const targetVx = ix * speed;
            const targetVy = iy * speed;
            const accel = this.isMoving ? 12 : 16;
            const f = 1 - Math.exp(-accel * dt);
            this.vx = lerp(this.vx, targetVx, f);
            this.vy = lerp(this.vy, targetVy, f);
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            if (this.isMoving) {
                this.footTimer -= dt;
                if (this.footTimer <= 0) {
                    this.footTimer = 0.18;
                    game.addParticles(this.x + rand(-6, 6), this.y + 18, 1, '#6d6480', {
                        kind: 'smoke', size: 3, life: 0.35, vx: rand(-8, 8), vy: rand(-14, -4), glow: false
                    });
                }
            }
        }

        this.x = clamp(this.x, -1850, 1850);
        this.y = clamp(this.y, -1500, 1500);

        // Ataques
        if (game.attackHeld && this.attackCd <= 0) this.basicAttack(game, false);
        if (settings().autoAttack && this.attackCd <= 0) {
            const target = game.nearestEnemy(this.x, this.y, 340);
            if (target) {
                const a = angleBetween(this.x, this.y, target.x, target.y);
                this.basicAttack(game, false, a);
            }
        }
        if (game.heavyQueued) {
            game.heavyQueued = false;
            if (this.heavyCd <= 0) this.heavyAttack(game);
        }

        // Regenerações
        if (this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + this.stats.manaRegen * dt);
        if (this.stats.regen > 0 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.stats.regen * dt);
        if (this.classId === 'guardian' && this.timeSinceHit > 6 && this.shield < this.stats.shieldMax) {
            this.shield = Math.min(this.stats.shieldMax, this.shield + 12 * dt);
        }

        for (let i = this.ghosts.length - 1; i >= 0; i--) {
            this.ghosts[i].life -= dt;
            if (this.ghosts[i].life <= 0) this.ghosts.splice(i, 1);
        }
    }

    doDash(game, ix, iy) {
        let a = this.aim;
        if (ix || iy) a = Math.atan2(iy, ix);
        const sp = this.getMoveSpeed() * 4.1;
        this.dashVX = Math.cos(a) * sp;
        this.dashVY = Math.sin(a) * sp;
        this.dashTimer = 0.16;
        this.dashCd = this.stats.dashCdMax;
        this.iframes = Math.max(this.iframes, 0.34);
        this.ghostTimer = 0;
        this.dashHit.clear();
        this.facing = Math.cos(a) >= 0 ? 1 : -1;
        Sound.play('dash');
        game.shakeCamera(2.5);
        game.addParticles(this.x, this.y, 10, CLASSES[this.classId].color, {
            glow: true, size: 2.5, life: 0.4, vx: -Math.cos(a) * rand(80, 180), vy: -Math.sin(a) * rand(80, 180)
        });
    }

    // =============================================================
    // COMBATE
    // =============================================================
    basicAttack(game, heavy = false, forcedAngle = null) {
        const w = WEAPONS[this.weaponId] || WEAPONS.twilight;
        const attackAngle = forcedAngle !== null && forcedAngle !== undefined ? forcedAngle : this.aim;
        const comboIdx = this.comboStep % w.combo.length;
        const comboMult = w.combo[comboIdx];
        const isFinisher = comboIdx === w.combo.length - 1;
        const crit = Math.random() < this.stats.critChance;
        const base = w.damage * this.getDamageMult() * (this.weaponDamageMod || 1) * comboMult;
        const dmg = base * (crit ? this.stats.critDamage : 1);

        this.comboStep = (this.comboStep + 1) % w.combo.length;
        this.comboTimer = 0.95;
        this.attackCd = w.cooldown / this.getAttackSpeed();
        this.attackAnim = 0.24;
        this.attackAnimMax = 0.24;
        this.attackDir *= -1;
        this.swingAngle = attackAngle;
        if (crit) this.onCrit(game);

        if (w.kind === 'ranged') {
            const count = w.hits || 1;
            for (let i = 0; i < count; i++) {
                const spread = count > 1 ? (i - (count - 1) / 2) * 0.08 : 0;
                game.projectiles.push(new PlayerProjectile(this.x, this.y - 6, attackAngle + spread, {
                    speed: 860, damage: dmg, color: w.color, type: 'bolt',
                    pierce: 1, life: 1.1, source: this, crit, knockback: w.knockback
                }));
            }
            Sound.play('slash', 0.7);
            game.shakeCamera(1.5);
            return;
        }

        const reach = w.reach * (isFinisher ? 1.08 : 1);
        const arc = w.arc * (isFinisher ? 1.08 : 1);
        let hitAny = false;
        const hitSet = new Set();
        const applyHit = (e) => {
            if (hitSet.has(e)) return;
            hitSet.add(e);
            hitAny = true;
            const hits = w.hits || 1;
            for (let h = 0; h < hits; h++) {
                game.damageEnemy(e, dmg, {
                    crit, source: this, color: w.color, knockback: w.knockback,
                    lifesteal: true, shake: 1.5, critColor: w.accent
                });
                this.onHitEnemy(e, dmg, game, crit);
            }
            if (w.bleed) e.applyStatus('bleed', 5, w.bleed * this.getDamageMult() * 0.3, game);
            if (w.stun) e.applyStatus('stun', w.stun, 0, game);
        };

        for (const e of game.enemies) {
            if (e.hp <= 0 || e.spawnTimer > 0) continue;
            const d = dist(this.x, this.y, e.x, e.y);
            if (d > reach + e.size) continue;
            const ea = angleBetween(this.x, this.y, e.x, e.y);
            if (w.kind === 'thrust') {
                const perp = Math.abs(Math.sin(ea - attackAngle)) * d;
                if (perp > e.size + 24) continue;
                if (Math.abs(normAngle(ea - attackAngle)) > Math.PI / 2.2) continue;
            } else if (angleDiff(ea, attackAngle) > arc / 2) continue;
            applyHit(e);
        }

        // Alvos extras (ricochete)
        if (this.stats.bonusTargets > 0) {
            const extras = game.enemies
                .filter(e => !hitSet.has(e) && e.hp > 0 && e.spawnTimer <= 0 && dist(this.x, this.y, e.x, e.y) < reach * 1.35 + e.size)
                .sort((a, b) => dist(this.x, this.y, a.x, a.y) - dist(this.x, this.y, b.x, b.y))
                .slice(0, this.stats.bonusTargets);
            extras.forEach(applyHit);
        }

        game.effects.push(new SlashEffect(this.x, this.y, attackAngle, reach + 16, arc, w.color, {
            dir: this.attackDir, heavy: isFinisher, width: isFinisher ? 22 : 16
        }));

        if (isFinisher && this.classId === 'warrior') {
            game.effects.push(new Shockwave(this.x, this.y, 88, '#ffcf7a', { life: 0.38 }));
            for (const e of game.enemies) {
                if (e.hp <= 0 || e.spawnTimer > 0 || hitSet.has(e)) continue;
                if (dist(this.x, this.y, e.x, e.y) < 90 + e.size) {
                    game.damageEnemy(e, dmg * 0.42, { source: this, color: '#ffcf7a', knockback: 260, lifesteal: true });
                }
            }
            game.shakeCamera(3);
        }
        if (w.shockwave) {
            game.effects.push(new Shockwave(this.x, this.y, reach * 0.95, w.color, { life: 0.45, width: 5 }));
            for (const e of game.enemies) {
                if (e.hp <= 0 || e.spawnTimer > 0 || hitSet.has(e)) continue;
                if (dist(this.x, this.y, e.x, e.y) < reach * 0.95 + e.size) {
                    game.damageEnemy(e, dmg * w.shockwave, { source: this, color: w.color, knockback: 340, lifesteal: true });
                    e.applyStatus('stun', 0.5, 0, game);
                }
            }
            game.shakeCamera(6);
            game.addParticles(this.x, this.y, 18, w.color, { glow: true, size: 3, life: 0.5 });
        }
        if (w.wave) {
            game.projectiles.push(new PlayerProjectile(this.x, this.y - 4, attackAngle, {
                speed: 620, damage: dmg * 0.55, color: w.color, type: 'wave',
                pierce: true, life: 0.8, source: this, crit, knockback: 140
            }));
        }

        Sound.play(hitAny ? 'hit' : 'slash', hitAny ? 1 : 0.65);
        if (hitAny) {
            game.hitStop = Math.max(game.hitStop, 0.022);
            game.shakeCamera(1.6);
        }
    }

    heavyAttack(game) {
        const w = WEAPONS[this.weaponId] || WEAPONS.twilight;
        const crit = Math.random() < this.stats.critChance;
        const dmg = w.damage * 2.25 * this.getDamageMult() * (this.weaponDamageMod || 1) * (crit ? this.stats.critDamage : 1);
        const radius = (w.reach + 22) * 1.28;
        this.attackCd = Math.max(this.attackCd, 0.3 / this.getAttackSpeed());
        this.heavyCd = 1.45 / this.getAttackSpeed();
        this.attackAnim = 0.36;
        this.attackAnimMax = 0.36;
        this.swingAngle = this.aim;
        if (crit) this.onCrit(game);

        if (w.kind === 'ranged') {
            for (let i = -1; i <= 1; i++) {
                game.projectiles.push(new PlayerProjectile(this.x, this.y - 6, this.aim + i * 0.16, {
                    speed: 900, damage: dmg, color: w.color, type: 'bolt',
                    pierce: 2, life: 1.2, source: this, crit, knockback: 200
                }));
            }
        } else {
            let hit = false;
            for (const e of game.enemies) {
                if (e.hp <= 0 || e.spawnTimer > 0) continue;
                const d = dist(this.x, this.y, e.x, e.y);
                if (d > radius + e.size) continue;
                const ea = angleBetween(this.x, this.y, e.x, e.y);
                if (angleDiff(ea, this.aim) > Math.PI * 0.65) continue;
                game.damageEnemy(e, dmg, {
                    crit, source: this, color: w.accent, knockback: 520,
                    lifesteal: true, shake: 4, critColor: '#fff3c4'
                });
                e.applyStatus('stun', 0.7, 0, game);
                this.onHitEnemy(e, dmg, game, crit);
                hit = true;
            }
            game.effects.push(new SlashEffect(this.x, this.y, this.aim, radius + 22, 2.5, w.color, {
                dir: this.attackDir, heavy: true, width: 30, life: 0.3
            }));
            game.effects.push(new Shockwave(this.x, this.y, radius, w.color, { life: 0.45, width: 7 }));
            game.addParticles(this.x, this.y, 26, w.color, {
                glow: true, size: 3.5, life: 0.6, vx: rand(-220, 220), vy: rand(-220, 220)
            });
            if (hit) game.hitStop = Math.max(game.hitStop, 0.045);
        }
        Sound.play('crit', 0.9);
        game.shakeCamera(7);
    }

    onHitEnemy(e, dmg, game, crit) {
        if (!e || e.hp <= 0) return;
        const st = this.stats;
        if (st.fireOnHit) {
            if (e.status.freeze > 0) {
                game.explode(e.x, e.y, 64, dmg * 0.35, { friendly: true, color: '#ffb36b', style: 'fire', source: this });
                e.status.freeze = 0;
                game.addFloatingText(e.x, e.y - 20, 'ESTILHAÇAR!', '#ffb36b', true);
            }
            e.applyStatus('burn', 4, dmg * 0.10, game);
        }
        if (st.iceOnHit) e.applyStatus('chill', 2.5, 0, game);
        if (st.chainChance > 0 && Math.random() < st.chainChance) {
            game.chainLightning(e, 3, dmg * 0.35, '#ffe66d', this);
        }
        if (this.flags.echo && Math.random() < 0.15) {
            game.damageEnemy(e, dmg * 0.5, {
                source: this, color: '#b06bff', silentText: false, lifesteal: false, noShake: true
            });
        }
        if (this.flags.vampiric && e.hp <= 0) this.heal(2, game, false);
    }

    onCrit(game) {
        if (this.classId === 'assassin') {
            this.addBuff('phantom', 'speed', 1.15, 2);
            game.addParticles(this.x, this.y, 5, '#5ef2c2', { glow: true, size: 2, life: 0.3, vx: rand(-40, 40), vy: rand(-50, -10) });
        }
    }

    onKill(game) {
        if (this.classId === 'hunter') {
            this.killStacks = Math.min(8, this.killStacks + 1);
            this.killStackTimer = 6;
        }
        if (this.classId === 'cursed') {
            this.heal(2, game, false);
            this.addShield(8, game, false);
        }
        if (this.flags.vampiric) this.heal(2, game, false);
    }

    takeDamage(amount, game, source = null, opts = {}) {
        if (this.dead) return 0;
        if (!opts.ignoreIframes && (this.iframes > 0 || this.dashTimer > 0)) return 0;
        if (!opts.ignoreDodge && Math.random() < this.stats.dodge) {
            game.addFloatingText(this.x, this.y - 30, 'ESQUIVA', '#5ef2c2', false);
            Sound.play('dash', 0.5);
            return 0;
        }
        let dmg = Math.max(1, amount * (1 - this.stats.armor) * this.stats.damageTakenMult);
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, dmg);
            this.shield -= absorbed;
            dmg -= absorbed;
            game.addFloatingText(this.x, this.y - 34, `-${Math.round(absorbed)} ESCUDO`, '#61c0ff', false);
        }
        if (dmg > 0.5) {
            this.hp -= dmg;
            this.hurtTimer = 0.32;
            this.iframes = Math.max(this.iframes, opts.ignoreIframes ? 0.25 : 0.62);
            this.timeSinceHit = 0;
            this.comboStep = 0;
            game.waveDamage += dmg;
            game.stats.damageTaken += dmg;
            game.addFloatingText(this.x, this.y - 26, `-${Math.round(dmg)}`, '#ff5f6d', false);
            game.addParticles(this.x, this.y, 7, '#c0392b', { size: 2.5, life: 0.4, gravity: 160 });
            game.shakeCamera(5);
            game.flashScreen('#8b0018', 0.22);
            Sound.play('hurt');
        }
        if (this.stats.thorns > 0 && source && typeof source.hp === 'number') {
            game.damageEnemy(source, this.stats.thorns, { source: this, color: '#6fe7a0', silentText: false, noShake: true });
        }
        if (this.flags.thornmail && source && typeof source.hp === 'number') {
            game.damageEnemy(source, amount * 0.25, { source: this, color: '#b06bff', silentText: true, noShake: true });
        }
        if (this.reflectTimer > 0 && source && typeof source.hp === 'number') {
            game.damageEnemy(source, amount * this.reflectPct, { source: this, color: '#61c0ff', silentText: true, noShake: true });
        }
        if (this.hp <= 0) {
            if (this.stats.phoenix && !this.phoenixUsed) {
                this.phoenixUsed = true;
                this.hp = Math.max(1, Math.round(this.maxHp * 0.45));
                this.iframes = 2.2;
                game.effects.push(new Shockwave(this.x, this.y, 220, '#ff7ae0', { life: 0.8, width: 8 }));
                game.addParticles(this.x, this.y, 45, '#ff7ae0', { glow: true, size: 4, life: 1, vx: rand(-260, 260), vy: rand(-260, 260) });
                game.addFloatingText(this.x, this.y - 50, 'FÊNIX!', '#ff7ae0', true);
                game.flashScreen('#ff7ae0', 0.45);
                Sound.play('victory', 0.8);
            } else {
                this.hp = 0;
                this.dead = true;
                game.onPlayerDeath();
            }
        }
        return dmg;
    }

    heal(amount, game, show = true) {
        if (this.dead || amount <= 0) return;
        const real = Math.min(this.maxHp - this.hp, amount);
        if (real <= 0) return;
        this.hp += real;
        if (show) game.addFloatingText(this.x, this.y - 30, `+${Math.round(real)}`, '#6fe7a0', false);
    }

    addShield(amount, game, show = true) {
        this.shield += amount;
        if (show) game.addFloatingText(this.x, this.y - 40, `+${Math.round(amount)} ESCUDO`, '#61c0ff', false);
    }

    gainXp(amount, game, show = true) {
        const final = Math.max(1, Math.round(amount * this.stats.xpMult));
        this.xp += final;
        if (show) game.addFloatingText(this.x, this.y - 38, `+${final} XP`, '#ffd166', false);
        let leveled = false;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.round(48 * Math.pow(1.28, this.level - 1));
            this.pendingLevelUps++;
            leveled = true;
        }
        if (leveled) {
            Sound.play('level');
            game.stats.highestLevel = Math.max(game.stats.highestLevel, this.level);
            game.openLevelUpMenu();
        }
    }

    getSkillCost(def) {
        let cost = def.mana;
        if (this.classId === 'mage') cost *= 0.8;
        if (this.classId === 'guardian') cost *= 0.85;
        return Math.round(cost);
    }

    castSkill(slot, game) {
        const id = this.skills[slot];
        if (!id) return false;
        const def = SKILLS[id];
        if (this.getCooldown(id) > 0) {
            game.addFloatingText(this.x, this.y - 42, 'RECARREGANDO', '#9aa4ad', false);
            Sound.play('denied', 0.5);
            return false;
        }
        const cost = this.getSkillCost(def);
        if (this.mana < cost) {
            game.addFloatingText(this.x, this.y - 42, 'MANA INSUFICIENTE', '#61c0ff', false);
            Sound.play('denied', 0.5);
            return false;
        }
        if (!game.castSkill(id, this)) return false;
        this.mana -= cost;
        this.skillCd[id] = def.cooldown * this.stats.cooldownMult;
        game.stats.skillsUsed++;
        Sound.play('skill', 0.8);
        return true;
    }

    // =============================================================
    // DESENHO
    // =============================================================
    draw(c, game) {
        const time = game.time;
        for (const g of this.ghosts) {
            const a = g.life / g.maxLife;
            c.save();
            c.globalAlpha = a * 0.32;
            c.translate(g.x, g.y);
            c.fillStyle = g.color;
            c.beginPath(); c.ellipse(0, 0, 15, 27, 0, 0, TAU); c.fill();
            c.beginPath(); c.arc(0, -25, 11, 0, TAU); c.fill();
            c.restore();
        }
        if (this.dead) return;

        const blink = this.iframes > 0 && this.iframes < 0.5 ? (Math.sin(time * 45) > 0 ? 0.45 : 1) : 1;
        const cls = CLASSES[this.classId];
        const bob = Math.sin(this.anim * (this.isMoving ? 11 : 3.2)) * (this.isMoving ? 2.2 : 1);
        const moving = this.isMoving && this.dashTimer <= 0;
        const legSwing = moving ? Math.sin(this.anim * 11) * 6 : 0;

        c.save();
        c.globalAlpha = blink;
        c.translate(this.x, this.y + bob);

        // sombra
        c.fillStyle = 'rgba(0,0,0,0.42)';
        c.beginPath(); c.ellipse(0, 24, 18, 7, 0, 0, TAU); c.fill();

        if (this.hurtTimer > 0) {
            c.save();
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, 0, 0, 44, '#ff2040', 0.30);
            c.restore();
        }

        // capa
        c.save();
        const capeSway = Math.sin(time * 5 + this.anim * 2) * 5 - this.vx * 0.012;
        c.fillStyle = shade(cls.color, -70);
        c.beginPath();
        c.moveTo(-12, -12);
        c.quadraticCurveTo(-24 + capeSway, 18, -16 + capeSway, 34);
        c.quadraticCurveTo(0, 28, 16 + capeSway, 34);
        c.quadraticCurveTo(24 + capeSway, 18, 12, -12);
        c.closePath();
        c.fill();
        c.strokeStyle = hexToRgba(cls.accent, 0.35);
        c.lineWidth = 1.2;
        c.stroke();
        c.restore();

        // pernas
        c.strokeStyle = '#2b2533';
        c.lineWidth = 6;
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(-6, 10); c.lineTo(-7 + legSwing, 26); c.stroke();
        c.beginPath(); c.moveTo(6, 10); c.lineTo(7 - legSwing, 26); c.stroke();

        // torso
        const bodyGrad = c.createLinearGradient(0, -22, 0, 20);
        bodyGrad.addColorStop(0, shade(cls.color, 5));
        bodyGrad.addColorStop(0.55, shade(cls.color, -45));
        bodyGrad.addColorStop(1, '#17131f');
        c.fillStyle = bodyGrad;
        c.beginPath();
        c.moveTo(-12, -16);
        c.quadraticCurveTo(-17, 2, -11, 17);
        c.quadraticCurveTo(0, 22, 11, 17);
        c.quadraticCurveTo(17, 2, 12, -16);
        c.closePath();
        c.fill();
        c.strokeStyle = hexToRgba(cls.accent, 0.5);
        c.lineWidth = 1;
        c.stroke();

        // detalhes de classe
        if (this.classId === 'warrior') {
            c.fillStyle = shade(cls.accent, -30);
            c.beginPath(); c.ellipse(-12, -10, 7, 5, -0.4, 0, TAU); c.fill();
            c.beginPath(); c.ellipse(12, -10, 7, 5, 0.4, 0, TAU); c.fill();
        } else if (this.classId === 'guardian') {
            c.save();
            c.globalAlpha = 0.8;
            c.strokeStyle = '#e3b341';
            c.lineWidth = 2;
            c.beginPath(); c.arc(-15, 2, 10, 0, TAU); c.stroke();
            c.restore();
        } else if (this.classId === 'cursed') {
            c.strokeStyle = '#ff4d6d';
            c.lineWidth = 2;
            c.beginPath(); c.moveTo(-8, -19); c.lineTo(-13, -31); c.moveTo(8, -19); c.lineTo(13, -31); c.stroke();
        }

        // cabeça / capuz
        c.fillStyle = '#0d0b12';
        c.beginPath(); c.arc(0, -22, 11, 0, TAU); c.fill();
        c.fillStyle = shade(cls.color, -55);
        c.beginPath();
        c.moveTo(-11, -20);
        c.quadraticCurveTo(-9, -35, 0, -36);
        c.quadraticCurveTo(9, -35, 11, -20);
        c.quadraticCurveTo(0, -15, -11, -20);
        c.closePath(); c.fill();

        // olhos
        const eyeColor = cls.accent;
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.shadowBlur = 9;
        c.shadowColor = eyeColor;
        c.fillStyle = eyeColor;
        const look = clamp(Math.cos(this.aim) * 2.2, -2, 2);
        c.beginPath(); c.arc(-3.5 + look, -22, 1.8, 0, TAU); c.fill();
        c.beginPath(); c.arc(3.5 + look, -22, 1.8, 0, TAU); c.fill();
        c.restore();

        // acessório de classe
        if (this.classId === 'mage') {
            const orbA = time * 2;
            c.save();
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, -17, -4 + Math.sin(orbA) * 3, 12, '#9b7bff', 0.7);
            c.fillStyle = '#d7c4ff';
            c.beginPath(); c.arc(-17, -4 + Math.sin(orbA) * 3, 3.2, 0, TAU); c.fill();
            c.restore();
        } else if (this.classId === 'hunter') {
            c.strokeStyle = 'rgba(255,209,102,0.6)';
            c.lineWidth = 1.5;
            c.beginPath(); c.arc(0, 0, 22 + Math.sin(time * 2) * 2, 0.2, 1.3); c.stroke();
        }

        // arma
        this.drawWeapon(c, time);

        // escudo
        if (this.shield > 0) {
            c.save();
            c.globalCompositeOperation = 'lighter';
            c.globalAlpha = 0.55 + Math.sin(time * 4) * 0.1;
            c.strokeStyle = '#61c0ff';
            c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 35, 0, TAU); c.stroke();
            c.globalAlpha = 0.13;
            c.fillStyle = '#61c0ff';
            c.beginPath(); c.arc(0, 0, 35, 0, TAU); c.fill();
            c.restore();
        }

        // aura de status
        if (this.buffs.length) {
            for (const b of this.buffs) {
                if (b.id === 'phantom') {
                    c.save();
                    c.globalAlpha = 0.25;
                    c.strokeStyle = '#5ef2c2';
                    c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.stroke();
                    c.restore();
                }
            }
        }
        c.restore();
    }

    drawWeapon(c, time) {
        const w = WEAPONS[this.weaponId] || WEAPONS.twilight;
        const swingT = this.attackAnim > 0 ? 1 - this.attackAnim / this.attackAnimMax : 0;
        const swing = this.attackAnim > 0 ? Math.sin(swingT * Math.PI) * 0.8 * this.attackDir : 0;
        const angle = this.aim + swing;
        const s = this.attackAnim > 0 ? 1 + Math.sin(swingT * Math.PI) * 0.12 : 1;
        c.save();
        c.translate(0, -3);
        c.rotate(angle);
        c.scale(this.facing, 1);
        c.scale(s, s);
        c.lineCap = 'round';
        if (w.id === 'staff') {
            c.strokeStyle = '#5a4632'; c.lineWidth = 3;
            c.beginPath(); c.moveTo(-8, 8); c.lineTo(36, -8); c.stroke();
            c.save();
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, 38, -9, 14, w.color, 0.75);
            c.fillStyle = '#fff8d0';
            c.beginPath(); c.arc(38, -9, 3.5, 0, TAU); c.fill();
            c.restore();
        } else if (w.id === 'hammer') {
            c.strokeStyle = '#6a5440'; c.lineWidth = 4;
            c.beginPath(); c.moveTo(-4, 10); c.lineTo(28, -6); c.stroke();
            c.fillStyle = shade(w.color, -20);
            c.fillRect(24, -18, 18, 22);
            c.strokeStyle = w.color; c.lineWidth = 1.5;
            c.strokeRect(24, -18, 18, 22);
        } else if (w.id === 'axe') {
            c.strokeStyle = '#5a4030'; c.lineWidth = 4;
            c.beginPath(); c.moveTo(-2, 10); c.lineTo(30, -8); c.stroke();
            c.fillStyle = w.color;
            c.beginPath();
            c.moveTo(26, -12); c.quadraticCurveTo(46, -24, 45, -2);
            c.quadraticCurveTo(36, 2, 27, -2); c.closePath(); c.fill();
        } else if (w.id === 'scythe') {
            c.strokeStyle = '#4a3d32'; c.lineWidth = 3;
            c.beginPath(); c.moveTo(-6, 12); c.lineTo(34, -12); c.stroke();
            c.strokeStyle = w.color; c.lineWidth = 3;
            c.beginPath(); c.arc(38, -14, 20, Math.PI * 0.85, Math.PI * 1.8); c.stroke();
        } else if (w.id === 'spear') {
            c.strokeStyle = '#695648'; c.lineWidth = 2.5;
            c.beginPath(); c.moveTo(-18, 12); c.lineTo(35, -10); c.stroke();
            c.fillStyle = w.color;
            c.beginPath(); c.moveTo(54, -16); c.lineTo(32, -16); c.lineTo(36, -7); c.closePath(); c.fill();
        } else if (w.id === 'daggers') {
            for (const off of [-1, 1]) {
                c.save();
                c.translate(0, off * 6);
                c.rotate(off * 0.12);
                c.fillStyle = w.color;
                c.beginPath(); c.moveTo(8, -2); c.lineTo(34, -3); c.lineTo(36, 0); c.lineTo(34, 3); c.lineTo(8, 2); c.closePath(); c.fill();
                c.restore();
            }
        } else {
            c.fillStyle = w.color;
            c.beginPath();
            c.moveTo(8, -3); c.lineTo(48, -2.4); c.lineTo(54, 0); c.lineTo(48, 2.4); c.lineTo(8, 3);
            c.closePath(); c.fill();
            c.fillStyle = shade(w.color, -45);
            c.fillRect(2, -7, 5, 14);
            c.fillRect(-5, -1.5, 10, 3);
        }
        c.restore();
    }
}


/* ----------------------------------------------------------------
   MÓDULO: enemies.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — INIMIGOS
   ================================================================ */
'use strict';

class Enemy {
    constructor(x, y, type, wave, game, opts = {}) {
        const def = opts.def || ENEMY_DEFS[type] || ENEMY_DEFS.skeleton;
        this.type = type;
        this.def = def;
        this.isBoss = !!opts.boss;
        this.elite = !!opts.elite && !this.isBoss;
        this.summoned = !!opts.summoned;
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.knockX = 0; this.knockY = 0;
        this.angle = rand(0, TAU);
        this.size = def.size * (this.elite ? 1.18 : 1);
        this.baseSpeed = def.speed * (this.elite ? 1.08 : 1);
        const scale = 1 + Math.max(0, wave - 1) * (this.isBoss ? 0.19 : 0.145);
        const diff = game ? game.difficulty : { hp: 1, dmg: 1 };
        let hpMult = scale * diff.hp;
        if (this.elite) hpMult *= 2.25;
        if (this.summoned) hpMult *= 0.7;
        this.maxHp = Math.max(8, Math.round(def.hp * hpMult));
        this.hp = this.maxHp;
        this.dmg = def.damage * (1 + Math.max(0, wave - 1) * 0.075) * diff.dmg * (this.elite ? 1.35 : 1);
        this.range = def.range;
        this.atkCd = def.atkCd;
        this.telegraphTime = def.telegraph || 0.4;
        this.attackCd = rand(0.2, 1.0);
        this.xpValue = Math.round(def.xp * (1 + wave * 0.06) * (this.elite ? 2.4 : 1));
        this.coinValue = Math.round(def.coins * (1 + wave * 0.1) * (this.elite ? 3 : 1));
        this.color = def.color;
        this.spawnTimer = opts.summoned ? 0.35 : 0.65;
        this.spawnMax = this.spawnTimer;
        this.flashTimer = 0;
        this.attackFlash = 0;
        this.windup = 0;
        this.windupMax = 0;
        this.aoeX = x; this.aoeY = y; this.aoeR = 0;
        this.charging = false;
        this.chargeTimer = 0;
        this.chargeDir = { x: 0, y: 0 };
        this.chargeHit = false;
        this.fuse = 0;
        this.selfDestruct = false;
        this.guard = 0;
        this.dead = false;
        this.status = { burn: 0, burnDps: 0, bleed: 0, bleedDps: 0, chill: 0, freeze: 0, shock: 0, stun: 0 };
        this.statusTick = 0;
        this.anim = Math.random() * 10;
        this.facing = 1;
        this.summonCd = rand(3, 6);
        this.invisibleTimer = 0;
        this.phase = 1;
        this.leap = 0;
        this.orbitDir = Math.random() < 0.5 ? 1 : -1;
        this.tint = 0;
        this.id = Enemy.nextId++;
    }

    get speed() {
        let s = this.baseSpeed;
        if (this.status.chill > 0) s *= 0.55;
        if (this.status.freeze > 0 || this.status.stun > 0) s = 0;
        if (this.status.shock > 0) s *= 0.9;
        return s;
    }

    applyStatus(kind, duration, power, game) {
        if (this.hp <= 0) return;
        if (this.isBoss && (kind === 'freeze' || kind === 'stun')) duration *= 0.45;
        if (this.elite && kind === 'stun') duration *= 0.7;
        const s = this.status;
        if (kind === 'burn') { s.burn = Math.max(s.burn, duration); s.burnDps = Math.max(s.burnDps, power); }
        else if (kind === 'bleed') { s.bleed = Math.max(s.bleed, duration); s.bleedDps = Math.max(s.bleedDps, power); }
        else if (kind === 'chill') s.chill = Math.max(s.chill, duration);
        else if (kind === 'freeze') { s.freeze = Math.max(s.freeze, duration); s.chill = Math.max(s.chill, duration); }
        else if (kind === 'shock') s.shock = Math.max(s.shock, duration);
        else if (kind === 'stun') s.stun = Math.max(s.stun, duration);
        if (game && (kind === 'freeze' || kind === 'stun') && Math.random() < 0.6) {
            game.addFloatingText(this.x, this.y - this.size - 14, kind === 'freeze' ? 'CONGELADO' : 'ATORDOADO', kind === 'freeze' ? '#7fe7ff' : '#ffd166', false);
        }
    }

    tickStatus(dt, game) {
        const s = this.status;
        if (s.burn > 0) {
            s.burn -= dt;
            this.hp -= s.burnDps * dt;
            if (Math.random() < 0.18) game.addParticles(this.x + rand(-8, 8), this.y - rand(0, 14), 1, '#ff9f43', { glow: true, size: 2.2, life: 0.35, vy: -35 });
            if (s.burn <= 0) s.burnDps = 0;
        }
        if (s.bleed > 0) {
            s.bleed -= dt;
            this.hp -= s.bleedDps * dt;
            if (Math.random() < 0.12) game.addParticles(this.x, this.y + rand(-5, 5), 1, '#c0392b', { size: 2, life: 0.3, gravity: 200 });
            if (s.bleed <= 0) s.bleedDps = 0;
        }
        if (s.chill > 0) s.chill -= dt;
        if (s.freeze > 0) s.freeze -= dt;
        if (s.shock > 0) s.shock -= dt;
        if (s.stun > 0) s.stun -= dt;
    }

    moveToward(player, dt, mult = 1) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const sp = this.speed * mult;
        this.x += dx / d * sp * dt;
        this.y += dy / d * sp * dt;
        this.facing = dx >= 0 ? 1 : -1;
    }

    moveAway(player, dt, mult = 1) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const sp = this.speed * mult;
        this.x += dx / d * sp * dt;
        this.y += dy / d * sp * dt;
        this.facing = dx >= 0 ? 1 : -1;
    }

    strafe(player, dt, mult = 1) {
        const a = angleBetween(this.x, this.y, player.x, player.y) + Math.PI / 2 * this.orbitDir;
        this.x += Math.cos(a) * this.speed * mult * dt;
        this.y += Math.sin(a) * this.speed * mult * dt;
        this.facing = player.x >= this.x ? 1 : -1;
    }

    update(player, dt, game) {
        if (this.spawnTimer > 0) {
            this.spawnTimer -= dt;
            this.anim += dt;
            return;
        }
        if (this.hp <= 0) return;
        this.anim += dt;
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        this.attackFlash = Math.max(0, this.attackFlash - dt);
        this.tickStatus(dt, game);
        if (this.hp <= 0) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const targetAngle = Math.atan2(dy, dx);
        const da = normAngle(targetAngle - this.angle);
        this.angle += clamp(da, -7 * dt, 7 * dt);
        this.facing = dx >= 0 ? 1 : -1;

        if (this.status.freeze > 0 || this.status.stun > 0) {
            if (this.windup > 0) this.windup = Math.min(this.windup, this.windupMax);
            return;
        }

        if (this.charging) {
            this.chargeTimer -= dt;
            this.x += this.chargeDir.x * this.baseSpeed * 5.4 * dt;
            this.y += this.chargeDir.y * this.baseSpeed * 5.4 * dt;
            if (!this.chargeHit && dist(this.x, this.y, player.x, player.y) < this.size + player.size + 6) {
                this.chargeHit = true;
                player.takeDamage(this.dmg * 1.25, game, this);
                game.effects.push(new Shockwave(this.x, this.y, 65, this.color, { life: 0.3 }));
                game.shakeCamera(5);
            }
            if (this.chargeTimer <= 0) {
                this.charging = false;
                this.attackCd = this.atkCd * 1.3;
            }
            return;
        }

        if (this.fuse > 0) {
            this.fuse -= dt;
            this.moveToward(player, dt, 1.2);
            if (this.fuse <= 0) {
                game.explode(this.x, this.y, 92, this.dmg * 1.8, {
                    hostile: true, color: '#ff7a3d', style: 'fire', source: this
                });
                this.hp = 0;
                this.selfDestruct = true;
                game.shakeCamera(7);
                Sound.play('explosion');
            }
            return;
        }

        if (this.windup > 0) {
            this.windup -= dt;
            if (this.def.ai === 'charge') this.moveToward(player, dt, 0.15);
            else if (this.def.ai === 'ranged' || this.def.ai === 'support') { /* imóvel */ }
            else this.moveToward(player, dt, 0.2);
            if (this.windup <= 0) this.executeAttack(game);
            if (this.def.ai === 'assassin') this.separate(game);
            return;
        }

        this.attackCd -= dt;
        this.summonCd -= dt;

        // Comportamentos passivos / especiais
        if (this.def.ai === 'blink' && d > 100 && this.attackCd <= 0 && Math.random() < 0.025) {
            const a = rand(0, TAU);
            game.addParticles(this.x, this.y, 10, this.color, { glow: true, size: 2.4, life: 0.45 });
            this.x = player.x + Math.cos(a) * rand(70, 130);
            this.y = player.y + Math.sin(a) * rand(70, 130);
            game.addParticles(this.x, this.y, 10, this.color, { glow: true, size: 2.4, life: 0.45 });
            Sound.play('teleport', 0.35);
        }

        if (this.def.ai === 'support') {
            if (this.summonCd <= 0) {
                this.summonCd = 5;
                let healed = false;
                for (const o of game.enemies) {
                    if (o === this || o.hp <= 0 || o.hp >= o.maxHp) continue;
                    if (dist(this.x, this.y, o.x, o.y) < 220) {
                        o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.18);
                        game.effects.push(new BeamEffect(this.x, this.y - 12, o.x, o.y, '#7dffb0', { life: 0.3, width: 2 }));
                        game.addParticles(o.x, o.y - 10, 4, '#7dffb0', { glow: true, size: 2, life: 0.4, vy: -25 });
                        healed = true;
                    }
                }
                if (healed) Sound.play('heal', 0.35);
            }
            if (d > 270) this.moveToward(player, dt, 0.8);
            else if (d < 180) this.moveAway(player, dt, 0.9);
            else this.strafe(player, dt, 0.35);
        } else if (this.def.ai === 'ranged' || this.def.ai === 'summoner') {
            if (d > this.range * 0.82) this.moveToward(player, dt, 0.75);
            else if (d < this.range * 0.4) this.moveAway(player, dt, 0.9);
            else this.strafe(player, dt, 0.35);
        } else if (this.def.ai === 'assassin') {
            if (d > 260) this.moveToward(player, dt, 1.0);
            else this.strafe(player, dt, 0.8);
        } else if (this.def.ai === 'bomber') {
            this.moveToward(player, dt, 1.1);
            if (d < 66) this.beginAttack(game);
        } else if (this.def.ai === 'invisible') {
            this.invisibleTimer += dt;
            this.moveToward(player, dt, 0.95);
        } else {
            if (d > this.range * 0.68) this.moveToward(player, dt, 0.9);
            else this.strafe(player, dt, 0.12);
        }

        if (this.attackCd <= 0 && player.hp > 0) {
            if (this.def.ai === 'support') {
                if (d < this.range) this.beginAttack(game);
            } else if (this.def.ai === 'summoner') {
                if (d < this.range) this.beginAttack(game);
            } else if (d < this.range + player.size + 6) {
                this.beginAttack(game);
            }
        }

        // knockback
        this.x += this.knockX * dt;
        this.y += this.knockY * dt;
        const kf = Math.exp(-8 * dt);
        this.knockX *= kf; this.knockY *= kf;

        this.x = clamp(this.x, -1900, 1900);
        this.y = clamp(this.y, -1550, 1550);
        this.separate(game);
    }

    separate(game) {
        for (const o of game.enemies) {
            if (o === this || o.hp <= 0) continue;
            const dx = this.x - o.x, dy = this.y - o.y;
            const d2 = dx * dx + dy * dy;
            const min = (this.size + o.size) * 0.62;
            if (d2 < min * min && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const push = (min - d) / d * 0.5;
                this.x += dx * push;
                this.y += dy * push;
            }
        }
    }

    beginAttack(game) {
        this.attackCd = this.atkCd;
        this.windupMax = this.telegraphTime;
        this.windup = this.telegraphTime;
        this.attackFlash = 0.3;
        this.aoeX = game.player.x;
        this.aoeY = game.player.y;
        this.aoeR = this.def.ai === 'slam' ? 105 : 70;
        if (this.def.ai === 'bomber') {
            this.fuse = 0.8;
            this.windup = 0;
            Sound.play('ui', 0.7);
        }
        if (this.def.ai === 'charge') {
            const a = angleBetween(this.x, this.y, game.player.x, game.player.y);
            this.chargeDir = { x: Math.cos(a), y: Math.sin(a) };
        }
    }

    executeAttack(game) {
        const player = game.player;
        const d = dist(this.x, this.y, player.x, player.y);
        const ai = this.def.ai;
        Sound.play('slash', 0.55);
        if (ai === 'ranged') {
            const a = angleBetween(this.x, this.y, player.x, player.y);
            const type = this.type === 'cultist' ? 'fire' : this.type === 'healer' ? 'holy' : this.type === 'summoner' ? 'void' : 'void';
            const count = this.type === 'cultist' && this.elite ? 3 : 1;
            for (let i = 0; i < count; i++) {
                game.spawnEnemyProjectile(this.x, this.y - 8, a + (i - (count - 1) / 2) * 0.18, this.dmg, {
                    type, color: this.color, speed: type === 'fire' ? 250 : 230,
                    radius: type === 'fire' ? 8 : 6, source: this, homing: type === 'holy' ? 0.6 : 0
                });
            }
            if (this.type === 'summoner' && this.summonCd <= 0) {
                this.summonCd = 7;
                for (let i = 0; i < 2; i++) {
                    const a2 = rand(0, TAU);
                    game.spawnEnemy('skeleton', this.x + Math.cos(a2) * 55, this.y + Math.sin(a2) * 55, { summoned: true });
                }
                game.addFloatingText(this.x, this.y - 30, 'INVOCAÇÃO!', '#c46bff', true);
            }
        } else if (ai === 'slam') {
            game.explode(this.aoeX, this.aoeY, this.aoeR, this.dmg * 1.15, {
                hostile: true, color: this.color, style: 'void', source: this, shake: 6
            });
            game.effects.push(new Shockwave(this.aoeX, this.aoeY, this.aoeR, this.color, { life: 0.5 }));
        } else if (ai === 'charge') {
            this.charging = true;
            this.chargeTimer = 0.34;
            this.chargeHit = false;
            game.addParticles(this.x, this.y, 12, this.color, { size: 3, life: 0.4, glow: true });
        } else if (ai === 'assassin') {
            const a = angleBetween(this.x, this.y, player.x, player.y);
            this.x = player.x - Math.cos(a) * 48;
            this.y = player.y - Math.sin(a) * 48;
            game.addParticles(this.x, this.y, 12, '#5ef2c2', { kind: 'smoke', size: 3, life: 0.5 });
            if (dist(this.x, this.y, player.x, player.y) < this.size + player.size + 12) {
                player.takeDamage(this.dmg * 1.2, game, this);
            }
            game.effects.push(new SlashEffect(this.x, this.y, a, 54, 1.4, '#5ef2c2'));
        } else if (ai === 'leap') {
            const a = angleBetween(this.x, this.y, player.x, player.y);
            this.x = player.x - Math.cos(a) * 34;
            this.y = player.y - Math.sin(a) * 34;
            game.explode(player.x, player.y, 56, this.dmg, {
                hostile: true, color: '#7dffb0', style: 'web', source: this
            });
        } else {
            if (d < this.range + player.size + 14) player.takeDamage(this.dmg, game, this);
            game.effects.push(new SlashEffect(this.x, this.y, this.angle, this.range * 0.75, 1.5, this.color, { life: 0.16 }));
        }
    }

    takeDamage(amount, game, opts = {}) {
        return game.damageEnemy(this, amount, opts);
    }

    draw(c, game) {
        this.drawTelegraph(c, game);
        const scale = this.spawnTimer > 0 ? 0.25 + (1 - this.spawnTimer / this.spawnMax) * 0.75 : 1;
        const alpha = this.spawnTimer > 0 ? 1 - this.spawnTimer / this.spawnMax : 1;
        const bob = Math.sin(this.anim * 4) * 2;
        let alphaMod = 1;
        if (this.type === 'invisible') {
            const d = dist(this.x, this.y, game.player.x, game.player.y);
            alphaMod = d < 110 ? 1 : this.windup > 0 ? 0.65 : 0.18 + Math.sin(this.anim * 3) * 0.06;
        }

        c.save();
        c.globalAlpha = alpha * alphaMod;
        if (this.elite) {
            c.save();
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, this.x, this.y, this.size * 2.1, this.color, 0.14 + Math.sin(this.anim * 3) * 0.04);
            c.strokeStyle = this.color;
            c.globalAlpha = 0.35;
            c.lineWidth = 1;
            c.beginPath(); c.arc(this.x, this.y, this.size * 1.45, this.anim, this.anim + 4); c.stroke();
            c.restore();
        }
        c.translate(this.x, this.y + bob);
        c.fillStyle = 'rgba(0,0,0,0.4)';
        c.beginPath(); c.ellipse(0, this.size * 0.9, this.size * 0.8, this.size * 0.28, 0, 0, TAU); c.fill();
        c.scale(scale * (this.facing < 0 ? -1 : 1), scale);
        c.scale(this.size / 22, this.size / 22);
        switch (this.def.draw) {
            case 'skeleton': this.drawSkeleton(c); break;
            case 'wraith': this.drawWraith(c); break;
            case 'spider': this.drawSpider(c); break;
            case 'cultist': this.drawCultist(c); break;
            case 'bomber': this.drawBomber(c); break;
            case 'assassin': this.drawAssassin(c); break;
            case 'golem': this.drawGolem(c); break;
            case 'healer': this.drawHealer(c); break;
            case 'summoner': this.drawSummoner(c); break;
            case 'invisible': this.drawInvisible(c); break;
            case 'brute': this.drawBrute(c); break;
            default: this.drawSkeleton(c);
        }
        c.restore();

        if (this.flashTimer > 0) {
            c.save();
            c.globalAlpha = Math.min(0.8, this.flashTimer * 8);
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, this.x, this.y, this.size * 1.3, '#ffffff', 0.55);
            c.restore();
        }
        if (this.status.freeze > 0 || this.status.chill > 0) {
            c.save();
            c.globalAlpha = this.status.freeze > 0 ? 0.45 : 0.22;
            c.strokeStyle = '#7fe7ff';
            c.lineWidth = 1.5;
            for (let i = 0; i < 5; i++) {
                const a = this.anim * 0.5 + i * TAU / 5;
                c.beginPath();
                c.moveTo(this.x + Math.cos(a) * this.size * 0.8, this.y + Math.sin(a) * this.size * 0.8);
                c.lineTo(this.x + Math.cos(a) * this.size * 1.35, this.y + Math.sin(a) * this.size * 1.35);
                c.stroke();
            }
            c.restore();
        }
        if (!this.isBoss) this.drawHealth(c);
        this.drawStatusIcons(c);
    }

    drawTelegraph(c, game) {
        if (this.windup <= 0 || this.spawnTimer > 0) return;
        const p = clamp(1 - this.windup / this.windupMax, 0, 1);
        const pulse = 0.22 + p * 0.35 + Math.sin(this.anim * 18) * 0.05;
        c.save();
        c.globalAlpha = pulse;
        c.strokeStyle = '#ff4d4d';
        c.fillStyle = 'rgba(255,50,50,0.12)';
        c.lineWidth = 2;
        if (this.def.ai === 'slam') {
            c.beginPath(); c.arc(this.aoeX, this.aoeY, this.aoeR, 0, TAU); c.fill(); c.stroke();
            c.globalAlpha = pulse * 0.6;
            c.beginPath(); c.arc(this.aoeX, this.aoeY, this.aoeR * p, 0, TAU); c.stroke();
        } else if (this.def.ai === 'charge') {
            const a = Math.atan2(this.chargeDir.y, this.chargeDir.x);
            c.translate(this.x, this.y); c.rotate(a);
            c.fillRect(0, -this.size * 0.7, 300, this.size * 1.4);
            c.globalAlpha = pulse + 0.15;
            c.beginPath(); c.moveTo(0, 0); c.lineTo(300, 0); c.stroke();
        } else if (this.def.ai === 'ranged' || this.def.ai === 'support') {
            c.setLineDash([6, 8]);
            c.beginPath(); c.moveTo(this.x, this.y); c.lineTo(game.player.x, game.player.y); c.stroke();
        } else {
            c.translate(this.x, this.y);
            c.rotate(angleBetween(this.x, this.y, game.player.x, game.player.y));
            c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, this.range + 20, -0.55, 0.55); c.closePath();
            c.fill(); c.stroke();
        }
        c.restore();
    }

    drawHealth(c) {
        if (this.hp >= this.maxHp || this.spawnTimer > 0) return;
        const w = this.elite ? 44 : 32;
        const y = this.y - this.size - 16;
        c.save();
        c.fillStyle = 'rgba(0,0,0,0.65)';
        c.fillRect(this.x - w / 2 - 1, y - 1, w + 2, 6);
        c.fillStyle = this.elite ? '#ffb347' : '#c0392b';
        c.fillRect(this.x - w / 2, y, w * clamp(this.hp / this.maxHp, 0, 1), 4);
        if (this.elite) {
            c.fillStyle = '#ffd166';
            c.font = '700 8px Segoe UI, sans-serif';
            c.textAlign = 'center';
            c.fillText('ELITE', this.x, y - 4);
        }
        c.restore();
    }

    drawStatusIcons(c) {
        const icons = [];
        if (this.status.burn > 0) icons.push('#ff9f43');
        if (this.status.chill > 0) icons.push('#7fe7ff');
        if (this.status.shock > 0) icons.push('#ffe66d');
        if (this.status.bleed > 0) icons.push('#c0392b');
        if (this.status.stun > 0) icons.push('#ffd166');
        if (!icons.length) return;
        const y = this.y - this.size - 25;
        icons.forEach((col, i) => {
            c.fillStyle = col;
            c.beginPath();
            c.arc(this.x + (i - (icons.length - 1) / 2) * 9, y, 3, 0, TAU);
            c.fill();
        });
    }

    // ---------------- desenhos ----------------
    eye(c, x, y, r, color) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.shadowBlur = 8;
        c.shadowColor = color || '#ff5f5f';
        c.fillStyle = color || '#ff5f5f';
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
        c.restore();
    }

    drawSkeleton(c) {
        const step = Math.sin(this.anim * 7) * 3;
        c.strokeStyle = '#c9c2ae'; c.lineWidth = 2.4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-1, 0); c.lineTo(-1, 12); c.stroke();
        c.beginPath(); c.moveTo(-1, 0); c.lineTo(-5 + step, 18); c.stroke();
        c.beginPath(); c.moveTo(-1, 0); c.lineTo(5 - step, 18); c.stroke();
        c.beginPath(); c.moveTo(-1, 11); c.lineTo(-7 + step * 0.5, 20); c.stroke();
        c.beginPath(); c.moveTo(-1, 11); c.lineTo(6 - step * 0.5, 20); c.stroke();
        c.strokeStyle = '#b8b09e'; c.lineWidth = 1.4;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-1, -2 + i * 4, 7 - i, 0.15, Math.PI - 0.15); c.stroke(); }
        c.strokeStyle = '#c9c2ae'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(-5, -4); c.lineTo(-11, 5); c.lineTo(-14, 12); c.stroke();
        c.beginPath(); c.moveTo(5, -4); c.lineTo(11, 4); c.stroke();
        c.fillStyle = '#d8d4c2';
        c.beginPath(); c.arc(0, -12, 7.5, 0, TAU); c.fill();
        c.fillStyle = '#1a1714';
        c.beginPath(); c.arc(-2.6, -13, 2.1, 0, TAU); c.fill();
        c.beginPath(); c.arc(2.6, -13, 2.1, 0, TAU); c.fill();
        c.fillRect(-2, -8, 4, 1.4);
        this.eye(c, -2.6, -13, 1.1, '#ff6b4a');
        this.eye(c, 2.6, -13, 1.1, '#ff6b4a');
        c.strokeStyle = '#7d7468'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(11, 4); c.lineTo(18, -8); c.stroke();
        c.strokeStyle = '#b8b09e'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(15, -5); c.lineTo(23, -13); c.stroke();
    }

    drawWraith(c) {
        const wav = Math.sin(this.anim * 2.2) * 4;
        c.save();
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, 0, 30, this.color, 0.18);
        c.restore();
        c.fillStyle = 'rgba(40,30,70,0.9)';
        c.beginPath();
        c.moveTo(-12, -8);
        c.quadraticCurveTo(-18, 12, -13 + wav, 26);
        c.quadraticCurveTo(-4, 21, 0, 30);
        c.quadraticCurveTo(6, 21, 12 + wav, 26);
        c.quadraticCurveTo(18, 12, 12, -8);
        c.quadraticCurveTo(0, -20, -12, -8);
        c.closePath(); c.fill();
        c.strokeStyle = hexToRgba(this.color, 0.55);
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = '#161022';
        c.beginPath(); c.arc(0, -12, 8, 0, TAU); c.fill();
        this.eye(c, -3, -13, 1.8, this.color);
        this.eye(c, 3, -13, 1.8, this.color);
        c.strokeStyle = hexToRgba(this.color, 0.7);
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-12, -2); c.quadraticCurveTo(-22, 8, -17, 16); c.stroke();
        c.beginPath(); c.moveTo(12, -2); c.quadraticCurveTo(22, 8, 17, 16); c.stroke();
    }

    drawSpider(c) {
        const legPhase = this.anim * 11;
        c.strokeStyle = '#6e4d38'; c.lineWidth = 2.2; c.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const spread = -0.9 + i * 0.6;
            for (const side of [-1, 1]) {
                const wig = Math.sin(legPhase + i) * 3;
                c.beginPath();
                c.moveTo(0, 2);
                c.lineTo(side * 13, 7 + spread * 3);
                c.lineTo(side * (21 + wig), 17 + spread * 7);
                c.stroke();
            }
        }
        c.fillStyle = '#4a3428';
        c.beginPath(); c.ellipse(0, 4, 11, 14, 0, 0, TAU); c.fill();
        c.fillStyle = '#7d5a42';
        c.beginPath(); c.ellipse(0, -8, 8, 7, 0, 0, TAU); c.fill();
        c.fillStyle = '#3a271e';
        c.beginPath(); c.ellipse(0, -1, 6, 8, 0, 0, TAU); c.fill();
        this.eye(c, -3.5, -9, 1.4, '#ff5f5f');
        this.eye(c, 3.5, -9, 1.4, '#ff5f5f');
        this.eye(c, -6, -11, 0.9, '#ffb36b');
        this.eye(c, 6, -11, 0.9, '#ffb36b');
    }

    drawCultist(c) {
        c.fillStyle = '#2b1838';
        c.beginPath();
        c.moveTo(-13, 22); c.lineTo(-8, -16); c.quadraticCurveTo(0, -24, 8, -16); c.lineTo(13, 22);
        c.closePath(); c.fill();
        c.strokeStyle = hexToRgba(this.color, 0.6); c.lineWidth = 1;
        c.stroke();
        c.fillStyle = '#120b1a';
        c.beginPath(); c.arc(0, -17, 8, 0, TAU); c.fill();
        this.eye(c, -2.6, -18, 1.5, this.color);
        this.eye(c, 2.6, -18, 1.5, this.color);
        c.strokeStyle = '#5b4030'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(12, 18); c.lineTo(17, -18); c.stroke();
        c.save();
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, 18, -20, 12, this.color, 0.6);
        c.fillStyle = '#e8d6ff';
        c.beginPath(); c.arc(18, -20, 3, 0, TAU); c.fill();
        c.restore();
        c.strokeStyle = hexToRgba(this.color, 0.4);
        c.beginPath(); c.arc(0, 6, 5, 0, TAU); c.stroke();
    }

    drawBomber(c) {
        const pulse = 1 + Math.sin(this.anim * (this.fuse > 0 ? 18 : 5)) * 0.08;
        c.scale(pulse, pulse);
        c.fillStyle = 'rgba(255,120,50,0.16)';
        c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fill();
        const g = c.createRadialGradient(-4, -6, 2, 0, 0, 18);
        g.addColorStop(0, '#ffb36b'); g.addColorStop(0.5, '#d35400'); g.addColorStop(1, '#4a1d0c');
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.fill();
        c.strokeStyle = '#2b1208'; c.lineWidth = 2;
        c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.stroke();
        for (let i = 0; i < 4; i++) {
            const a = i / 4 * TAU + 0.4;
            c.strokeStyle = '#3b1b0d'; c.lineWidth = 2.5;
            c.beginPath(); c.moveTo(Math.cos(a) * 13, Math.sin(a) * 13); c.lineTo(Math.cos(a) * 20, Math.sin(a) * 19); c.stroke();
        }
        this.eye(c, -5, -3, 1.7, '#fff3c4');
        this.eye(c, 5, -3, 1.7, '#fff3c4');
        c.strokeStyle = '#57402d'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(0, -15); c.quadraticCurveTo(6, -24, 13, -21); c.stroke();
        c.save();
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, 13, -21, 8, '#ffd166', 0.8);
        c.restore();
    }

    drawAssassin(c) {
        c.fillStyle = '#14251f';
        c.beginPath();
        c.moveTo(-10, 20); c.lineTo(-7, -10); c.quadraticCurveTo(0, -22, 7, -10); c.lineTo(10, 20);
        c.closePath(); c.fill();
        c.fillStyle = '#0b1512';
        c.beginPath(); c.arc(0, -15, 8, 0, TAU); c.fill();
        this.eye(c, -2.8, -16, 1.5, '#5ef2c2');
        this.eye(c, 2.8, -16, 1.5, '#5ef2c2');
        c.fillStyle = '#2b4a3d';
        c.beginPath();
        c.moveTo(-7, -8); c.lineTo(-18, -1); c.lineTo(-9, 2); c.closePath(); c.fill();
        const hand = Math.sin(this.anim * 6) * 2;
        c.fillStyle = '#a7d8c8';
        c.beginPath(); c.moveTo(-10, 3); c.lineTo(-18, -3 + hand); c.lineTo(-8, 0); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(10, 3); c.lineTo(18, -3 - hand); c.lineTo(8, 0); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(94,242,194,0.35)'; c.lineWidth = 1;
        c.beginPath(); c.arc(0, 0, 24, 0.4, 1.7); c.stroke();
    }

    drawGolem(c) {
        const g = c.createLinearGradient(0, -22, 0, 22);
        g.addColorStop(0, '#8f9ca4'); g.addColorStop(0.5, '#5d6870'); g.addColorStop(1, '#343b42');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-15, 12); c.lineTo(-18, -8); c.lineTo(-9, -20); c.lineTo(8, -19);
        c.lineTo(17, -6); c.lineTo(14, 13); c.lineTo(0, 20); c.closePath(); c.fill();
        c.fillStyle = '#485159';
        c.fillRect(-23, -8, 9, 20); c.fillRect(14, -8, 9, 20);
        c.fillStyle = '#2b3036';
        c.fillRect(-14, 19, 11, 6); c.fillRect(4, 19, 11, 6);
        c.strokeStyle = hexToRgba(this.color, 0.75); c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-9, -14); c.lineTo(-3, -4); c.lineTo(-6, 6); c.stroke();
        c.beginPath(); c.moveTo(8, -12); c.lineTo(2, 0); c.lineTo(7, 10); c.stroke();
        this.eye(c, -4, -13, 1.8, '#ffb36b');
        this.eye(c, 4, -13, 1.8, '#ffb36b');
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, -1, 20, this.color, 0.10);
        c.restore();
    }

    drawHealer(c) {
        c.fillStyle = '#1b3226';
        c.beginPath();
        c.moveTo(-13, 22); c.lineTo(-7, -14); c.quadraticCurveTo(0, -22, 7, -14); c.lineTo(13, 22); c.closePath(); c.fill();
        c.fillStyle = '#0f1c15';
        c.beginPath(); c.arc(0, -16, 8, 0, TAU); c.fill();
        this.eye(c, -2.6, -17, 1.4, '#7dffb0');
        this.eye(c, 2.6, -17, 1.4, '#7dffb0');
        c.strokeStyle = '#4f6b58'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(12, 16); c.lineTo(18, -16); c.stroke();
        c.save();
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, -28, 15, '#7dffb0', 0.35);
        c.strokeStyle = 'rgba(125,255,176,0.8)';
        c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(0, -28, 10, 3.5, 0, 0, TAU); c.stroke();
        glowCircle(c, 19, -18, 10, '#7dffb0', 0.5);
        c.restore();
    }

    drawSummoner(c) {
        const hov = Math.sin(this.anim * 2) * 2;
        c.translate(0, hov);
        c.fillStyle = '#261338';
        c.beginPath();
        c.moveTo(-14, 20); c.quadraticCurveTo(-10, -10, 0, -18); c.quadraticCurveTo(10, -10, 14, 20);
        c.quadraticCurveTo(0, 28, -14, 20); c.closePath(); c.fill();
        c.fillStyle = '#120a1c';
        c.beginPath(); c.arc(0, -15, 9, 0, TAU); c.fill();
        this.eye(c, -4, -16, 1.5, '#ff7ae0');
        this.eye(c, 0, -18, 1.3, '#c46bff');
        this.eye(c, 4, -16, 1.5, '#ff7ae0');
        c.strokeStyle = hexToRgba('#c46bff', 0.6); c.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            c.beginPath(); c.arc(rand(-4, 4), 4 + i * 5, 6 + i * 2, 0.2, 2.8); c.stroke();
        }
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, 16, -6, 12, '#c46bff', 0.7);
        c.fillStyle = '#ffd6ff';
        c.beginPath(); c.arc(16, -6, 2.5, 0, TAU); c.fill();
        c.restore();
    }

    drawInvisible(c) {
        c.globalAlpha *= 0.75;
        c.strokeStyle = hexToRgba(this.color, 0.7);
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(-8, 18);
        c.quadraticCurveTo(-12 + Math.sin(this.anim * 3) * 5, 0, -5, -14);
        c.quadraticCurveTo(0, -22, 5, -14);
        c.quadraticCurveTo(12 + Math.sin(this.anim * 3) * 5, 0, 8, 18);
        c.stroke();
        this.eye(c, -3, -10, 1.4, this.color);
        this.eye(c, 3, -10, 1.4, this.color);
        c.globalAlpha *= 0.5;
        for (let i = 0; i < 3; i++) {
            c.beginPath();
            c.arc(rand(-8, 8), rand(-10, 10), rand(8, 16), rand(0, TAU), rand(0, TAU));
            c.stroke();
        }
    }

    drawBrute(c) {
        const g = c.createLinearGradient(0, -24, 0, 24);
        g.addColorStop(0, '#6b3b26'); g.addColorStop(0.5, '#3e2118'); g.addColorStop(1, '#1f100b');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-18, 16); c.lineTo(-21, -8); c.lineTo(-10, -23); c.lineTo(10, -23); c.lineTo(21, -8); c.lineTo(18, 17);
        c.lineTo(0, 24); c.closePath(); c.fill();
        c.strokeStyle = '#ff9f43'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(-12, -14); c.lineTo(-4, -4); c.lineTo(-10, 6); c.stroke();
        c.fillStyle = '#24120c';
        c.beginPath(); c.arc(0, -16, 9, 0, TAU); c.fill();
        this.eye(c, -3.5, -18, 2, '#ffd166');
        this.eye(c, 3.5, -18, 2, '#ffd166');
        c.fillStyle = '#3b1d12';
        c.beginPath(); c.moveTo(-8, -24); c.lineTo(-17, -34); c.lineTo(-11, -22); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(8, -24); c.lineTo(17, -34); c.lineTo(11, -22); c.closePath(); c.fill();
        c.strokeStyle = '#4a2a1a'; c.lineWidth = 5;
        c.beginPath(); c.moveTo(16, 6); c.lineTo(27, 15); c.stroke();
        c.fillStyle = '#c9c2ae';
        c.beginPath(); c.moveTo(27, 9); c.lineTo(38, 21); c.lineTo(32, 24); c.lineTo(24, 13); c.closePath(); c.fill();
    }
}

Enemy.nextId = 1;


/* ----------------------------------------------------------------
   MÓDULO: bosses.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — CHEFES E INVOCAÇÕES
   ================================================================ */
'use strict';

class Boss extends Enemy {
    constructor(def, wave, game) {
        const synth = {
            hp: def.hp, speed: def.speed, damage: def.damage,
            range: 150, atkCd: 2.4, telegraph: 0.85, xp: 300, coins: 30,
            size: def.size, color: def.color, draw: 'boss', ai: 'boss'
        };
        super(0, 0, 'boss', wave, game, { def: synth, boss: true });
        this.bossId = def.id;
        this.bossDef = def;
        this.name = def.name;
        this.title = def.title;
        this.spawnTimer = 1.15;
        this.spawnMax = 1.15;
        this.size = def.size;
        const cycle = Math.floor((wave - 1) / 5);
        const extraScale = 1 + Math.max(0, wave - def.wave) * 0.10 + Math.max(0, cycle - 4) * 0.22;
        this.maxHp = Math.round(def.hp * extraScale * game.difficulty.hp);
        this.hp = this.maxHp;
        this.baseSpeed = def.speed * (1 + Math.max(0, wave - def.wave) * 0.012);
        this.dmg = def.damage * (1 + Math.max(0, wave - def.wave) * 0.06) * game.difficulty.dmg;
        this.abilityCd = 1.8;
        this.ability = null;
        this.abilityTimer = 0;
        this.abilityWindupMax = 0;
        this.guardTimer = 0;
        this.pullTimer = 0;
        this.breathTimer = 0;
        this.breathTick = 0;
        this.chargeTimer = 0;
        this.chargeDir2 = { x: 0, y: 0 };
        this.phaseAnnounced = false;
        this.orbit = 0;
        this.roots = [];
    }

    update(player, dt, game) {
        if (this.spawnTimer > 0) {
            this.spawnTimer -= dt;
            this.anim += dt;
            return;
        }
        if (this.hp <= 0) return;
        this.anim += dt;
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        this.attackFlash = Math.max(0, this.attackFlash - dt);
        this.tickStatus(dt, game);
        this.orbit += dt * 1.2;
        this.guardTimer = Math.max(0, this.guardTimer - dt);
        this.guard = this.guardTimer > 0 ? 0.55 : 0;

        if (this.phase === 1 && this.hp <= this.maxHp * 0.5) {
            this.phase = 2;
            this.baseSpeed *= 1.25;
            this.attackCd = 1.0;
            this.abilityCd = Math.min(this.abilityCd, 1.0);
            game.addFloatingText(this.x, this.y - this.size - 30, 'FÚRIA DO CHEFE!', '#ff4d6d', true);
            game.effects.push(new Shockwave(this.x, this.y, 240, this.color, { life: 0.8, width: 8 }));
            game.addParticles(this.x, this.y, 40, this.color, { glow: true, size: 4, life: 0.9, vx: rand(-280, 280), vy: rand(-280, 280) });
            game.shakeCamera(12);
            game.flashScreen(this.color, 0.26);
            Sound.play('boss');
            this.phaseAnnounced = true;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        this.facing = dx >= 0 ? 1 : -1;
        this.angle = Math.atan2(dy, dx);

        if (this.status.freeze > 0 || this.status.stun > 0) return;

        if (this.pullTimer > 0) {
            this.pullTimer -= dt;
            const pull = 250 * dt;
            player.x -= dx / d * pull;
            player.y -= dy / d * pull;
            if (Math.random() < 0.7) {
                const a = rand(0, TAU), r = rand(100, 360);
                game.addParticles(player.x + Math.cos(a) * r, player.y + Math.sin(a) * r, 1, '#c46bff', {
                    glow: true, size: 2, life: 0.4,
                    vx: (this.x - player.x) * 0.7 + rand(-30, 30),
                    vy: (this.y - player.y) * 0.7 + rand(-30, 30)
                });
            }
            if (d < this.size + player.size + 30) player.takeDamage(this.dmg * 0.6, game, this);
        }

        if (this.breathTimer > 0) {
            this.breathTimer -= dt;
            this.breathTick -= dt;
            if (this.breathTick <= 0) {
                this.breathTick = 0.12;
                const cone = 1.1;
                if (d < 360 && angleDiff(angleBetween(this.x, this.y, player.x, player.y), this.angle) < cone / 2) {
                    player.takeDamage(this.dmg * 0.30, game, this);
                }
                for (let i = 0; i < 4; i++) {
                    const a = this.angle + rand(-cone / 2, cone / 2);
                    const r = rand(40, 330);
                    game.addParticles(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r, 1, pick(['#ff7a3d', '#ffb36b', '#ff4d2e']), {
                        glow: true, size: rand(2, 5), life: rand(0.3, 0.6),
                        vx: Math.cos(a) * rand(30, 120), vy: Math.sin(a) * rand(30, 120) - 20,
                        kind: Math.random() < 0.3 ? 'smoke' : 'spark'
                    });
                }
            }
            if (this.breathTimer <= 0) this.abilityCd = this.phase === 2 ? 1.6 : 2.4;
            return;
        }

        if (this.chargeTimer > 0) {
            this.chargeTimer -= dt;
            this.x += this.chargeDir2.x * this.baseSpeed * 6.2 * dt;
            this.y += this.chargeDir2.y * this.baseSpeed * 6.2 * dt;
            if (!this.chargeHit && dist(this.x, this.y, player.x, player.y) < this.size + player.size + 10) {
                this.chargeHit = true;
                player.takeDamage(this.dmg * 1.5, game, this);
                game.shakeCamera(10);
                game.effects.push(new Shockwave(this.x, this.y, 120, this.color, { life: 0.5, width: 6 }));
            }
            game.addParticles(this.x, this.y, 2, this.color, { size: 3, life: 0.35, glow: true });
            if (this.chargeTimer <= 0) this.abilityCd = this.phase === 2 ? 1.5 : 2.4;
            return;
        }

        if (this.windup > 0) {
            this.windup -= dt;
            if (this.windup <= 0) {
                this.executeAbility(game);
                this.ability = null;
                this.abilityCd = this.phase === 2 ? rand(1.6, 2.5) : rand(2.5, 3.6);
            }
            if (this.ability === 'beam' || this.ability === 'gravity') {
                this.x += Math.cos(this.angle) * this.baseSpeed * 0.2 * dt;
                this.y += Math.sin(this.angle) * this.baseSpeed * 0.2 * dt;
            }
            return;
        }

        if (d > 240) this.moveToward(player, dt, 0.65);
        else if (d < 110) this.moveAway(player, dt, 0.4);
        else this.strafe(player, dt, 0.4);

        this.attackCd -= dt;
        this.abilityCd -= dt;
        if (this.abilityCd <= 0) this.chooseAbility(game);
    }

    chooseAbility(game) {
        const lists = {
            executioner: ['cleave', 'spike_ring', 'charge'],
            spider_queen: ['spiderlings', 'web_volley', 'leap_slam'],
            faceless_knight: ['mirror_dash', 'spectral_blades', 'void_guard'],
            abyss_dragon: ['breath', 'meteors', 'wing_gust'],
            void_guardian: ['void_zones', 'beam', 'gravity', 'voidlings']
        };
        const list = lists[this.bossId] || ['cleave', 'spike_ring', 'charge'];
        this.ability = pick(list);
        this.abilityWindupMax = this.phase === 2 ? rand(0.45, 0.7) : rand(0.65, 0.95);
        this.windupMax = this.abilityWindupMax;
        this.windup = this.abilityWindupMax;
        this.aoeX = game.player.x;
        this.aoeY = game.player.y;
        Sound.play('void', 0.44);
    }

    executeAbility(game) {
        const p = game.player;
        const d = dist(this.x, this.y, p.x, p.y);
        const a = angleBetween(this.x, this.y, p.x, p.y);
        Sound.play('skill', 0.7);
        switch (this.ability) {
            case 'cleave': {
                const range = 180;
                if (d < range + p.size && angleDiff(angleBetween(this.x, this.y, p.x, p.y), this.angle) < 1.4) {
                    p.takeDamage(this.dmg * 1.5, game, this);
                }
                game.effects.push(new SlashEffect(this.x, this.y, this.angle, range, 2.6, this.color || '#ff6b4a', { heavy: true, width: 36, life: 0.35 }));
                game.effects.push(new Shockwave(this.x, this.y, range, this.color || '#ff6b4a', { life: 0.5, width: 8 }));
                game.shakeCamera(9);
                Sound.play('crit');
                break;
            }
            case 'spike_ring': {
                const n = this.phase === 2 ? 9 : 6;
                for (let i = 0; i < n; i++) {
                    const aa = i / n * TAU + rand(-0.2, 0.2);
                    const r = rand(55, 190);
                    game.effects.push(new DelayedBlast(p.x + Math.cos(aa) * r, p.y + Math.sin(aa) * r, 54, 0.55 + i * 0.07, this.dmg * 0.9, {
                        hostile: true, color: '#ff4d4d', style: 'spike', source: this
                    }));
                }
                break;
            }
            case 'charge': {
                this.chargeDir2 = { x: Math.cos(a), y: Math.sin(a) };
                this.chargeTimer = 0.52;
                this.chargeHit = false;
                this.charging = true;
                game.addParticles(this.x, this.y, 20, this.color || '#ff6b4a', { glow: true, size: 3, life: 0.5 });
                break;
            }
            case 'spiderlings': {
                for (let i = 0; i < (this.phase === 2 ? 4 : 3); i++) {
                    const aa = rand(0, TAU);
                    game.spawnEnemy('spider', this.x + Math.cos(aa) * 70, this.y + Math.sin(aa) * 70, { summoned: true });
                }
                game.addFloatingText(this.x, this.y - this.size - 20, 'O NINHO DESPERTA', '#ff7ad1', true);
                break;
            }
            case 'web_volley': {
                const n = this.phase === 2 ? 12 : 8;
                for (let i = 0; i < n; i++) {
                    const aa = a + (i - (n - 1) / 2) * 0.17;
                    game.spawnEnemyProjectile(this.x, this.y - 8, aa, this.dmg * 0.8, {
                        type: 'web', color: '#ff7ad1', speed: 250, radius: 8, source: this
                    });
                }
                break;
            }
            case 'leap_slam': {
                const aa = rand(0, TAU);
                this.x = p.x + Math.cos(aa) * 110;
                this.y = p.y + Math.sin(aa) * 110;
                game.effects.push(new DelayedBlast(p.x, p.y, 120, 0.35, this.dmg * 1.2, {
                    hostile: true, color: '#7dffb0', style: 'web', source: this, knockback: 300
                }));
                game.addParticles(this.x, this.y, 24, '#ff7ad1', { glow: true, size: 4, life: 0.7 });
                game.shakeCamera(8);
                break;
            }
            case 'mirror_dash': {
                const aa = rand(0, TAU);
                game.addParticles(this.x, this.y, 18, '#9fe8ff', { glow: true, size: 3, life: 0.6 });
                this.x = p.x + Math.cos(aa) * 70;
                this.y = p.y + Math.sin(aa) * 70;
                game.effects.push(new DelayedBlast(p.x, p.y, 84, 0.18, this.dmg * 1.15, {
                    hostile: true, color: '#9fe8ff', style: 'void', source: this
                }));
                game.effects.push(new SlashEffect(this.x, this.y, angleBetween(this.x, this.y, p.x, p.y), 105, 2.4, '#9fe8ff', { heavy: true }));
                game.shakeCamera(6);
                break;
            }
            case 'spectral_blades': {
                const n = this.phase === 2 ? 16 : 12;
                for (let i = 0; i < n; i++) {
                    const aa = i / n * TAU + this.orbit;
                    game.spawnEnemyProjectile(this.x, this.y, aa, this.dmg * 0.7, {
                        type: 'void', color: '#9fe8ff', speed: 220, radius: 7, source: this
                    });
                }
                break;
            }
            case 'void_guard': {
                this.guardTimer = this.phase === 2 ? 3.0 : 2.2;
                this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.04);
                game.effects.push(new Shockwave(this.x, this.y, 190, '#9fe8ff', { life: 0.6, width: 5 }));
                game.addFloatingText(this.x, this.y - this.size - 20, 'GUARDA ESPECTRAL', '#9fe8ff', true);
                break;
            }
            case 'breath': {
                this.breathTimer = this.phase === 2 ? 1.5 : 1.1;
                this.breathTick = 0;
                game.shakeCamera(4);
                break;
            }
            case 'meteors': {
                const n = this.phase === 2 ? 8 : 6;
                for (let i = 0; i < n; i++) {
                    const aa = rand(0, TAU), r = rand(30, 260);
                    game.effects.push(new DelayedBlast(p.x + Math.cos(aa) * r, p.y + Math.sin(aa) * r, 74, 0.7 + i * 0.1, this.dmg * 1.1, {
                        hostile: true, color: '#ff7a3d', style: 'meteor', source: this, label: 'METEORO'
                    }));
                }
                break;
            }
            case 'wing_gust': {
                const n = this.phase === 2 ? 22 : 16;
                for (let i = 0; i < n; i++) {
                    const aa = i / n * TAU + this.orbit;
                    game.spawnEnemyProjectile(this.x, this.y, aa, this.dmg * 0.65, {
                        type: 'fire', color: '#ff7a3d', speed: 280, radius: 7, source: this
                    });
                }
                game.effects.push(new Shockwave(this.x, this.y, 210, '#ffb36b', { life: 0.6, width: 6 }));
                game.shakeCamera(8);
                break;
            }
            case 'void_zones': {
                const n = this.phase === 2 ? 6 : 4;
                for (let i = 0; i < n; i++) {
                    const aa = rand(0, TAU), r = rand(40, 260);
                    game.effects.push(new DelayedBlast(p.x + Math.cos(aa) * r, p.y + Math.sin(aa) * r, 82, 0.8 + i * 0.12, this.dmg * 1.15, {
                        hostile: true, color: '#c46bff', style: 'void', source: this, label: 'COLAPSO'
                    }));
                }
                break;
            }
            case 'beam': {
                if (d < 780 && this.distToLine(p.x, p.y, this.x, this.y, this.x + Math.cos(this.angle) * 780, this.y + Math.sin(this.angle) * 780) < 48) {
                    p.takeDamage(this.dmg * 1.7, game, this);
                }
                game.effects.push(new BeamEffect(this.x, this.y, this.x + Math.cos(this.angle) * 800, this.y + Math.sin(this.angle) * 800, '#ff7ae0', { life: 0.4, width: 8, bolt: false }));
                game.effects.push(new Shockwave(this.x, this.y, 110, '#ff7ae0', { life: 0.5 }));
                game.shakeCamera(9);
                break;
            }
            case 'gravity': {
                this.pullTimer = 1.35;
                game.effects.push(new Shockwave(this.x, this.y, 330, '#c46bff', { life: 1.0, width: 4 }));
                game.addFloatingText(this.x, this.y - this.size - 20, 'GRAVIDADE DO VAZIO', '#c46bff', true);
                break;
            }
            case 'voidlings': {
                for (let i = 0; i < 2; i++) {
                    const aa = rand(0, TAU);
                    game.spawnEnemy(pick(['wraith', 'invisible']), this.x + Math.cos(aa) * 85, this.y + Math.sin(aa) * 85, { summoned: true });
                }
                break;
            }
            default: {
                if (d < 170) p.takeDamage(this.dmg * 1.2, game, this);
            }
        }
    }

    distToLine(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const len = dx * dx + dy * dy;
        const t = len ? clamp(((px - x1) * dx + (py - y1) * dy) / len, 0, 1) : 0;
        const cx = x1 + t * dx, cy = y1 + t * dy;
        return Math.hypot(px - cx, py - cy);
    }

    drawTelegraph(c, game) {
        if (this.windup <= 0 && this.chargeTimer <= 0 && this.breathTimer <= 0) return;
        const p = this.ability ? clamp(1 - this.windup / this.abilityWindupMax, 0, 1) : 1;
        c.save();
        c.globalAlpha = 0.16 + p * 0.32;
        c.strokeStyle = '#ff4d6d';
        c.fillStyle = 'rgba(255,50,80,0.12)';
        c.lineWidth = 2.5;
        if (this.ability === 'cleave') {
            c.translate(this.x, this.y);
            c.rotate(this.angle);
            c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 180, -1.35, 1.35); c.closePath(); c.fill(); c.stroke();
        } else if (this.ability === 'charge' || this.charging || this.chargeTimer > 0) {
            const a = Math.atan2(this.chargeDir2.y || Math.sin(this.angle), this.chargeDir2.x || Math.cos(this.angle));
            c.translate(this.x, this.y); c.rotate(a);
            c.fillRect(0, -this.size * 0.8, 620, this.size * 1.6);
            c.globalAlpha = 0.5;
            c.beginPath(); c.moveTo(0, 0); c.lineTo(620, 0); c.stroke();
        } else if (this.ability === 'beam') {
            c.globalAlpha = 0.2 + p * 0.35;
            c.strokeStyle = '#ff7ae0';
            c.lineWidth = 3 + p * 8;
            c.beginPath(); c.moveTo(this.x, this.y);
            c.lineTo(this.x + Math.cos(this.angle) * 800, this.y + Math.sin(this.angle) * 800);
            c.stroke();
        } else if (this.ability === 'breath' || this.breathTimer > 0) {
            c.translate(this.x, this.y);
            c.rotate(this.angle);
            c.fillStyle = 'rgba(255,90,40,0.22)';
            c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 360, -0.55, 0.55); c.closePath(); c.fill();
            c.globalAlpha = 0.45;
            c.strokeStyle = '#ff7a3d'; c.lineWidth = 2; c.stroke();
        } else {
            c.beginPath(); c.arc(this.x, this.y, this.size + 26 + p * 24, 0, TAU); c.stroke();
            c.globalAlpha = 0.1;
            c.beginPath(); c.arc(this.x, this.y, (this.size + 26) * p, 0, TAU); c.fill();
        }
        c.restore();
    }

    draw(c, game) {
        this.drawTelegraph(c, game);
        const spawnA = this.spawnTimer > 0 ? 1 - this.spawnTimer / this.spawnMax : 1;
        const scale = 0.4 + spawnA * 0.6;
        const bob = Math.sin(this.anim * 2.2) * 3;
        c.save();
        c.globalAlpha = spawnA;
        c.save();
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, this.x, this.y, this.size * 2.6, this.color, 0.10 + Math.sin(this.anim * 2) * 0.025);
        if (this.phase === 2) glowCircle(c, this.x, this.y, this.size * 3.2, '#ff4d6d', 0.09 + Math.sin(this.anim * 5) * 0.03);
        c.restore();
        c.translate(this.x, this.y + bob);
        c.fillStyle = 'rgba(0,0,0,0.45)';
        c.beginPath(); c.ellipse(0, this.size * 0.92, this.size * 1.05, this.size * 0.28, 0, 0, TAU); c.fill();
        c.scale(scale, scale);
        c.scale(this.facing < 0 ? -1 : 1, 1);
        c.scale(this.size / 50, this.size / 50);
        switch (this.bossId) {
            case 'executioner': this.drawExecutioner(c); break;
            case 'spider_queen': this.drawSpiderQueen(c); break;
            case 'faceless_knight': this.drawFacelessKnight(c); break;
            case 'abyss_dragon': this.drawDragon(c); break;
            case 'void_guardian': this.drawVoidGuardian(c); break;
            default: this.drawExecutioner(c);
        }
        c.restore();
        if (this.flashTimer > 0) {
            c.save(); c.globalCompositeOperation = 'lighter';
            c.globalAlpha = Math.min(0.8, this.flashTimer * 6);
            glowCircle(c, this.x, this.y, this.size * 1.6, '#ffffff', 0.5);
            c.restore();
        }
        if (this.guardTimer > 0) {
            c.save();
            c.globalAlpha = 0.4 + Math.sin(this.anim * 8) * 0.1;
            c.strokeStyle = '#9fe8ff'; c.lineWidth = 3;
            c.beginPath(); c.arc(this.x, this.y, this.size * 1.4, 0, TAU); c.stroke();
            c.restore();
        }
        this.drawStatusIcons(c);
    }

    drawExecutioner(c) {
        const step = Math.sin(this.anim * 3) * 2;
        // correntes
        c.strokeStyle = 'rgba(120,110,105,0.7)'; c.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
            c.beginPath(); c.arc(-32 + i * 10, 22 + Math.sin(this.anim * 2 + i) * 3, 4, 0, TAU); c.stroke();
        }
        // corpo
        const g = c.createLinearGradient(0, -30, 0, 30);
        g.addColorStop(0, '#3a2b30'); g.addColorStop(0.5, '#24191c'); g.addColorStop(1, '#120c0e');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-22, 28); c.lineTo(-28, -2); c.lineTo(-15, -28); c.lineTo(16, -28); c.lineTo(29, -2); c.lineTo(24, 29);
        c.lineTo(0, 34); c.closePath(); c.fill();
        c.strokeStyle = '#5a3a2e'; c.lineWidth = 1.2; c.stroke();
        // capuz
        c.fillStyle = '#0e090b';
        c.beginPath(); c.moveTo(-16, -24); c.quadraticCurveTo(-18, -48, 0, -52); c.quadraticCurveTo(18, -48, 16, -24); c.closePath(); c.fill();
        c.fillStyle = '#000';
        c.beginPath(); c.ellipse(0, -32, 11, 12, 0, 0, TAU); c.fill();
        this.eye(c, -5, -34, 2.6, '#ff6b4a');
        this.eye(c, 5, -34, 2.6, '#ff6b4a');
        // ombreiras
        c.fillStyle = '#4a3438';
        c.beginPath(); c.ellipse(-26, -10, 11, 8, -0.4, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(26, -10, 11, 8, 0.4, 0, TAU); c.fill();
        // machado gigante
        c.save();
        c.translate(30, -6);
        c.rotate(-0.35 + Math.sin(step) * 0.03);
        c.strokeStyle = '#5a4030'; c.lineWidth = 5;
        c.beginPath(); c.moveTo(0, 30); c.lineTo(0, -38); c.stroke();
        c.fillStyle = this.phase === 2 ? '#ff6b4a' : '#9aa4ad';
        c.beginPath();
        c.moveTo(0, -40); c.quadraticCurveTo(40, -52, 44, -18); c.quadraticCurveTo(22, -14, 0, -24); c.closePath(); c.fill();
        c.strokeStyle = '#e8dcc0'; c.lineWidth = 1; c.stroke();
        c.restore();
        if (this.phase === 2) {
            c.save(); c.globalCompositeOperation = 'lighter';
            c.globalAlpha = 0.35 + Math.sin(this.anim * 9) * 0.12;
            glowCircle(c, 0, -30, 42, '#ff4d4d', 0.24);
            c.restore();
        }
    }

    drawSpiderQueen(c) {
        const legPhase = this.anim * 7;
        c.save();
        c.strokeStyle = '#68412e'; c.lineWidth = 3.6; c.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            for (const side of [-1, 1]) {
                const spread = -1.0 + i * 0.65;
                c.beginPath();
                c.moveTo(0, 4);
                c.lineTo(side * 24, 8 + spread * 5);
                c.lineTo(side * (39 + Math.sin(legPhase + i) * 4), 20 + spread * 9);
                c.stroke();
            }
        }
        c.restore();
        // abdômen
        const g = c.createRadialGradient(-6, -2, 3, 0, 0, 28);
        g.addColorStop(0, '#8c5a3f'); g.addColorStop(0.55, '#4e2f22'); g.addColorStop(1, '#21110c');
        c.fillStyle = g;
        c.beginPath(); c.ellipse(-4, 4, 22, 27, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,122,209,0.5)'; c.lineWidth = 1.2;
        c.beginPath(); c.arc(-4, 4, 15, 0, TAU); c.stroke();
        c.beginPath(); c.arc(-4, 4, 8, 0, TAU); c.stroke();
        // tronco humanoide
        c.fillStyle = '#3b2419';
        c.beginPath();
        c.moveTo(-14, -12); c.quadraticCurveTo(-11, -30, 0, -37); c.quadraticCurveTo(11, -30, 14, -12);
        c.quadraticCurveTo(8, -4, 0, -5); c.quadraticCurveTo(-8, -4, -14, -12); c.closePath(); c.fill();
        // cabeça e coroa
        c.fillStyle = '#24140e';
        c.beginPath(); c.arc(0, -44, 12, 0, TAU); c.fill();
        this.eye(c, -4.5, -46, 2.4, '#ff7ad1');
        this.eye(c, 4.5, -46, 2.4, '#ff7ad1');
        this.eye(c, 0, -52, 1.5, '#ffd166');
        c.fillStyle = '#b06bff';
        c.beginPath();
        c.moveTo(-10, -54); c.lineTo(-13, -66); c.lineTo(-5, -58); c.lineTo(0, -70); c.lineTo(5, -58); c.lineTo(13, -66); c.lineTo(10, -54); c.closePath(); c.fill();
        // fios
        c.strokeStyle = 'rgba(255,150,220,0.35)'; c.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            c.beginPath();
            c.moveTo(-20 + i * 8, 22);
            c.quadraticCurveTo(rand(-30, 30), 42 + i * 3, rand(-20, 20), 56);
            c.stroke();
        }
    }

    drawFacelessKnight(c) {
        const g = c.createLinearGradient(0, -40, 0, 32);
        g.addColorStop(0, '#b8c6d6'); g.addColorStop(0.5, '#6b7b8f'); g.addColorStop(1, '#2e3947');
        // capa
        c.fillStyle = 'rgba(20,28,42,0.9)';
        c.beginPath(); c.moveTo(-18, -26); c.quadraticCurveTo(-36, 10, -28, 36); c.lineTo(0, 27); c.lineTo(28, 36); c.quadraticCurveTo(36, 10, 18, -26); c.closePath(); c.fill();
        // corpo
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-19, 26); c.lineTo(-22, -10); c.lineTo(-10, -28); c.lineTo(12, -28); c.lineTo(22, -10); c.lineTo(19, 26);
        c.lineTo(0, 32); c.closePath(); c.fill();
        c.strokeStyle = '#d7e8f7'; c.lineWidth = 1; c.stroke();
        // elmo vazio
        c.fillStyle = '#3b4757';
        c.beginPath();
        c.moveTo(-12, -30); c.quadraticCurveTo(0, -52, 12, -30); c.lineTo(10, -16); c.quadraticCurveTo(0, -10, -10, -16); c.closePath(); c.fill();
        c.fillStyle = '#05070b';
        c.beginPath(); c.ellipse(0, -28, 8, 9, 0, 0, TAU); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, -28, 13, '#9fe8ff', 0.22 + Math.sin(this.anim * 2) * 0.05);
        c.restore();
        // ombreiras
        c.fillStyle = '#8396a9';
        c.beginPath(); c.ellipse(-23, -12, 10, 7, -0.4, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(23, -12, 10, 7, 0.4, 0, TAU); c.fill();
        // espada espectral
        c.save();
        c.translate(26, -2); c.rotate(-0.5);
        c.strokeStyle = '#d7e8f7'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, 22); c.lineTo(0, -46); c.stroke();
        c.save(); c.globalCompositeOperation = 'lighter';
        c.strokeStyle = '#9fe8ff'; c.lineWidth = 6; c.globalAlpha = 0.4;
        c.beginPath(); c.moveTo(0, 22); c.lineTo(0, -46); c.stroke();
        c.restore();
        c.fillStyle = '#d7e8f7';
        c.beginPath(); c.moveTo(-6, 2); c.lineTo(6, 2); c.lineTo(2, 12); c.lineTo(-2, 12); c.closePath(); c.fill();
        c.restore();
        // escudo
        c.fillStyle = '#4a5a6d';
        c.beginPath();
        c.moveTo(-30, 2); c.quadraticCurveTo(-44, 16, -30, 30); c.quadraticCurveTo(-16, 16, -30, 2); c.closePath(); c.fill();
        c.strokeStyle = '#9fe8ff'; c.lineWidth = 1.2; c.stroke();
    }

    drawDragon(c) {
        const flap = Math.sin(this.anim * 3) * 0.12;
        // asas
        c.save();
        c.fillStyle = 'rgba(90,25,20,0.85)';
        for (const side of [-1, 1]) {
            c.save();
            c.scale(side, 1);
            c.rotate(flap * side);
            c.beginPath();
            c.moveTo(10, -6);
            c.quadraticCurveTo(48, -40, 72, -10);
            c.quadraticCurveTo(56, -6, 60, 16);
            c.quadraticCurveTo(36, 8, 12, 18);
            c.closePath(); c.fill();
            c.strokeStyle = 'rgba(255,120,60,0.35)'; c.lineWidth = 1; c.stroke();
            c.restore();
        }
        c.restore();
        // cauda
        c.strokeStyle = '#5a1d17'; c.lineWidth = 8; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(-20, 18); c.quadraticCurveTo(-55, 30, -66, 6 + Math.sin(this.anim * 2) * 8); c.stroke();
        c.fillStyle = '#7a2a1d';
        c.beginPath(); c.moveTo(-66, 4); c.lineTo(-80, -6); c.lineTo(-72, 10); c.closePath(); c.fill();
        // corpo
        const g = c.createRadialGradient(-4, -10, 4, 0, 0, 34);
        g.addColorStop(0, '#a33a24'); g.addColorStop(0.6, '#5e1e15'); g.addColorStop(1, '#2a0c08');
        c.fillStyle = g;
        c.beginPath(); c.ellipse(0, 6, 25, 28, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,170,80,0.45)'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(0, 10, 16, 18, 0, 0, TAU); c.stroke();
        // pescoço e cabeça
        c.strokeStyle = '#5e1e15'; c.lineWidth = 14;
        c.beginPath(); c.moveTo(8, -18); c.quadraticCurveTo(18, -42, 10, -54); c.stroke();
        c.fillStyle = '#7a2a1d';
        c.beginPath(); c.ellipse(8, -58, 17, 12, -0.15, 0, TAU); c.fill();
        c.fillStyle = '#3a0e09';
        c.beginPath(); c.moveTo(20, -54); c.lineTo(34, -50); c.lineTo(22, -46); c.closePath(); c.fill();
        this.eye(c, 12, -61, 2.4, '#ffd166');
        // chifres
        c.strokeStyle = '#e8dcc0'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(0, -67); c.lineTo(-8, -82); c.moveTo(10, -68); c.lineTo(14, -84); c.stroke();
        // fogo no peito
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, 8, 26, '#ff7a3d', 0.18 + Math.sin(this.anim * 4) * 0.04);
        c.restore();
        // garras
        c.fillStyle = '#3a0e09';
        for (const side of [-1, 1]) {
            c.beginPath(); c.ellipse(side * 22, 26, 7, 5, 0, 0, TAU); c.fill();
        }
    }

    drawVoidGuardian(c) {
        const hov = Math.sin(this.anim * 1.8) * 4;
        c.translate(0, hov);
        // anéis orbitando
        c.save();
        c.rotate(this.orbit * 0.4);
        c.strokeStyle = 'rgba(255,122,224,0.45)'; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(0, 0, 38, 12, 0, 0, TAU); c.stroke();
        c.rotate(1.2);
        c.beginPath(); c.ellipse(0, 0, 44, 14, 0, 0, TAU); c.stroke();
        c.restore();
        // manto
        const g = c.createLinearGradient(0, -36, 0, 34);
        g.addColorStop(0, '#4c2c6e'); g.addColorStop(0.5, '#2a1640'); g.addColorStop(1, '#0f0718');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(-24, 28); c.quadraticCurveTo(-30, 0, -16, -30); c.quadraticCurveTo(0, -44, 16, -30);
        c.quadraticCurveTo(30, 0, 24, 28); c.quadraticCurveTo(0, 38, -24, 28); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,122,224,0.4)'; c.lineWidth = 1.2; c.stroke();
        // tentáculos
        c.strokeStyle = 'rgba(196,107,255,0.5)'; c.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const bx = -18 + i * 12;
            c.beginPath();
            c.moveTo(bx, 22);
            c.quadraticCurveTo(bx + Math.sin(this.anim * 2 + i) * 14, 38, bx + Math.sin(this.anim * 2 + i) * 22, 52);
            c.stroke();
        }
        // máscara
        c.fillStyle = '#d9c9ff';
        c.beginPath();
        c.moveTo(0, -36); c.quadraticCurveTo(15, -30, 12, -16); c.quadraticCurveTo(0, -6, -12, -16); c.quadraticCurveTo(-15, -30, 0, -36);
        c.closePath(); c.fill();
        c.fillStyle = '#1a0c27';
        c.beginPath(); c.ellipse(-4, -24, 2.8, 4, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(4, -24, 2.8, 4, 0, 0, TAU); c.fill();
        this.eye(c, 0, -17, 2.2, '#ff7ae0');
        // orbe
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, 20, -2, 16, '#ff7ae0', 0.6);
        c.fillStyle = '#ffe0ff';
        c.beginPath(); c.arc(20, -2, 3.5, 0, TAU); c.fill();
        c.restore();
    }
}

// ---------------------------------------------------------------
// LOBO ESPECTRAL (invocação)
// ---------------------------------------------------------------
class Minion {
    constructor(x, y, owner, damage, duration) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.damage = damage;
        this.life = duration;
        this.maxLife = duration;
        this.size = 18;
        this.attackCd = 0;
        this.anim = 0;
        this.facing = 1;
        this.target = null;
        this.dead = false;
    }
    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0 || !this.owner || this.owner.dead) { this.dead = true; return; }
        this.anim += dt;
        this.attackCd -= dt;
        if (!this.target || this.target.hp <= 0) this.target = game.nearestEnemy(this.x, this.y, 760);
        if (this.target) {
            const d = dist(this.x, this.y, this.target.x, this.target.y);
            const a = angleBetween(this.x, this.y, this.target.x, this.target.y);
            this.facing = Math.cos(a) >= 0 ? 1 : -1;
            if (d > 42) {
                this.x += Math.cos(a) * 280 * dt;
                this.y += Math.sin(a) * 280 * dt;
            } else if (this.attackCd <= 0) {
                this.attackCd = 0.5;
                game.damageEnemy(this.target, this.damage, {
                    source: this.owner, color: '#a8ffdf', lifesteal: false,
                    knockback: 80, noShake: true, summon: true
                });
                game.effects.push(new SlashEffect(this.x, this.y, a, 46, 1.2, '#a8ffdf'));
                game.addParticles(this.target.x, this.target.y, 5, '#a8ffdf', { glow: true, size: 2, life: 0.3 });
            }
        } else {
            this.x = lerp(this.x, this.owner.x + Math.cos(this.anim * 1.5) * 34, 0.08);
            this.y = lerp(this.y, this.owner.y + 20, 0.08);
        }
        if (Math.random() < 0.35) game.addParticles(this.x, this.y, 1, '#a8ffdf', { glow: true, size: 1.8, life: 0.3, vy: -20 });
    }
    draw(c) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        const run = Math.sin(this.anim * 12) * 3;
        c.save();
        c.globalAlpha = Math.min(1, a * 2) * 0.9;
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, this.x, this.y, 28, '#a8ffdf', 0.16);
        c.globalCompositeOperation = 'source-over';
        c.translate(this.x, this.y);
        c.scale(this.facing, 1);
        c.fillStyle = 'rgba(168,255,223,0.35)';
        c.beginPath(); c.ellipse(0, 2, 15, 8, 0, 0, TAU); c.fill();
        c.strokeStyle = '#a8ffdf'; c.lineWidth = 2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-10, 3); c.lineTo(-14 + run, 15); c.moveTo(-4, 4); c.lineTo(-6 - run, 15); c.stroke();
        c.beginPath(); c.moveTo(6, 2); c.lineTo(10, 15); c.moveTo(11, 1); c.lineTo(15, 14); c.stroke();
        c.fillStyle = '#d7fff2';
        c.beginPath(); c.ellipse(12, -2, 8, 6, 0.1, 0, TAU); c.fill();
        c.fillStyle = '#0e2a22';
        c.beginPath(); c.arc(15, -3, 1.4, 0, TAU); c.fill();
        c.strokeStyle = '#a8ffdf'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(18, -1); c.lineTo(24, 2); c.stroke();
        c.beginPath(); c.moveTo(18, 1); c.lineTo(24, 5); c.stroke();
        c.restore();
    }
}


/* ----------------------------------------------------------------
   MÓDULO: world.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — MUNDO
   Cenário procedural, tochas, altares, baús, mercadores, portais,
   loot, equipamentos caídos e armadilhas.
   ================================================================ */
'use strict';

// ---------------------------------------------------------------
// CENÁRIO
// ---------------------------------------------------------------
class Prop {
    constructor(x, y, type, biome, opts = {}) {
        this.x = x; this.y = y;
        this.type = type;
        this.biome = biome;
        this.seed = Math.random() * 1000;
        this.variant = randi(0, 3);
        this.size = opts.size || rand(0.8, 1.25);
        this.rot = opts.rot !== undefined ? opts.rot : rand(-0.25, 0.25);
        this.alpha = opts.alpha !== undefined ? opts.alpha : 1;
        this.light = null;
        const b = BIOMES.find(v => v.id === biome) || BIOMES[0];
        if (type === 'torch' || type === 'brazier') {
            this.light = { radius: rand(170, 220), color: b.light, intensity: 0.95 };
        } else if (type === 'crystal' || type === 'voidstone' || type === 'rune') {
            this.light = { radius: rand(110, 165), color: b.accent, intensity: 0.7 };
        } else if (type === 'lava' || type === 'forge') {
            this.light = { radius: rand(150, 210), color: '#ff7a3d', intensity: 0.85 };
        } else if (type === 'ice' || type === 'frozen') {
            this.light = { radius: rand(90, 130), color: '#7fe7ff', intensity: 0.45 };
        } else if (type === 'mushroom') {
            this.light = { radius: rand(60, 100), color: '#62ffa8', intensity: 0.5 };
        }
    }
    draw(c, time) {
        const b = BIOMES.find(v => v.id === this.biome) || BIOMES[0];
        const s = this.size;
        c.save();
        c.globalAlpha = this.alpha;
        c.translate(this.x, this.y);
        c.rotate(this.rot);
        switch (this.type) {
            case 'pillar': {
                const broken = this.variant === 3;
                const h = (broken ? 44 : 78) * s;
                c.fillStyle = 'rgba(0,0,0,0.35)';
                c.beginPath(); c.ellipse(0, 10, 24 * s, 9 * s, 0, 0, TAU); c.fill();
                const g = c.createLinearGradient(-18 * s, 0, 18 * s, 0);
                g.addColorStop(0, shade(b.wall, -22));
                g.addColorStop(0.45, b.wallLight);
                g.addColorStop(1, shade(b.wall, -30));
                c.fillStyle = g;
                c.fillRect(-17 * s, -h, 34 * s, h + 6);
                c.fillStyle = shade(b.wallLight, 10);
                c.fillRect(-23 * s, -h - 8, 46 * s, 10);
                if (!broken) c.fillRect(-22 * s, -6, 44 * s, 10);
                c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1;
                for (let i = 0; i < 3; i++) {
                    c.beginPath();
                    c.moveTo(-12 * s + i * 9, -h + 14 + i * 12);
                    c.lineTo(-4 * s + i * 6, -h + 26 + i * 9);
                    c.stroke();
                }
                if (this.variant === 1) {
                    c.strokeStyle = hexToRgba(b.accent, 0.4);
                    c.beginPath(); c.arc(0, -h * 0.55, 9 * s, 0, TAU); c.stroke();
                }
                break;
            }
            case 'torch': {
                c.fillStyle = '#3a2a20';
                c.fillRect(-3 * s, -34 * s, 6 * s, 34 * s);
                c.fillStyle = '#5a4433';
                c.fillRect(-6 * s, -40 * s, 12 * s, 8 * s);
                const f = 1 + Math.sin(time * 8 + this.seed) * 0.22;
                const g = c.createRadialGradient(0, -46 * s, 1, 0, -46 * s, 18 * s * f);
                g.addColorStop(0, 'rgba(255,244,200,0.95)');
                g.addColorStop(0.35, hexToRgba(b.light, 0.8));
                g.addColorStop(1, hexToRgba(b.light, 0));
                c.fillStyle = g;
                c.beginPath(); c.ellipse(0, -46 * s, 12 * s * f, 20 * s * f, 0, 0, TAU); c.fill();
                break;
            }
            case 'brazier': {
                c.strokeStyle = '#4a3a30'; c.lineWidth = 4 * s;
                c.beginPath();
                c.moveTo(-14 * s, 22 * s); c.lineTo(0, 2); c.lineTo(14 * s, 22 * s);
                c.moveTo(0, 2); c.lineTo(0, -8);
                c.stroke();
                c.fillStyle = '#3c2f28';
                c.beginPath(); c.ellipse(0, -8, 15 * s, 6 * s, 0, 0, TAU); c.fill();
                const f = 1 + Math.sin(time * 7 + this.seed) * 0.2;
                const g = c.createRadialGradient(0, -18 * s, 2, 0, -18 * s, 26 * s * f);
                g.addColorStop(0, 'rgba(255,250,215,0.95)');
                g.addColorStop(0.4, hexToRgba(b.light, 0.85));
                g.addColorStop(1, hexToRgba(b.light, 0));
                c.fillStyle = g;
                c.beginPath(); c.ellipse(0, -20 * s, 16 * s * f, 26 * s * f, 0, 0, TAU); c.fill();
                break;
            }
            case 'crystal': {
                c.fillStyle = 'rgba(0,0,0,0.3)';
                c.beginPath(); c.ellipse(0, 8, 18 * s, 7 * s, 0, 0, TAU); c.fill();
                c.save();
                c.globalCompositeOperation = 'lighter';
                glowCircle(c, 0, -16 * s, 44 * s, b.accent, 0.24);
                c.restore();
                const cols = [b.accent, shade(b.accent, 35), shade(b.accent, -45)];
                for (let i = 0; i < 3; i++) {
                    const off = (i - 1) * 10 * s;
                    const h = (26 + (i === 1 ? 18 : 0)) * s;
                    c.fillStyle = cols[i];
                    c.beginPath();
                    c.moveTo(off - 7 * s, 6);
                    c.lineTo(off - 3 * s, -h);
                    c.lineTo(off + 3 * s, -h);
                    c.lineTo(off + 7 * s, 6);
                    c.closePath(); c.fill();
                    c.strokeStyle = hexToRgba('#ffffff', 0.35); c.lineWidth = 1; c.stroke();
                }
                break;
            }
            case 'bone': {
                c.strokeStyle = '#c9c2ae'; c.lineWidth = 3 * s; c.lineCap = 'round';
                c.beginPath(); c.moveTo(-14 * s, 2); c.lineTo(14 * s, -3); c.stroke();
                c.fillStyle = '#d8d2c0';
                c.beginPath(); c.arc(-15 * s, 3, 4 * s, 0, TAU); c.fill();
                c.beginPath(); c.arc(15 * s, -4, 4 * s, 0, TAU); c.fill();
                if (this.variant > 1) {
                    c.beginPath(); c.moveTo(-4 * s, 2); c.lineTo(4 * s, 9 * s); c.stroke();
                }
                break;
            }
            case 'skull': {
                c.fillStyle = 'rgba(0,0,0,0.3)';
                c.beginPath(); c.ellipse(0, 4, 12 * s, 5 * s, 0, 0, TAU); c.fill();
                c.fillStyle = '#cfc8b4';
                c.beginPath(); c.arc(0, -2, 9 * s, 0, TAU); c.fill();
                c.fillRect(-5 * s, 2, 10 * s, 6 * s);
                c.fillStyle = '#1a1714';
                c.beginPath(); c.arc(-3.4 * s, -3, 2.4 * s, 0, TAU); c.fill();
                c.beginPath(); c.arc(3.4 * s, -3, 2.4 * s, 0, TAU); c.fill();
                c.fillRect(-1 * s, 1, 2 * s, 3 * s);
                if (this.variant === 2) this.eye(c, -3.4 * s, -3, 1, '#ff6b4a');
                break;
            }
            case 'coffin': {
                c.fillStyle = 'rgba(0,0,0,0.35)';
                c.beginPath(); c.ellipse(0, 10, 26 * s, 8 * s, 0, 0, TAU); c.fill();
                c.fillStyle = shade(b.wall, -10);
                c.beginPath();
                c.moveTo(0, -34 * s); c.lineTo(15 * s, -24 * s); c.lineTo(13 * s, 24 * s);
                c.lineTo(0, 32 * s); c.lineTo(-13 * s, 24 * s); c.lineTo(-15 * s, -24 * s);
                c.closePath(); c.fill();
                c.strokeStyle = hexToRgba(b.accent, 0.4); c.lineWidth = 1.5;
                c.beginPath(); c.moveTo(0, -26 * s); c.lineTo(0, 22 * s); c.stroke();
                c.beginPath(); c.moveTo(-9 * s, -12 * s); c.lineTo(9 * s, -12 * s); c.stroke();
                break;
            }
            case 'chain': {
                c.strokeStyle = 'rgba(150,145,138,0.75)'; c.lineWidth = 2 * s;
                for (let i = 0; i < 6; i++) {
                    c.beginPath();
                    c.ellipse(Math.sin(i * 0.8 + this.seed) * 4 * s, -i * 9 * s, 4 * s, 5 * s, 0, 0, TAU);
                    c.stroke();
                }
                break;
            }
            case 'tree': {
                c.fillStyle = 'rgba(0,0,0,0.4)';
                c.beginPath(); c.ellipse(0, 12, 30 * s, 10 * s, 0, 0, TAU); c.fill();
                c.strokeStyle = '#241a16'; c.lineWidth = 9 * s; c.lineCap = 'round';
                c.beginPath(); c.moveTo(0, 14); c.quadraticCurveTo(-8 * s, -30 * s, 3 * s, -62 * s); c.stroke();
                c.lineWidth = 4 * s;
                for (let i = 0; i < 5; i++) {
                    const ang = -2.4 + i * 0.55;
                    const bx = 2 * s + Math.cos(ang) * 18 * s;
                    const by = -30 * s + Math.sin(ang) * 20 * s;
                    c.beginPath();
                    c.moveTo(1 * s, -28 * s - i * 5 * s);
                    c.quadraticCurveTo(bx, by - 10 * s, bx + Math.cos(ang) * 20 * s, by - 24 * s);
                    c.stroke();
                }
                c.fillStyle = hexToRgba(b.accent, 0.22);
                c.beginPath(); c.arc(2 * s, -58 * s, 26 * s, 0, TAU); c.fill();
                break;
            }
            case 'root': {
                c.strokeStyle = '#2b201a'; c.lineWidth = 5 * s; c.lineCap = 'round';
                c.beginPath();
                c.moveTo(-30 * s, 4); c.quadraticCurveTo(-6 * s, -12 * s, 8 * s, 2);
                c.quadraticCurveTo(22 * s, 14 * s, 34 * s, -2);
                c.stroke();
                c.strokeStyle = hexToRgba(b.accent, 0.25); c.lineWidth = 1.5;
                c.stroke();
                break;
            }
            case 'mushroom': {
                for (let i = 0; i < 3; i++) {
                    const ox = (i - 1) * 9 * s;
                    const h = (8 + i * 4) * s;
                    c.strokeStyle = '#cfd8c4'; c.lineWidth = 2 * s;
                    c.beginPath(); c.moveTo(ox, 4); c.lineTo(ox, 4 - h); c.stroke();
                    c.fillStyle = hexToRgba(b.accent, 0.85);
                    c.beginPath(); c.ellipse(ox, 4 - h, 7 * s, 4 * s, 0, Math.PI, TAU); c.fill();
                }
                break;
            }
            case 'ice':
            case 'frozen': {
                c.save();
                c.globalCompositeOperation = 'lighter';
                glowCircle(c, 0, -8, 40 * s, b.accent, 0.16);
                c.restore();
                c.fillStyle = 'rgba(150,225,255,0.35)';
                c.beginPath();
                c.moveTo(-18 * s, 8); c.lineTo(-8 * s, -28 * s); c.lineTo(2 * s, -6 * s);
                c.lineTo(12 * s, -34 * s); c.lineTo(20 * s, 8);
                c.closePath(); c.fill();
                c.strokeStyle = 'rgba(210,245,255,0.7)'; c.lineWidth = 1.2; c.stroke();
                if (this.type === 'frozen') {
                    c.fillStyle = 'rgba(140,210,240,0.5)';
                    c.beginPath(); c.arc(0, -12, 12 * s, 0, TAU); c.fill();
                    this.eye(c, -3, -13, 1.4, '#ffffff');
                    this.eye(c, 3, -13, 1.4, '#ffffff');
                }
                break;
            }
            case 'lava': {
                const pulse = 0.65 + Math.sin(time * 2 + this.seed) * 0.15;
                const g = c.createRadialGradient(0, 0, 2, 0, 0, 34 * s);
                g.addColorStop(0, `rgba(255,240,180,${pulse})`);
                g.addColorStop(0.4, `rgba(255,140,40,${pulse * 0.9})`);
                g.addColorStop(1, 'rgba(120,20,0,0.15)');
                c.fillStyle = g;
                c.beginPath(); c.ellipse(0, 0, 34 * s, 20 * s, 0, 0, TAU); c.fill();
                c.strokeStyle = 'rgba(60,20,10,0.8)'; c.lineWidth = 2;
                c.beginPath(); c.ellipse(0, 0, 34 * s, 20 * s, 0, 0, TAU); c.stroke();
                break;
            }
            case 'forge': {
                c.fillStyle = '#332420';
                c.fillRect(-24 * s, -18 * s, 48 * s, 32 * s);
                c.fillStyle = '#1a100d';
                c.fillRect(-12 * s, -10 * s, 24 * s, 20 * s);
                c.save();
                c.globalCompositeOperation = 'lighter';
                glowCircle(c, 0, 0, 34 * s, '#ff7a3d', 0.5 + Math.sin(time * 3) * 0.1);
                c.restore();
                break;
            }
            case 'spikes': {
                c.fillStyle = '#4a4f56';
                for (let i = 0; i < 5; i++) {
                    const ox = (i - 2) * 9 * s;
                    c.beginPath();
                    c.moveTo(ox - 4 * s, 8); c.lineTo(ox, -14 * s); c.lineTo(ox + 4 * s, 8);
                    c.closePath(); c.fill();
                }
                break;
            }
            case 'rune': {
                c.save();
                c.rotate(this.rot + Math.sin(time * 0.6 + this.seed) * 0.05);
                c.strokeStyle = hexToRgba(b.accent, 0.55);
                c.lineWidth = 2;
                c.setLineDash([7, 7]);
                c.beginPath(); c.arc(0, 0, 24 * s, 0, TAU); c.stroke();
                c.setLineDash([]);
                c.beginPath(); c.arc(0, 0, 14 * s, 0, TAU); c.stroke();
                for (let i = 0; i < 6; i++) {
                    const a = i / 6 * TAU + time * 0.1;
                    c.beginPath();
                    c.moveTo(Math.cos(a) * 14 * s, Math.sin(a) * 14 * s);
                    c.lineTo(Math.cos(a + 0.6) * 24 * s, Math.sin(a + 0.6) * 24 * s);
                    c.stroke();
                }
                c.restore();
                break;
            }
            case 'altar': {
                c.fillStyle = 'rgba(0,0,0,0.4)';
                c.beginPath(); c.ellipse(0, 12, 28 * s, 9 * s, 0, 0, TAU); c.fill();
                c.fillStyle = shade(b.wall, 5);
                c.fillRect(-22 * s, -8 * s, 44 * s, 20 * s);
                c.fillStyle = shade(b.wallLight, 15);
                c.fillRect(-28 * s, -16 * s, 56 * s, 9 * s);
                c.strokeStyle = hexToRgba(b.accent, 0.55); c.lineWidth = 1.5;
                c.beginPath(); c.arc(0, -24 * s, 10 * s, 0, TAU); c.stroke();
                c.beginPath(); c.moveTo(0, -34 * s); c.lineTo(0, -14 * s); c.stroke();
                break;
            }
            case 'voidstone': {
                const g = c.createRadialGradient(0, -14 * s, 2, 0, -14 * s, 24 * s);
                g.addColorStop(0, '#efe0ff');
                g.addColorStop(0.4, b.accent);
                g.addColorStop(1, 'rgba(30,10,50,0)');
                c.fillStyle = g;
                c.beginPath(); c.arc(0, -14 * s, 22 * s, 0, TAU); c.fill();
                c.strokeStyle = 'rgba(220,190,255,0.8)'; c.lineWidth = 1.4;
                c.beginPath(); c.arc(0, -14 * s, 14 * s, 0, TAU); c.stroke();
                c.beginPath(); c.arc(0, -14 * s, 7 * s, time, time + 4); c.stroke();
                break;
            }
            case 'rubble': {
                c.fillStyle = shade(b.wall, -8);
                for (let i = 0; i < 5; i++) {
                    const ox = (i - 2) * 10 * s, oy = Math.sin(i * 2 + this.seed) * 4 * s;
                    c.beginPath();
                    c.moveTo(ox - 7 * s, oy + 6);
                    c.lineTo(ox - 3 * s, oy - 5 * s);
                    c.lineTo(ox + 6 * s, oy - 2 * s);
                    c.lineTo(ox + 4 * s, oy + 7);
                    c.closePath(); c.fill();
                }
                break;
            }
            case 'statue': {
                c.fillStyle = 'rgba(0,0,0,0.35)';
                c.beginPath(); c.ellipse(0, 12, 22 * s, 8 * s, 0, 0, TAU); c.fill();
                c.fillStyle = shade(b.wall, -2);
                c.fillRect(-16 * s, 4, 32 * s, 10 * s);
                c.fillStyle = shade(b.wallLight, -10);
                c.beginPath();
                c.moveTo(-10 * s, 4); c.lineTo(-7 * s, -28 * s); c.lineTo(0, -36 * s);
                c.lineTo(7 * s, -28 * s); c.lineTo(10 * s, 4); c.closePath(); c.fill();
                c.beginPath(); c.arc(0, -40 * s, 7 * s, 0, TAU); c.fill();
                c.strokeStyle = hexToRgba(b.accent, 0.4); c.lineWidth = 1;
                c.beginPath(); c.arc(0, -40 * s, 9 * s, 0, TAU); c.stroke();
                break;
            }
            case 'cobweb': {
                c.strokeStyle = 'rgba(200,200,200,0.20)'; c.lineWidth = 0.8;
                for (let i = 0; i < 5; i++) {
                    const a = i / 5 * Math.PI;
                    c.beginPath(); c.moveTo(0, 0);
                    c.lineTo(Math.cos(a) * 40 * s, Math.sin(a) * 40 * s); c.stroke();
                }
                for (let r = 10; r <= 38; r += 9) {
                    c.beginPath(); c.arc(0, 0, r * s, 0, Math.PI, false); c.stroke();
                }
                break;
            }
            case 'portal': {
                c.save();
                c.globalCompositeOperation = 'lighter';
                glowCircle(c, 0, -20 * s, 54 * s, b.accent, 0.35);
                c.strokeStyle = hexToRgba(b.accent, 0.7); c.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    c.beginPath();
                    c.ellipse(0, -20 * s, (16 + i * 8) * s, (26 + i * 6) * s, time * 0.4 + i, 0, TAU);
                    c.stroke();
                }
                c.restore();
                break;
            }
            default: {
                c.fillStyle = shade(b.wall, -6);
                c.beginPath(); c.arc(0, 0, 10 * s, 0, TAU); c.fill();
            }
        }
        c.restore();
    }
    eye(c, x, y, r, color) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.shadowBlur = 8; c.shadowColor = color;
        c.fillStyle = color;
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
        c.restore();
    }
}

// ---------------------------------------------------------------
// INTERAGÍVEIS
// ---------------------------------------------------------------
class Interactable {
    constructor(kind, x, y, opts = {}) {
        this.kind = kind;
        this.x = x; this.y = y;
        this.used = false;
        this.radius = opts.radius || 62;
        this.seed = Math.random() * 10;
        this.anim = 0;
        this.data = opts.data || {};
        this.persist = !!opts.persist;
        this.biome = opts.biome || 'catacumbas';
        const labels = {
            chest: 'Baú', merchant: 'Mercador Errante', fountain: 'Fonte de Essência',
            altar: 'Altar Amaldiçoado', lore: 'Pedra de Memória', portal: 'Portal do Selo'
        };
        this.label = optionsLabel(opts, labels, kind);
        function optionsLabel(o, map, k) { return o.label || map[k] || 'Objeto'; }
        this.color = opts.color || '#e8c46a';
    }
    update(dt, game) {
        this.anim += dt;
        if (this.kind === 'portal' && Math.random() < 0.3) {
            game.addParticles(this.x + rand(-16, 16), this.y - rand(0, 40), 1, this.color,
                { glow: true, size: 2, life: 0.6, vy: rand(-40, -15) });
        }
        if (this.kind === 'fountain' && Math.random() < 0.2) {
            game.addParticles(this.x + rand(-12, 12), this.y - rand(0, 20), 1, '#7fe7ff',
                { glow: true, size: 1.8, life: 0.5, vy: rand(-50, -20) });
        }
    }
    getPrompt(game) {
        if (this.kind === 'chest') return this.used ? null : 'Abrir baú';
        if (this.kind === 'merchant') return 'Negociar';
        if (this.kind === 'fountain') return this.used ? null : 'Beber da fonte';
        if (this.kind === 'altar') return this.used ? null : 'Tocar o altar';
        if (this.kind === 'lore') return this.used ? 'Reler inscrição' : 'Ler inscrição';
        if (this.kind === 'portal') return 'Atravessar o portal';
        return null;
    }
    draw(c, game) {
        const t = game.time + this.seed;
        const pulse = 0.6 + Math.sin(t * 2.2) * 0.4;
        c.save();
        c.translate(this.x, this.y);
        // base
        if (this.kind === 'chest') {
            c.fillStyle = 'rgba(0,0,0,0.4)';
            c.beginPath(); c.ellipse(0, 14, 26, 8, 0, 0, TAU); c.fill();
            const wood = '#4a3220', metal = this.used ? '#6b6257' : '#c9a227';
            c.fillStyle = wood;
            c.fillRect(-22, -8, 44, 22);
            c.fillStyle = shade(wood, -12);
            if (this.used) c.fillRect(-22, -30, 44, 14);
            else {
                c.beginPath();
                c.moveTo(-22, -8); c.quadraticCurveTo(0, -26, 22, -8);
                c.closePath(); c.fill();
            }
            c.strokeStyle = metal; c.lineWidth = 3;
            c.strokeRect(-22, -8, 44, 22);
            c.fillStyle = metal;
            c.fillRect(-4, -4, 8, 8);
            if (!this.used) {
                c.save(); c.globalCompositeOperation = 'lighter';
                glowCircle(c, 0, -6, 46, this.color, 0.16 + pulse * 0.10);
                c.restore();
            }
        } else if (this.kind === 'merchant') {
            c.fillStyle = 'rgba(0,0,0,0.4)';
            c.beginPath(); c.ellipse(0, 16, 24, 8, 0, 0, TAU); c.fill();
            c.fillStyle = '#2b2440';
            c.beginPath();
            c.moveTo(-16, 14); c.lineTo(-10, -18); c.quadraticCurveTo(0, -26, 10, -18); c.lineTo(16, 14);
            c.closePath(); c.fill();
            c.fillStyle = '#171223';
            c.beginPath(); c.arc(0, -20, 9, 0, TAU); c.fill();
            c.save(); c.globalCompositeOperation = 'lighter';
            c.fillStyle = '#ffd166';
            c.beginPath(); c.arc(-3, -21, 1.4, 0, TAU); c.fill();
            c.beginPath(); c.arc(3, -21, 1.4, 0, TAU); c.fill();
            c.restore();
            c.fillStyle = '#5a4028';
            c.fillRect(-24, -6, 12, 14);
            c.strokeStyle = '#e8c46a'; c.lineWidth = 1;
            c.strokeRect(-24, -6, 12, 14);
            c.save(); c.globalCompositeOperation = 'lighter';
            glowCircle(c, 0, 0, 58, '#e8c46a', 0.18 + pulse * 0.08);
            c.restore();
        } else if (this.kind === 'fountain') {
            c.fillStyle = '#3a4550';
            c.beginPath(); c.ellipse(0, 10, 30, 12, 0, 0, TAU); c.fill();
            c.fillStyle = '#26313a';
            c.fillRect(-24, 8, 48, 10);
            c.save(); c.globalCompositeOperation = 'lighter';
            glowCircle(c, 0, -2, 40, '#7fe7ff', this.used ? 0.10 : 0.3);
            c.fillStyle = 'rgba(127,231,255,0.55)';
            c.beginPath(); c.ellipse(0, 2, 24, 9, 0, 0, TAU); c.fill();
            if (!this.used) {
                for (let i = 0; i < 3; i++) {
                    const h = 10 + ((t * 26 + i * 14) % 30);
                    c.globalAlpha = 1 - h / 40;
                    c.beginPath(); c.ellipse(Math.sin(t + i) * 8, -h, 2, 4, 0, 0, TAU); c.fill();
                }
            }
            c.restore();
        } else if (this.kind === 'altar') {
            c.fillStyle = 'rgba(0,0,0,0.4)';
            c.beginPath(); c.ellipse(0, 16, 30, 9, 0, 0, TAU); c.fill();
            c.fillStyle = '#2a2035';
            c.fillRect(-24, -6, 48, 22);
            c.fillStyle = '#3d2f4f';
            c.fillRect(-30, -14, 60, 9);
            c.save(); c.globalCompositeOperation = 'lighter';
            glowCircle(c, 0, -22, 40, this.used ? '#6b5a80' : '#c46bff', this.used ? 0.12 : 0.28 + pulse * 0.12);
            c.strokeStyle = this.used ? '#6b5a80' : '#d9b3ff';
            c.lineWidth = 1.6;
            c.beginPath(); c.arc(0, -22, 12, 0, TAU); c.stroke();
            c.beginPath();
            c.moveTo(-8, -30); c.lineTo(8, -14); c.moveTo(8, -30); c.lineTo(-8, -14);
            c.stroke();
            c.restore();
        } else if (this.kind === 'lore') {
            c.fillStyle = 'rgba(0,0,0,0.35)';
            c.beginPath(); c.ellipse(0, 14, 22, 7, 0, 0, TAU); c.fill();
            c.fillStyle = '#44404f';
            c.beginPath();
            c.moveTo(-14, 12); c.lineTo(-18, -20); c.lineTo(-4, -34); c.lineTo(12, -28);
            c.lineTo(17, 10); c.closePath(); c.fill();
            c.strokeStyle = hexToRgba('#7fe7ff', 0.7);
            c.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                c.beginPath();
                c.moveTo(-9 + i * 4, -24 + i * 7);
                c.lineTo(2 + i * 3, -21 + i * 7);
                c.stroke();
            }
            c.save(); c.globalCompositeOperation = 'lighter';
            glowCircle(c, 0, -16, 28, '#7fe7ff', 0.16 + pulse * 0.06);
            c.restore();
        } else if (this.kind === 'portal') {
            c.save();
            c.globalCompositeOperation = 'lighter';
            glowCircle(c, 0, -18, 66, this.color, 0.32 + pulse * 0.1);
            c.strokeStyle = hexToRgba(this.color, 0.85);
            c.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                c.beginPath();
                c.ellipse(0, -18, 18 + i * 10, 30 + i * 7, t * 0.5 + i * 0.6, 0, TAU);
                c.stroke();
            }
            c.fillStyle = 'rgba(30,10,50,0.55)';
            c.beginPath(); c.ellipse(0, -18, 26, 38, 0, 0, TAU); c.fill();
            c.restore();
        }
        c.restore();
    }
    drawPrompt(c, game) {
        const prompt = this.getPrompt(game);
        if (!prompt) return;
        if (dist(this.x, this.y, game.player.x, game.player.y) > this.radius) return;
        const y = this.y - (this.kind === 'portal' ? 78 : 52);
        c.save();
        c.textAlign = 'center';
        c.font = '700 12px Segoe UI, sans-serif';
        const w = c.measureText(prompt).width + 54;
        c.fillStyle = 'rgba(10,8,16,0.82)';
        roundRect(c, this.x - w / 2, y - 14, w, 24, 6);
        c.fill();
        c.strokeStyle = hexToRgba(this.color, 0.5);
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = '#e8c46a';
        c.font = '700 10px Segoe UI, sans-serif';
        c.fillText('G', this.x - w / 2 + 14, y + 2);
        c.fillStyle = '#e8e2d4';
        c.font = '700 12px Segoe UI, sans-serif';
        c.fillText(prompt, this.x + 8, y + 2);
        c.restore();
    }
}

// ---------------------------------------------------------------
// LOOT
// ---------------------------------------------------------------
class Loot {
    constructor(x, y, type, value, game, opts = {}) {
        this.x = x; this.y = y;
        this.type = type;
        this.value = value;
        this.vx = opts.vx !== undefined ? opts.vx : rand(-70, 70);
        this.vy = opts.vy !== undefined ? opts.vy : rand(-110, -30);
        this.ground = rand(0, 6);
        this.life = opts.life || 90;
        this.anim = Math.random() * 6;
        this.collected = false;
        this.pull = 0;
        this.size = opts.size || (type === 'gold' ? 7 : 9);
        this.color = type === 'gold' ? '#ffd166' : type === 'heart' ? '#ff5f6d'
            : type === 'shield' ? '#61c0ff' : type === 'xp' ? '#b06bff' : '#a8ffdf';
        if (type === 'gold' && game && game.player) {
            this.value = Math.max(1, Math.round(value * game.player.stats.goldMult));
        }
        this.text = null;
        if (type === 'gold' && opts.text !== false) this.text = `${this.value}`;
    }
    update(dt, game) {
        if (this.collected) return;
        this.anim += dt;
        this.life -= dt;
        const p = game.player;
        const d = dist(this.x, this.y, p.x, p.y);
        const magnet = this.type === 'gold' || this.type === 'xp' || this.type === 'soul' ? p.stats.magnet : p.stats.magnet * 0.4;
        if (d < magnet || this.pull > 0) {
            this.pull = 1;
            const a = angleBetween(this.x, this.y, p.x, p.y);
            const speed = 280 + (magnet - d) * 2.4;
            this.x += Math.cos(a) * speed * dt;
            this.y += Math.sin(a) * speed * dt;
            this.vy = 0; this.vx = 0;
            if (dist(this.x, this.y, p.x, p.y) < p.size + 12) this.collect(game);
            return;
        }
        if (this.life < 20 && Math.sin(this.anim * 12) < 0) return;
        if (this.pull === 0) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 320 * dt;
            if (this.y > this.ground) {
                this.y = this.ground;
                this.vy *= -0.35;
                this.vx *= 0.6;
                if (Math.abs(this.vy) < 20) { this.vy = 0; this.vx = 0; }
            }
        }
        if (this.life <= 0) this.collected = true;
    }
    collect(game) {
        if (this.collected) return;
        this.collected = true;
        const p = game.player;
        if (this.type === 'gold') {
            game.gold += this.value;
            game.stats.goldEarned += this.value;
            Sound.play('coin', 0.55);
            if (Math.random() < 0.35) game.addFloatingText(p.x, p.y - 40, `+${this.value}`, '#ffd166', false);
        } else if (this.type === 'heart') {
            const amount = this.value * p.stats.healingPct;
            p.heal(amount, game);
            Sound.play('heal', 0.5);
        } else if (this.type === 'shield') {
            p.addShield(this.value, game);
            Sound.play('shield', 0.5);
        } else if (this.type === 'xp') {
            p.gainXp(this.value, game, false);
        } else if (this.type === 'soul') {
            game.soulsRun = (game.soulsRun || 0) + this.value;
            game.addFloatingText(p.x, p.y - 40, `+${this.value} ALMA`, '#a8ffdf', false);
            Sound.play('heal', 0.4);
        }
    }
    draw(c) {
        if (this.collected) return;
        const bob = Math.sin(this.anim * 4) * 3;
        c.save();
        c.translate(this.x, this.y + bob);
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, 0, this.size * 3.2, this.color, 0.34);
        c.globalCompositeOperation = 'source-over';
        if (this.type === 'heart') {
            c.fillStyle = this.color;
            c.beginPath();
            c.moveTo(0, 6);
            c.bezierCurveTo(-10, -2, -8, -10, 0, -5);
            c.bezierCurveTo(8, -10, 10, -2, 0, 6);
            c.fill();
        } else if (this.type === 'shield') {
            c.fillStyle = this.color;
            c.beginPath();
            c.moveTo(0, -8); c.lineTo(7, -4); c.lineTo(6, 4); c.lineTo(0, 9);
            c.lineTo(-6, 4); c.lineTo(-7, -4);
            c.closePath(); c.fill();
        } else if (this.type === 'xp' || this.type === 'soul') {
            c.fillStyle = this.color;
            c.beginPath();
            c.moveTo(0, -9); c.lineTo(4, -2); c.lineTo(0, 9); c.lineTo(-4, -2);
            c.closePath(); c.fill();
            c.fillStyle = '#ffffff';
            c.beginPath(); c.arc(0, -1, 1.8, 0, TAU); c.fill();
        } else {
            c.fillStyle = '#b8860b';
            c.beginPath(); c.arc(0, 0, this.size, 0, TAU); c.fill();
            c.fillStyle = this.color;
            c.beginPath(); c.arc(0, 0, this.size * 0.78, 0, TAU); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.75)';
            c.beginPath(); c.arc(-2, -2, this.size * 0.3, 0, TAU); c.fill();
        }
        c.restore();
        if (this.text) {
            c.save();
            c.textAlign = 'center';
            c.font = '700 10px Segoe UI, sans-serif';
            c.fillStyle = 'rgba(0,0,0,0.6)';
            c.fillText(this.text, this.x + 1, this.y - 16 + bob + 1);
            c.fillStyle = '#ffd166';
            c.fillText(this.text, this.x, this.y - 16 + bob);
            c.restore();
        }
    }
}

class ItemDrop {
    constructor(x, y, item) {
        this.x = x; this.y = y;
        this.item = item;
        this.anim = Math.random() * 6;
        this.life = 120;
        this.collected = false;
        this.rarity = RARITIES[item.rarity] || RARITIES.common;
        this.vy = -120;
        this.vx = rand(-50, 50);
        this.ground = rand(0, 8);
    }
    update(dt, game) {
        if (this.collected) return;
        this.anim += dt;
        this.life -= dt;
        if (this.y < this.ground) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 360 * dt;
            if (this.y >= this.ground) { this.y = this.ground; this.vy = 0; this.vx = 0; }
        }
        const p = game.player;
        if (dist(this.x, this.y, p.x, p.y) < 46) {
            this.collected = true;
            const added = p.addItem(this.item);
            if (added) {
                game.notify(`${this.item.name} (${this.rarity.name})`, this.rarity.color);
                Sound.play('chest', 0.8);
            } else {
                game.notify('Inventário cheio!', '#ff6b6b');
                this.collected = false;
                this.life = 999;
            }
        }
        if (this.life <= 0) this.collected = true;
    }
    draw(c) {
        if (this.collected) return;
        const bob = Math.sin(this.anim * 3) * 3;
        c.save();
        c.translate(this.x, this.y + bob);
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.22;
        c.fillStyle = this.rarity.color;
        c.fillRect(-6, -90, 12, 90);
        glowCircle(c, 0, 4, 30, this.rarity.color, 0.35);
        c.globalCompositeOperation = 'source-over';
        c.globalAlpha = 1;
        c.fillStyle = this.rarity.color;
        c.beginPath();
        c.moveTo(0, -10); c.lineTo(8, 0); c.lineTo(0, 10); c.lineTo(-8, 0);
        c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1; c.stroke();
        c.restore();
        c.save();
        c.textAlign = 'center';
        c.font = '700 10px Segoe UI, sans-serif';
        c.fillStyle = this.rarity.color;
        c.fillText(this.item.name, this.x, this.y - 24 + bob);
        c.restore();
    }
}

// ---------------------------------------------------------------
// ARMADILHAS
// ---------------------------------------------------------------
class Trap {
    constructor(kind, x, y, opts = {}) {
        this.kind = kind;
        this.x = x; this.y = y;
        this.radius = opts.radius || (kind === 'laser' ? 34 : kind === 'rock' ? 56 : 46);
        this.damage = opts.damage || 14;
        this.triggerRadius = opts.triggerRadius || (kind === 'laser' ? 210 : 64);
        this.cooldown = 0;
        this.cdMax = opts.cd || (kind === 'laser' ? 2.6 : kind === 'spike' ? 2.2 : kind === 'lava' ? 1.2 : 3.4);
        this.timer = rand(0, 1);
        this.active = 0;
        this.armed = true;
        this.angle = opts.angle || rand(0, TAU);
        this.anim = Math.random() * 8;
        this.t = 0;
        this.state = 'idle';
        this.hitOnce = false;
        this.color = kind === 'lava' ? '#ff7a3d'
            : kind === 'poison' ? '#7dffb0'
                : kind === 'laser' ? '#c46bff'
                    : kind === 'rune' ? '#e8c46a'
                        : kind === 'rock' ? '#b8b0a0' : '#c0392b';
    }
    update(dt, game) {
        const p = game.player;
        this.t += dt;
        this.anim += dt;
        this.cooldown = Math.max(0, this.cooldown - dt);
        this.active = Math.max(0, this.active - dt);
        const d = dist(this.x, this.y, p.x, p.y);

        if (this.kind === 'lava') {
            if (d < this.radius * 0.8 && p.dashTimer <= 0) this.hitPlayer(game, this.damage * 0.5, dt);
            return;
        }
        if (this.kind === 'laser') {
            if (this.cooldown <= 0 && d < this.triggerRadius) {
                this.state = 'charge';
                this.timer = 0.85;
                this.cooldown = this.cdMax;
                Sound.play('ui', 0.5);
            }
            if (this.state === 'charge') {
                this.timer -= dt;
                if (this.timer <= 0) {
                    this.state = 'fire';
                    this.active = 0.35;
                    const end = 900;
                    const hit = this.pointToLine(p.x, p.y, this.x, this.y,
                        this.x + Math.cos(this.angle) * end, this.y + Math.sin(this.angle) * end);
                    if (hit < 30) p.takeDamage(this.damage * 1.6, game, null);
                    game.effects.push(new BeamEffect(this.x, this.y,
                        this.x + Math.cos(this.angle) * end, this.y + Math.sin(this.angle) * end,
                        this.color, { life: 0.28, width: 7, bolt: false }));
                    game.shakeCamera(4);
                    Sound.play('lightning', 0.6);
                }
            } else if (this.state === 'fire') {
                if (this.active <= 0) this.state = 'idle';
            }
            return;
        }
        if (this.kind === 'rock') {
            if (this.cooldown <= 0 && d < this.triggerRadius) {
                this.cooldown = this.cdMax;
                this.state = 'warning';
                this.timer = 0.7;
            }
            if (this.state === 'warning') {
                this.timer -= dt;
                if (this.timer <= 0) {
                    this.state = 'idle';
                    game.effects.push(new DelayedBlast(p.x, p.y, 54, 0.01, this.damage, {
                        hostile: true, color: '#b8b0a0', style: 'rock', source: null
                    }));
                    game.addParticles(p.x, p.y, 22, '#8c8478', { size: 4, life: 0.6, gravity: 280 });
                    game.shakeCamera(6);
                    Sound.play('explosion', 0.5);
                }
            }
            return;
        }
        // espinhos / lâminas / veneno / runa
        if (this.cooldown <= 0 && d < this.triggerRadius) {
            this.cooldown = this.cdMax;
            if (this.kind === 'blade') {
                this.angle = angleBetween(this.x, this.y, p.x, p.y);
                this.active = 0.5;
                game.effects.push(new SlashEffect(this.x, this.y, this.angle, 54, 3.2, '#d7d2c4', { heavy: true, width: 12 }));
            } else {
                this.active = this.kind === 'poison' ? 1.6 : 0.7;
            }
            Sound.play('slash', 0.4);
            this.hitOnce = false;
        }
        if (this.active > 0 && !this.hitOnce) {
            const reach = this.kind === 'blade' ? 62 : this.radius;
            if (dist(this.x, this.y, p.x, p.y) < reach) {
                this.hitOnce = true;
                if (this.kind === 'poison') {
                    p.takeDamage(this.damage * 0.5, game, null);
                    p.applyPoison = 2.5;
                } else {
                    p.takeDamage(this.damage, game, null);
                }
            }
        }
    }
    hitPlayer(game, amount, dt) {
        if (this.cooldown > 0) return;
        this.cooldown = 0.7;
        game.player.takeDamage(amount, game, null);
        game.addParticles(game.player.x, game.player.y, 4, '#ff7a3d', { glow: true, size: 2, life: 0.3, vy: -40 });
    }
    pointToLine(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const len = dx * dx + dy * dy;
        const t = len ? clamp(((px - x1) * dx + (py - y1) * dy) / len, 0, 1) : 0;
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }
    draw(c, game) {
        const p = game.player;
        const near = dist(this.x, this.y, p.x, p.y) < this.triggerRadius + 80;
        c.save();
        c.translate(this.x, this.y);
        const t = game.time;
        if (this.kind === 'spike') {
            const up = this.active > 0 ? 1 : 0;
            c.fillStyle = 'rgba(20,16,22,0.85)';
            c.beginPath(); c.ellipse(0, 2, 34, 12, 0, 0, TAU); c.fill();
            c.strokeStyle = 'rgba(160,150,140,0.4)'; c.lineWidth = 1;
            c.stroke();
            for (let i = 0; i < 7; i++) {
                const ox = (i - 3) * 9;
                const h = up ? 26 : 4;
                c.fillStyle = up ? '#d9d2c2' : '#6b6459';
                c.beginPath();
                c.moveTo(ox - 4, 4); c.lineTo(ox, 4 - h); c.lineTo(ox + 4, 4);
                c.closePath(); c.fill();
            }
            if (this.cooldown > this.cdMax * 0.6 && near) this.ring(c, 38, '#ff5f5f');
        } else if (this.kind === 'blade') {
            c.save();
            c.rotate(this.angle + (this.active > 0 ? (1 - this.active / 0.5) * 2.4 : 0));
            c.strokeStyle = 'rgba(180,175,165,0.55)'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.stroke();
            c.strokeStyle = this.active > 0 ? '#f4f0e4' : '#8f887c';
            c.lineWidth = 5;
            c.beginPath(); c.moveTo(0, 0); c.lineTo(52, 0); c.stroke();
            c.restore();
            c.fillStyle = '#4a443c';
            c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill();
            if (near && this.cooldown < 0.6) this.ring(c, 60, '#ff5f5f');
        } else if (this.kind === 'poison') {
            c.fillStyle = 'rgba(40,80,50,0.55)';
            c.beginPath(); c.ellipse(0, 0, 34, 22, 0, 0, TAU); c.fill();
            for (let i = 0; i < 4; i++) {
                const bx = Math.sin(t + i * 2) * 18;
                const by = Math.cos(t * 1.3 + i) * 10;
                c.fillStyle = 'rgba(125,255,176,0.35)';
                c.beginPath(); c.arc(bx, by, 4 + Math.sin(t * 3 + i) * 1.5, 0, TAU); c.fill();
            }
            this.ring(c, 30, '#7dffb0', 0.25);
        } else if (this.kind === 'lava') {
            const g = c.createRadialGradient(0, 0, 3, 0, 0, 34);
            g.addColorStop(0, 'rgba(255,235,180,0.95)');
            g.addColorStop(0.45, 'rgba(255,120,40,0.75)');
            g.addColorStop(1, 'rgba(120,20,0,0.25)');
            c.fillStyle = g;
            c.beginPath(); c.ellipse(0, 0, 34, 22, 0, 0, TAU); c.fill();
            c.strokeStyle = 'rgba(60,18,8,0.9)'; c.lineWidth = 2;
            c.beginPath(); c.ellipse(0, 0, 34, 22, 0, 0, TAU); c.stroke();
        } else if (this.kind === 'rune') {
            const ready = this.cooldown <= 0;
            c.save(); c.rotate(t * 0.3);
            c.strokeStyle = hexToRgba(this.color, ready ? 0.8 : 0.3); c.lineWidth = 2;
            c.setLineDash([6, 6]);
            c.beginPath(); c.arc(0, 0, 28, 0, TAU); c.stroke();
            c.setLineDash([]);
            for (let i = 0; i < 3; i++) {
                c.rotate(TAU / 3);
                c.beginPath(); c.moveTo(8, 0); c.lineTo(18, 0); c.lineTo(13, 8); c.stroke();
            }
            c.restore();
            if (ready && near) c.save(), c.globalCompositeOperation = 'lighter', glowCircle(c, 0, 0, 36, this.color, 0.2 + Math.sin(t * 5) * 0.1), c.restore();
        } else if (this.kind === 'laser') {
            c.save();
            c.rotate(this.angle);
            c.fillStyle = '#3d3352';
            c.fillRect(-9, -9, 18, 18);
            c.strokeStyle = hexToRgba(this.color, 0.8); c.lineWidth = 1.5;
            c.strokeRect(-9, -9, 18, 18);
            if (this.state === 'charge') {
                c.globalAlpha = 0.25 + Math.sin(t * 22) * 0.1;
                c.strokeStyle = this.color; c.lineWidth = 2;
                c.beginPath(); c.moveTo(0, 0); c.lineTo(900, 0); c.stroke();
            }
            c.restore();
            if (this.state === 'charge') {
                c.save(); c.globalAlpha = 0.5 + Math.sin(t * 25) * 0.2;
                this.ring(c, 18 + (1 - this.timer / 0.85) * 16, '#ff5f5f');
                c.restore();
            }
        } else if (this.kind === 'rock') {
            c.fillStyle = 'rgba(20,16,18,0.5)';
            c.beginPath(); c.ellipse(0, 0, 30, 14, 0, 0, TAU); c.fill();
            c.strokeStyle = 'rgba(160,150,140,0.35)'; c.lineWidth = 1;
            c.beginPath(); c.ellipse(0, 0, 30, 14, 0, 0, TAU); c.stroke();
            if (this.state === 'warning') {
                c.globalAlpha = 0.4 + Math.sin(t * 24) * 0.2;
                this.ring(c, this.radius || 56, '#ff5f5f');
            }
        }
        c.restore();
    }
    ring(c, r, color, alpha) {
        c.save();
        c.strokeStyle = hexToRgba(color, alpha !== undefined ? alpha : 0.5);
        c.lineWidth = 1.5;
        c.setLineDash([4, 5]);
        c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
        c.restore();
    }
}


/* ----------------------------------------------------------------
   MÓDULO: ui.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — INTERFACE (primitivos, HUD, notificações)
   ================================================================ */
'use strict';

const UI_COLORS = {
    bg: '#0b0912',
    panel: 'rgba(16,13,23,0.94)',
    panel2: 'rgba(24,20,34,0.92)',
    border: 'rgba(168,140,220,0.22)',
    borderHot: 'rgba(232,196,106,0.75)',
    gold: '#e8c46a',
    goldDark: '#a8842f',
    text: '#e9e3d6',
    dim: '#9b93a6',
    faint: '#6b6478',
    danger: '#ff5f6d',
    hp: '#c0392b',
    hpLight: '#ff6b5a',
    mana: '#4d8dff',
    manaLight: '#7fb2ff',
    shield: '#61c0ff',
    xp: '#c46bff',
    success: '#6fe7a0',
    purple: '#b06bff'
};

const UI = {
    mouse: { x: -999, y: -999 },
    click: null,
    lastHot: [],
    hot: [],
    deferred: [],
    s: 1,
    time: 0,
    toastAnim: 0,

    // -------------------------------------------------------------
    // CICLO
    // -------------------------------------------------------------
    begin(dt) {
        this.time += dt || 0;
        this.s = clamp(Math.min(VIEW.w / 1360, VIEW.h / 800), 0.8, 1.35);
        this.hot = [];
        this.deferred = [];
    },
    end() {
        for (const fn of this.deferred) fn();
        this.deferred = [];
        this.lastHot = this.hot;
        this.click = null;
    },
    push(x, y, w, h, id, cb, disabled) {
        this.hot.push({ x, y, w, h, id, cb, disabled });
    },
    hover(x, y, w, h) {
        const m = this.mouse;
        return m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h;
    },
    consumeClick(x, y, w, h) {
        if (!this.click) return false;
        const c = this.click;
        if (c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h) {
            this.click = null;
            return true;
        }
        return false;
    },
    pointInHot(x, y) {
        for (const h of this.lastHot) {
            if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return true;
        }
        return false;
    },
    hotAt(x, y) {
        for (const h of this.lastHot) {
            if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
        }
        return null;
    },

    // -------------------------------------------------------------
    // TEXTO / FORMAS
    // -------------------------------------------------------------
    font(size, weight = '400', family = 'Segoe UI, sans-serif') {
        return `${weight} ${Math.round(size * this.s)}px ${family}`;
    },
    text(str, x, y, size = 14, color = UI_COLORS.text, align = 'left', weight = '400', family) {
        const c = ctx;
        c.save();
        c.font = this.font(size, weight, family || 'Segoe UI, sans-serif');
        c.fillStyle = color;
        c.textAlign = align;
        c.textBaseline = 'middle';
        c.fillText(str, x, y);
        c.restore();
    },
    title(str, x, y, size = 34, color = UI_COLORS.text, align = 'center') {
        this.text(str, x, y, size, color, align, '700', 'Georgia, serif');
    },
    wrap(str, maxW, size = 13, weight = '400', family) {
        const c = ctx;
        c.save();
        c.font = this.font(size, weight, family || 'Segoe UI, sans-serif');
        const words = String(str).split(' ');
        const lines = [];
        let line = '';
        for (const w of words) {
            const test = line ? line + ' ' + w : w;
            if (c.measureText(test).width > maxW && line) {
                lines.push(line);
                line = w;
            } else line = test;
        }
        if (line) lines.push(line);
        c.restore();
        return lines;
    },
    paragraph(str, x, y, maxW, size = 13, color = UI_COLORS.dim, lh = 1.55, weight = '400', family) {
        const lines = this.wrap(str, maxW, size, weight, family);
        const step = size * this.s * lh;
        lines.forEach((l, i) => this.text(l, x, y + i * step, size, color, 'left', weight, family));
        return y + lines.length * step;
    },
    panel(x, y, w, h, opts = {}) {
        const c = ctx;
        c.save();
        // sombra
        c.shadowColor = 'rgba(0,0,0,0.65)';
        c.shadowBlur = 26;
        c.shadowOffsetY = 10;
        const g = c.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, opts.top || 'rgba(24,20,34,0.97)');
        g.addColorStop(1, opts.bottom || 'rgba(12,10,18,0.98)');
        c.fillStyle = g;
        roundRect(c, x, y, w, h, (opts.radius || 12) * this.s);
        c.fill();
        c.shadowColor = 'transparent';
        c.strokeStyle = opts.border || UI_COLORS.border;
        c.lineWidth = 1;
        c.stroke();
        if (opts.accent) {
            c.strokeStyle = hexToRgba(opts.accent, 0.35);
            c.beginPath();
            c.moveTo(x + 16, y + 0.5);
            c.lineTo(x + w - 16, y + 0.5);
            c.stroke();
        }
        c.restore();
        if (opts.title) {
            this.text(opts.title, x + 18 * this.s, y + 26 * this.s, 17, opts.accent || UI_COLORS.gold, 'left', '700', 'Georgia, serif');
            if (opts.subtitle) this.text(opts.subtitle, x + 18 * this.s, y + 46 * this.s, 11, UI_COLORS.dim);
            ctx.save();
            ctx.strokeStyle = hexToRgba(opts.accent || UI_COLORS.gold, 0.18);
            ctx.beginPath();
            ctx.moveTo(x + 16 * this.s, y + 58 * this.s);
            ctx.lineTo(x + w - 16 * this.s, y + 58 * this.s);
            ctx.stroke();
            ctx.restore();
        }
        if (opts.close) {
            const bs = 24 * this.s;
            const bx = x + w - bs - 10 * this.s, by = y + 10 * this.s;
            const hot = this.hover(bx, by, bs, bs);
            ctx.save();
            ctx.fillStyle = hot ? 'rgba(255,95,109,0.2)' : 'rgba(255,255,255,0.05)';
            roundRect(ctx, bx, by, bs, bs, 6 * this.s);
            ctx.fill();
            ctx.strokeStyle = hot ? UI_COLORS.danger : 'rgba(255,255,255,0.14)';
            ctx.stroke();
            this.text('✕', bx + bs / 2, by + bs / 2 + 1, 12, hot ? UI_COLORS.danger : UI_COLORS.dim, 'center', '700');
            ctx.restore();
            this.push(bx, by, bs, bs, 'close', opts.close);
            if (this.consumeClick(bx, by, bs, bs)) {
                Sound.play('ui');
                opts.close();
            }
        }
    },
    button(x, y, w, h, label, opts = {}) {
        const c = ctx;
        const hot = this.hover(x, y, w, h) && !opts.disabled;
        const color = opts.color || UI_COLORS.gold;
        const clicked = this.consumeClick(x, y, w, h);
        this.push(x, y, w, h, opts.id || label, opts.onClick, opts.disabled);
        c.save();
        c.shadowColor = hot ? hexToRgba(color, 0.45) : 'transparent';
        c.shadowBlur = hot ? 18 : 0;
        const g = c.createLinearGradient(x, y, x, y + h);
        if (opts.primary) {
            g.addColorStop(0, hot ? shade(color, 18) : color);
            g.addColorStop(1, hot ? shade(color, -18) : shade(color, -34));
        } else {
            g.addColorStop(0, hot ? 'rgba(58,48,78,0.98)' : 'rgba(32,27,44,0.94)');
            g.addColorStop(1, hot ? 'rgba(40,33,56,0.98)' : 'rgba(20,17,29,0.94)');
        }
        c.fillStyle = opts.disabled ? 'rgba(24,22,30,0.7)' : g;
        roundRect(c, x, y, w, h, (opts.radius || 8) * this.s);
        c.fill();
        c.shadowBlur = 0;
        c.strokeStyle = opts.disabled ? 'rgba(255,255,255,0.06)'
            : hot ? hexToRgba(opts.primary ? '#ffffff' : color, 0.9)
                : hexToRgba(opts.primary ? color : '#b9a8dd', 0.35);
        c.lineWidth = hot ? 1.6 : 1;
        c.stroke();
        const fs = (opts.fontSize || 13.5) * this.s;
        c.font = `${opts.weight || '700'} ${fs}px Segoe UI, sans-serif`;
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillStyle = opts.disabled ? UI_COLORS.faint
            : opts.primary ? '#141019' : hot ? '#fff8e6' : UI_COLORS.text;
        let tx = x + w / 2;
        if (opts.icon) {
            const iconSize = Math.min(h * 0.56, 19 * this.s);
            this.icon(opts.icon, x + 16 * this.s + iconSize / 2, y + h / 2, iconSize, opts.disabled ? UI_COLORS.faint : (opts.primary ? '#141019' : color));
            tx = x + w / 2 + iconSize * 0.6;
        }
        c.fillText(label, tx, y + h / 2 + 1);
        if (opts.sub) {
            c.font = `400 ${10.5 * this.s}px Segoe UI, sans-serif`;
            c.fillStyle = opts.disabled ? UI_COLORS.faint : (opts.primary ? 'rgba(20,16,25,0.65)' : UI_COLORS.dim);
            c.fillText(opts.sub, x + w / 2, y + h - 9 * this.s);
        }
        c.restore();
        if (clicked && !opts.disabled) {
            Sound.play('ui');
            if (opts.onClick) opts.onClick();
            return true;
        }
        return false;
    },
    bar(x, y, w, h, value, max, color, opts = {}) {
        const c = ctx;
        const ratio = clamp(max > 0 ? value / max : 0, 0, 1);
        c.save();
        c.fillStyle = opts.bg || 'rgba(0,0,0,0.62)';
        roundRect(c, x, y, w, h, Math.min(h / 2, 4 * this.s));
        c.fill();
        if (ratio > 0) {
            const g = c.createLinearGradient(x, y, x, y + h);
            g.addColorStop(0, opts.light || shade(color, 30));
            g.addColorStop(1, color);
            c.fillStyle = g;
            c.shadowColor = hexToRgba(color, 0.6);
            c.shadowBlur = opts.glow === false ? 0 : 8;
            roundRect(c, x + 1, y + 1, Math.max(2, (w - 2) * ratio), h - 2, Math.min((h - 2) / 2, 3.5 * this.s));
            c.fill();
            c.shadowBlur = 0;
            c.fillStyle = 'rgba(255,255,255,0.18)';
            roundRect(c, x + 2, y + 2, Math.max(1, (w - 4) * ratio), Math.max(1, (h - 4) * 0.4), 2);
            c.fill();
        }
        c.strokeStyle = opts.border || 'rgba(255,255,255,0.13)';
        c.lineWidth = 1;
        roundRect(c, x, y, w, h, Math.min(h / 2, 4 * this.s));
        c.stroke();
        c.restore();
        if (opts.label) {
            this.text(opts.label, x + w / 2, y + h / 2 + 0.5, opts.labelSize || 10, opts.labelColor || '#ffffff', 'center', '700');
        }
    },
    card(x, y, w, h, opts = {}) {
        const c = ctx;
        const hot = this.hover(x, y, w, h);
        const selected = !!opts.selected;
        const locked = !!opts.locked;
        const clicked = this.consumeClick(x, y, w, h);
        this.push(x, y, w, h, opts.id, opts.onClick, locked);
        const accent = opts.color || UI_COLORS.gold;
        c.save();
        c.shadowColor = selected ? hexToRgba(accent, 0.35) : 'transparent';
        c.shadowBlur = selected ? 20 : 0;
        const g = c.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, selected ? hexToRgba(accent, 0.16) : hot ? 'rgba(48,40,66,0.95)' : 'rgba(22,18,32,0.92)');
        g.addColorStop(1, selected ? hexToRgba(accent, 0.05) : 'rgba(13,11,20,0.94)');
        c.fillStyle = locked ? 'rgba(16,14,22,0.8)' : g;
        roundRect(c, x, y, w, h, 9 * this.s);
        c.fill();
        c.shadowBlur = 0;
        c.strokeStyle = selected ? hexToRgba(accent, 0.9) : hot ? 'rgba(200,180,240,0.55)' : 'rgba(160,140,200,0.18)';
        c.lineWidth = selected ? 1.8 : 1;
        c.stroke();
        c.restore();
        if (opts.draw) opts.draw(c, x, y, w, h, hot);
        if (clicked && !locked) {
            Sound.play('ui');
            if (opts.onClick) opts.onClick();
            return true;
        }
        return false;
    },
    icon(name, x, y, size, color = UI_COLORS.gold) {
        const c = ctx;
        const s = size / 24;
        c.save();
        c.translate(x, y);
        c.scale(s, s);
        c.strokeStyle = color;
        c.fillStyle = color;
        c.lineWidth = 1.8;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        const P = (pts, close) => {
            c.beginPath();
            pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
            if (close) c.closePath();
            c.stroke();
        };
        switch (name) {
            case 'sword':
                P([[7, 17], [17, 5], [20, 3], [19, 7], [9, 19]], true);
                P([[6, 14], [10, 18]]);
                P([[4, 20], [8, 16]]);
                break;
            case 'dagger':
                P([[8, 16], [16, 6], [18, 4], [17, 8], [10, 18]], true);
                P([[7, 14], [10, 17]]);
                break;
            case 'axe':
                P([[10, 20], [14, 6]]);
                c.beginPath();
                c.arc(17, 7, 7, -1.4, 1.4);
                c.stroke();
                break;
            case 'hammer':
                P([[7, 20], [14, 7]]);
                c.strokeRect(12, 2, 9, 8);
                break;
            case 'spear':
                P([[5, 21], [18, 6]]);
                P([[15, 3], [21, 5], [17, 10]], true);
                break;
            case 'scythe':
                P([[8, 21], [12, 4]]);
                c.beginPath();
                c.arc(15, 6, 8, 2.4, 4.9);
                c.stroke();
                break;
            case 'staff':
                P([[6, 21], [17, 6]]);
                c.beginPath(); c.arc(18, 4, 3, 0, TAU); c.stroke();
                break;
            case 'orb':
                c.beginPath(); c.arc(12, 12, 7, 0, TAU); c.stroke();
                c.beginPath(); c.arc(9, 9, 2.4, 0, TAU); c.fill();
                break;
            case 'shield':
                c.beginPath();
                c.moveTo(12, 2); c.lineTo(20, 6); c.lineTo(18, 16);
                c.lineTo(12, 22); c.lineTo(6, 16); c.lineTo(4, 6); c.closePath();
                c.stroke();
                break;
            case 'crown':
                P([[4, 18], [5, 8], [9, 13], [12, 5], [15, 13], [19, 8], [20, 18]], true);
                break;
            case 'bow':
                c.beginPath(); c.arc(9, 12, 9, -1.1, 1.1); c.stroke();
                P([[9, 3], [9, 21]]);
                P([[9, 12], [20, 12]]);
                break;
            case 'heart':
                c.beginPath();
                c.moveTo(12, 20);
                c.bezierCurveTo(2, 13, 3, 5, 8, 5);
                c.bezierCurveTo(11, 5, 12, 8, 12, 9);
                c.bezierCurveTo(12, 8, 13, 5, 16, 5);
                c.bezierCurveTo(21, 5, 22, 13, 12, 20);
                c.closePath(); c.fill();
                break;
            case 'mana':
                c.beginPath();
                c.moveTo(12, 2);
                c.bezierCurveTo(18, 10, 19, 13, 19, 15);
                c.arc(12, 15, 7, 0, Math.PI, false);
                c.bezierCurveTo(5, 13, 6, 10, 12, 2);
                c.closePath(); c.fill();
                break;
            case 'xp':
                P([[12, 2], [14, 9], [21, 12], [14, 15], [12, 22], [10, 15], [3, 12], [10, 9]], true);
                break;
            case 'coin':
                c.beginPath(); c.arc(12, 12, 8, 0, TAU); c.stroke();
                c.beginPath(); c.arc(12, 12, 4, 0, TAU); c.stroke();
                break;
            case 'eye':
                c.beginPath();
                c.moveTo(2, 12); c.quadraticCurveTo(12, 2, 22, 12);
                c.quadraticCurveTo(12, 22, 2, 12);
                c.stroke();
                c.beginPath(); c.arc(12, 12, 3, 0, TAU); c.fill();
                break;
            case 'drain':
                c.beginPath();
                c.moveTo(12, 3); c.bezierCurveTo(19, 9, 17, 15, 12, 16);
                c.bezierCurveTo(7, 15, 5, 9, 12, 3);
                c.fill();
                P([[12, 16], [12, 21]]);
                break;
            case 'thorns':
                P([[12, 21], [12, 3]]);
                P([[12, 8], [7, 5]]);
                P([[12, 12], [17, 9]]);
                P([[12, 16], [7, 13]]);
                break;
            case 'rune':
                c.strokeRect(4, 4, 16, 16);
                P([[8, 14], [12, 8], [16, 14]]);
                break;
            case 'bolt':
                P([[13, 2], [6, 13], [11, 13], [9, 22], [18, 9], [13, 9]], true);
                break;
            case 'boots':
                P([[5, 17], [6, 8], [11, 8], [11, 15], [19, 15], [19, 20], [5, 20]], true);
                break;
            case 'nova':
                c.beginPath(); c.arc(12, 12, 4, 0, TAU); c.stroke();
                for (let i = 0; i < 4; i++) {
                    const a = i / 4 * TAU + 0.4;
                    P([[12 + Math.cos(a) * 7, 12 + Math.sin(a) * 7], [12 + Math.cos(a) * 11, 12 + Math.sin(a) * 11]]);
                }
                c.beginPath(); c.arc(12, 12, 10, 0, TAU); c.setLineDash([2, 5]); c.stroke(); c.setLineDash([]);
                break;
            case 'meteor':
                P([[6, 18], [14, 8]]);
                c.beginPath(); c.arc(15, 7, 5, 0, TAU); c.fill();
                break;
            case 'chain':
                for (let i = 0; i < 3; i++) {
                    c.beginPath();
                    c.ellipse(7 + i * 5, 8 + i * 4, 4, 6, -0.7, 0, TAU);
                    c.stroke();
                }
                break;
            case 'ice':
                for (let i = 0; i < 3; i++) {
                    const a = i / 3 * Math.PI;
                    P([[12 + Math.cos(a) * 10, 12 + Math.sin(a) * 10], [12 - Math.cos(a) * 10, 12 - Math.sin(a) * 10]]);
                }
                P([[12, 2], [12, 22]]);
                break;
            case 'fire':
                c.beginPath();
                c.moveTo(12, 21);
                c.bezierCurveTo(4, 17, 6, 9, 12, 3);
                c.bezierCurveTo(12, 9, 19, 11, 17, 17);
                c.bezierCurveTo(17, 20, 14, 21, 12, 21);
                c.fill();
                break;
            case 'blink':
                P([[4, 12], [14, 12]]);
                P([[10, 7], [15, 12], [10, 17]]);
                c.setLineDash([2, 4]);
                P([[19, 5], [19, 19]]);
                c.setLineDash([]);
                break;
            case 'wolf':
                P([[4, 18], [7, 8], [11, 12], [15, 8], [18, 18]], true);
                c.beginPath(); c.arc(6, 12, 1.5, 0, TAU); c.fill();
                c.beginPath(); c.arc(16, 12, 1.5, 0, TAU); c.fill();
                break;
            case 'eclipse':
                c.beginPath(); c.arc(12, 12, 9, 0, TAU); c.fill();
                c.globalCompositeOperation = 'destination-out';
                c.beginPath(); c.arc(16, 9, 8, 0, TAU); c.fill();
                break;
            case 'chest':
                c.strokeRect(3, 10, 18, 10);
                c.beginPath(); c.arc(12, 10, 9, Math.PI, TAU); c.stroke();
                c.fillRect(11, 12, 3, 5);
                break;
            case 'map':
                P([[3, 6], [9, 3], [15, 6], [21, 3], [21, 18], [15, 21], [9, 18], [3, 21]], true);
                P([[9, 3], [9, 18]]);
                P([[15, 6], [15, 21]]);
                break;
            case 'book':
                c.strokeRect(4, 3, 16, 18);
                P([[8, 7], [16, 7]]);
                P([[8, 11], [16, 11]]);
                P([[8, 15], [13, 15]]);
                break;
            case 'mask':
                c.beginPath();
                c.moveTo(4, 5); c.quadraticCurveTo(12, 2, 20, 5);
                c.quadraticCurveTo(18, 17, 12, 21);
                c.quadraticCurveTo(6, 17, 4, 5);
                c.stroke();
                c.beginPath(); c.arc(9, 10, 2, 0, TAU); c.fill();
                c.beginPath(); c.arc(15, 10, 2, 0, TAU); c.fill();
                break;
            case 'seal':
                c.beginPath(); c.arc(12, 9, 6, 0, TAU); c.stroke();
                P([[12, 15], [12, 21]]);
                P([[8, 19], [16, 19]]);
                break;
            case 'dice':
                c.strokeRect(4, 4, 16, 16);
                c.beginPath(); c.arc(8, 8, 1.4, 0, TAU); c.fill();
                c.beginPath(); c.arc(16, 16, 1.4, 0, TAU); c.fill();
                c.beginPath(); c.arc(12, 12, 1.4, 0, TAU); c.fill();
                break;
            case 'belt':
                c.strokeRect(3, 9, 18, 6);
                c.strokeRect(9, 7, 6, 10);
                break;
            case 'feather':
                c.beginPath();
                c.moveTo(6, 20); c.quadraticCurveTo(8, 6, 19, 4);
                c.quadraticCurveTo(18, 15, 6, 20);
                c.stroke();
                P([[6, 20], [16, 8]]);
                break;
            case 'magnet':
                c.beginPath(); c.arc(12, 12, 8, Math.PI, 0); c.stroke();
                P([[4, 12], [4, 18]]);
                P([[20, 12], [20, 18]]);
                break;
            case 'armor':
                P([[8, 3], [16, 3], [20, 8], [17, 21], [7, 21], [4, 8]], true);
                P([[12, 3], [12, 21]]);
                break;
            case 'helm':
                c.beginPath(); c.arc(12, 13, 9, Math.PI, TAU); c.stroke();
                P([[3, 13], [3, 17], [21, 17], [21, 13]]);
                c.strokeRect(9, 13, 6, 3);
                break;
            case 'ring':
                c.beginPath(); c.arc(12, 14, 6, 0, TAU); c.stroke();
                P([[12, 5], [9, 8], [12, 11], [15, 8]], true);
                break;
            case 'amulet':
                c.beginPath(); c.arc(12, 9, 7, 0.4, Math.PI - 0.4); c.stroke();
                P([[12, 10], [17, 15], [12, 21], [7, 15]], true);
                break;
            case 'skull':
                c.beginPath(); c.arc(12, 10, 7, 0, TAU); c.stroke();
                c.fillRect(9, 15, 6, 4);
                c.beginPath(); c.arc(9, 10, 1.8, 0, TAU); c.fill();
                c.beginPath(); c.arc(15, 10, 1.8, 0, TAU); c.fill();
                break;
            case 'pause':
                c.fillRect(7, 5, 3.5, 14);
                c.fillRect(13.5, 5, 3.5, 14);
                break;
            case 'close':
                P([[6, 6], [18, 18]]);
                P([[18, 6], [6, 18]]);
                break;
            case 'check':
                P([[5, 13], [10, 18], [19, 6]]);
                break;
            case 'arrow':
                P([[4, 12], [20, 12]]);
                P([[14, 6], [20, 12], [14, 18]]);
                break;
            case 'flame':
                c.beginPath(); c.arc(12, 14, 6, 0, TAU); c.stroke();
                P([[12, 2], [12, 8]]);
                break;
            default:
                c.beginPath();
                c.moveTo(12, 3); c.lineTo(21, 12); c.lineTo(12, 21); c.lineTo(3, 12);
                c.closePath(); c.stroke();
        }
        c.restore();
    },
    tooltip(title, lines, x, y, color) {
        this.deferred.push(() => {
            const c = ctx;
            const titleLines = title ? [title] : [];
            const bodyLines = [];
            for (const l of lines || []) {
                const wrapped = this.wrap(l, 260 * this.s, 11);
                bodyLines.push(...wrapped);
            }
            const w = 290 * this.s;
            const h = (titleLines.length * 18 + bodyLines.length * 15 + 14) * this.s;
            let bx = x + 16 * this.s;
            let by = y + 12 * this.s;
            if (bx + w > VIEW.w - 10) bx = x - w - 14 * this.s;
            if (by + h > VIEW.h - 10) by = VIEW.h - h - 10;
            if (by < 10) by = 10;
            c.save();
            c.shadowColor = 'rgba(0,0,0,0.7)';
            c.shadowBlur = 18;
            c.fillStyle = 'rgba(10,8,15,0.97)';
            roundRect(c, bx, by, w, h, 7 * this.s);
            c.fill();
            c.shadowBlur = 0;
            c.strokeStyle = hexToRgba(color || UI_COLORS.gold, 0.5);
            c.lineWidth = 1;
            c.stroke();
            let ty = by + 16 * this.s;
            if (title) {
                this.text(title, bx + 10 * this.s, ty, 12, color || UI_COLORS.gold, 'left', '700');
                ty += 18 * this.s;
            }
            for (const l of bodyLines) {
                this.text(l, bx + 10 * this.s, ty, 11, UI_COLORS.text, 'left', '400');
                ty += 15 * this.s;
            }
            c.restore();
        });
    },

    // -------------------------------------------------------------
    // NOTIFICAÇÕES
    // -------------------------------------------------------------
    drawNotifications(game) {
        const c = ctx;
        let y = 132 * this.s;
        for (let i = 0; i < game.notifications.length; i++) {
            const n = game.notifications[i];
            const a = clamp(n.life / 0.5, 0, 1) * clamp((n.maxLife - n.life) / 0.2, 0, 1);
            if (a <= 0) continue;
            c.save();
            c.globalAlpha = a;
            c.font = this.font(12, '700');
            const w = Math.min(VIEW.w * 0.6, c.measureText(n.text).width + 46 * this.s);
            const x = VIEW.w / 2 - w / 2;
            c.fillStyle = 'rgba(10,8,16,0.86)';
            roundRect(c, x, y, w, 28 * this.s, 6 * this.s);
            c.fill();
            c.strokeStyle = hexToRgba(n.color, 0.55);
            c.lineWidth = 1;
            c.stroke();
            c.fillStyle = n.color;
            c.beginPath();
            c.arc(x + 14 * this.s, y + 14 * this.s, 3.5 * this.s, 0, TAU);
            c.fill();
            c.font = this.font(12, '700');
            c.fillStyle = UI_COLORS.text;
            c.textAlign = 'left';
            c.textBaseline = 'middle';
            c.fillText(n.text, x + 26 * this.s, y + 14 * this.s);
            c.restore();
            y += 33 * this.s;
        }
    },

    // -------------------------------------------------------------
    // MINIMAPA
    // -------------------------------------------------------------
    drawMinimap(game, x, y, w, h) {
        const c = ctx;
        c.save();
        c.fillStyle = 'rgba(8,6,13,0.88)';
        roundRect(c, x, y, w, h, 7 * this.s);
        c.fill();
        c.strokeStyle = 'rgba(168,140,220,0.25)';
        c.lineWidth = 1;
        c.stroke();
        c.clip();
        const sc = Math.min(w / 4000, h / 3300);
        const cx = x + w / 2, cy = y + h / 2;
        const m = p => ({ x: cx + p.x * sc, y: cy + p.y * sc });
        // salas
        for (const room of game.rooms || []) {
            const a = m({ x: room.x, y: room.y });
            c.fillStyle = room.type === 'boss' ? 'rgba(255,95,109,0.14)' : 'rgba(140,120,190,0.10)';
            c.fillRect(a.x, a.y, room.w * sc, room.h * sc);
            c.strokeStyle = 'rgba(160,140,200,0.14)';
            c.strokeRect(a.x, a.y, room.w * sc, room.h * sc);
        }
        // armadilhas
        for (const t of game.traps) {
            const a = m(t);
            c.fillStyle = 'rgba(255,110,80,0.5)';
            c.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
        }
        // interagíveis
        for (const it of game.interactables) {
            if (it.used || it.kind === 'portal') continue;
            const a = m(it);
            c.fillStyle = it.color;
            c.beginPath(); c.arc(a.x, a.y, 2.6, 0, TAU); c.fill();
        }
        // inimigos
        for (const e of game.enemies) {
            if (e.hp <= 0) continue;
            const a = m(e);
            if (e.isBoss) {
                c.fillStyle = '#ff4d6d';
                c.beginPath(); c.arc(a.x, a.y, 4.5, 0, TAU); c.fill();
            } else {
                c.fillStyle = e.elite ? '#ffb347' : 'rgba(255,90,90,0.85)';
                c.beginPath(); c.arc(a.x, a.y, 2, 0, TAU); c.fill();
            }
        }
        // jogador
        const p = m(game.player);
        c.save();
        c.translate(p.x, p.y);
        c.rotate(game.player.aim);
        c.fillStyle = '#7fe7ff';
        c.beginPath();
        c.moveTo(5, 0); c.lineTo(-3, 3.2); c.lineTo(-3, -3.2);
        c.closePath(); c.fill();
        c.restore();
        c.restore();
        this.text('MAPA', x + 8 * this.s, y + 11 * this.s, 9, UI_COLORS.faint, 'left', '700');
    }
};


/* ----------------------------------------------------------------
   MÓDULO: menus.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — TELAS DE MENU
   ================================================================ */
'use strict';

Object.assign(UI, {

    dimBackground(alpha = 0.72) {
        ctx.save();
        ctx.fillStyle = `rgba(5,4,9,${alpha})`;
        ctx.fillRect(0, 0, VIEW.w, VIEW.h);
        ctx.restore();
    },

    screenFrame(title, subtitle, opts = {}) {
        const s = this.s;
        const w = Math.min(VIEW.w - 32 * s, 1260 * s);
        const h = Math.min(VIEW.h - 32 * s, 720 * s);
        const x = (VIEW.w - w) / 2;
        const y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, {
            title, subtitle,
            accent: opts.accent || UI_COLORS.gold,
            close: opts.close
        });
        return { x, y, w, h };
    },

    // -------------------------------------------------------------
    // MENU PRINCIPAL
    // -------------------------------------------------------------
    drawMenu(game) {
        const s = this.s, W = VIEW.w, H = VIEW.h;
        const c = ctx;
        // moldura decorativa
        c.save();
        c.strokeStyle = 'rgba(232,196,106,0.18)';
        c.lineWidth = 1;
        c.strokeRect(18 * s, 18 * s, W - 36 * s, H - 36 * s);
        c.strokeStyle = 'rgba(232,196,106,0.08)';
        c.strokeRect(26 * s, 26 * s, W - 52 * s, H - 52 * s);
        // cantos
        const corner = 34 * s;
        c.strokeStyle = 'rgba(232,196,106,0.5)';
        c.lineWidth = 2;
        for (const [cx, cy, dx, dy] of [[18 * s, 18 * s, 1, 1], [W - 18 * s, 18 * s, -1, 1], [18 * s, H - 18 * s, 1, -1], [W - 18 * s, H - 18 * s, -1, -1]]) {
            c.beginPath();
            c.moveTo(cx + dx * corner, cy);
            c.lineTo(cx, cy);
            c.lineTo(cx, cy + dy * corner);
            c.stroke();
        }
        c.restore();

        const leftX = Math.max(W * 0.08, 60 * s);
        const titleY = H * 0.20;
        // brasas
        this.decorEmbers();

        this.title('SHADOW DUNGEON', leftX, titleY, Math.min(64 * s, W * 0.055), '#efe3c8', 'left');
        this.text('O   S E L O   D E   V A H L', leftX + 3 * s, titleY + 42 * s, 12.5, UI_COLORS.gold, 'left', '700');
        ctx.save();
        ctx.strokeStyle = 'rgba(232,196,106,0.35)';
        ctx.beginPath();
        ctx.moveTo(leftX, titleY + 60 * s);
        ctx.lineTo(leftX + Math.min(420 * s, W * 0.34), titleY + 60 * s);
        ctx.stroke();
        ctx.restore();

        const bw = Math.min(330 * s, W * 0.28);
        const bh = 46 * s;
        let by = titleY + 100 * s;
        const gap = 9 * s;
        const main = [
            { label: 'Iniciar Expedição', icon: 'sword', primary: true, act: () => game.startRun() },
            { label: 'Arsenal & Classe', icon: 'shield', act: () => game.setState('loadout') },
            { label: 'Loja Permanente', icon: 'coin', act: () => game.setState('meta'), sub: `${fmt(SAVE.coins)} moedas` },
            { label: 'Conquistas', icon: 'crown', act: () => game.setState('achievements'), sub: `${Object.keys(SAVE.achievements).length}/${ACHIEVEMENTS.length}` },
            { label: 'Códice', icon: 'book', act: () => game.setState('codex') },
            { label: 'Configurações', icon: 'rune', act: () => game.setState('settings') }
        ];
        main.forEach(b => {
            this.button(leftX, by, bw, bh, b.label, {
                icon: b.icon, primary: b.primary, sub: b.sub,
                onClick: b.act, fontSize: b.primary ? 15 : 13.5
            });
            by += bh + gap;
        });

        // atalho de retomada
        if (game.runActive && game.player && !game.player.dead) {
            this.button(leftX, by + 4 * s, bw, 34 * s, 'Continuar Expedição', {
                icon: 'arrow', color: UI_COLORS.success,
                onClick: () => game.resumeRun()
            });
        }

        // painel de perfil
        const pw = Math.min(430 * s, W * 0.32);
        const px = W - pw - Math.max(W * 0.07, 44 * s);
        const py = H * 0.155;
        const ph = Math.min(560 * s, H * 0.66);
        this.panel(px, py, pw, ph, { title: 'PERFIL DA ALMA', accent: UI_COLORS.gold });

        const ic = 18 * s;
        let ry = py + 82 * s;
        const statRow = (icon, label, value, color) => {
            this.icon(icon, px + 30 * s, ry, ic, color);
            this.text(label, px + 48 * s, ry, 12, UI_COLORS.dim);
            this.text(value, px + pw - 26 * s, ry, 13.5, color, 'right', '700');
            ry += 33 * s;
        };
        statRow('coin', 'Moedas', fmt(SAVE.coins), UI_COLORS.gold);
        statRow('xp', 'Almas', fmt(SAVE.souls), UI_COLORS.xp);
        statRow('rune', 'Melhor Onda', String(SAVE.bestWave), '#e9e3d6');
        statRow('crown', 'Chefes Caídos', fmt(SAVE.stats.bosses), UI_COLORS.danger);
        statRow('skull', 'Abates Totais', fmt(SAVE.stats.kills), UI_COLORS.dim);
        statRow('map', 'Tempo Jogado', fmtTime(SAVE.stats.playtime), UI_COLORS.dim);

        ctx.save();
        ctx.strokeStyle = 'rgba(232,196,106,0.16)';
        ctx.beginPath();
        ctx.moveTo(px + 24 * s, ry - 8 * s);
        ctx.lineTo(px + pw - 24 * s, ry - 8 * s);
        ctx.stroke();
        ctx.restore();
        ry += 12 * s;

        const cls = CLASSES[SAVE.selected.classId] || CLASSES.warrior;
        const wpn = WEAPONS[SAVE.selected.weaponId] || WEAPONS.twilight;
        this.text('CARREGAMENTO', px + 24 * s, ry, 10.5, UI_COLORS.faint, 'left', '700');
        ry += 22 * s;
        this.icon(cls.icon, px + 34 * s, ry + 6 * s, 26 * s, cls.color);
        this.text(cls.name, px + 56 * s, ry, 13, '#f0e8d8', 'left', '700');
        this.text(`Dificuldade: ${(DIFFICULTY_LABEL[SAVE.selected.difficulty] || 'Normal')}`, px + 56 * s, ry + 18 * s, 10.5, UI_COLORS.dim);
        ry += 44 * s;
        this.icon(wpn.icon, px + 34 * s, ry + 4 * s, 24 * s, wpn.color);
        this.text(wpn.name, px + 56 * s, ry, 12.5, RARITIES[wpn.rarity].color, 'left', '700');
        this.text(`Dano ${wpn.damage} · Alcance ${wpn.reach}`, px + 56 * s, ry + 17 * s, 10.5, UI_COLORS.dim);
        ry += 46 * s;

        const ach = Object.keys(SAVE.achievements).length;
        this.text(`CONQUISTAS  ${ach}/${ACHIEVEMENTS.length}`, px + 24 * s, ry, 10.5, UI_COLORS.faint, 'left', '700');
        this.bar(px + 24 * s, ry + 12 * s, pw - 48 * s, 8 * s, ach, ACHIEVEMENTS.length, UI_COLORS.gold);
        ry += 34 * s;

        this.text('SELO DE PROGRESSO', px + 24 * s, ry, 10.5, UI_COLORS.faint, 'left', '700');
        ry += 16 * s;
        this.text(`Recorde: onda ${SAVE.bestWave} · ${fmt(SAVE.bestScore)} pontos`, px + 24 * s, ry, 11, UI_COLORS.dim);

        this.text(`v3.0 · ${game.version || '1.0'}`, px + pw - 24 * s, py + ph - 16 * s, 9.5, UI_COLORS.faint, 'right');

        // rodapé de controles
        const fy = H - 42 * s;
        ctx.save();
        ctx.fillStyle = 'rgba(8,6,13,0.7)';
        roundRect(ctx, 30 * s, fy - 14 * s, W - 60 * s, 28 * s, 6 * s);
        ctx.fill();
        ctx.restore();
        this.text('WASD mover · Mouse mirar · Clique atacar · Clique direito golpe pesado · Shift/Espaço dash · Q E R F habilidades · G interagir · I inventário · ESC pausa',
            W / 2, fy, 10.5, UI_COLORS.dim, 'center');
    },

    decorEmbers() {
        const c = ctx;
        const t = this.time;
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 26; i++) {
            const seed = i * 91.7;
            const x = (Math.sin(seed) * 0.5 + 0.5) * VIEW.w;
            const speed = 12 + (i % 5) * 5;
            const y = VIEW.h - ((t * speed + i * 73) % (VIEW.h + 120));
            const a = 0.06 + (i % 3) * 0.03;
            c.fillStyle = i % 4 === 0 ? `rgba(196,107,255,${a})` : `rgba(232,196,106,${a})`;
            c.beginPath();
            c.arc(x + Math.sin(t * 0.8 + i) * 18, y, 1.2 + (i % 3) * 0.7, 0, TAU);
            c.fill();
        }
        c.restore();
    },

    // -------------------------------------------------------------
    // ARSENAL / CARREGAMENTO
    // -------------------------------------------------------------
    drawLoadout(game) {
        const r = this.screenFrame('ARSENAL & CLASSE', 'Escolha quem desce e com o que luta', {
            close: () => game.setState('menu')
        });
        const s = this.s;
        const sel = SAVE.selected;
        const rightW = Math.min(430 * s, r.w * 0.36);
        const rightX = r.x + r.w - rightW - 22 * s;
        const leftX = r.x + 24 * s;
        const leftW = rightX - leftX - 22 * s;
        let y = r.y + 76 * s;

        // classes
        this.text('CLASSE', leftX, y, 11, UI_COLORS.gold, 'left', '700');
        y += 16 * s;
        const cw = (leftW - 20 * s) / 3;
        const ch = 100 * s;
        Object.values(CLASSES).forEach((cls, i) => {
            const cols = 3;
            const cx = leftX + (i % cols) * (cw + 10 * s);
            const cy = y + Math.floor(i / cols) * (ch + 9 * s);
            const owned = SAVE.unlocked.classes.includes(cls.id);
            const selected = sel.classId === cls.id;
            this.card(cx, cy, cw, ch, {
                color: owned ? cls.color : '#6b6478',
                selected,
                draw: (c, x, yy, w, h, hot) => {
                    this.icon(cls.icon, x + 22 * s, yy + 24 * s, 22 * s, owned ? cls.color : '#5a5464');
                    this.text(cls.short, x + 40 * s, yy + 20 * s, 12.5, owned ? '#f0e8d8' : '#8f8798', 'left', '700');
                    this.text(cls.difficulty, x + 40 * s, yy + 34 * s, 9.5, owned ? cls.color : '#6b6478', 'left', '700');
                    this.text(cls.passive, x + 12 * s, yy + 58 * s, 10.5, owned ? '#cfc4e0' : '#7d7689', 'left', '600');
                    if (!owned) {
                        this.icon('coin', x + 22 * s, yy + 82 * s, 13 * s, UI_COLORS.gold);
                        this.text(fmt(cls.cost), x + 34 * s, yy + 82 * s, 11, UI_COLORS.gold, 'left', '700');
                        this.text(SAVE.coins >= cls.cost ? 'Desbloquear' : 'Bloqueado', x + w - 12 * s, yy + 82 * s, 9.5, SAVE.coins >= cls.cost ? UI_COLORS.success : UI_COLORS.faint, 'right');
                    } else if (selected) {
                        this.text('SELECIONADO', x + w - 12 * s, yy + 82 * s, 9.5, cls.color, 'right', '700');
                    }
                    this.text(cls.tags.join(' · '), x + 12 * s, yy + 74 * s, 8.8, '#8f8798', 'left');
                    if (hot) this.tooltip(cls.name, [cls.desc, `Passiva — ${cls.passive}: ${cls.passiveDesc}`], x, yy, cls.color);
                },
                onClick: () => game.selectOrUnlockClass(cls.id)
            });
        });
        y += ch * 2 + 30 * s;

        // armas
        this.text('ARSENAL', leftX, y, 11, UI_COLORS.gold, 'left', '700');
        y += 16 * s;
        const ww = (leftW - 30 * s) / 4;
        const wh = 58 * s;
        Object.values(WEAPONS).forEach((w, i) => {
            const wx = leftX + (i % 4) * (ww + 10 * s);
            const wy = y + Math.floor(i / 4) * (wh + 8 * s);
            const owned = SAVE.unlocked.weapons.includes(w.id);
            const selected = sel.weaponId === w.id;
            const rar = RARITIES[w.rarity];
            this.card(wx, wy, ww, wh, {
                color: owned ? w.color : '#6b6478', selected,
                draw: (c, x, yy, width, h, hot) => {
                    this.icon(w.icon, x + 20 * s, yy + h / 2, 20 * s, owned ? w.color : '#5a5464');
                    this.text(w.name, x + 36 * s, yy + h / 2 - 7 * s, 10, owned ? '#f0e8d8' : '#8f8798', 'left', '700');
                    this.text(owned ? rar.name : `${fmt(w.cost)} moedas`, x + 36 * s, yy + h / 2 + 9 * s, 9, owned ? rar.color : UI_COLORS.gold, 'left', '600');
                    if (selected) {
                        c.save();
                        c.fillStyle = hexToRgba(w.color, 0.75);
                        c.beginPath(); c.arc(x + width - 10 * s, yy + 10 * s, 2.6 * s, 0, TAU); c.fill();
                        c.restore();
                    }
                    if (hot) this.tooltip(w.name, [w.desc, `Dano ${w.damage} · Alcance ${w.reach} · Recarga ${w.cooldown}s`, w.special], x, yy, rar.color);
                },
                onClick: () => game.selectOrUnlockWeapon(w.id)
            });
        });
        y += wh * 2 + 26 * s;

        // habilidades
        this.text(`HABILIDADES  ${sel.skills.length}/4`, leftX, y, 11, UI_COLORS.gold, 'left', '700');
        this.text('Clique para equipar ou remover', leftX + 150 * s, y, 9.5, UI_COLORS.faint, 'left');
        y += 16 * s;
        const sw = (leftW - 60 * s) / 7;
        const sh = 42 * s;
        Object.values(SKILLS).forEach((sk, i) => {
            const sx = leftX + (i % 7) * (sw + 10 * s);
            const sy = y + Math.floor(i / 7) * (sh + 7 * s);
            const owned = SAVE.unlocked.skills.includes(sk.id);
            const selected = sel.skills.includes(sk.id);
            this.card(sx, sy, sw, sh, {
                color: owned ? sk.color : '#6b6478', selected,
                draw: (c, x, yy, width, h, hot) => {
                    this.icon(sk.icon, x + 15 * s, yy + h / 2, 17 * s, owned ? sk.color : '#5a5464');
                    const nameLines = this.wrap(sk.name, width - 32 * s, 8.6, '700');
                    this.text(nameLines[0] || sk.name, x + 28 * s, yy + h / 2 - (nameLines[1] ? 5 * s : 0), 8.6, owned ? '#efe7d8' : '#8f8798', 'left', '700');
                    if (nameLines[1]) this.text(nameLines[1], x + 28 * s, yy + h / 2 + 6 * s, 8.6, owned ? '#efe7d8' : '#8f8798', 'left', '700');
                    if (!owned) {
                        this.icon('coin', x + 10 * s, yy + h - 8 * s, 10 * s, UI_COLORS.gold);
                        this.text(fmt(sk.cost), x + 18 * s, yy + h - 8 * s, 8.5, UI_COLORS.gold, 'left', '700');
                    } else if (selected) {
                        c.save();
                        c.fillStyle = hexToRgba(sk.color, 0.8);
                        c.beginPath(); c.arc(x + width - 8 * s, yy + 8 * s, 2.4 * s, 0, TAU); c.fill();
                        c.restore();
                    }
                    if (hot) this.tooltip(sk.name, [sk.desc, `Mana ${sk.mana} · Recarga ${sk.cooldown}s`, sk.formula], x, yy, sk.color);
                },
                onClick: () => game.toggleOrUnlockSkill(sk.id)
            });
        });

        // ---------------- painel direito ----------------
        const cls = CLASSES[sel.classId] || CLASSES.warrior;
        const wpn = WEAPONS[sel.weaponId] || WEAPONS.twilight;
        this.panel(rightX, r.y + 76 * s, rightW, r.h - 100 * s, {
            title: 'RESUMO DA EXPEDIÇÃO', accent: cls.color
        });
        let ry = r.y + 138 * s;
        this.icon(cls.icon, rightX + 34 * s, ry, 30 * s, cls.color);
        this.text(cls.name, rightX + 58 * s, ry - 8 * s, 15, '#f2ead9', 'left', '700', 'Georgia, serif');
        this.text(cls.title, rightX + 58 * s, ry + 9 * s, 10, cls.color, 'left', '600');
        ry += 34 * s;
        this.text(`Vida ${cls.base.maxHp} · Mana ${cls.base.maxMana} · Dano ${Math.round(cls.base.damage * 100)}% · Crítico ${Math.round(cls.base.crit * 100)}%`, rightX + 24 * s, ry, 10, UI_COLORS.dim);
        ry += 20 * s;
        this.paragraph(cls.passiveDesc, rightX + 24 * s, ry, rightW - 48 * s, 10.5, '#bdb3cc', 1.45);
        ry += 52 * s;

        this.text('ARMA EQUIPADA', rightX + 24 * s, ry, 10, UI_COLORS.faint, 'left', '700');
        ry += 18 * s;
        this.icon(wpn.icon, rightX + 34 * s, ry + 4 * s, 20 * s, wpn.color);
        this.text(wpn.name, rightX + 52 * s, ry, 11.5, RARITIES[wpn.rarity].color, 'left', '700');
        this.text(wpn.special, rightX + 52 * s, ry + 16 * s, 9.5, UI_COLORS.dim);
        ry += 42 * s;

        this.text('DIFICULDADE', rightX + 24 * s, ry, 10, UI_COLORS.faint, 'left', '700');
        ry += 18 * s;
        const dw = (rightW - 48 * s - 12 * s) / 3;
        Object.keys(DIFFICULTIES).forEach((d, i) => {
            const dd = DIFFICULTIES[d];
            const selected = sel.difficulty === d;
            this.button(rightX + 24 * s + i * (dw + 6 * s), ry, dw, 34 * s, dd.short, {
                primary: selected,
                color: selected ? dd.color : UI_COLORS.gold,
                fontSize: 10.5,
                onClick: () => game.setDifficulty(d)
            });
        });
        ry += 50 * s;

        this.text(`MODIFICADORES  ${sel.modifiers.length}/3`, rightX + 24 * s, ry, 10, UI_COLORS.faint, 'left', '700');
        ry += 18 * s;
        Object.values(MODIFIERS).forEach((m, i) => {
            const on = sel.modifiers.includes(m.id);
            const mx = rightX + 24 * s;
            const mw = rightW - 48 * s;
            const mh = 34 * s;
            const yy = ry + i * (mh + 5 * s);
            const hot = this.hover(mx, yy, mw, mh);
            const clicked = this.consumeClick(mx, yy, mw, mh);
            this.push(mx, yy, mw, mh, 'mod_' + m.id, () => game.toggleModifier(m.id));
            ctx.save();
            ctx.fillStyle = on ? hexToRgba(m.color, 0.18) : hot ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)';
            roundRect(ctx, mx, yy, mw, mh, 6 * s);
            ctx.fill();
            ctx.strokeStyle = on ? hexToRgba(m.color, 0.8) : 'rgba(255,255,255,0.10)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            this.icon(m.icon, mx + 16 * s, yy + mh / 2, 14 * s, on ? m.color : UI_COLORS.faint);
            this.text(m.name, mx + 30 * s, yy + mh / 2, 10.5, on ? '#f2ead9' : UI_COLORS.dim, 'left', '700');
            this.text(on ? 'ATIVO' : 'inativo', mx + mw - 12 * s, yy + mh / 2, 8.5, on ? m.color : UI_COLORS.faint, 'right', '700');
            if (hot) this.tooltip(m.name, [m.desc], mx, yy, m.color);
            if (clicked) { Sound.play('ui'); game.toggleModifier(m.id); }
        });

        const btnY = r.y + r.h - 46 * s;
        this.button(rightX, btnY, rightW - 110 * s, 34 * s, 'Iniciar Expedição', {
            primary: true, icon: 'sword', color: '#e8c46a',
            onClick: () => game.startRun()
        });
        this.button(rightX + rightW - 100 * s, btnY, 100 * s, 34 * s, 'Voltar', {
            onClick: () => game.setState('menu')
        });
    },

    // -------------------------------------------------------------
    // PAUSA
    // -------------------------------------------------------------
    drawPause(game) {
        this.dimBackground(0.68);
        const s = this.s;
        const w = 430 * s, h = 470 * s;
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, { title: 'EXPEDIÇÃO PAUSADA', accent: UI_COLORS.gold });
        let by = y + 86 * s;
        const bw = w - 60 * s, bx = x + 30 * s;
        this.text(`Onda ${game.wave} · Nível ${game.player.level} · ${fmtTime(game.runTime)}`, x + w / 2, by, 11.5, UI_COLORS.dim, 'center');
        by += 34 * s;
        this.button(bx, by, bw, 42 * s, 'Continuar', { primary: true, icon: 'arrow', onClick: () => game.resumeRun() });
        by += 52 * s;
        this.button(bx, by, bw, 38 * s, 'Inventário & Equipamento', { icon: 'chest', onClick: () => game.setState('inventory') });
        by += 48 * s;
        this.button(bx, by, bw, 38 * s, 'Configurações', { icon: 'rune', onClick: () => game.openSettings('paused') });
        by += 48 * s;
        this.button(bx, by, bw, 38 * s, 'Como Jogar', { icon: 'book', onClick: () => game.showTutorial() });
        by += 50 * s;
        this.button(bx, by, bw, 38 * s,
            game.confirmAbandon ? 'Clique para confirmar o abandono' : 'Abandonar Expedição',
            {
                color: UI_COLORS.danger, icon: 'close',
                onClick: () => {
                    if (game.confirmAbandon) game.abandonRun();
                    else { game.confirmAbandon = true; game.notify('Clique novamente para abandonar (o ouro é convertido).', UI_COLORS.danger); }
                }
            });
        this.text('ESC retoma a expedição', x + w / 2, y + h - 22 * s, 10, UI_COLORS.faint, 'center');
    },

    // -------------------------------------------------------------
    // CONFIGURAÇÕES
    // -------------------------------------------------------------
    drawSettings(game) {
        const r = this.screenFrame('CONFIGURAÇÕES', 'Áudio, acessibilidade e apresentação', {
            close: () => game.closeSettings()
        });
        const s = this.s;
        const x = r.x + 30 * s;
        const w = r.w - 60 * s;
        let y = r.y + 78 * s;
        const st = SAVE.settings;

        this.text('ÁUDIO', x, y, 11, UI_COLORS.gold, 'left', '700');
        y += 22 * s;
        const slider = (label, key) => {
            const sw = 260 * s;
            const sx = x + w - sw - 10 * s;
            this.text(label, x, y, 12, UI_COLORS.text);
            const val = st[key];
            this.text(`${Math.round(val * 100)}%`, x + w - 10 * s, y, 11, UI_COLORS.gold, 'right', '700');
            this.bar(sx, y - 6 * s, sw, 12 * s, val, 1, UI_COLORS.gold, { glow: false });
            if (this.hover(sx, y - 12 * s, sw, 24 * s)) {
                if (this.click) {
                    const nx = clamp((this.click.x - sx) / sw, 0, 1);
                    st[key] = Math.round(nx * 100) / 100;
                    this.click = null;
                    if (key === 'master' || key === 'sfx' || key === 'music') Sound.applyVolumes();
                    Sound.play('ui');
                }
            }
            y += 34 * s;
        };
        slider('Volume Geral', 'master');
        slider('Música', 'music');
        slider('Efeitos', 'sfx');
        slider('Tremor de Câmera', 'shake');
        slider('Partículas', 'particles');
        y += 6 * s;

        this.text('APRESENTAÇÃO & ACESSIBILIDADE', x, y, 11, UI_COLORS.gold, 'left', '700');
        y += 22 * s;
        const toggles = [
            ['damageNumbers', 'Números de dano'],
            ['flash', 'Flash de tela'],
            ['autoAttack', 'Ataque automático'],
            ['invertAim', 'Inverter mira (eixo X)'],
            ['showFps', 'Exibir FPS'],
            ['colorblind', 'Modo daltônico']
        ];
        const tw = (w - 14 * s) / 2;
        toggles.forEach((t, i) => {
            const tx = x + (i % 2) * (tw + 14 * s);
            const ty = y + Math.floor(i / 2) * 44 * s;
            const on = !!st[t[0]];
            const hot = this.hover(tx, ty, tw, 36 * s);
            const clicked = this.consumeClick(tx, ty, tw, 36 * s);
            this.push(tx, ty, tw, 36 * s, 'set_' + t[0], () => game.toggleSetting(t[0]));
            ctx.save();
            ctx.fillStyle = hot ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)';
            roundRect(ctx, tx, ty, tw, 36 * s, 6 * s);
            ctx.fill();
            ctx.strokeStyle = on ? 'rgba(232,196,106,0.45)' : 'rgba(255,255,255,0.10)';
            ctx.stroke();
            ctx.restore();
            this.text(t[1], tx + 12 * s, ty + 18 * s, 11.5, on ? '#f0e8d8' : UI_COLORS.dim);
            const bx = tx + tw - 46 * s, by = ty + 9 * s;
            ctx.save();
            ctx.fillStyle = on ? 'rgba(232,196,106,0.85)' : 'rgba(90,84,100,0.8)';
            roundRect(ctx, bx, by, 34 * s, 18 * s, 9 * s);
            ctx.fill();
            ctx.fillStyle = on ? '#141019' : '#d4cfdc';
            ctx.beginPath();
            ctx.arc(bx + (on ? 25 : 9) * s, by + 9 * s, 6.5 * s, 0, TAU);
            ctx.fill();
            ctx.restore();
            if (clicked) { Sound.play('ui'); game.toggleSetting(t[0]); }
        });

        const by = r.y + r.h - 44 * s;
        this.button(x, by, 160 * s, 34 * s, 'Restaurar padrões', {
            icon: 'rune', onClick: () => {
                SAVE.settings = defaultSave().settings;
                Sound.applyVolumes();
                game.notify('Configurações restauradas.', UI_COLORS.gold);
            }
        });
        this.button(x + w - 140 * s, by, 140 * s, 34 * s, 'Voltar', {
            icon: 'arrow', onClick: () => game.closeSettings()
        });
        this.text('As configurações são salvas automaticamente.', x + w / 2, by + 16 * s, 9.5, UI_COLORS.faint, 'center');
    },

    // -------------------------------------------------------------
    // FIM DE JOGO
    // -------------------------------------------------------------
    drawGameOver(game) {
        this.dimBackground(0.78);
        const s = this.s;
        const w = Math.min(760 * s, VIEW.w - 30), h = Math.min(620 * s, VIEW.h - 30);
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, { title: game.runWon ? 'O SELO FOI QUEBRADO' : 'VOCÊ CAIU NA ESCURIDÃO', accent: game.runWon ? UI_COLORS.success : UI_COLORS.danger });
        this.text(game.deathCause || 'A masmorra reclama mais um nome.', x + w / 2, y + 80 * s, 12, UI_COLORS.dim, 'center');

        const stats = game.lastRunSummary || {};
        const entries = [
            ['Onda Alcançada', String(game.wave), UI_COLORS.gold],
            ['Nível', String(game.player ? game.player.level : 1), UI_COLORS.xp],
            ['Abates', fmt(stats.kills || 0), UI_COLORS.danger],
            ['Dano Causado', fmt(stats.damageDealt || 0), '#ff9f43'],
            ['Dano Recebido', fmt(stats.damageTaken || 0), UI_COLORS.danger],
            ['Chefes', String(stats.bosses || 0), '#ffd166'],
            ['Ouro Coletado', fmt(stats.gold || 0), UI_COLORS.gold],
            ['Tempo', fmtTime(game.runTime), UI_COLORS.dim]
        ];
        const gw = (w - 80 * s) / 2;
        let gy = y + 110 * s;
        entries.forEach((e, i) => {
            const ex = x + 40 * s + (i % 2) * (gw + 4 * s);
            const ey = gy + Math.floor(i / 2) * 34 * s;
            ctx.save();
            ctx.fillStyle = 'rgba(255,255,255,0.025)';
            roundRect(ctx, ex, ey - 13 * s, gw - 8 * s, 28 * s, 5 * s);
            ctx.fill();
            ctx.restore();
            this.text(e[0], ex + 10 * s, ey, 10.5, UI_COLORS.dim);
            this.text(e[1], ex + gw - 22 * s, ey, 12.5, e[2], 'right', '700');
        });
        gy += 4 * 34 * s + 12 * s;

        // conversão
        const coins = Math.floor((game.gold || 0) * 0.55) + (game.soulsRun || 0) * 2;
        this.panel(x + 30 * s, gy - 12 * s, w - 60 * s, 68 * s, { top: 'rgba(28,23,38,0.95)', bottom: 'rgba(18,14,26,0.95)' });
        this.icon('coin', x + 56 * s, gy + 22 * s, 22 * s, UI_COLORS.gold);
        this.text('Conversão de Ouro em Moedas', x + 78 * s, gy + 10 * s, 11.5, UI_COLORS.text, 'left', '600');
        this.text(`${fmt(game.gold || 0)} ouro → ${fmt(coins)} moedas permanentes`, x + 78 * s, gy + 30 * s, 10.5, UI_COLORS.dim);
        if (game.newRecord) this.text('NOVO RECORDE!', x + w - 52 * s, gy + 22 * s, 10.5, UI_COLORS.success, 'right', '700');

        const by = y + h - 58 * s;
        this.button(x + 40 * s, by, (w - 100 * s) / 3, 40 * s, 'Tentar Novamente', {
            primary: true, icon: 'sword', onClick: () => game.retryRun()
        });
        this.button(x + 40 * s + (w - 100 * s) / 3 + 10 * s, by, (w - 100 * s) / 3, 40 * s, 'Arsenal', {
            icon: 'shield', onClick: () => game.setState('loadout')
        });
        this.button(x + 40 * s + (w - 100 * s) * 2 / 3 + 20 * s, by, (w - 100 * s) / 3, 40 * s, 'Menu Principal', {
            icon: 'arrow', onClick: () => game.returnToMenu()
        });
    },

    // -------------------------------------------------------------
    // HISTÓRIA / TUTORIAL
    // -------------------------------------------------------------
    drawStory(game) {
        const s = this.s;
        const story = game.storyModal;
        if (!story) return;
        this.dimBackground(0.7);
        const w = Math.min(680 * s, VIEW.w - 30);
        const h = Math.min(420 * s, VIEW.h - 30);
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, { title: story.title || 'INSCRIÇÃO', accent: '#7fe7ff', close: () => game.closeStory() });
        let ty = y + 92 * s;
        if (story.subtitle) {
            this.text(story.subtitle, x + 32 * s, ty, 10, '#7fe7ff', 'left', '700');
            ty += 22 * s;
        }
        ty = this.paragraph(story.text, x + 32 * s, ty + 6 * s, w - 64 * s, 13.5, '#ddd5ea', 1.75);
        if (story.lines) {
            story.lines.forEach(l => {
                ty += 6 * s;
                this.text(l, x + 32 * s, ty, 11.5, UI_COLORS.dim);
                ty += 18 * s;
            });
        }
        this.button(x + w - 160 * s, y + h - 50 * s, 130 * s, 34 * s, 'Fechar', {
            icon: 'check', primary: true, onClick: () => game.closeStory()
        });
        if (story.reward) this.text(`Recompensa: ${story.reward}`, x + 32 * s, y + h - 34 * s, 10.5, UI_COLORS.gold);
    }
});

const DIFFICULTY_LABEL = { normal: 'Normal', nightmare: 'Pesadelo', abyss: 'Abismo' };


/* ----------------------------------------------------------------
   MÓDULO: screens.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — TELAS DE JOGO E COLEÇÃO
   ================================================================ */
'use strict';

const STAT_LABELS = {
    damagePct: 'Dano', maxHpFlat: 'Vida', maxHpPct: 'Vida Máx.', critChance: 'Crítico',
    critDamage: 'Dano Crítico', armor: 'Armadura', moveSpeed: 'Velocidade',
    attackSpeed: 'Vel. de Ataque', skillPower: 'Poder Mágico', lifesteal: 'Roubo de Vida',
    thorns: 'Reflexo', maxMana: 'Mana', regen: 'Regeneração', goldPct: 'Ouro', xpPct: 'XP'
};
const STAT_PCT = ['damagePct', 'maxHpPct', 'critChance', 'critDamage', 'armor', 'moveSpeed',
    'attackSpeed', 'skillPower', 'lifesteal', 'goldPct', 'xpPct'];

function statLine(k, v) {
    const label = STAT_LABELS[k] || k;
    const value = STAT_PCT.includes(k) ? `${v > 0 ? '+' : ''}${(Math.round(v * 10) / 10)}%` : `${v > 0 ? '+' : ''}${Math.round(v * 10) / 10}`;
    return `${value} ${label}`;
}

function itemSellPrice(item) {
    const rar = RARITIES[item.rarity] || RARITIES.common;
    return Math.max(6, Math.round(10 * rar.mult + (item.level || 1) * 2));
}

Object.assign(UI, {

    // -------------------------------------------------------------
    // INVENTÁRIO
    // -------------------------------------------------------------
    drawInventory(game) {
        const back = () => game.setState(game.runActive && !game.player.dead ? 'paused' : 'menu');
        const r = this.screenFrame('INVENTÁRIO', `Ouro da expedição: ${fmt(game.gold)} · Sacola ${game.player.backpack.length}/24`, {
            close: back, accent: '#b06bff'
        });
        const s = this.s;
        const p = game.player;
        const leftX = r.x + 24 * s;
        const top = r.y + 76 * s;

        // equipamento
        this.text('EQUIPAMENTO', leftX, top, 10.5, UI_COLORS.gold, 'left', '700');
        const ew = 160 * s, eh = 88 * s;
        EQUIP_SLOTS.forEach((slot, i) => {
            const ex = leftX + (i % 2) * (ew + 9 * s);
            const ey = top + 16 * s + Math.floor(i / 2) * (eh + 8 * s);
            const item = p.gear[slot.id];
            const ra = item ? RARITIES[item.rarity] : null;
            const selected = game.inventorySelected === 'gear:' + slot.id;
            this.card(ex, ey, ew, eh, {
                color: ra ? ra.color : '#6b6478', selected,
                draw: (c, x, y, w, h, hot) => {
                    this.icon(item ? slot.icon : slot.icon, x + 20 * s, y + 22 * s, 18 * s, ra ? ra.color : '#5a5464');
                    this.text(slot.name, x + 34 * s, y + 18 * s, 9, UI_COLORS.faint, 'left', '700');
                    if (item) {
                        this.text(item.name, x + 10 * s, y + 44 * s, 9.6, ra.color, 'left', '700');
                        this.text(RARITIES[item.rarity].name, x + 10 * s, y + 60 * s, 8.5, ra.color, 'left');
                        if (item.unique && UNIQUE_EFFECTS[item.unique]) this.text(UNIQUE_EFFECTS[item.unique].name, x + 10 * s, y + 74 * s, 8, UNIQUE_EFFECTS[item.unique].color, 'left', '700');
                    } else {
                        this.text('Vazio', x + 10 * s, y + 52 * s, 9.5, UI_COLORS.faint, 'left');
                    }
                    if (hot && item) this.tooltip(item.name, this.itemTooltip(item), x, y, ra.color);
                },
                onClick: () => { game.inventorySelected = 'gear:' + slot.id; }
            });
        });

        // relíquias
        const relicY = top + 16 * s + 3 * (eh + 8 * s) + 14 * s;
        this.text(`RELÍQUIAS  ${p.relics.length}`, leftX, relicY, 10.5, UI_COLORS.gold, 'left', '700');
        if (!p.relics.length) this.text('Nenhuma relíquia carregada.', leftX, relicY + 22 * s, 9.5, UI_COLORS.faint);
        p.relics.forEach((id, i) => {
            const rel = RELICS[id];
            if (!rel) return;
            const rx = leftX + (i % 3) * 106 * s;
            const ry = relicY + 16 * s + Math.floor(i / 3) * 34 * s;
            const hot = this.hover(rx, ry, 100 * s, 28 * s);
            ctx.save();
            ctx.fillStyle = hot ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)';
            roundRect(ctx, rx, ry, 100 * s, 28 * s, 5 * s);
            ctx.fill();
            ctx.strokeStyle = 'rgba(176,107,255,0.3)';
            ctx.stroke();
            ctx.restore();
            this.icon(rel.icon, rx + 14 * s, ry + 14 * s, 14 * s, '#b06bff');
            this.text(rel.name, rx + 24 * s, ry + 14 * s, 7.6, '#e6dcf5', 'left', '600');
            if (hot) this.tooltip(rel.name, [rel.desc, rel.flavor], rx, ry, '#b06bff');
        });

        // sacola
        const bagX = leftX + 2 * (ew + 9 * s) + 26 * s;
        const slotSize = 66 * s;
        const cols = 4;
        this.text('SACOLA', bagX, top, 10.5, UI_COLORS.gold, 'left', '700');
        this.text('Clique para selecionar', bagX + 90 * s, top, 9, UI_COLORS.faint);
        for (let i = 0; i < 24; i++) {
            const bx = bagX + (i % cols) * (slotSize + 7 * s);
            const by = top + 16 * s + Math.floor(i / cols) * (slotSize + 7 * s);
            const item = p.backpack[i];
            const selected = game.inventorySelected === i;
            const ra = item ? RARITIES[item.rarity] : null;
            this.card(bx, by, slotSize, slotSize, {
                color: ra ? ra.color : '#6b6478', selected,
                draw: (c, x, y, w, h, hot) => {
                    if (!item) {
                        c.save();
                        c.strokeStyle = 'rgba(255,255,255,0.07)';
                        c.setLineDash([3, 4]);
                        c.strokeRect(x + 6 * s, y + 6 * s, w - 12 * s, h - 12 * s);
                        c.restore();
                        return;
                    }
                    const slotDef = EQUIP_SLOTS.find(v => v.id === item.slot) || EQUIP_SLOTS[0];
                    this.icon(slotDef.icon, x + w / 2, y + h / 2 - 5 * s, 24 * s, ra.color);
                    c.save();
                    c.fillStyle = ra.color;
                    c.fillRect(x + 6 * s, y + h - 10 * s, w - 12 * s, 2);
                    c.restore();
                    this.text(ra.name, x + w / 2, y + h - 16 * s, 7, ra.color, 'center', '700');
                    if (hot) this.tooltip(item.name, this.itemTooltip(item), x, y, ra.color);
                },
                onClick: () => { game.inventorySelected = i; }
            });
        }

        // detalhes
        const dx = r.x + r.w - 392 * s;
        const dw = 368 * s;
        const dy = top;
        const dh = r.h - 100 * s;
        this.panel(dx, dy, dw, dh, { title: 'DETALHES', accent: UI_COLORS.gold });
        let ty = dy + 76 * s;
        const sel = game.inventorySelected;
        let item = null, gearSlot = null;
        if (typeof sel === 'number') item = p.backpack[sel];
        else if (typeof sel === 'string' && sel.startsWith('gear:')) {
            gearSlot = sel.slice(5);
            item = p.gear[gearSlot];
        }

        if (item) {
            const ra = RARITIES[item.rarity];
            this.text(item.name, dx + 20 * s, ty, 15, ra.color, 'left', '700', 'Georgia, serif');
            ty += 22 * s;
            const slotDef = EQUIP_SLOTS.find(v => v.id === item.slot);
            this.text(`${ra.name} · ${slotDef ? slotDef.name : item.slot} · Nível ${item.level || 1}`, dx + 20 * s, ty, 9.8, UI_COLORS.dim);
            ty += 22 * s;
            for (const k in item.stats) {
                this.text(statLine(k, item.stats[k]), dx + 24 * s, ty, 10.5, '#9fe8b0');
                ty += 17 * s;
            }
            if (item.unique && UNIQUE_EFFECTS[item.unique]) {
                const u = UNIQUE_EFFECTS[item.unique];
                ty += 4 * s;
                this.text(`◆ ${u.name}`, dx + 22 * s, ty, 10.5, u.color, 'left', '700');
                ty += 15 * s;
                ty = this.paragraph(u.desc, dx + 22 * s, ty, dw - 44 * s, 9.6, UI_COLORS.dim, 1.4);
            }
            if (item.setId && SETS[item.setId]) {
                const set = SETS[item.setId];
                ty += 4 * s;
                this.text(`✦ ${set.name} (${p.setCounts[item.setId] || 0} peças)`, dx + 22 * s, ty, 10.5, set.color, 'left', '700');
                ty += 15 * s;
                ty = this.paragraph(`2 peças: ${set.bonus2}`, dx + 22 * s, ty, dw - 44 * s, 9.2, UI_COLORS.dim, 1.35);
                ty = this.paragraph(`3 peças: ${set.bonus3}`, dx + 22 * s, ty, dw - 44 * s, 9.2, UI_COLORS.dim, 1.35);
            }
            ty += 8 * s;
            const equipped = typeof sel === 'number' ? p.gear[item.slot] : null;
            if (equipped && equipped !== item) {
                this.text('EQUIPADO ATUALMENTE', dx + 20 * s, ty, 8.5, UI_COLORS.faint, 'left', '700');
                this.text(equipped.name, dx + 20 * s, ty + 14 * s, 9.5, RARITIES[equipped.rarity].color);
                ty += 34 * s;
            }
            const by = dy + dh - 54 * s;
            if (typeof sel === 'number') {
                this.button(dx + 20 * s, by, 150 * s, 34 * s, 'Equipar', {
                    primary: true, icon: 'check', onClick: () => game.equipBackpackItem(sel)
                });
                this.button(dx + 180 * s, by, 168 * s, 34 * s, `Vender (${fmt(itemSellPrice(item))})`, {
                    icon: 'coin', onClick: () => game.sellBackpackItem(sel)
                });
            } else if (gearSlot) {
                this.button(dx + 20 * s, by, dw - 40 * s, 34 * s, 'Desequipar para a sacola', {
                    icon: 'chest', onClick: () => game.unequipSlot(gearSlot)
                });
            }
        } else {
            this.text('Nenhum item selecionado', dx + 20 * s, ty, 11, UI_COLORS.faint);
            ty += 26 * s;
            this.text('Selecione um equipamento da sacola para ver atributos, equipar ou vender.', dx + 20 * s, ty, 10, UI_COLORS.dim);
            ty += 26 * s;
            this.text('ATRIBUTOS ATUAIS', dx + 20 * s, ty, 10, UI_COLORS.gold, 'left', '700');
            ty += 20 * s;
            const st = p.stats;
            const rows = [
                ['Vida', `${Math.round(p.hp)} / ${Math.round(p.maxHp)}`],
                ['Mana', `${Math.round(p.mana)} / ${Math.round(p.maxMana)}`],
                ['Dano', `${Math.round(st.damageMult * 100)}%`],
                ['Crítico', `${Math.round(st.critChance * 100)}%`],
                ['Dano Crítico', `${Math.round(st.critDamage * 100)}%`],
                ['Armadura', `${Math.round(st.armor * 100)}%`],
                ['Roubo de Vida', `${Math.round(st.lifesteal * 100)}%`],
                ['Poder Mágico', `${Math.round(st.skillPower * 100)}%`],
                ['Recarga', `${Math.round((1 - st.cooldownMult) * 100)}%`],
                ['Velocidade', `${Math.round(st.moveSpeed)}`]
            ];
            rows.forEach((row, i) => {
                const cy = ty + i * 17 * s;
                this.text(row[0], dx + 24 * s, cy, 10, UI_COLORS.dim);
                this.text(row[1], dx + dw - 24 * s, cy, 10, '#e9e3d6', 'right', '600');
            });
        }
    },

    itemTooltip(item) {
        const lines = [];
        Object.keys(item.stats || {}).forEach(k => lines.push(statLine(k, item.stats[k])));
        if (item.unique && UNIQUE_EFFECTS[item.unique]) lines.push(`◆ ${UNIQUE_EFFECTS[item.unique].name}: ${UNIQUE_EFFECTS[item.unique].desc}`);
        if (item.setId && SETS[item.setId]) lines.push(`✦ Conjunto: ${SETS[item.setId].name}`);
        return lines;
    },

    // -------------------------------------------------------------
    // LEVEL UP
    // -------------------------------------------------------------
    drawLevelUp(game) {
        this.dimBackground(0.7);
        const s = this.s;
        const choices = game.levelChoices || [];
        const w = Math.min(1000 * s, VIEW.w - 30);
        const h = Math.min(540 * s, VIEW.h - 30);
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, {
            title: 'NÍVEL ' + game.player.level,
            subtitle: 'Escolha uma melhoria para esta expedição',
            accent: UI_COLORS.xp
        });
        this.text(`${game.player.pendingLevelUps} escolha(s) pendente(s)`, x + w - 28 * s, y + 28 * s, 10, UI_COLORS.dim, 'right');
        const cw = Math.min(290 * s, (w - 90 * s) / 3);
        const gap = (w - 40 * s - cw * 3) / 2;
        const cy = y + 92 * s;
        const ch = h - 150 * s;
        choices.forEach((up, i) => {
            const cx = x + 20 * s + i * (cw + gap);
            const rar = RARITIES[up.rarity] || RARITIES.common;
            const stacks = game.upgradeCounts ? (game.upgradeCounts[up.id] || 0) : 0;
            this.card(cx, cy, cw, ch, {
                color: rar.color,
                draw: (c, bx, by, bw, bh, hot) => {
                    c.save();
                    c.globalCompositeOperation = 'lighter';
                    glowCircle(c, bx + bw / 2, by + 52 * s, 80 * s, rar.color, 0.10);
                    c.restore();
                    this.icon(up.icon, bx + bw / 2, by + 52 * s, 40 * s, rar.color);
                    this.text(up.name, bx + bw / 2, by + 96 * s, 15, '#f2ead9', 'center', '700', 'Georgia, serif');
                    this.text(rar.name.toUpperCase() + ' · ' + (up.category || 'melhoria').toUpperCase(), bx + bw / 2, by + 116 * s, 8.5, rar.color, 'center', '700');
                    this.paragraph(up.desc, bx + 20 * s, by + 142 * s, bw - 40 * s, 10.5, '#c9c0d8', 1.55);
                    const max = up.max || 8;
                    this.text(`Nível ${stacks}/${max}`, bx + bw / 2, by + bh - 40 * s, 9.5, UI_COLORS.dim, 'center');
                    this.bar(bx + 24 * s, by + bh - 26 * s, bw - 48 * s, 6 * s, stacks, max, rar.color, { glow: false });
                    if (hot) this.tooltip(up.name, [up.desc, `Categoria: ${up.category || 'geral'}`, `Máximo: ${max}`], bx, by, rar.color);
                },
                onClick: () => game.chooseUpgrade(up.id)
            });
        });
        this.text('Escolha com sabedoria: cada decisão molda a build.', x + w / 2, y + h - 28 * s, 10, UI_COLORS.faint, 'center');
    },

    // -------------------------------------------------------------
    // ESCOLHA DE RELÍQUIA
    // -------------------------------------------------------------
    drawRelicChoice(game) {
        this.dimBackground(0.72);
        const s = this.s;
        const ids = game.relicChoices || [];
        const w = Math.min(1000 * s, VIEW.w - 30);
        const h = Math.min(540 * s, VIEW.h - 30);
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, {
            title: 'RELÍQUIA ENCONTRADA',
            subtitle: 'Poder tem preço. Escolha o seu.',
            accent: '#b06bff'
        });
        const cw = Math.min(290 * s, (w - 90 * s) / 3);
        const gap = (w - 40 * s - cw * 3) / 2;
        const cy = y + 92 * s;
        const ch = h - 150 * s;
        ids.forEach((id, i) => {
            const rel = RELICS[id];
            if (!rel) return;
            const rar = RARITIES[rel.rarity] || RARITIES.epic;
            const cx = x + 20 * s + i * (cw + gap);
            this.card(cx, cy, cw, ch, {
                color: rar.color,
                draw: (c, bx, by, bw, bh, hot) => {
                    c.save();
                    c.globalCompositeOperation = 'lighter';
                    glowCircle(c, bx + bw / 2, by + 58 * s, 86 * s, rar.color, 0.12);
                    c.restore();
                    this.icon(rel.icon, bx + bw / 2, by + 58 * s, 42 * s, rar.color);
                    this.text(rel.name, bx + bw / 2, by + 104 * s, 15, '#f2ead9', 'center', '700', 'Georgia, serif');
                    this.text(rar.name.toUpperCase(), bx + bw / 2, by + 124 * s, 8.5, rar.color, 'center', '700');
                    this.paragraph(rel.desc, bx + 22 * s, by + 150 * s, bw - 44 * s, 10.5, '#e2d8ef', 1.55);
                    this.paragraph(rel.flavor, bx + 22 * s, by + bh - 74 * s, bw - 44 * s, 9.2, UI_COLORS.faint, 1.4);
                    this.text('EQUIPAR', bx + bw / 2, by + bh - 20 * s, 10, rar.color, 'center', '700');
                    if (hot) this.tooltip(rel.name, [rel.desc, rel.flavor], bx, by, rar.color);
                },
                onClick: () => game.chooseRelic(id)
            });
        });
    },

    // -------------------------------------------------------------
    // MERCADOR
    // -------------------------------------------------------------
    drawMerchant(game) {
        this.dimBackground(0.7);
        const s = this.s;
        const w = Math.min(1060 * s, VIEW.w - 30);
        const h = Math.min(640 * s, VIEW.h - 30);
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, {
            title: 'MERCADOR ERRANTE',
            subtitle: '“Ouro por trânsito. Tudo tem preço, até a sua sobrevivência.”',
            accent: UI_COLORS.gold,
            close: () => game.closeMerchant()
        });
        this.icon('coin', x + w - 170 * s, y + 32 * s, 16 * s, UI_COLORS.gold);
        this.text(fmt(game.gold), x + w - 150 * s, y + 32 * s, 14, UI_COLORS.gold, 'left', '700');

        const offers = game.merchantOffers || [];
        const n = Math.max(1, offers.length);
        const cw = Math.min(232 * s, (w - 60 * s - (n - 1) * 12 * s) / n);
        const ch = h - 170 * s;
        const cy = y + 94 * s;
        offers.forEach((o, i) => {
            const cx = x + 30 * s + i * (cw + 12 * s);
            const color = o.color || UI_COLORS.gold;
            this.card(cx, cy, cw, ch, {
                color,
                draw: (c, bx, by, bw, bh, hot) => {
                    c.save();
                    c.globalCompositeOperation = 'lighter';
                    glowCircle(c, bx + bw / 2, by + 54 * s, 74 * s, color, 0.10);
                    c.restore();
                    this.icon(o.icon || 'chest', bx + bw / 2, by + 54 * s, 36 * s, color);
                    this.text(o.title, bx + bw / 2, by + 92 * s, 12.5, '#f2ead9', 'center', '700');
                    this.paragraph(o.desc, bx + 16 * s, by + 114 * s, bw - 32 * s, 9.6, UI_COLORS.dim, 1.5);
                    if (o.item) {
                        const ra = RARITIES[o.item.rarity];
                        this.text(ra.name + ' · ' + o.item.slot, bx + bw / 2, by + bh - 76 * s, 8.5, ra.color, 'center', '700');
                    }
                    if (o.sold) {
                        this.text('VENDIDO', bx + bw / 2, by + bh - 22 * s, 11, UI_COLORS.faint, 'center', '700');
                    } else {
                        const can = game.gold >= o.price;
                        this.button(bx + 14 * s, by + bh - 40 * s, bw - 28 * s, 30 * s, `${fmt(o.price)} moedas`, {
                            primary: can, color: can ? UI_COLORS.gold : '#5a5464', fontSize: 10.5,
                            icon: 'coin', disabled: !can,
                            onClick: () => game.buyMerchantOffer(i)
                        });
                    }
                }
            });
        });

        const by = y + h - 52 * s;
        this.button(x + 30 * s, by, 190 * s, 34 * s, 'Sortear ofertas', {
            icon: 'dice', sub: `${Math.round(25 + game.wave * 3)} moedas`,
            onClick: () => game.rerollMerchant()
        });
        this.button(x + w - 200 * s, by, 170 * s, 34 * s, 'Sair da loja', {
            icon: 'arrow', onClick: () => game.closeMerchant()
        });
        this.text('As ofertas são exclusivas desta expedição.', x + w / 2, y + h - 30 * s, 9.5, UI_COLORS.faint, 'center');
    },

    // -------------------------------------------------------------
    // EVENTO
    // -------------------------------------------------------------
    drawEvent(game) {
        const ev = game.currentEvent;
        if (!ev) return;
        this.dimBackground(0.74);
        const s = this.s;
        const w = Math.min(760 * s, VIEW.w - 30);
        const h = Math.min(560 * s, VIEW.h - 30);
        const x = (VIEW.w - w) / 2, y = (VIEW.h - h) / 2;
        this.panel(x, y, w, h, { title: ev.title, subtitle: ev.subtitle, accent: ev.color || UI_COLORS.gold });
        this.text(ev.icon ? '' : '', x, y, 1);
        if (ev.icon) this.icon(ev.icon, x + w / 2, y + 92 * s, 40 * s, ev.color || UI_COLORS.gold);
        let ty = y + 132 * s;
        ty = this.paragraph(ev.text, x + 40 * s, ty, w - 80 * s, 12, '#d8d0e5', 1.65);
        ty += 16 * s;
        const options = ev.options || [];
        const oh = 62 * s;
        options.forEach((o, i) => {
            const oy = ty + i * (oh + 10 * s);
            const color = o.color || UI_COLORS.gold;
            const hot = this.hover(x + 40 * s, oy, w - 80 * s, oh);
            const clicked = this.consumeClick(x + 40 * s, oy, w - 80 * s, oh);
            this.push(x + 40 * s, oy, w - 80 * s, oh, 'ev_' + i, () => game.resolveEvent(i));
            ctx.save();
            ctx.fillStyle = hot ? hexToRgba(color, 0.16) : 'rgba(255,255,255,0.035)';
            roundRect(ctx, x + 40 * s, oy, w - 80 * s, oh, 8 * s);
            ctx.fill();
            ctx.strokeStyle = hot ? hexToRgba(color, 0.7) : 'rgba(255,255,255,0.12)';
            ctx.lineWidth = hot ? 1.6 : 1;
            ctx.stroke();
            ctx.restore();
            this.text(o.label, x + 60 * s, oy + 22 * s, 13, hot ? '#fff6e2' : '#efe7d8', 'left', '700');
            this.text(o.desc || '', x + 60 * s, oy + 42 * s, 10, UI_COLORS.dim);
            this.icon('arrow', x + w - 66 * s, oy + oh / 2, 16 * s, color);
            if (clicked) { Sound.play('confirm'); game.resolveEvent(i); }
        });
    },

    // -------------------------------------------------------------
    // LOJA PERMANENTE
    // -------------------------------------------------------------
    drawMeta(game) {
        const r = this.screenFrame('LOJA PERMANENTE', 'Melhorias que atravessam a morte', {
            close: () => game.setState('menu'), accent: UI_COLORS.gold
        });
        const s = this.s;
        this.icon('coin', r.x + r.w - 170 * s, r.y + 28 * s, 18 * s, UI_COLORS.gold);
        this.text(fmt(SAVE.coins), r.x + r.w - 148 * s, r.y + 28 * s, 16, UI_COLORS.gold, 'left', '700');
        this.text('MOEDAS', r.x + r.w - 148 * s, r.y + 44 * s, 8, UI_COLORS.faint, 'left', '700');

        const cols = 3;
        const cw = (r.w - 72 * s - (cols - 1) * 12 * s) / cols;
        const chh = (r.h - 122 * s - 3 * 10 * s) / 4;
        META_UPGRADES.forEach((u, i) => {
            const cx = r.x + 24 * s + (i % cols) * (cw + 12 * s);
            const cy = r.y + 76 * s + Math.floor(i / cols) * (chh + 10 * s);
            const level = SAVE.meta[u.key] || 0;
            const maxed = level >= u.max;
            const cost = u.cost(level);
            const can = SAVE.coins >= cost;
            this.card(cx, cy, cw, chh, {
                color: maxed ? UI_COLORS.success : can ? UI_COLORS.gold : '#6b6478',
                draw: (c, x, y, w, h, hot) => {
                    this.icon(u.icon, x + 26 * s, y + 26 * s, 22 * s, maxed ? UI_COLORS.success : UI_COLORS.gold);
                    this.text(u.name, x + 46 * s, y + 20 * s, 11.8, '#f0e8d8', 'left', '700');
                    this.text(u.desc, x + 46 * s, y + 36 * s, 9.2, UI_COLORS.dim);
                    const bx = x + 14 * s, bw = w - 28 * s, by = y + h - 30 * s;
                    this.bar(bx, by, bw, 8 * s, level, u.max, maxed ? UI_COLORS.success : UI_COLORS.gold, { glow: false });
                    this.text(`${level}/${u.max}`, x + w - 14 * s, y + 52 * s, 8.5, UI_COLORS.faint, 'right');
                    if (maxed) {
                        this.text('MÁXIMO', x + w / 2, y + h - 12 * s, 9.5, UI_COLORS.success, 'center', '700');
                    } else {
                        this.icon('coin', x + 24 * s, y + h - 12 * s, 11 * s, can ? UI_COLORS.gold : UI_COLORS.faint);
                        this.text(fmt(cost), x + 34 * s, y + h - 12 * s, 10, can ? UI_COLORS.gold : UI_COLORS.faint, 'left', '700');
                        this.text(can ? 'Comprar' : 'Sem moedas', x + w - 16 * s, y + h - 12 * s, 8.5, can ? UI_COLORS.success : UI_COLORS.faint, 'right');
                    }
                    if (hot) this.tooltip(u.name, [u.desc, `Nível ${level}/${u.max}`, maxed ? 'Totalmente aprimorado.' : `Próximo nível: ${fmt(cost)} moedas`], x, y, maxed ? UI_COLORS.success : UI_COLORS.gold);
                },
                onClick: () => game.buyMeta(u.key)
            });
        });
        this.text('Dica: chefes e ondas altas concedem mais moedas. Relíquias e equipamentos tornam cada descida única.', r.x + r.w / 2, r.y + r.h - 18 * s, 9.5, UI_COLORS.faint, 'center');
    },

    // -------------------------------------------------------------
    // CONQUISTAS
    // -------------------------------------------------------------
    drawAchievements(game) {
        const r = this.screenFrame('CONQUISTAS', 'Feitos registrados no selo', {
            close: () => game.setState('menu'), accent: UI_COLORS.gold
        });
        const s = this.s;
        const done = Object.keys(SAVE.achievements).length;
        this.text(`${done} / ${ACHIEVEMENTS.length}`, r.x + r.w - 30 * s, r.y + 28 * s, 16, UI_COLORS.gold, 'right', '700');
        this.bar(r.x + 24 * s, r.y + 62 * s, r.w - 48 * s, 6 * s, done, ACHIEVEMENTS.length, UI_COLORS.gold, { glow: false });

        const cols = 3;
        const cw = (r.w - 72 * s) / cols;
        const chh = (r.h - 140 * s) / 6;
        ACHIEVEMENTS.forEach((a, i) => {
            const cx = r.x + 24 * s + (i % cols) * cw;
            const cy = r.y + 80 * s + Math.floor(i / cols) * chh;
            const ok = !!SAVE.achievements[a.id];
            const w = cw - 10 * s, h = chh - 8 * s;
            this.card(cx, cy, w, h, {
                color: ok ? UI_COLORS.gold : '#5a5464',
                draw: (c, x, y, ww, hh, hot) => {
                    this.icon(a.icon, x + 26 * s, y + hh / 2, 20 * s, ok ? UI_COLORS.gold : '#5a5464');
                    this.text(a.name, x + 44 * s, y + 18 * s, 10.5, ok ? '#f2ead9' : '#8f8798', 'left', '700');
                    this.text(a.desc, x + 44 * s, y + 34 * s, 8.6, ok ? UI_COLORS.dim : '#6b6478');
                    this.text(ok ? 'CONCLUÍDA' : `Recompensa: ${a.reward}`, x + 44 * s, y + hh - 14 * s, 8.2, ok ? UI_COLORS.success : UI_COLORS.gold, 'left', '700');
                    if (ok) this.icon('check', x + ww - 18 * s, y + hh / 2, 14 * s, UI_COLORS.success);
                    if (hot) this.tooltip(a.name, [a.desc, `Recompensa: ${a.reward} moedas`, ok ? 'Concluída' : 'Pendente'], x, y, ok ? UI_COLORS.gold : '#8f8798');
                }
            });
        });
    },

    // -------------------------------------------------------------
    // CÓDICE
    // -------------------------------------------------------------
    drawCodex(game) {
        const r = this.screenFrame('CÓDICE', 'Tudo o que o Abismo já sussurrou', {
            close: () => game.setState('menu'), accent: '#7fe7ff'
        });
        const s = this.s;
        const tabs = [
            { id: 'enemies', label: 'Criaturas', icon: 'skull' },
            { id: 'bosses', label: 'Chefes', icon: 'crown' },
            { id: 'story', label: 'História', icon: 'book' },
            { id: 'biomes', label: 'Biomas', icon: 'map' }
        ];
        const tabW = (r.w - 48 * s - 3 * 8 * s) / 4;
        tabs.forEach((t, i) => {
            const tx = r.x + 24 * s + i * (tabW + 8 * s);
            this.button(tx, r.y + 68 * s, tabW, 32 * s, t.label, {
                primary: game.codexTab === t.id, icon: t.icon, fontSize: 10.5,
                onClick: () => { game.codexTab = t.id; game.codexIndex = 0; }
            });
        });

        const listX = r.x + 24 * s;
        const listY = r.y + 112 * s;
        const listW = 290 * s;
        const listH = r.h - 138 * s;
        let entries = [];
        if (game.codexTab === 'enemies') {
            entries = Object.values(ENEMY_DEFS).map(d => ({
                id: d.id, name: d.name, found: !!SAVE.codex.enemies[d.id], data: d, kind: 'enemy'
            }));
        } else if (game.codexTab === 'bosses') {
            entries = BOSS_DEFS.map(d => ({
                id: d.id, name: d.name, found: !!SAVE.codex.bosses[d.id], data: d, kind: 'boss'
            }));
        } else if (game.codexTab === 'story') {
            entries = STORY.map(d => ({
                id: d.id, name: d.title, found: !!SAVE.codex.story[d.id], data: d, kind: 'story'
            }));
        } else {
            entries = BIOMES.map(d => ({
                id: d.id, name: d.name, found: !!SAVE.codex.biomes[d.id], data: d, kind: 'biome'
            }));
        }
        game.codexIndex = clamp(game.codexIndex || 0, 0, Math.max(0, entries.length - 1));

        this.panel(listX, listY, listW, listH, { top: 'rgba(18,15,26,0.9)', bottom: 'rgba(12,10,18,0.9)' });
        const rowH = 34 * s;
        entries.forEach((e, i) => {
            const ry = listY + 10 * s + i * rowH;
            if (ry + rowH > listY + listH) return;
            const selected = game.codexIndex === i;
            const hot = this.hover(listX + 6 * s, ry, listW - 12 * s, rowH - 3 * s);
            const clicked = this.consumeClick(listX + 6 * s, ry, listW - 12 * s, rowH - 3 * s);
            this.push(listX + 6 * s, ry, listW - 12 * s, rowH - 3 * s, 'cx_' + i, () => { game.codexIndex = i; });
            ctx.save();
            ctx.fillStyle = selected ? 'rgba(127,231,255,0.14)' : hot ? 'rgba(255,255,255,0.05)' : 'transparent';
            roundRect(ctx, listX + 6 * s, ry, listW - 12 * s, rowH - 3 * s, 5 * s);
            ctx.fill();
            ctx.restore();
            this.icon(e.kind === 'boss' ? 'crown' : e.kind === 'story' ? 'book' : e.kind === 'biome' ? 'map' : 'skull',
                listX + 22 * s, ry + rowH / 2, 13 * s, selected ? '#7fe7ff' : e.found ? UI_COLORS.text : '#5a5464');
            this.text(e.found ? e.name : '???', listX + 40 * s, ry + rowH / 2, 10.5,
                selected ? '#c8f4ff' : e.found ? '#cfc8d8' : '#5a5464', 'left', e.found ? '600' : '400');
            if (clicked) { Sound.play('ui'); game.codexIndex = i; }
        });

        const dx = listX + listW + 16 * s;
        const dw = r.x + r.w - dx - 24 * s;
        this.panel(dx, listY, dw, listH, { top: 'rgba(18,15,26,0.9)', bottom: 'rgba(12,10,18,0.9)' });
        const e = entries[game.codexIndex];
        if (!e) return;
        let ty = listY + 34 * s;
        if (!e.found) {
            this.icon('eye', dx + dw / 2, ty + 50 * s, 34 * s, '#5a5464');
            this.text('Ainda não catalogado', dx + dw / 2, ty + 90 * s, 14, '#8f8798', 'center', '700', 'Georgia, serif');
            this.text('Enfrente esta criatura, visite este bioma ou encontre este registro.', dx + dw / 2, ty + 114 * s, 10, UI_COLORS.faint, 'center');
            return;
        }
        const d = e.data;
        if (e.kind === 'enemy') {
            this.icon('skull', dx + 34 * s, ty, 24 * s, d.color);
            this.text(d.name, dx + 56 * s, ty - 6 * s, 16, '#eef6ff', 'left', '700', 'Georgia, serif');
            this.text(`Ameaça ${d.threat} · Surge na onda ${d.minWave}`, dx + 56 * s, ty + 12 * s, 9.5, UI_COLORS.dim);
            ty += 38 * s;
            ty = this.paragraph(d.desc, dx + 26 * s, ty, dw - 52 * s, 11.5, '#d5ccdf', 1.65);
            ty += 16 * s;
            const stats = [
                ['Vida Base', d.hp], ['Dano', d.damage], ['Velocidade', d.speed],
                ['Alcance', d.range], ['XP', d.xp], ['Moedas', d.coins]
            ];
            stats.forEach((st, i) => {
                const sx = dx + 26 * s + (i % 3) * ((dw - 52 * s) / 3);
                const sy = ty + Math.floor(i / 3) * 40 * s;
                ctx.save();
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                roundRect(ctx, sx, sy, (dw - 52 * s) / 3 - 8 * s, 32 * s, 5 * s);
                ctx.fill();
                ctx.restore();
                this.text(st[0], sx + 8 * s, sy + 11 * s, 8.5, UI_COLORS.faint);
                this.text(String(st[1]), sx + 8 * s, sy + 23 * s, 11, UI_COLORS.text, 'left', '700');
            });
        } else if (e.kind === 'boss') {
            this.icon('crown', dx + 34 * s, ty, 24 * s, d.color);
            this.text(d.name, dx + 56 * s, ty - 6 * s, 16, '#ffe8ea', 'left', '700', 'Georgia, serif');
            this.text(d.title, dx + 56 * s, ty + 12 * s, 10, d.accent, 'left', '600');
            ty += 42 * s;
            ty = this.paragraph(d.desc, dx + 26 * s, ty, dw - 52 * s, 11.5, '#d5ccdf', 1.65);
            ty += 10 * s;
            this.text(`“${d.quote}”`, dx + 26 * s, ty, 11.5, '#ffd166', 'left', '600', 'Georgia, serif');
            ty += 28 * s;
            this.text(`Onda ${d.wave} · Vida ${fmt(d.hp)} · Dano ${d.damage}`, dx + 26 * s, ty, 10, UI_COLORS.dim);
        } else if (e.kind === 'story') {
            this.text(d.title, dx + 26 * s, ty, 17, '#c8f4ff', 'left', '700', 'Georgia, serif');
            ty += 26 * s;
            ty = this.paragraph(d.text, dx + 26 * s, ty, dw - 52 * s, 12.5, '#ddd5ea', 1.75);
        } else {
            this.text(d.name, dx + 26 * s, ty, 17, d.accent, 'left', '700', 'Georgia, serif');
            ty += 26 * s;
            ty = this.paragraph(CODEX_BIOMES[d.id] || d.desc, dx + 26 * s, ty, dw - 52 * s, 12, '#d5ccdf', 1.7);
            ty += 12 * s;
            this.text('Criaturas conhecidas neste bioma:', dx + 26 * s, ty, 9.5, UI_COLORS.faint, 'left', '700');
            ty += 16 * s;
            this.text(Object.values(ENEMY_DEFS).filter(v => v.minWave <= 9).slice(0, 6).map(v => v.name).join(' · '), dx + 26 * s, ty, 9.8, UI_COLORS.dim);
        }
    }
});


/* ----------------------------------------------------------------
   MÓDULO: game.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — NÚCLEO DO JOGO
   ================================================================ */
'use strict';

const ARENA = { minX: -1900, maxX: 1900, minY: -1550, maxY: 1550 };
const TILE = 76;

class GameSession {
    constructor() {
        this.version = '3.0';
        this.state = 'menu';
        this.prevState = 'menu';
        this.runActive = false;
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.effects = [];
        this.particles = [];
        this.texts = [];
        this.loot = [];
        this.itemDrops = [];
        this.props = [];
        this.traps = [];
        this.interactables = [];
        this.minions = [];
        this.rooms = [];
        this.notifications = [];
        this.keys = {};
        this.attackHeld = false;
        this.heavyQueued = false;
        this.dashQueued = false;
        this.aimAngle = 0;
        this.time = 0;
        this.runTime = 0;
        this.hitStop = 0;
        this.flash = { color: '#ff2040', alpha: 0 };
        this.cam = { x: 0, y: 0, shake: 0, sx: 0, sy: 0 };
        this.wave = 1;
        this.waveState = 'intermission';
        this.waveTimer = 1.4;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveDamage = 0;
        this.maxEnemies = 110;
        this.gold = 0;
        this.soulsRun = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.biomeIndex = 0;
        this.biome = BIOMES[0];
        this.boss = null;
        this.notifications = [];
        this.banner = null;
        this.deathTimer = 0;
        this.confirmAbandon = false;
        this.inventorySelected = -1;
        this.settingsReturn = 'menu';
        this.storyModal = null;
        this.levelChoices = [];
        this.relicChoices = [];
        this.merchantOffers = [];
        this.currentEvent = null;
        this.codexTab = 'enemies';
        this.codexIndex = 0;
        this.upgradeCounts = {};
        this.runMods = {};
        this.difficulty = DIFFICULTIES.normal;
        this.stats = this.blankStats();
        this.lastRunSummary = null;
        this.newRecord = false;
        this.runWon = false;
        this.deathCause = '';
        this.lightCanvas = document.createElement('canvas');
        this.lightCtx = this.lightCanvas.getContext('2d');
        this.lastFrame = 0;
        this.fps = 60;
        this.fpsAccum = 0;
        this.fpsFrames = 0;
        this.saveTimer = 0;
        this.dungeonSeed = Math.random() * 10000;
        Sound.setTheme('menu');
        this.ensureLightCanvas();
        window.addEventListener('resize', () => this.ensureLightCanvas());
    }

    blankStats() {
        return {
            kills: 0, bosses: 0, elites: 0, chests: 0, goldEarned: 0,
            damageDealt: 0, damageTaken: 0, highestLevel: 1, bestCombo: 0,
            itemsFound: 0, perfectWaves: 0, storyFragments: 0, deaths: 0,
            skillsUsed: 0
        };
    }

    ensureLightCanvas() {
        const w = Math.max(1, Math.floor(VIEW.w / 2));
        const h = Math.max(1, Math.floor(VIEW.h / 2));
        if (this.lightCanvas.width !== w || this.lightCanvas.height !== h) {
            this.lightCanvas.width = w;
            this.lightCanvas.height = h;
        }
    }

    // =============================================================
    // ESTADO
    // =============================================================
    setState(state) {
        if (state === this.state) return;
        this.prevState = this.state;
        this.state = state;
        if (state === 'playing') {
            Sound.setTheme(this.boss ? 'boss' : (this.biome ? this.biome.music : 'menu'));
        } else if (state === 'menu' || state === 'loadout' || state === 'meta' ||
            state === 'achievements' || state === 'codex' || state === 'settings') {
            Sound.setTheme('menu');
        }
        UI.click = null;
    }

    notify(text, color = UI_COLORS.gold) {
        this.notifications.push({ text, color, life: 3.4, maxLife: 3.4 });
        if (this.notifications.length > 5) this.notifications.shift();
    }

    addFloatingText(x, y, text, color, crit) {
        if (this.texts.length > 90) return;
        this.texts.push(new FloatingText(x, y, text, color, crit));
    }

    addParticles(x, y, count, color, opts = {}) {
        const mult = settings().particles;
        const n = Math.max(0, Math.round(count * mult));
        if (!n) return;
        for (let i = 0; i < n; i++) {
            if (this.particles.length > 720) break;
            this.particles.push(new Particle(x, y, color, opts));
        }
    }

    shakeCamera(amount) {
        this.cam.shake = Math.min(18, this.cam.shake + amount * settings().shake);
    }

    flashScreen(color, alpha) {
        if (!settings().flash) return;
        this.flash.color = color;
        this.flash.alpha = Math.max(this.flash.alpha, alpha);
    }

    screenToWorld(sx, sy) {
        return { x: sx + this.cam.x, y: sy + this.cam.y };
    }

    nearestEnemy(x, y, radius = 99999) {
        let best = null, bd = radius * radius;
        for (const e of this.enemies) {
            if (e.hp <= 0 || e.dead || e.spawnTimer > 0) continue;
            const dx = e.x - x, dy = e.y - y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bd) { bd = d2; best = e; }
        }
        return best;
    }

    enemiesInRadius(x, y, radius) {
        const r2 = radius * radius;
        return this.enemies.filter(e => {
            if (e.hp <= 0 || e.dead) return false;
            const dx = e.x - x, dy = e.y - y;
            return dx * dx + dy * dy <= r2;
        });
    }

    // =============================================================
    // INÍCIO / FIM DE RUN
    // =============================================================
    startRun() {
        const sel = SAVE.selected;
        const clsId = CLASSES[sel.classId] ? sel.classId : 'warrior';
        const wpnId = WEAPONS[sel.weaponId] ? sel.weaponId : 'twilight';
        this.difficulty = DIFFICULTIES[sel.difficulty] || DIFFICULTIES.normal;
        this.buildRunMods();

        this.player = new Player({ classId: clsId, weaponId: wpnId, skills: sel.skills }, this.runMods);
        this.player.x = 0; this.player.y = 0;
        this.stats = this.blankStats();
        this.stats.highestLevel = 1;
        this.gold = 0;
        this.soulsRun = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.time = 0;
        this.runTime = 0;
        this.wave = 1;
        this.waveState = 'intermission';
        this.waveTimer = 1.8;
        this.spawnQueue = [];
        this.waveDamage = 0;
        this.boss = null;
        this.deathTimer = 0;
        this.confirmAbandon = false;
        this.inventorySelected = -1;
        this.upgradeCounts = {};
        this.levelChoices = [];
        this.relicChoices = [];
        this.merchantOffers = [];
        this.currentEvent = null;
        this.storyModal = null;
        this.lastRunSummary = null;
        this.newRecord = false;
        this.runWon = false;
        this.deathCause = '';
        this.finalized = false;
        this.biomeIndex = 0;
        this.biome = BIOMES[0];
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.effects = [];
        this.particles = [];
        this.texts = [];
        this.loot = [];
        this.itemDrops = [];
        this.minions = [];
        this.notifications = [];
        this.banner = null;
        this.traps = [];
        this.interactables = [];
        this.props = [];
        this.rooms = [];
        this.cam.x = this.player.x - VIEW.w / 2;
        this.cam.y = this.player.y - VIEW.h / 2;
        this.cam.shake = 0;

        this.generateDungeon();
        this.runActive = true;
        this.state = 'playing';
        this.runMods = this.runMods || {};

        if (!SAVE.stats.classesPlayed.includes(clsId)) SAVE.stats.classesPlayed.push(clsId);
        SAVE.runs = (SAVE.runs || 0) + 1;
        SAVE.stats.runs = (SAVE.stats.runs || 0) + 1;
        SAVE.selected.classId = clsId;
        SAVE.selected.weaponId = wpnId;

        this.notify(`${CLASSES[clsId].name} desce ao selo.`, CLASSES[clsId].color);
        this.notify(`Dificuldade: ${this.difficulty.name}`, this.difficulty.color);
        if (SAVE.selected.modifiers.length) {
            this.notify(`Modificadores: ${SAVE.selected.modifiers.map(id => MODIFIERS[id].name).join(', ')}`, '#b06bff');
        }
        Sound.setTheme(this.biome.music);
        Sound.play('confirm');
        this.saveProgress();

        if (!SAVE.tutorialSeen) {
            SAVE.tutorialSeen = true;
            this.storyModal = {
                title: 'O SELO DE VAHL',
                subtitle: 'COMO JOGAR',
                text: STORY[0].text,
                lines: TUTORIAL_STEPS,
                returnState: 'playing'
            };
            SAVE.codex.story.intro = true;
            if (!SAVE.storySeen.includes('intro')) SAVE.storySeen.push('intro');
            this.state = 'story';
        }
    }

    buildRunMods() {
        const diff = this.difficulty;
        const mods = {
            hp: diff.hp, dmg: diff.dmg, xp: diff.xp, gold: diff.gold,
            speed: 1, damage: 1, damageTaken: 1, shield: 1, prices: 1,
            enemySpeed: 1, eliteChance: diff.elite, noHearts: false
        };
        for (const id of SAVE.selected.modifiers) {
            const def = MODIFIERS[id];
            if (!def) continue;
            const a = def.apply || {};
            if (a.enemySpeed) mods.enemySpeed *= a.enemySpeed;
            if (a.gold) mods.gold *= a.gold;
            if (a.xp) mods.xp *= a.xp;
            if (a.damage) mods.damage *= a.damage;
            if (a.damageTaken) mods.damageTaken *= a.damageTaken;
            if (a.elites) mods.eliteChance *= a.elites;
            if (a.prices) mods.prices *= a.prices;
            if (a.shield) mods.shield *= a.shield;
            if (a.noHearts) mods.noHearts = true;
        }
        this.runMods = mods;
    }

    retryRun() {
        this.startRun();
    }

    resumeRun() {
        if (!this.runActive || !this.player || this.player.dead) {
            this.startRun();
            return;
        }
        this.setState('playing');
        Sound.ensure();
    }

    abandonRun() {
        if (!this.runActive) { this.returnToMenu(); return; }
        this.deathCause = 'Você abandonou a expedição. O selo cobra o silêncio.';
        this.runWon = false;
        this.finalizeRun(true);
    }

    returnToMenu() {
        this.runActive = false;
        this.state = 'menu';
        this.player = null;
        this.enemies = [];
        this.effects = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.texts = [];
        this.loot = [];
        this.itemDrops = [];
        this.minions = [];
        this.interactables = [];
        this.traps = [];
        this.props = [];
        this.notifications = [];
        this.boss = null;
        this.currentEvent = null;
        this.merchantOffers = [];
        this.storyModal = null;
        Sound.setTheme('menu');
        this.saveProgress();
    }

    onPlayerDeath() {
        if (this.deathTimer > 0) return;
        this.stats.deaths++;
        this.deathTimer = 1.5;
        this.deathCause = pick([
            'A escuridão não precisa de motivo.',
            'O selo aceitou mais um nome.',
            'Seus ossos agora decoram as catacumbas.',
            'A masmorra sempre cobra a entrada.',
            'O Abismo aprendeu seu rosto.'
        ]);
        this.shakeCamera(14);
        this.flashScreen('#8b0018', 0.5);
        Sound.play('death');
        this.notify('Você caiu. O ouro será convertido.', UI_COLORS.danger);
        if (this.player) {
            this.addParticles(this.player.x, this.player.y, 40, '#c0392b', {
                size: 3, life: 0.9, gravity: 200, glow: true,
                vx: rand(-220, 220), vy: rand(-240, 40)
            });
        }
    }

    // =============================================================
    // MASMORRA PROCEDURAL
    // =============================================================
    generateDungeon() {
        this.biome = BIOMES[this.biomeIndex % BIOMES.length];
        this.props = [];
        this.traps = [];
        this.interactables = [];
        this.rooms = [];
        const rng = mulberry32(Math.floor(this.dungeonSeed + this.wave * 97 + this.biomeIndex * 131));

        const start = { x: -460, y: -360, w: 920, h: 720, type: 'start', name: 'Portal de Entrada' };
        this.rooms.push(start);
        const bossRoom = { x: 760, y: -340, w: 880, h: 680, type: 'boss', name: 'Câmara do Selo' };
        this.rooms.push(bossRoom);

        const types = ['crypt', 'hall', 'garden', 'forge', 'ritual', 'secret'];
        let tries = 0;
        while (this.rooms.length < 8 && tries < 200) {
            tries++;
            const w = 480 + rng() * 300;
            const h = 420 + rng() * 260;
            const x = -1650 + rng() * (3300 - w);
            const y = -1350 + rng() * (2700 - h);
            const cx = x + w / 2, cy = y + h / 2;
            let ok = true;
            for (const r of this.rooms) {
                const rcx = r.x + r.w / 2, rcy = r.y + r.h / 2;
                if (dist(cx, cy, rcx, rcy) < 620) { ok = false; break; }
            }
            if (!ok) continue;
            this.rooms.push({
                x, y, w, h,
                type: types[Math.floor(rng() * types.length)],
                name: pick(['Galeria Rachada', 'Salão dos Ossos', 'Cripta Silenciosa', 'Círculo Rúnico', 'Antessala', 'Nicho Oculto'])
            });
        }

        const b = this.biome;
        // piso decorativo por sala
        for (const room of this.rooms) {
            const cx = room.x + room.w / 2, cy = room.y + room.h / 2;
            // tochas nos cantos
            const corners = [
                [room.x + 40, room.y + 40],
                [room.x + room.w - 40, room.y + 40],
                [room.x + 40, room.y + room.h - 40]
            ];
            corners.forEach(([px, py], i) => {
                if (rng() < 0.72) {
                    this.props.push(new Prop(px, py, i === 0 ? 'brazier' : 'torch', b.id, { size: 0.9 + rng() * 0.3 }));
                }
            });
            // pilares e decoração
            const propList = b.props;
            const count = room.type === 'boss' ? 16 : 12;
            for (let i = 0; i < count; i++) {
                const px = room.x + 50 + rng() * (room.w - 100);
                const py = room.y + 50 + rng() * (room.h - 100);
                if (dist(px, py, 0, 0) < 190) continue;
                let type = pick(propList);
                const roll = rng();
                if (roll < 0.22) type = 'pillar';
                else if (roll < 0.32) type = 'rubble';
                else if (roll < 0.40 && b.id === 'catacumbas') type = 'coffin';
                else if (roll < 0.46) type = 'crystal';
                if (room.type === 'boss' && i < 4) type = 'pillar';
                this.props.push(new Prop(px, py, type, b.id, { size: 0.75 + rng() * 0.6 }));
            }
            // segredo
            if (room.type === 'secret') {
                this.props.push(new Prop(room.x + 24, room.y + room.h / 2, 'rubble', b.id, { size: 1.4 }));
                this.props.push(new Prop(room.x + 24, room.y + room.h / 2 - 60, 'rubble', b.id, { size: 1.2 }));
                this.props.push(new Prop(room.x + 24, room.y + room.h / 2 + 60, 'rubble', b.id, { size: 1.2 }));
            }
        }

        // armadilhas
        const trapKinds = b.id === 'infernal' ? ['lava', 'spike', 'laser', 'rock']
            : b.id === 'cavernas' ? ['spike', 'blade', 'rock', 'laser']
                : b.id === 'floresta' ? ['poison', 'spike', 'rune', 'blade']
                    : b.id === 'abismo' ? ['rune', 'laser', 'rock', 'spike'] : ['spike', 'blade', 'poison', 'rune'];
        for (const room of this.rooms) {
            if (room.type === 'start') continue;
            const n = room.type === 'boss' ? 1 : 1 + Math.floor(rng() * 3);
            for (let i = 0; i < n; i++) {
                const tx = room.x + 80 + rng() * (room.w - 160);
                const ty = room.y + 80 + rng() * (room.h - 160);
                if (dist(tx, ty, 0, 0) < 220) continue;
                this.traps.push(new Trap(pick(trapKinds), tx, ty, {
                    damage: (10 + this.wave * 2.2) * this.difficulty.dmg,
                    radius: 40 + rng() * 10,
                    triggerRadius: 62
                }));
            }
        }

        // interativos
        const nonStart = this.rooms.filter(r => r.type !== 'start');
        const shuffled = shuffle(nonStart);
        let idx = 0;
        const place = (kind, room, opts) => {
            if (!room) return;
            const x = room.x + room.w / 2 + rand(-room.w * 0.22, room.w * 0.22);
            const y = room.y + room.h / 2 + rand(-room.h * 0.22, room.h * 0.22);
            this.interactables.push(new Interactable(kind, x, y, opts || {}));
        };
        place('chest', shuffled[idx++], { biome: b.id });
        place('chest', shuffled[idx++], { biome: b.id });
        place('lore', shuffled[idx++], { biome: b.id, color: '#7fe7ff' });
        if (this.wave >= 2) place('fountain', shuffled[idx++], { biome: b.id, color: '#7fe7ff' });
        if (this.wave >= 3) place('altar', shuffled[idx++], { biome: b.id, color: '#c46bff' });
        const secret = this.rooms.find(r => r.type === 'secret');
        if (secret) place('chest', secret, { biome: b.id, label: 'Baú Escondido' });

        // esculturas de fundo
        for (let i = 0; i < 14; i++) {
            const x = rand(ARENA.minX + 100, ARENA.maxX - 100);
            const y = rand(ARENA.minY + 100, ARENA.maxY - 100);
            if (this.rooms.some(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h)) continue;
            this.props.push(new Prop(x, y, pick(['rubble', 'bone', 'skull', 'chain', 'cobweb']), b.id, { size: 0.8 + rng() * 0.5 }));
        }

        this.cam.x = this.player.x - VIEW.w / 2;
        this.cam.y = this.player.y - VIEW.h / 2;
        this.saveProgress();
    }

    maybeChangeBiome() {
        const newIndex = Math.floor((this.wave - 1) / 5) % BIOMES.length;
        if (newIndex !== this.biomeIndex) {
            this.biomeIndex = newIndex;
            this.generateDungeon();
            this.notify(`Nova região: ${this.biome.name}`, this.biome.accent);
            Sound.setTheme(this.biome.music);
            this.flashScreen(this.biome.accent, 0.18);
        }
    }

    // =============================================================
    // ONDAS
    // =============================================================
    beginWave() {
        this.waveState = 'fighting';
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveDamage = 0;
        this.maybeChangeBiome();
        const isBossWave = this.wave % 5 === 0;
        const bossDef = isBossWave ? BOSS_DEFS[(this.wave / 5 - 1) % BOSS_DEFS.length] : null;

        if (isBossWave) {
            this.spawnQueue.push({ boss: true, def: bossDef, delay: 1.2 });
            const adds = Math.min(10, 2 + Math.floor(this.wave / 4));
            for (let i = 0; i < adds; i++) {
                this.spawnQueue.push({ type: this.pickEnemyType(), delay: 2.0 + i * 0.5, elite: false });
            }
            this.banner = {
                text: bossDef.name,
                sub: bossDef.title,
                color: bossDef.color,
                life: 4.5,
                maxLife: 4.5,
                boss: true
            };
            this.notify(`CHEFE: ${bossDef.name}`, bossDef.color);
            Sound.play('boss');
            Sound.setTheme('boss');
            this.flashScreen(bossDef.color, 0.22);
            this.shakeCamera(8);
        } else {
            const count = Math.min(46, Math.round(4 + this.wave * 1.55));
            for (let i = 0; i < count; i++) {
                this.spawnQueue.push({
                    type: this.pickEnemyType(),
                    delay: i * rand(0.12, 0.26),
                    elite: Math.random() < this.runMods.eliteChance
                });
            }
            this.banner = {
                text: `ONDA ${this.wave}`,
                sub: `${count} criaturas · ${this.biome.name}`,
                color: this.biome.accent,
                life: 3.4,
                maxLife: 3.4
            };
            Sound.play('wave');
            this.notify(`Onda ${this.wave} — ${count} inimigos`, this.biome.accent);
        }
        if (this.player.classId === 'guardian') {
            this.player.shield = Math.max(this.player.shield, 30 * (this.runMods.shield || 1));
        }
        this.saveProgress();
    }

    pickEnemyType() {
        const pool = Object.values(ENEMY_DEFS).filter(d => d.minWave <= this.wave);
        if (!pool.length) return 'skeleton';
        const weights = pool.map(d => 1 / Math.max(1, d.threat * 0.7));
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < pool.length; i++) {
            r -= weights[i];
            if (r <= 0) return pool[i].id;
        }
        return pool[pool.length - 1].id;
    }

    completeWave() {
        const wasBoss = this.wave % 5 === 0;
        if (this.waveDamage <= 0.5) {
            this.stats.perfectWaves++;
            SAVE.stats.perfectWaves = (SAVE.stats.perfectWaves || 0) + 1;
            if (this.stats.perfectWaves === 1) this.notify('Onda perfeita! Nenhum dano recebido.', UI_COLORS.success);
            this.gold += 20 + this.wave * 4;
            this.stats.goldEarned += 20 + this.wave * 4;
        }
        if (!wasBoss) {
            const bonus = 12 + this.wave * 6;
            this.gold += bonus;
            this.stats.goldEarned += bonus;
            this.addFloatingText(this.player.x, this.player.y - 60, `+${bonus} OURO`, '#ffd166', false);
            if (Math.random() < 0.35 + this.wave * 0.01) {
                this.dropItem(this.player.x + rand(-40, 40), this.player.y + rand(-30, 30));
            }
            this.notify(`Onda ${this.wave} concluída.`, UI_COLORS.success);
            this.waveTimer = 4.5;
        } else {
            this.waveTimer = 6;
        }
        this.wave++;
        this.waveState = 'intermission';
        this.spawnQueue = [];
        SAVE.bestWave = Math.max(SAVE.bestWave || 1, this.wave);
        Sound.play('confirm');
        this.checkAchievements();
        if (this.wave % 5 === 1) this.maybeChangeBiome();
        if (this.wave > 1 && Math.random() < 0.5) this.triggerAmbientEvent();
        this.saveProgress();
    }

    // =============================================================
    // SPAWN
    // =============================================================
    spawnEnemy(type, x, y, opts = {}) {
        if (this.enemies.length >= this.maxEnemies) return null;
        const e = new Enemy(x, y, type, this.wave, this, opts);
        e.baseSpeed *= this.runMods.enemySpeed || 1;
        if (opts.elite) {
            e.elite = true;
            e.size *= 1.12;
            e.maxHp = Math.round(e.maxHp * 1.9);
            e.hp = e.maxHp;
            e.dmg *= 1.25;
            e.xpValue = Math.round(e.xpValue * 2);
            e.coinValue = Math.round(e.coinValue * 2.5);
        }
        this.enemies.push(e);
        return e;
    }

    spawnBoss(def) {
        const b = new Boss(def, this.wave, this);
        b.x = this.player.x + rand(-260, 260);
        b.y = this.player.y + rand(-260, 260);
        this.enemies.push(b);
        this.boss = b;
        this.playSpawnEffect(b.x, b.y, def.color, 1.8);
        return b;
    }

    playSpawnEffect(x, y, color, size = 1) {
        this.effects.push(new Shockwave(x, y, 80 * size, color, { life: 0.6, width: 4 }));
        this.addParticles(x, y, Math.round(16 * size), color, {
            glow: true, size: 3, life: 0.7, vx: rand(-80, 80), vy: rand(-120, -20)
        });
    }

    spawnEnemyProjectile(x, y, angle, damage, opts = {}) {
        if (this.enemyProjectiles.length > 260) return;
        this.enemyProjectiles.push(new EnemyProjectile(x, y, angle, damage, opts));
    }

    spawnPositionAwayFromPlayer(minDist = 520, maxDist = 780) {
        for (let i = 0; i < 24; i++) {
            const a = rand(0, TAU);
            const d = rand(minDist, maxDist);
            const x = clamp(this.player.x + Math.cos(a) * d, ARENA.minX + 80, ARENA.maxX - 80);
            const y = clamp(this.player.y + Math.sin(a) * d, ARENA.minY + 80, ARENA.maxY - 80);
            if (dist(x, y, this.player.x, this.player.y) > 380) return { x, y };
        }
        return { x: clamp(this.player.x + 500, ARENA.minX + 80, ARENA.maxX - 80), y: this.player.y };
    }

    // =============================================================
    // LOOP / UPDATE
    // =============================================================
    update(dt) {
        if (dt > 0.05) dt = 0.05;
        if (this.state === 'playing') {
            this.time += dt;
            this.runTime += dt;
            if (this.hitStop > 0) {
                this.hitStop -= dt;
                dt *= 0.22;
            }
            this.updateRun(dt);
        } else {
            this.time += dt * 0.35;
        }
        Sound.update();
        if (this.hitStop < 0) this.hitStop = 0;

        this.flash.alpha = Math.max(0, this.flash.alpha - dt * 2.2);
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].life -= dt;
            if (this.notifications[i].life <= 0) this.notifications.splice(i, 1);
        }
        if (this.banner) {
            this.banner.life -= dt;
            if (this.banner.life <= 0) this.banner = null;
        }
        this.updateCamera(dt);

        this.saveTimer += dt;
        if (this.saveTimer > 12) {
            this.saveTimer = 0;
            if (this.runActive) {
                SAVE.stats.playtime += 12;
                this.saveProgress();
            }
        }
    }

    updateRun(dt) {
        const p = this.player;
        if (!p) return;
        if (this.deathTimer > 0) {
            this.deathTimer -= dt;
            this.updateEffects(dt);
            this.updateParticles(dt);
            if (this.deathTimer <= 0) this.finalizeRun(false);
            return;
        }

        p.aim = null;
        // mira
        const psx = p.x - this.cam.x;
        const psy = p.y - this.cam.y;
        const m = UI.mouse;
        const mx = settings().invertAim ? VIEW.w - m.x : m.x;
        this.aimAngle = Math.atan2(m.y - psy, mx - psx);
        p.update(this, dt);

        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (!e || e.dead || e.hp <= 0) continue;
            e.update(p, dt, this);
            if (e.hp <= 0 && !e.dead) this.onEnemyKilled(e);
        }

        for (let i = this.minions.length - 1; i >= 0; i--) {
            this.minions[i].update(dt, this);
            if (this.minions[i].dead) this.minions.splice(i, 1);
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const pr = this.projectiles[i];
            pr.update(dt, this);
            if (!pr.alive) this.projectiles.splice(i, 1);
        }
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const pr = this.enemyProjectiles[i];
            pr.update(dt, this);
            if (!pr.alive) this.enemyProjectiles.splice(i, 1);
        }

        this.updateEffects(dt);
        this.updateParticles(dt);

        for (let i = this.loot.length - 1; i >= 0; i--) {
            const l = this.loot[i];
            l.update(dt, this);
            if (l.collected) this.loot.splice(i, 1);
        }
        for (let i = this.itemDrops.length - 1; i >= 0; i--) {
            const d = this.itemDrops[i];
            d.update(dt, this);
            if (d.collected) this.itemDrops.splice(i, 1);
        }
        for (const t of this.traps) t.update(dt, this);
        for (const it of this.interactables) it.update(dt, this);

        this.comboTimer -= dt;
        if (this.comboTimer <= 0 && this.combo > 0) this.combo = 0;

        // spawn queue
        if (this.spawnQueue.length) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = 0.22;
                const next = this.spawnQueue[0];
                if (next.boss) {
                    this.spawnBoss(next.def);
                    this.spawnQueue.shift();
                } else if (this.enemies.length < this.maxEnemies - 4) {
                    this.spawnQueue.shift();
                    const pos = this.spawnPositionAwayFromPlayer(500, 820);
                    const e = this.spawnEnemy(next.type, pos.x, pos.y, { elite: next.elite });
                    if (e) this.playSpawnEffect(e.x, e.y, e.color, 0.7);
                }
            }
        }

        this.enemies = this.enemies.filter(e => e && e.hp > 0 && !e.dead);
        if (this.boss && (this.boss.dead || this.boss.hp <= 0)) this.boss = null;

        if (this.waveState === 'fighting' && !this.spawnQueue.length && this.enemies.length === 0 && this.deathTimer <= 0) {
            this.completeWave();
        } else if (this.waveState === 'intermission') {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) this.beginWave();
        }

        // limpeza de segurança
        if (this.effects.length > 260) this.effects.splice(0, this.effects.length - 260);
        if (this.projectiles.length > 220) this.projectiles.splice(0, this.projectiles.length - 220);
        if (this.enemyProjectiles.length > 220) this.enemyProjectiles.splice(0, this.enemyProjectiles.length - 220);
        if (this.loot.length > 160) this.loot.splice(0, this.loot.length - 160);
    }

    updateEffects(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const e = this.effects[i];
            e.update(dt, this);
            if (!e.alive) this.effects.splice(i, 1);
        }
        for (let i = this.texts.length - 1; i >= 0; i--) {
            this.texts[i].update(dt);
            if (this.texts[i].life <= 0) this.texts.splice(i, 1);
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
    }

    updateCamera(dt) {
        const p = this.player;
        if (!p) return;
        const targetX = clamp(p.x - VIEW.w / 2 + Math.cos(this.aimAngle) * 46, ARENA.minX, ARENA.maxX - VIEW.w);
        const targetY = clamp(p.y - VIEW.h / 2 + Math.sin(this.aimAngle) * 40, ARENA.minY, ARENA.maxY - VIEW.h);
        const f = 1 - Math.exp(-7 * dt);
        if (this.cam.x === 0 && this.cam.y === 0) { this.cam.x = targetX; this.cam.y = targetY; }
        this.cam.x = lerp(this.cam.x, targetX, f);
        this.cam.y = lerp(this.cam.y, targetY, f);
        if (VIEW.w > ARENA.maxX - ARENA.minX) this.cam.x = (ARENA.minX + ARENA.maxX - VIEW.w) / 2;
        if (VIEW.h > ARENA.maxY - ARENA.minY) this.cam.y = (ARENA.minY + ARENA.maxY - VIEW.h) / 2;
        this.cam.shake *= Math.exp(-6 * dt);
        this.cam.sx = rand(-1, 1) * this.cam.shake;
        this.cam.sy = rand(-1, 1) * this.cam.shake;
    }

    // =============================================================
    // COMBATE
    // =============================================================
    damageEnemy(e, amount, opts = {}) {
        if (!e || e.hp <= 0 || e.dead) return 0;
        let dmg = Math.max(0, amount);
        const p = this.player;
        if (opts.source === p && p && p.stats.execute > 0 && e.hp / e.maxHp < 0.32) {
            dmg *= 1 + p.stats.execute;
        }
        if (e.guard > 0) dmg *= (1 - e.guard);
        if (e.isBoss && e.phase === 2) dmg *= 0.96;
        e.hp -= dmg;
        e.flashTimer = 0.13;
        this.stats.damageDealt += dmg;
        this.hitStop = Math.max(this.hitStop, opts.crit ? 0.055 : 0.018);

        if (!opts.silentText) {
            const col = opts.crit ? '#ffe066' : (opts.color || '#ffffff');
            this.addFloatingText(e.x + rand(-6, 6), e.y - e.size - rand(0, 8),
                opts.crit ? `${Math.round(dmg)}!` : `${Math.round(dmg)}`, col, opts.crit);
        }
        if (!opts.noParticles) {
            this.addParticles(e.x, e.y, opts.crit ? 8 : 3, opts.color || '#ffb3a0', {
                glow: true, size: 2.2, life: 0.3, gravity: 120
            });
        }
        if (!opts.noShake) this.shakeCamera(Math.min(4, 0.8 + dmg * 0.04));
        if (opts.knockback && !e.isBoss) {
            const a = angleBetween(p ? p.x : e.x, p ? p.y : e.y, e.x, e.y);
            e.knockX += Math.cos(a) * opts.knockback;
            e.knockY += Math.sin(a) * opts.knockback;
        }
        if (opts.lifesteal && p) {
            const heal = dmg * p.stats.lifesteal;
            if (heal > 0.5) p.heal(heal, this, false);
        }
        if (opts.onHit) opts.onHit(e, dmg);
        if (e.hp <= 0) this.onEnemyKilled(e);
        else if (Math.random() < 0.4) Sound.play(opts.crit ? 'crit' : 'hit', opts.crit ? 0.9 : 0.55);
        return dmg;
    }

    onEnemyKilled(e) {
        if (!e || e.dead) return;
        e.dead = true;
        e.hp = 0;
        const p = this.player;
        this.stats.kills++;
        SAVE.stats.kills = (SAVE.stats.kills || 0) + 1;
        SAVE.totalKills = (SAVE.totalKills || 0) + 1;
        this.combo++;
        this.comboTimer = 4.5;
        if (this.combo > this.stats.bestCombo) this.stats.bestCombo = this.combo;
        if (e.elite) this.stats.elites++;
        if (SAVE.codex.enemies[e.type] !== true && !e.isBoss) {
            SAVE.codex.enemies[e.type] = true;
            this.notify(`Códice atualizado: ${e.def ? e.def.name : e.type}`, '#7fe7ff');
        }
        if (e.type === 'invisible' && SAVE.codex.enemies[e.type] !== true) SAVE.codex.enemies[e.type] = true;

        this.addParticles(e.x, e.y, e.isBoss ? 50 : e.elite ? 22 : 12, e.color, {
            glow: true, size: e.isBoss ? 4 : 2.5, life: 0.7,
            vx: rand(-160, 160), vy: rand(-180, 40), gravity: 160
        });
        if (e.isBoss) {
            this.shakeCamera(16);
            this.flashScreen(e.color, 0.4);
            Sound.play('victory');
            this.boss = null;
            this.stats.bosses++;
            SAVE.bossesKilled++;
            SAVE.codex.bosses[e.bossId] = true;
            this.gold += 90 + this.wave * 14;
            this.stats.goldEarned += 90 + this.wave * 14;
            this.notify(`${e.name} foi derrotado!`, '#ffd166');
            for (let i = 0; i < 3; i++) {
                this.dropItem(e.x + rand(-60, 60), e.y + rand(-40, 40), true);
            }
            const relic = new Interactable('portal', e.x, e.y, {
                color: '#b06bff', label: 'Portal do Selo', biome: this.biome.id
            });
            this.interactables.push(relic);
            Sound.setTheme(this.biome.music);
            this.openRelicChoice(3);
        } else {
            Sound.play('death', 0.35);
            this.shakeCamera(e.elite ? 4 : 1.5);
        }

        // drops
        const goldTotal = Math.max(1, e.coinValue);
        const coins = clamp(1 + Math.floor(goldTotal / 4), 1, 4);
        for (let i = 0; i < coins; i++) {
            this.loot.push(new Loot(e.x + rand(-8, 8), e.y + rand(-8, 8), 'gold',
                Math.max(1, Math.round(goldTotal / coins)), this, {
                vx: rand(-80, 80), vy: rand(-140, -40)
            }));
        }
        this.loot.push(new Loot(e.x, e.y, 'xp', e.xpValue, this, {
            vx: rand(-40, 40), vy: rand(-120, -60), life: 70
        }));
        const heartChance = e.elite ? 0.5 : 0.15;
        if (!this.runMods.noHearts && Math.random() < heartChance) {
            this.loot.push(new Loot(e.x + rand(-12, 12), e.y, 'heart', 18 + this.wave * 1.2, this));
        }
        if (Math.random() < (e.elite ? 0.25 : 0.07)) {
            this.loot.push(new Loot(e.x, e.y, 'shield', 20 + this.wave * 2, this));
        }
        if (Math.random() < (e.isBoss ? 1 : e.elite ? 0.35 : 0.055)) {
            this.dropItem(e.x + rand(-20, 20), e.y + rand(-20, 20));
        }
        if (Math.random() < 0.06) {
            this.loot.push(new Loot(e.x, e.y, 'soul', 1 + Math.floor(this.wave / 8), this));
        }
        if (p && p.onKill) p.onKill(this);
        this.checkAchievements();
    }

    explode(x, y, radius, damage, opts = {}) {
        const color = opts.color || '#ff7a3d';
        this.effects.push(new Shockwave(x, y, radius, color, { life: 0.45, width: opts.hostile ? 5 : 4 }));
        this.addParticles(x, y, opts.hostile ? 18 : 14, color, {
            glow: true, size: 3, life: 0.55, vx: rand(-180, 180), vy: rand(-180, 100)
        });
        if (opts.hostile) {
            const p = this.player;
            if (p && !p.dead && dist(x, y, p.x, p.y) < radius + p.size * 0.6) {
                const factor = 1 - 0.45 * clamp(dist(x, y, p.x, p.y) / radius, 0, 1);
                p.takeDamage(damage * factor, this, opts.source || null);
            }
            if (opts.knockback && p) {
                const a = angleBetween(x, y, p.x, p.y);
                p.x += Math.cos(a) * opts.knockback * 0.06;
                p.y += Math.sin(a) * opts.knockback * 0.06;
            }
            Sound.play('explosion', 0.55);
        } else {
            const targets = this.enemiesInRadius(x, y, radius);
            for (const e of targets) {
                this.damageEnemy(e, damage, {
                    source: opts.source, color,
                    knockback: opts.knockback || 120, lifesteal: true,
                    noParticles: true, noShake: true,
                    silentText: false
                });
                if (opts.stun) e.applyStatus('stun', opts.stun, 0, this);
            }
            if (opts.style === 'fire') {
                for (const e of targets) if (e.hp > 0) e.applyStatus('burn', 3, damage * 0.12, this);
            }
            if (opts.style === 'web') {
                for (const e of targets) if (e.hp > 0) e.applyStatus('chill', 2, 0, this);
            }
        }
        this.shakeCamera(opts.hostile ? 6 : 3);
        Sound.play(opts.hostile ? 'explosion' : 'meteor', opts.hostile ? 0.7 : 0.5);
    }

    chainLightning(from, count, damage, color = '#ffe66d', source = null) {
        if (!from || from.dead) return;
        const points = [{ x: from.x, y: from.y }];
        const hit = new Set([from]);
        let current = from;
        for (let i = 0; i < count; i++) {
            let next = null, bd = 460 * 460;
            for (const e of this.enemies) {
                if (e.hp <= 0 || e.dead || hit.has(e)) continue;
                const d2 = (e.x - current.x) ** 2 + (e.y - current.y) ** 2;
                if (d2 < bd) { bd = d2; next = e; }
            }
            if (!next) break;
            hit.add(next);
            points.push({ x: next.x, y: next.y });
            this.damageEnemy(next, damage, {
                source, color, noShake: true, noParticles: true,
                silentText: false, lifesteal: true
            });
            if (next.hp > 0) next.applyStatus('shock', 2, 0, this);
            current = next;
        }
        if (points.length > 1) {
            this.effects.push(new ChainEffect(points, color));
            Sound.play('lightning', 0.6);
        }
    }

    healPlayer(amount, show = true) {
        if (this.player) this.player.heal(amount, this, show);
    }
}

// PRNG determinístico para decoração
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}


/* ----------------------------------------------------------------
   MÓDULO: systems.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — SISTEMAS
   Itens, inventário, loja, relíquias, melhorias, eventos,
   interações, habilidades, conquistas e progressão.
   ================================================================ */
'use strict';

let itemCounter = 0;

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const ITEM_SUFFIXES = [
    'da Ruína', 'do Abismo', 'do Vigia', 'das Sombras', 'do Eclipse',
    'de Vahl', 'do Carrasco', 'da Fenda', 'dos Ossos', 'do Silêncio',
    'da Rainha', 'do Selo', 'da Vigília', 'do Vazio', 'de Cinzas'
];

function weightedPick(list, weightFn) {
    let total = 0;
    const weights = list.map(v => {
        const w = Math.max(0.0001, weightFn(v));
        total += w;
        return w;
    });
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
        r -= weights[i];
        if (r <= 0) return list[i];
    }
    return list[list.length - 1];
}

function rollItemRarity(wave, bonus = 0) {
    const entries = Object.values(RARITIES);
    return weightedPick(entries, r => {
        let w = r.weight;
        const tier = RARITY_ORDER.indexOf(r.id);
        w *= 1 + Math.max(0, wave - 1) * 0.012 * tier;
        if (r.id === 'common') w *= Math.max(0.16, 1 - wave * 0.022);
        if (r.id === 'mythic' && wave < 12) w *= 0.25;
        w *= 1 + bonus;
        return w;
    }).id;
}

function findSetForBase(baseName) {
    for (const id in SETS) {
        if (SETS[id].pieces.includes(baseName)) return id;
    }
    return null;
}

function rollAffixValue(affix, level, rarityMult) {
    let v = rand(affix.min, affix.max);
    v *= 1 + (level - 1) * 0.045;
    v *= 0.85 + rarityMult * 0.12;
    if (affix.dec !== undefined) return Math.round(v * 10) / 10;
    if (affix.pct) return Math.max(1, Math.round(v * 10) / 10);
    return Math.max(1, Math.round(v));
}

function makeItem(level, opts = {}) {
    const slotDef = EQUIP_SLOTS.find(s => s.id === opts.slot) || pick(EQUIP_SLOTS);
    const slot = slotDef.id;
    const rarityId = opts.rarity || rollItemRarity(level, opts.luck || 0);
    const rar = RARITIES[rarityId];
    const bases = ITEM_BASES[slot] || ['Relíquia Esquecida'];
    const base = pick(bases);
    const stats = {};
    const affixCount = Math.min(AFFIXES.length, rar.affixes + (Math.random() < 0.22 ? 1 : 0));
    const pool = shuffle(AFFIXES.slice());
    for (let i = 0; i < affixCount && i < pool.length; i++) {
        const affix = pool[i];
        const key = affix.key;
        stats[key] = (stats[key] || 0) + rollAffixValue(affix, level, rar.mult);
    }

    let unique = null;
    if (rarityId === 'mythic' || (RARITY_ORDER.indexOf(rarityId) >= 3 && Math.random() < 0.42)) {
        unique = pick(Object.keys(UNIQUE_EFFECTS));
    }

    let setId = null;
    if (findSetForBase(base) && Math.random() < 0.5 + RARITY_ORDER.indexOf(rarityId) * 0.05) {
        setId = findSetForBase(base);
    }

    const name = `${base} ${pick(ITEM_SUFFIXES)}`;
    return {
        id: `item_${Date.now().toString(36)}_${(itemCounter++).toString(36)}`,
        name, slot, rarity: rarityId, level,
        stats, unique, setId
    };
}

// ---------------------------------------------------------------
// EVENTOS AMBIENTAIS
// ---------------------------------------------------------------
const RUN_EVENTS = [
    {
        id: 'blood_altar', title: 'ALTAR DE SANGUE', subtitle: 'O PEDESTAL PEDE UM PREÇO',
        icon: 'skull', color: '#ff4d6d',
        text: 'O altar pulsa como um coração exposto. Runas vermelhas sobem pelas suas mãos. Uma voz antiga oferece poder em troca de vitalidade.',
        options: [
            {
                label: 'Oferecer sangue', desc: 'Perde 25% da vida máxima, ganha +22% de dano nesta run.', color: '#ff4d6d',
                apply: g => {
                    const p = g.player;
                    const loss = Math.round(p.maxHp * 0.25);
                    p.upg.hpMax -= loss;
                    p.upg.damagePct += 0.22;
                    p.recalc(true);
                    p.hp = Math.min(p.hp, p.maxHp);
                    g.flashScreen('#ff4d6d', 0.28);
                    g.addParticles(p.x, p.y, 24, '#ff4d6d', { glow: true, size: 3, life: 0.7 });
                    g.notify(`Pacto aceito: -${loss} vida máxima, +22% de dano.`, '#ff4d6d');
                }
            },
            {
                label: 'Recusar o pacto', desc: 'Ganha 35 de ouro e segue em frente.', color: '#e8c46a',
                apply: g => {
                    g.gold += 35;
                    g.stats.goldEarned += 35;
                    g.notify('Você recua. O altar parece decepcionado.', '#e8c46a');
                }
            }
        ]
    },
    {
        id: 'gambler', title: 'DADO DO APOSTADOR', subtitle: 'UMA FACE SORRI PARA VOCÊ',
        icon: 'dice', color: '#b06bff',
        text: 'Um dado de osso rola sozinho no chão. Quando para, todas as faces mostram o mesmo sorriso. Uma aposta é feita em silêncio.',
        options: [
            {
                label: 'Apostar 60 de ouro', desc: 'Chance de ganhar uma relíquia ou devolver 120 de ouro.', color: '#b06bff',
                apply: g => {
                    if (g.gold < 60) { g.notify('Ouro insuficiente. O dado ri.', '#ff5f6d'); return; }
                    g.gold -= 60;
                    if (Math.random() < 0.45) {
                        const available = Object.keys(RELICS).filter(id => !g.player.relics.includes(id));
                        if (available.length) {
                            const id = pick(available);
                            g.player.addRelic(id);
                            g.notify(`Relíquia: ${RELICS[id].name}`, RELICS[id].rarity === 'legendary' ? '#ffb347' : '#b06bff');
                            g.recordRelicUnlock(id);
                        } else {
                            g.gold += 180;
                            g.notify('Sem relíquias restantes. O dado paga 180 de ouro.', '#e8c46a');
                        }
                    } else {
                        g.notify('O dado vira uma pedra comum. Você perdeu a aposta.', '#9b93a6');
                    }
                }
            },
            {
                label: 'Ignorar o dado', desc: 'Nada acontece. Provavelmente.', color: '#9b93a6',
                apply: g => g.notify('Você deixa o dado rolar para a escuridão.', '#9b93a6')
            }
        ]
    },
    {
        id: 'wounded_hero', title: 'HERÓI MORIBUNDO', subtitle: 'MAIS UM NOME NO SELO',
        icon: 'heart', color: '#ff9f43',
        text: 'Um aventureiro encostado na parede segura o próprio braço. Ele reconhece a sua armadura e sorri sem humor. “Você também veio pelo selo?”',
        options: [
            {
                label: 'Dar um elixir', desc: 'Perde 15% da vida atual, ganha uma melhoria aleatória.', color: '#6fe7a0',
                apply: g => {
                    const p = g.player;
                    const cost = Math.round(p.hp * 0.15);
                    p.hp = Math.max(1, p.hp - cost);
                    g.chooseRandomUpgrade();
                    g.notify(`Você cede ${cost} de vida. Ele sussurra um segredo de combate.`, '#6fe7a0');
                }
            },
            {
                label: 'Saquear e seguir', desc: 'Ganha 45 de ouro, mas perde 8% da vida máxima.', color: '#ff5f6d',
                apply: g => {
                    const p = g.player;
                    g.gold += 45;
                    g.stats.goldEarned += 45;
                    p.upg.hpMax -= Math.round(p.maxHp * 0.06);
                    p.recalc(true);
                    p.hp = Math.min(p.hp, p.maxHp);
                    g.notify('Você pega o ouro. A masmorra anota o seu nome.', '#ff5f6d');
                }
            }
        ]
    },
    {
        id: 'supply_cache', title: 'ESCONDERIJO DE SUPRIMENTOS', subtitle: 'ALGUÉM ESTEVE AQUI',
        icon: 'chest', color: '#e8c46a',
        text: 'Um baú aberto, coberto de poeira recente. Há três frascos e um bilhete: “Se você está lendo isto, o selo ainda não caiu. Beba rápido.”',
        options: [
            {
                label: 'Beber o elixir', desc: 'Restaura 45% da vida e 60% da mana.', color: '#6fe7a0',
                apply: g => {
                    const p = g.player;
                    p.heal(p.maxHp * 0.45, g);
                    p.mana = Math.min(p.maxMana, p.mana + p.maxMana * 0.6);
                    g.notify('O elixir queima, mas funciona.', '#6fe7a0');
                }
            },
            {
                label: 'Guardar para depois', desc: 'Ganha 70 de ouro ao revender os frascos.', color: '#e8c46a',
                apply: g => {
                    g.gold += 70;
                    g.stats.goldEarned += 70;
                    g.notify('Os frascos tilintam na sua bolsa.', '#e8c46a');
                }
            }
        ]
    },
    {
        id: 'whispering_rune', title: 'Runa Sussurrante', subtitle: 'NÃO LEIA EM VOZ ALTA',
        icon: 'rune', color: '#7fe7ff',
        text: 'Uma runa flutua sobre o chão, emitindo palavras que você quase entende. Cada sílaba deixa um gosto metálico na boca.',
        options: [
            {
                label: 'Absorver a runa', desc: 'Ganha 90 de XP, mas sofre 12 de dano.', color: '#7fe7ff',
                apply: g => {
                    g.player.gainXp(90 + g.wave * 8, g, false);
                    g.player.takeDamage(12 + g.wave, g, null, { ignoreIframes: true, ignoreDodge: true });
                    g.flashScreen('#7fe7ff', 0.18);
                    g.notify('As palavras entram pelos olhos.', '#7fe7ff');
                }
            },
            {
                label: 'Quebrar a runa', desc: 'Ganha 55 de ouro e um pequeno escudo.', color: '#61c0ff',
                apply: g => {
                    g.gold += 55;
                    g.stats.goldEarned += 55;
                    g.player.addShield(25 + g.wave * 2, g);
                    g.notify('A runa estilhaça em pó brilhante.', '#61c0ff');
                }
            }
        ]
    },
    {
        id: 'hungry_roots', title: 'RAÍZES FAMINTAS', subtitle: 'A FLORESTA QUER PARTE DE VOCÊ',
        icon: 'thorns', color: '#62ffa8',
        text: 'Raízes se enrolam nos seus tornozelos, testando o peso. Uma flor pálida se abre, oferecendo pólen dourado em troca de um pouco de sangue.',
        options: [
            {
                label: 'Aceitar o pólen', desc: '+12% de velocidade e +10% de crítico nesta run.', color: '#62ffa8',
                apply: g => {
                    const p = g.player;
                    p.upg.speedPct += 0.12;
                    p.upg.critChance += 0.10;
                    p.hp = Math.max(1, p.hp - Math.round(p.maxHp * 0.10));
                    p.recalc(true);
                    g.notify('As raízes soltam você. O ar parece mais leve.', '#62ffa8');
                }
            },
            {
                label: 'Cortar as raízes', desc: 'Ganha 40 de ouro e 20 de XP.', color: '#e8c46a',
                apply: g => {
                    g.gold += 40;
                    g.stats.goldEarned += 40;
                    g.player.gainXp(20, g, false);
                    g.notify('A seiva escorre como tinta escura.', '#e8c46a');
                }
            }
        ]
    }
];

// ---------------------------------------------------------------
// MÉTODOS DE SESSÃO
// ---------------------------------------------------------------
Object.assign(GameSession.prototype, {

    // =============================================================
    // ITENS / INVENTÁRIO
    // =============================================================
    generateItem(level, opts = {}) {
        return makeItem(Math.max(1, Math.round(level || this.wave || 1)), opts);
    },

    dropItem(x, y, guaranteed = false) {
        if (!this.player) return null;
        const level = this.wave + (guaranteed ? 2 : 0);
        const item = this.generateItem(level, {
            luck: guaranteed ? 0.35 : (this.player.stats && this.player.stats.goldMult > 1.4 ? 0.08 : 0)
        });
        this.itemDrops.push(new ItemDrop(
            clamp(x, ARENA.minX + 30, ARENA.maxX - 30),
            clamp(y, ARENA.minY + 30, ARENA.maxY - 30),
            item
        ));
        this.stats.itemsFound = (this.stats.itemsFound || 0) + 1;
        SAVE.stats.itemsFound = (SAVE.stats.itemsFound || 0) + 1;
        Sound.play('chest', 0.4);
        return item;
    },

    recordRelicUnlock(id) {
        if (!SAVE.unlocked.relics.includes(id)) SAVE.unlocked.relics.push(id);
        if (!SAVE.codex.story.reliquias) SAVE.codex.story.reliquias = true;
    },

    equipBackpackItem(index) {
        if (!this.player) return;
        const item = this.player.backpack[index];
        if (!item) return;
        const old = this.player.equipItem(item);
        this.inventorySelected = item.slot ? 'gear:' + item.slot : -1;
        this.notify(`${item.name} equipado${old ? ` (${old.name} foi para a sacola)` : ''}.`, RARITIES[item.rarity].color);
        Sound.play('confirm', 0.8);
        this.saveProgress();
    },

    sellBackpackItem(index) {
        if (!this.player) return;
        const item = this.player.backpack[index];
        if (!item) return;
        const price = itemSellPrice(item);
        this.player.backpack.splice(index, 1);
        this.gold += price;
        this.stats.goldEarned += price;
        this.inventorySelected = -1;
        this.notify(`${item.name} vendido por ${fmt(price)} ouro.`, UI_COLORS.gold);
        Sound.play('coin', 0.8);
        this.saveProgress();
    },

    unequipSlot(slot) {
        if (!this.player) return;
        const item = this.player.gear[slot];
        if (!item) return;
        if (this.player.backpack.length >= 24) {
            this.notify('Sacola cheia! Venda algo antes.', UI_COLORS.danger);
            return;
        }
        this.player.gear[slot] = null;
        this.player.backpack.push(item);
        this.player.recalc(true);
        this.inventorySelected = 'gear:' + slot;
        this.notify(`${item.name} movido para a sacola.`, RARITIES[item.rarity].color);
        Sound.play('ui');
        this.saveProgress();
    },

    // =============================================================
    // LOJA PERMANENTE / DESBLOQUEIOS
    // =============================================================
    buyMeta(key) {
        const up = META_UPGRADES.find(u => u.key === key);
        if (!up) return;
        const level = SAVE.meta[key] || 0;
        if (level >= up.max) return;
        const cost = up.cost(level);
        if (SAVE.coins < cost) {
            this.notify('Moedas insuficientes.', UI_COLORS.danger);
            Sound.play('denied');
            return;
        }
        SAVE.coins -= cost;
        SAVE.meta[key] = level + 1;
        this.notify(`${up.name} aprimorado para nível ${level + 1}.`, UI_COLORS.gold);
        Sound.play('confirm');
        this.saveProgress();
    },

    selectOrUnlockClass(id) {
        if (!CLASSES[id]) return;
        if (SAVE.unlocked.classes.includes(id)) {
            SAVE.selected.classId = id;
            Sound.play('ui');
            this.saveProgress();
            return;
        }
        const cls = CLASSES[id];
        if (SAVE.coins < cls.cost) {
            this.notify(`Você precisa de ${fmt(cls.cost)} moedas para desbloquear ${cls.short}.`, UI_COLORS.danger);
            Sound.play('denied');
            return;
        }
        SAVE.coins -= cls.cost;
        SAVE.unlocked.classes.push(id);
        SAVE.selected.classId = id;
        this.notify(`${cls.name} desbloqueado!`, cls.color);
        Sound.play('confirm');
        this.saveProgress();
    },

    selectOrUnlockWeapon(id) {
        if (!WEAPONS[id]) return;
        if (SAVE.unlocked.weapons.includes(id)) {
            SAVE.selected.weaponId = id;
            Sound.play('ui');
            this.saveProgress();
            return;
        }
        const w = WEAPONS[id];
        if (SAVE.coins < w.cost) {
            this.notify(`Você precisa de ${fmt(w.cost)} moedas para desbloquear ${w.name}.`, UI_COLORS.danger);
            Sound.play('denied');
            return;
        }
        SAVE.coins -= w.cost;
        SAVE.unlocked.weapons.push(id);
        SAVE.selected.weaponId = id;
        this.notify(`${w.name} desbloqueada!`, RARITIES[w.rarity].color);
        Sound.play('confirm');
        this.saveProgress();
    },

    toggleOrUnlockSkill(id) {
        const sk = SKILLS[id];
        if (!sk) return;
        if (!SAVE.unlocked.skills.includes(id)) {
            if (SAVE.coins < sk.cost) {
                this.notify(`Você precisa de ${fmt(sk.cost)} moedas para aprender ${sk.name}.`, UI_COLORS.danger);
                Sound.play('denied');
                return;
            }
            SAVE.coins -= sk.cost;
            SAVE.unlocked.skills.push(id);
            this.notify(`${sk.name} aprendida!`, sk.color);
            Sound.play('confirm');
            this.saveProgress();
        }
        const arr = SAVE.selected.skills;
        const idx = arr.indexOf(id);
        if (idx >= 0) {
            if (arr.length <= 1) {
                this.notify('Mantenha ao menos uma habilidade equipada.', UI_COLORS.danger);
                return;
            }
            arr.splice(idx, 1);
            this.notify(`${sk.name} removida.`, UI_COLORS.dim);
            Sound.play('ui');
        } else {
            if (arr.length >= 4) {
                this.notify('Máximo de 4 habilidades equipadas.', UI_COLORS.danger);
                Sound.play('denied');
                return;
            }
            arr.push(id);
            this.notify(`${sk.name} equipada no slot ${arr.length}.`, sk.color);
            Sound.play('ui');
        }
        this.saveProgress();
    },

    setDifficulty(id) {
        if (!DIFFICULTIES[id]) return;
        SAVE.selected.difficulty = id;
        Sound.play('ui');
        this.saveProgress();
    },

    toggleModifier(id) {
        if (!MODIFIERS[id]) return;
        const arr = SAVE.selected.modifiers;
        const idx = arr.indexOf(id);
        if (idx >= 0) {
            arr.splice(idx, 1);
        } else {
            if (arr.length >= 3) {
                this.notify('Máximo de 3 modificadores.', UI_COLORS.danger);
                Sound.play('denied');
                return;
            }
            arr.push(id);
        }
        Sound.play('ui');
        this.saveProgress();
    },

    // =============================================================
    // MELHORIAS DE NÍVEL
    // =============================================================
    rollUpgrades(count = 3) {
        const counts = this.upgradeCounts || {};
        const pool = UPGRADES_POOL.filter(u => (counts[u.id] || 0) < (u.max || 1));
        const chosen = [];
        const poolCopy = pool.slice();
        while (chosen.length < count && poolCopy.length) {
            const up = weightedPick(poolCopy, u => {
                const rar = RARITIES[u.rarity] || RARITIES.common;
                return rar.weight;
            });
            chosen.push(up);
            poolCopy.splice(poolCopy.indexOf(up), 1);
        }
        return chosen;
    },

    openLevelUpMenu() {
        if (!this.player || this.player.pendingLevelUps <= 0) return;
        if (this.state !== 'playing' && this.state !== 'levelup') return;
        this.levelChoices = this.rollUpgrades(3);
        if (!this.levelChoices.length) {
            this.player.pendingLevelUps = 0;
            return;
        }
        this.setState('levelup');
        Sound.play('level');
    },

    chooseUpgrade(id) {
        if (!this.player) return;
        const up = (this.levelChoices || []).find(u => u.id === id);
        if (!up) return;
        this.player.applyUpgrade(up);
        this.upgradeCounts[id] = (this.upgradeCounts[id] || 0) + 1;
        this.player.pendingLevelUps = Math.max(0, this.player.pendingLevelUps - 1);
        this.notify(`${up.name} aprimorada (${this.upgradeCounts[id]}/${up.max || 8}).`, RARITIES[up.rarity].color);
        Sound.play('confirm');
        if (this.player.pendingLevelUps > 0) {
            this.levelChoices = this.rollUpgrades(3);
            if (!this.levelChoices.length) {
                this.player.pendingLevelUps = 0;
                this.setState('playing');
            }
        } else {
            this.levelChoices = [];
            this.setState('playing');
        }
        this.saveProgress();
    },

    chooseRandomUpgrade() {
        const pool = UPGRADES_POOL.filter(u => (this.upgradeCounts[u.id] || 0) < (u.max || 1));
        if (!pool.length) return;
        const up = pick(pool);
        this.player.applyUpgrade(up);
        this.upgradeCounts[up.id] = (this.upgradeCounts[up.id] || 0) + 1;
        this.notify(`Melhoria: ${up.name}.`, RARITIES[up.rarity].color);
    },

    // =============================================================
    // RELÍQUIAS
    // =============================================================
    rollRelics(count = 3) {
        const owned = this.player ? this.player.relics : [];
        const pool = Object.values(RELICS).filter(r => !owned.includes(r.id));
        const chosen = [];
        const copy = pool.slice();
        while (chosen.length < count && copy.length) {
            const rel = weightedPick(copy, r => {
                if (r.rarity === 'legendary') return 10;
                if (r.rarity === 'epic') return 34;
                return 56;
            });
            chosen.push(rel.id);
            copy.splice(copy.indexOf(rel), 1);
        }
        return chosen;
    },

    openRelicChoice(count = 3) {
        if (!this.player) return;
        if (this.state !== 'playing' && this.state !== 'levelup') return;
        this.relicChoices = this.rollRelics(count);
        if (!this.relicChoices.length) {
            this.notify('Todas as relíquias já pertencem a você.', '#b06bff');
            return;
        }
        this.setState('relic');
        Sound.play('void', 0.8);
    },

    chooseRelic(id) {
        if (!this.player) return;
        if (!this.player.addRelic(id)) {
            this.relicChoices = [];
            this.setState('playing');
            return;
        }
        this.recordRelicUnlock(id);
        const rel = RELICS[id];
        this.notify(`Relíquia equipada: ${rel.name}`, '#b06bff');
        this.addFloatingText(this.player.x, this.player.y - 58, rel.name.toUpperCase(), '#b06bff', false);
        Sound.play('confirm');
        this.relicChoices = [];
        this.saveProgress();
        if (this.player.pendingLevelUps > 0) this.openLevelUpMenu();
        else this.setState('playing');
    },

    // =============================================================
    // MERCADOR
    // =============================================================
    makeMerchantOffer(kind) {
        const p = this.player;
        const priceMult = p && p.stats ? (p.stats.prices || 1) : 1;
        const wave = this.wave || 1;
        if (kind === 'item') {
            const item = this.generateItem(wave + 1, { luck: 0.25 });
            const rar = RARITIES[item.rarity];
            return {
                type: 'item', title: item.name, desc: `Equipamento ${rar.name} de nível ${item.level}.`,
                icon: 'chest', color: rar.color, item,
                price: Math.max(20, Math.round((28 + wave * 9) * rar.mult * priceMult)),
                apply: g => {
                    if (!p.addItem(item)) {
                        g.notify('Sacola cheia! O mercador guarda o item por enquanto.', '#ff5f6d');
                        return false;
                    }
                    g.notify(`${item.name} comprado.`, rar.color);
                    return true;
                }
            };
        }
        if (kind === 'heal') {
            return {
                type: 'heal', title: 'Elixir de Sangue', desc: 'Restaura 45% da vida máxima imediatamente.',
                icon: 'heart', color: '#ff5f6d',
                price: Math.round((35 + wave * 6) * priceMult),
                apply: g => {
                    p.heal(p.maxHp * 0.45, g);
                    g.notify('O elixir queima ao descer.', '#ff5f6d');
                    return true;
                }
            };
        }
        if (kind === 'mana') {
            return {
                type: 'mana', title: 'Essência Azul', desc: 'Restaura toda a mana e +20 de mana máxima nesta run.',
                icon: 'mana', color: '#61c0ff',
                price: Math.round((30 + wave * 5) * priceMult),
                apply: g => {
                    p.upg.manaMax += 20;
                    p.recalc(true);
                    p.mana = p.maxMana;
                    g.notify('Sua mana transborda.', '#61c0ff');
                    return true;
                }
            };
        }
        if (kind === 'shield') {
            return {
                type: 'shield', title: 'Selo de Proteção', desc: 'Concede 60 de escudo e +5% de armadura nesta run.',
                icon: 'shield', color: '#7fe7ff',
                price: Math.round((38 + wave * 6) * priceMult),
                apply: g => {
                    p.upg.armor += 0.05;
                    p.recalc(true);
                    p.addShield(60, g);
                    g.notify('Runas protetoras envolvem seu corpo.', '#7fe7ff');
                    return true;
                }
            };
        }
        if (kind === 'upgrade') {
            const counts = this.upgradeCounts || {};
            const pool = UPGRADES_POOL.filter(u => (counts[u.id] || 0) < (u.max || 1));
            if (!pool.length) return this.makeMerchantOffer('heal');
            const up = pick(pool);
            return {
                type: 'upgrade', title: up.name, desc: up.desc,
                icon: up.icon, color: (RARITIES[up.rarity] || RARITIES.common).color,
                price: Math.round((55 + wave * 8) * priceMult),
                apply: g => {
                    p.applyUpgrade(up);
                    g.upgradeCounts[up.id] = (g.upgradeCounts[up.id] || 0) + 1;
                    g.notify(`Treinamento: ${up.name}.`, '#e8c46a');
                    return true;
                }
            };
        }
        if (kind === 'relic') {
            const available = Object.keys(RELICS).filter(id => !p.relics.includes(id));
            if (!available.length) return this.makeMerchantOffer('item');
            const id = pick(available);
            const rel = RELICS[id];
            return {
                type: 'relic', title: rel.name, desc: rel.desc,
                icon: rel.icon, color: '#b06bff',
                price: Math.round((150 + wave * 18) * priceMult),
                apply: g => {
                    p.addRelic(id);
                    g.recordRelicUnlock(id);
                    g.notify(`Relíquia adquirida: ${rel.name}`, '#b06bff');
                    return true;
                }
            };
        }
        return this.makeMerchantOffer('heal');
    },

    rollMerchantOffers(count = 3) {
        const kinds = ['item'];
        const others = ['heal', 'mana', 'shield', 'upgrade', 'relic'];
        const shuffled = shuffle(others.slice());
        for (let i = 0; kinds.length < count && i < shuffled.length; i++) kinds.push(shuffled[i]);
        return kinds.slice(0, count).map(k => this.makeMerchantOffer(k));
    },

    openMerchant() {
        this.merchantOffers = this.rollMerchantOffers(3);
        this.setState('merchant');
        Sound.play('confirm', 0.6);
    },

    buyMerchantOffer(index) {
        const offer = (this.merchantOffers || [])[index];
        if (!offer || offer.sold) return;
        if (this.gold < offer.price) {
            this.notify('Ouro insuficiente.', UI_COLORS.danger);
            Sound.play('denied');
            return;
        }
        // Aplica primeiro; se o inventário estiver cheio, devolve o ouro.
        this.gold -= offer.price;
        this.stats.goldEarned = Math.max(0, this.stats.goldEarned);
        const ok = offer.apply(this);
        if (ok === false) {
            this.gold += offer.price;
            return;
        }
        offer.sold = true;
        Sound.play('coin', 0.9);
        this.saveProgress();
    },

    rerollMerchant() {
        const cost = Math.round((25 + this.wave * 3) * ((this.player && this.player.stats.prices) || 1));
        if (this.gold < cost) {
            this.notify('Ouro insuficiente para sortear novas ofertas.', UI_COLORS.danger);
            Sound.play('denied');
            return;
        }
        this.gold -= cost;
        this.merchantOffers = this.rollMerchantOffers(3);
        this.notify('O mercador embaralha as ofertas.', UI_COLORS.gold);
        Sound.play('ui');
        this.saveProgress();
    },

    closeMerchant() {
        this.setState('playing');
    },

    // =============================================================
    // EVENTOS
    // =============================================================
    triggerAmbientEvent() {
        if (this.state !== 'playing' || this.currentEvent) return;
        const pool = RUN_EVENTS.filter(e => e.id !== 'blood_altar');
        this.openEvent(pick(pool));
    },

    openEvent(ev) {
        if (!ev) return;
        this.currentEvent = ev;
        this.setState('event');
        Sound.play('void', 0.6);
    },

    resolveEvent(index) {
        const ev = this.currentEvent;
        if (!ev) return;
        const opt = (ev.options || [])[index];
        if (!opt) return;
        try {
            const ret = opt.apply(this);
            if (typeof ret === 'string') this.notify(ret, ev.color || UI_COLORS.gold);
        } catch (e) {
            console.warn('Falha ao resolver evento', e);
        }
        this.currentEvent = null;
        this.setState('playing');
        Sound.play('confirm', 0.6);
        this.saveProgress();
    },

    // =============================================================
    // INTERAGÍVEIS
    // =============================================================
    nearestInteractable(radius = 78) {
        if (!this.player) return null;
        let best = null, bd = radius * radius;
        for (const it of this.interactables) {
            if (it.kind !== 'lore' && it.used) continue;
            const dx = it.x - this.player.x, dy = it.y - this.player.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bd && d2 <= Math.pow(it.radius || radius, 2) + 120) {
                bd = d2;
                best = it;
            }
        }
        return best;
    },

    interactWith() {
        if (this.state !== 'playing' || !this.player) return;
        const it = this.nearestInteractable();
        if (!it) return;
        switch (it.kind) {
            case 'chest': this.openChest(it); break;
            case 'merchant': this.openMerchant(); break;
            case 'fountain': this.useFountain(it); break;
            case 'altar': {
                it.used = true;
                this.addParticles(it.x, it.y, 20, '#c46bff', { glow: true, size: 3, life: 0.7, vy: -70 });
                Sound.play('void', 0.7);
                const ev = RUN_EVENTS.find(e => e.id === 'blood_altar');
                this.openEvent(ev);
                break;
            }
            case 'lore': this.readLore(it); break;
            case 'portal': this.usePortal(it); break;
            default: break;
        }
    },

    openChest(it) {
        if (!it || it.used) return;
        it.used = true;
        const gold = Math.round((20 + this.wave * 9) * rand(0.85, 1.25));
        this.gold += gold;
        this.stats.goldEarned += gold;
        this.stats.chests = (this.stats.chests || 0) + 1;
        SAVE.stats.chests = (SAVE.stats.chests || 0) + 1;
        this.addFloatingText(it.x, it.y - 40, `+${fmt(gold)} OURO`, '#ffd166', false);
        this.dropItem(it.x + rand(-20, 20), it.y + 20, false);
        this.addParticles(it.x, it.y, 26, '#e8c46a', {
            glow: true, size: 3, life: 0.8, vx: rand(-120, 120), vy: rand(-160, -20), gravity: 180
        });
        this.shakeCamera(3);
        Sound.play('chest', 0.9);
        this.notify(`${it.label || 'Baú'} aberto: ${fmt(gold)} de ouro e um equipamento.`, '#e8c46a');
        if (Math.random() < 0.14 && this.player.relics.length < Object.keys(RELICS).length) {
            this.openRelicChoice(3);
        }
        this.checkAchievements();
        this.saveProgress();
    },

    useFountain(it) {
        if (!it || it.used) return;
        it.used = true;
        const p = this.player;
        p.heal(p.maxHp * 0.4, this);
        p.mana = p.maxMana;
        this.addParticles(it.x, it.y, 28, '#7fe7ff', { glow: true, size: 2.5, life: 0.8, vy: -80 });
        Sound.play('heal', 0.9);
        this.notify('A fonte restaura sua vida e mana.', '#7fe7ff');
    },

    readLore(it) {
        if (!it) return;
        const unseen = STORY.filter(s => !SAVE.codex.story[s.id]);
        const entry = unseen.length ? pick(unseen) : pick(STORY);
        SAVE.codex.story[entry.id] = true;
        if (!SAVE.storySeen.includes(entry.id)) SAVE.storySeen.push(entry.id);
        this.stats.storyFragments = (this.stats.storyFragments || 0) + 1;
        SAVE.stats.storyFragments = (SAVE.stats.storyFragments || 0) + 1;
        this.gold += 15;
        this.stats.goldEarned += 15;
        it.used = true;
        this.storyModal = {
            title: entry.title,
            subtitle: 'FRAGMENTO DE MEMÓRIA',
            text: entry.text,
            lines: ['As palavras ficam gravadas no seu códice.', 'Recompensa: +15 ouro.'],
            returnState: 'playing'
        };
        this.setState('story');
        Sound.play('confirm', 0.7);
        this.checkAchievements();
    },

    usePortal(it) {
        if (!it || it.used) return;
        it.used = true;
        const p = this.player;
        p.heal(p.maxHp * 0.25, this);
        this.gold += 40;
        this.stats.goldEarned += 40;
        this.soulsRun = (this.soulsRun || 0) + 2;
        this.addParticles(it.x, it.y - 20, 40, '#b06bff', { glow: true, size: 3, life: 0.9, vy: -100 });
        this.flashScreen('#b06bff', 0.2);
        this.shakeCamera(4);
        Sound.play('teleport', 0.9);
        this.notify('O portal devolve parte da sua essência. +40 ouro, +2 almas.', '#b06bff');
        this.saveProgress();
    },

    // =============================================================
    // HISTÓRIA / CONFIGURAÇÕES
    // =============================================================
    showTutorial() {
        this.storyModal = {
            title: 'COMO SOBREVIVER AO SELO',
            subtitle: 'GUIA RÁPIDO',
            text: 'Você desce ao selo de Vahl. Cada cinco ondas um chefe guarda a passagem. Colete ouro, equipamentos e relíquias — a morte é permanente, mas as moedas atravessam.',
            lines: TUTORIAL_STEPS,
            returnState: this.state === 'story' ? 'playing' : this.state
        };
        this.setState('story');
    },

    closeStory() {
        const back = (this.storyModal && this.storyModal.returnState) || 'menu';
        this.storyModal = null;
        this.setState(back);
        this.saveProgress();
    },

    openSettings(from) {
        this.settingsReturn = from || this.state || 'menu';
        this.setState('settings');
    },

    closeSettings() {
        const back = this.settingsReturn || 'menu';
        this.settingsReturn = 'menu';
        this.setState(back);
        this.saveProgress();
    },

    toggleSetting(key) {
        if (typeof SAVE.settings[key] !== 'boolean') return;
        SAVE.settings[key] = !SAVE.settings[key];
        Sound.play('ui');
        this.saveProgress();
    },

    setSetting(key, value) {
        if (typeof SAVE.settings[key] === 'number') {
            SAVE.settings[key] = clamp(Number(value) || 0, 0, 1);
        } else if (typeof SAVE.settings[key] === 'boolean') {
            SAVE.settings[key] = !!value;
        }
        if (key === 'master' || key === 'music' || key === 'sfx') {
            Sound.applyVolumes();
        }
        this.saveProgress();
    },

    // =============================================================
    // HABILIDADES
    // =============================================================
    castSkill(id, source) {
        if (!source || !SKILLS[id]) return false;
        const p = source;
        const sp = p.getSkillPower ? p.getSkillPower() : 1;
        const area = (p.stats && p.stats.areaMult) || 1;
        const skill = SKILLS[id];
        const color = skill.color;
        const target = this.screenToWorld(UI.mouse.x, UI.mouse.y);

        switch (id) {
            case 'nova': {
                const radius = 165 * area;
                this.explode(p.x, p.y, radius, 30 * sp, {
                    source: p, color, style: 'shadow', knockback: 190,
                    lifesteal: true
                });
                for (const e of this.enemiesInRadius(p.x, p.y, radius * 1.1)) {
                    if (e.hp > 0) e.applyStatus('chill', 2.6, 0, this);
                }
                this.effects.push(new Shockwave(p.x, p.y, radius, color, { life: 0.55, width: 7 }));
                this.addParticles(p.x, p.y, 30, color, {
                    glow: true, size: 3, life: 0.7, vx: rand(-180, 180), vy: rand(-180, 180)
                });
                this.shakeCamera(4);
                Sound.play('void', 0.8);
                return true;
            }
            case 'spear': {
                this.projectiles.push(new PlayerProjectile(p.x, p.y - 6, p.aim, {
                    speed: 1020, damage: 52 * sp, color, type: 'spear',
                    pierce: true, life: 1.25, radius: 15, source: p,
                    crit: Math.random() < p.stats.critChance,
                    knockback: 260, trail: true
                }));
                this.addParticles(p.x, p.y, 10, color, { glow: true, size: 2, life: 0.3 });
                Sound.play('slash', 0.9);
                return true;
            }
            case 'meteor': {
                const cx = clamp(target.x, ARENA.minX + 60, ARENA.maxX - 60);
                const cy = clamp(target.y, ARENA.minY + 60, ARENA.maxY - 60);
                for (let i = 0; i < 5; i++) {
                    this.effects.push(new DelayedBlast(
                        cx + rand(-90, 90) * area, cy + rand(-90, 90) * area,
                        72 * area, 0.45 + i * 0.16, 34 * sp,
                        { color: '#ff7a3d', style: 'fire', source: p, label: 'METEORO', knockback: 120 }
                    ));
                }
                this.addParticles(cx, cy, 24, '#ff7a3d', { glow: true, size: 3, life: 0.6, vy: -100 });
                Sound.play('meteor', 0.9);
                this.shakeCamera(3);
                return true;
            }
            case 'chains': {
                let first = null, bd = 680 * 680;
                for (const e of this.enemies) {
                    if (e.hp <= 0 || e.spawnTimer > 0) continue;
                    const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
                    if (d2 < bd) { bd = d2; first = e; }
                }
                if (!first) {
                    this.addFloatingText(p.x, p.y - 40, 'SEM ALVOS', '#9b93a6', false);
                    return false;
                }
                this.damageEnemy(first, 26 * sp, {
                    source: p, color, lifesteal: true, knockback: 80
                });
                first.applyStatus('stun', 1.2, 0, this);
                this.chainLightning(first, 4, 22 * sp, color, p);
                this.effects.push(new BeamEffect(p.x, p.y, first.x, first.y, color, { life: 0.3, width: 3 }));
                Sound.play('lightning', 0.9);
                return true;
            }
            case 'frost': {
                const radius = 185 * area;
                this.explode(p.x, p.y, radius, 34 * sp, {
                    source: p, color, style: 'ice', knockback: 120, lifesteal: true
                });
                for (const e of this.enemiesInRadius(p.x, p.y, radius)) {
                    if (e.hp > 0) e.applyStatus('freeze', 2.1, 0, this);
                }
                this.addParticles(p.x, p.y, 34, color, {
                    glow: true, size: 2.6, life: 0.8, vx: rand(-220, 220), vy: rand(-220, 220)
                });
                Sound.play('ice', 0.9);
                return true;
            }
            case 'flames': {
                let hit = false;
                for (const e of this.enemies) {
                    if (e.hp <= 0 || e.spawnTimer > 0) continue;
                    const d = dist(p.x, p.y, e.x, e.y);
                    if (d > 300 * area + e.size) continue;
                    const ea = angleBetween(p.x, p.y, e.x, e.y);
                    if (angleDiff(ea, p.aim) > 0.72) continue;
                    hit = true;
                    this.damageEnemy(e, 36 * sp, {
                        source: p, color, lifesteal: true, knockback: 150
                    });
                    if (e.hp > 0) e.applyStatus('burn', 4, 8 * sp, this);
                }
                this.effects.push(new SlashEffect(p.x, p.y, p.aim, 290 * area, 1.5, color, {
                    heavy: true, width: 34, life: 0.35
                }));
                this.addParticles(p.x + Math.cos(p.aim) * 120, p.y + Math.sin(p.aim) * 120, 30, color, {
                    glow: true, size: 3, life: 0.6,
                    vx: Math.cos(p.aim) * rand(80, 240) + rand(-60, 60),
                    vy: Math.sin(p.aim) * rand(80, 240) + rand(-60, 60)
                });
                Sound.play('fire', 0.9);
                if (!hit) this.addFloatingText(p.x, p.y - 40, 'CONE VAZIO', '#9b93a6', false);
                return true;
            }
            case 'storm': {
                this.effects.push(new StormField(p, 3.6, 24 * sp, color));
                this.flashScreen(color, 0.14);
                Sound.play('lightning', 1);
                return true;
            }
            case 'shield': {
                p.addShield(80 + p.maxMana * 0.25, this);
                p.reflectTimer = 6;
                p.reflectPct = 0.35;
                p.addBuff('arcane_shield', 'damage', 1.05, 6);
                this.effects.push(new Shockwave(p.x, p.y, 90, color, { life: 0.6, width: 5 }));
                this.addParticles(p.x, p.y, 26, color, { glow: true, size: 2.5, life: 0.7, vy: -60 });
                Sound.play('shield', 0.9);
                return true;
            }
            case 'blink': {
                const fromX = p.x, fromY = p.y;
                const d = 330;
                const nx = clamp(p.x + Math.cos(p.aim) * d, ARENA.minX + 40, ARENA.maxX - 40);
                const ny = clamp(p.y + Math.sin(p.aim) * d, ARENA.minY + 40, ARENA.maxY - 40);
                for (const e of this.enemiesInRadius(fromX, fromY, 110)) {
                    if (e.hp > 0) e.applyStatus('stun', 0.8, 0, this);
                }
                this.explode(fromX, fromY, 110, 40 * sp, {
                    source: p, color, knockback: 260, lifesteal: true
                });
                this.addParticles(fromX, fromY, 22, color, { glow: true, size: 2.5, life: 0.5 });
                p.x = nx; p.y = ny;
                p.iframes = Math.max(p.iframes, 0.7);
                this.explode(nx, ny, 90, 28 * sp, {
                    source: p, color, knockback: 200, lifesteal: true
                });
                this.addParticles(nx, ny, 22, color, { glow: true, size: 2.5, life: 0.5 });
                Sound.play('teleport', 0.9);
                return true;
            }
            case 'drain': {
                const target2 = this.nearestEnemy(p.x, p.y, 560);
                if (!target2) {
                    this.addFloatingText(p.x, p.y - 40, 'SEM ALVOS', '#9b93a6', false);
                    return false;
                }
                this.effects.push(new DrainBeam(p, target2, 110 * sp, color));
                this.damageEnemy(target2, 20 * sp, {
                    source: p, color, lifesteal: true, silentText: true
                });
                Sound.play('void', 0.8);
                return true;
            }
            case 'runes': {
                const cx = clamp(target.x, ARENA.minX + 80, ARENA.maxX - 80);
                const cy = clamp(target.y, ARENA.minY + 80, ARENA.maxY - 80);
                for (let i = 0; i < 3; i++) {
                    const a = i / 3 * TAU;
                    this.effects.push(new RuneTrap(
                        cx + Math.cos(a) * 52, cy + Math.sin(a) * 52,
                        62 * sp, p
                    ));
                }
                this.addParticles(cx, cy, 18, color, { glow: true, size: 2, life: 0.5 });
                Sound.play('rune', 0.9);
                return true;
            }
            case 'summon': {
                const dur = 14 + (p.stats.summonBonus || 0) * 6;
                const dmg = 28 * sp * (1 + (p.stats.summonDamage || 0));
                this.minions.push(new Minion(p.x + rand(-30, 30), p.y + rand(-30, 30), p, dmg, dur));
                this.addParticles(p.x, p.y, 26, color, { glow: true, size: 2.5, life: 0.8 });
                this.notify('O Lobo Espectral atende ao chamado.', '#a8ffdf');
                Sound.play('void', 0.8);
                return true;
            }
            case 'supreme': {
                const radius = 440;
                this.flashScreen('#ff7ae0', 0.5);
                this.shakeCamera(14);
                this.effects.push(new Shockwave(p.x, p.y, radius, '#ff7ae0', { life: 0.9, width: 12 }));
                for (const e of this.enemiesInRadius(p.x, p.y, radius)) {
                    if (e.hp <= 0) continue;
                    this.damageEnemy(e, 120 * sp, {
                        source: p, color: '#ff7ae0', crit: true, knockback: 300,
                        lifesteal: true, silentText: false
                    });
                    if (e.hp > 0) e.applyStatus('stun', 1.6, 0, this);
                }
                p.heal(p.maxHp * 0.2, this);
                this.addParticles(p.x, p.y, 70, '#ff7ae0', {
                    glow: true, size: 4, life: 1.1, vx: rand(-300, 300), vy: rand(-300, 300)
                });
                Sound.play('victory', 0.9);
                return true;
            }
            default:
                return false;
        }
    },

    // =============================================================
    // CONQUISTAS
    // =============================================================
    checkAchievements() {
        let unlocked = 0;
        for (const a of ACHIEVEMENTS) {
            if (SAVE.achievements[a.id]) continue;
            let ok = false;
            try { ok = !!a.check(SAVE); } catch (e) { ok = false; }
            if (!ok) continue;
            SAVE.achievements[a.id] = true;
            SAVE.coins += a.reward;
            unlocked++;
            this.notify(`Conquista: ${a.name} (+${a.reward} moedas)`, UI_COLORS.gold);
            Sound.play('victory', 0.7);
        }
        if (unlocked) this.saveProgress();
    },

    // =============================================================
    // FIM DE RUN / SAVE
    // =============================================================
    finalizeRun(abandoned = false) {
        if (!this.runActive || this.finalized) return;
        this.finalized = true;
        this.runActive = false;
        const stats = this.stats || this.blankStats();
        const coins = Math.max(0, Math.floor((this.gold || 0) * 0.55 + (this.soulsRun || 0) * 2 + (this.stats.bosses || 0) * 25));
        const oldBest = SAVE.bestScore || 0;
        const score = Math.round((
            (this.wave || 1) * 120 +
            (stats.kills || 0) * 4 +
            (stats.bosses || 0) * 600 +
            (stats.damageDealt || 0) * 0.02 +
            (stats.chests || 0) * 30
        ) * (this.difficulty ? this.difficulty.score : 1));

        SAVE.coins += coins;
        SAVE.souls += this.soulsRun || 0;
        SAVE.stats.coinsEarned = (SAVE.stats.coinsEarned || 0) + coins;
        SAVE.stats.damageDealt = (SAVE.stats.damageDealt || 0) + (stats.damageDealt || 0);
        SAVE.stats.damageTaken = (SAVE.stats.damageTaken || 0) + (stats.damageTaken || 0);
        SAVE.stats.elites = (SAVE.stats.elites || 0) + (stats.elites || 0);
        SAVE.stats.skillsUsed = (SAVE.stats.skillsUsed || 0) + (stats.skillsUsed || 0);
        SAVE.stats.bestCombo = Math.max(SAVE.stats.bestCombo || 0, stats.bestCombo || 0);
        SAVE.stats.highestLevel = Math.max(SAVE.stats.highestLevel || 1, stats.highestLevel || 1);
        if (!abandoned) SAVE.stats.deaths = (SAVE.stats.deaths || 0) + 1;
        SAVE.bestWave = Math.max(SAVE.bestWave || 1, this.wave || 1);
        this.newRecord = score > oldBest;
        SAVE.bestScore = Math.max(oldBest, score);

        const summary = {
            kills: stats.kills || 0,
            bosses: stats.bosses || 0,
            damageDealt: Math.round(stats.damageDealt || 0),
            damageTaken: Math.round(stats.damageTaken || 0),
            gold: this.gold || 0,
            coins,
            level: this.player ? this.player.level : 1,
            wave: this.wave,
            score,
            time: this.runTime || 0,
            abandoned: !!abandoned
        };
        this.lastRunSummary = summary;
        SAVE.lastRun = summary;
        this.runWon = (this.wave || 1) > 25;
        if (this.runWon && !SAVE.achievements.selo_quebrado) {
            // Conquista narrativa opcional (não está na lista principal).
            SAVE.achievements.selo_quebrado = true;
        }

        this.checkAchievements();
        this.saveProgress();
        this.state = 'gameover';
        Sound.setTheme('menu');
        if (!abandoned) Sound.play('death', 0.8);
    },

    saveProgress() {
        if (this.player && this.runActive) {
            this.stats.highestLevel = Math.max(this.stats.highestLevel || 1, this.player.level || 1);
        }
        saveProgress();
    }
});

// Torna os eventos acessíveis ao render / depuração.
window.RUN_EVENTS = RUN_EVENTS;


/* ----------------------------------------------------------------
   MÓDULO: render.js
   ---------------------------------------------------------------- */
/* ================================================================
   SHADOW DUNGEON — RENDERIZAÇÃO / HUD / INPUT / LOOP
   ================================================================ */
'use strict';

Object.assign(GameSession.prototype, {

    // =============================================================
    // RENDER PRINCIPAL
    // =============================================================
    render() {
        const st = this.state;
        const menuStates = ['menu', 'loadout', 'meta', 'achievements', 'codex', 'settings'];
        const hasWorld = !!this.player && st !== 'menu';

        if (hasWorld) this.drawWorld();
        else this.drawMenuBackground();

        if (st === 'playing') this.drawHUD();

        switch (st) {
            case 'menu': UI.drawMenu(this); break;
            case 'loadout': UI.drawLoadout(this); break;
            case 'meta': UI.drawMeta(this); break;
            case 'achievements': UI.drawAchievements(this); break;
            case 'codex': UI.drawCodex(this); break;
            case 'settings': UI.drawSettings(this); break;
            case 'paused': UI.drawPause(this); break;
            case 'inventory': UI.drawInventory(this); break;
            case 'levelup': UI.drawLevelUp(this); break;
            case 'relic': UI.drawRelicChoice(this); break;
            case 'merchant': UI.drawMerchant(this); break;
            case 'event': UI.drawEvent(this); break;
            case 'story': UI.drawStory(this); break;
            case 'gameover': UI.drawGameOver(this); break;
            default: break;
        }

        if (st === 'playing') {
            UI.drawNotifications(this);
            this.drawBanner();
            if (settings().showFps) {
                UI.text(`${Math.round(this.fps)} FPS · ${this.enemies.length} inimigos · ${this.effects.length} efeitos`,
                    14 * UI.s, VIEW.h - 14 * UI.s, 9, UI_COLORS.faint, 'left', '600');
            }
        }
    },

    // =============================================================
    // FUNDO DO MENU
    // =============================================================
    drawMenuBackground() {
        const c = ctx;
        const t = UI.time;
        const w = VIEW.w, h = VIEW.h;
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#08060f');
        g.addColorStop(0.55, '#0d0a16');
        g.addColorStop(1, '#050409');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);

        // brilho arcano
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.35;
        glowCircle(c, w * 0.28, h * 0.30, Math.min(w, h) * 0.65, '#5a3d8f', 0.20);
        glowCircle(c, w * 0.78, h * 0.72, Math.min(w, h) * 0.55, '#2e5d78', 0.15);
        c.restore();

        // silhuetas de arcos e pilares
        c.save();
        c.globalAlpha = 0.5;
        for (let layer = 0; layer < 3; layer++) {
            const alpha = 0.10 - layer * 0.02;
            if (alpha <= 0) continue;
            c.fillStyle = `rgba(10,8,16,${0.55 - layer * 0.12})`;
            const baseY = h * (0.86 + layer * 0.03);
            const shift = Math.sin(t * 0.05 + layer) * 10;
            for (let i = -1; i < 9; i++) {
                const px = (i / 8) * w + shift;
                const pw = w * 0.075;
                const ph = h * (0.28 + (i % 3) * 0.06);
                c.fillRect(px, baseY - ph - layer * 40, pw, ph + h);
                // arco
                c.beginPath();
                c.arc(px + pw / 2, baseY - ph - layer * 40, pw * 0.62, Math.PI, TAU);
                c.fill();
            }
        }
        c.restore();

        // névoa baixa
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 5; i++) {
            const y = h * 0.68 + i * h * 0.06 + Math.sin(t * 0.3 + i) * 12;
            const rg = c.createLinearGradient(0, y - 40, 0, y + 80);
            rg.addColorStop(0, 'rgba(90,70,140,0)');
            rg.addColorStop(0.5, `rgba(90,70,140,${0.035 + i * 0.008})`);
            rg.addColorStop(1, 'rgba(90,70,140,0)');
            c.fillStyle = rg;
            c.fillRect(0, y - 40, w, 120);
        }
        c.restore();

        // runas flutuantes
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 9; i++) {
            const a = t * 0.12 + i * 1.7;
            const x = w * (0.12 + (i * 0.097) % 0.8) + Math.sin(a) * 26;
            const y = h * (0.2 + (i * 0.113) % 0.6) + Math.cos(a * 1.3) * 20;
            c.globalAlpha = 0.10 + Math.sin(t * 0.8 + i) * 0.05;
            UI.icon(i % 2 ? 'rune' : 'seal', x, y, 22 + (i % 3) * 8, i % 3 ? '#7a5cb8' : '#4b7a8f');
        }
        c.restore();

        // embers
        UI.decorEmbers();
    },

    // =============================================================
    // MUNDO
    // =============================================================
    drawWorld() {
        const c = ctx;
        c.save();
        c.translate(-this.cam.x + this.cam.sx, -this.cam.y + this.cam.sy);
        this.drawFloor(c);

        const drawables = [];
        for (const p of this.props) {
            if (!this.isVisible(p.x, p.y, 220)) continue;
            drawables.push({ y: p.y, draw: () => p.draw(c, this.time) });
        }
        for (const it of this.interactables) {
            if (!this.isVisible(it.x, it.y, 180)) continue;
            drawables.push({ y: it.y, draw: () => it.draw(c, this) });
        }
        for (const t of this.traps) {
            if (!this.isVisible(t.x, t.y, 140)) continue;
            drawables.push({ y: t.y, draw: () => t.draw(c, this) });
        }
        for (const l of this.loot) {
            if (!this.isVisible(l.x, l.y, 80)) continue;
            drawables.push({ y: l.y, draw: () => l.draw(c) });
        }
        for (const d of this.itemDrops) {
            if (!this.isVisible(d.x, d.y, 100)) continue;
            drawables.push({ y: d.y, draw: () => d.draw(c) });
        }
        for (const e of this.enemies) {
            if (e.dead || e.hp <= 0) continue;
            if (!this.isVisible(e.x, e.y, e.size + 120)) continue;
            drawables.push({ y: e.y, draw: () => e.draw(c, this) });
        }
        for (const m of this.minions) {
            if (m.dead) continue;
            drawables.push({ y: m.y, draw: () => m.draw(c, this) });
        }
        if (this.player && !this.player.dead) {
            drawables.push({ y: this.player.y, draw: () => this.player.draw(c, this) });
        }
        drawables.sort((a, b) => a.y - b.y);
        for (const d of drawables) d.draw();

        // projéteis por cima
        for (const pr of this.projectiles) pr.draw(c);
        for (const pr of this.enemyProjectiles) pr.draw(c);

        // efeitos e partículas
        for (const e of this.effects) e.draw(c);
        for (const pt of this.particles) pt.draw(c);
        for (const tx of this.texts) tx.draw(c);

        // prompt de interação
        if (this.state === 'playing') {
            const near = this.nearestInteractable();
            if (near) near.drawPrompt(c, this);
        }
        c.restore();

        this.drawLighting();
        this.drawScreenFx();
        if (this.state === 'playing') this.drawReticle();
    },

    isVisible(x, y, margin = 100) {
        return x > this.cam.x - margin && x < this.cam.x + VIEW.w + margin &&
            y > this.cam.y - margin && y < this.cam.y + VIEW.h + margin;
    },

    drawFloor(c) {
        const b = this.biome || BIOMES[0];
        const t = this.time;
        const x0 = Math.floor((this.cam.x - 120) / TILE) * TILE;
        const x1 = this.cam.x + VIEW.w + 120;
        const y0 = Math.floor((this.cam.y - 120) / TILE) * TILE;
        const y1 = this.cam.y + VIEW.h + 120;

        c.fillStyle = b.floor;
        c.fillRect(this.cam.x - 50, this.cam.y - 50, VIEW.w + 100, VIEW.h + 100);

        for (let y = y0; y < y1; y += TILE) {
            for (let x = x0; x < x1; x += TILE) {
                const ix = Math.floor(x / TILE), iy = Math.floor(y / TILE);
                const h = hash2(ix, iy);
                const h2 = hash2(ix + 31.7, iy - 19.3);
                c.fillStyle = h > 0.5 ? b.floor2 : shade(b.floor, 3 + h * 5);
                c.fillRect(x, y, TILE + 1, TILE + 1);
                if (h2 > 0.93) {
                    c.strokeStyle = 'rgba(0,0,0,0.28)';
                    c.lineWidth = 1;
                    c.beginPath();
                    c.moveTo(x + TILE * 0.18, y + TILE * 0.2);
                    c.lineTo(x + TILE * 0.55, y + TILE * 0.5);
                    c.lineTo(x + TILE * 0.42, y + TILE * 0.82);
                    c.stroke();
                }
                if (h < 0.045) {
                    c.fillStyle = 'rgba(255,255,255,0.018)';
                    c.fillRect(x + TILE * 0.3, y + TILE * 0.3, TILE * 0.4, TILE * 0.4);
                }
            }
        }

        // salas: lavagem de cor e contorno rúnico
        for (const room of this.rooms) {
            if (!this.isVisible(room.x + room.w / 2, room.y + room.h / 2, Math.max(room.w, room.h))) continue;
            c.save();
            const accent = room.type === 'boss' ? b.accent : b.wallLight;
            const rg = c.createRadialGradient(
                room.x + room.w / 2, room.y + room.h / 2, 20,
                room.x + room.w / 2, room.y + room.h / 2, Math.max(room.w, room.h) * 0.65
            );
            rg.addColorStop(0, hexToRgba(accent, room.type === 'boss' ? 0.075 : 0.035));
            rg.addColorStop(1, hexToRgba(accent, 0));
            c.fillStyle = rg;
            c.fillRect(room.x - 30, room.y - 30, room.w + 60, room.h + 60);
            c.strokeStyle = hexToRgba(accent, room.type === 'boss' ? 0.26 : 0.13);
            c.lineWidth = room.type === 'boss' ? 2 : 1;
            roundRect(c, room.x, room.y, room.w, room.h, 26);
            c.stroke();
            if (room.type === 'boss') {
                c.setLineDash([12, 14]);
                c.strokeStyle = hexToRgba(b.accent, 0.16);
                c.beginPath();
                c.arc(room.x + room.w / 2, room.y + room.h / 2, Math.min(room.w, room.h) * 0.42, t * 0.1, t * 0.1 + TAU);
                c.stroke();
                c.setLineDash([]);
            }
            c.restore();
        }

        // limites da arena
        c.save();
        c.strokeStyle = hexToRgba(b.accent, 0.22);
        c.lineWidth = 3;
        c.setLineDash([20, 16]);
        c.strokeRect(ARENA.minX, ARENA.minY, ARENA.maxX - ARENA.minX, ARENA.maxY - ARENA.minY);
        c.setLineDash([]);
        c.restore();

        // brasas / poeira ambiente
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 22; i++) {
            const seed = i * 37.31;
            const px = this.cam.x + ((Math.sin(seed + t * 0.12) * 0.5 + 0.5) * VIEW.w);
            const py = this.cam.y + ((Math.cos(seed * 1.7 + t * 0.08) * 0.5 + 0.5) * VIEW.h);
            c.globalAlpha = 0.10 + (i % 4) * 0.035;
            c.fillStyle = b.accent;
            c.beginPath();
            c.arc(px, py, 1 + (i % 3) * 0.7, 0, TAU);
            c.fill();
        }
        c.restore();
    },

    drawLighting() {
        const lc = this.lightCtx;
        if (!lc) return;
        this.ensureLightCanvas();
        const lw = this.lightCanvas.width, lh = this.lightCanvas.height;
        const sx = lw / VIEW.w, sy = lh / VIEW.h;
        const b = this.biome || BIOMES[0];
        const darkness = clamp(0.88 - (b.ambient || 0.5) * 0.62, 0.32, 0.72);

        lc.setTransform(1, 0, 0, 1, 0, 0);
        lc.clearRect(0, 0, lw, lh);
        lc.fillStyle = `rgba(4,2,9,${darkness})`;
        lc.fillRect(0, 0, lw, lh);
        lc.globalCompositeOperation = 'destination-out';

        const addLight = (wx, wy, radius, alpha = 1) => {
            const x = (wx - this.cam.x + this.cam.sx) * sx;
            const y = (wy - this.cam.y + this.cam.sy) * sy;
            const r = radius * sx;
            if (x + r < 0 || y + r < 0 || x - r > lw || y - r > lh) return;
            const g = lc.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`);
            g.addColorStop(0.45, `rgba(255,255,255,${0.55 * alpha})`);
            g.addColorStop(0.78, `rgba(255,255,255,${0.18 * alpha})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            lc.fillStyle = g;
            lc.beginPath();
            lc.arc(x, y, r, 0, TAU);
            lc.fill();
        };

        if (this.player) addLight(this.player.x, this.player.y - 10, 300);
        if (this.boss && this.boss.hp > 0) addLight(this.boss.x, this.boss.y, 250, 0.9);
        for (const p of this.props) {
            if (p.light && this.isVisible(p.x, p.y, p.light.radius)) {
                addLight(p.x, p.y - 20, p.light.radius, p.light.intensity || 1);
            }
        }
        for (const it of this.interactables) {
            if (!it.used && this.isVisible(it.x, it.y, 120)) addLight(it.x, it.y - 10, 130, 0.75);
        }
        for (const l of this.loot) {
            if (this.isVisible(l.x, l.y, 60)) addLight(l.x, l.y, 45, 0.5);
        }
        for (const d of this.itemDrops) {
            if (this.isVisible(d.x, d.y, 80)) addLight(d.x, d.y, 85, 0.85);
        }
        for (const pr of this.projectiles) {
            if (this.isVisible(pr.x, pr.y, 60)) addLight(pr.x, pr.y, 50, 0.45);
        }

        lc.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.drawImage(this.lightCanvas, 0, 0, VIEW.w, VIEW.h);
        ctx.restore();
    },

    drawScreenFx() {
        const c = ctx;
        // névoa colorida do bioma
        const b = this.biome || BIOMES[0];
        if (b && b.fog) {
            c.save();
            c.globalCompositeOperation = 'lighter';
            c.globalAlpha = 0.05 + Math.sin(this.time * 0.25) * 0.012;
            const g = c.createRadialGradient(VIEW.w * 0.5, VIEW.h * 0.5, VIEW.h * 0.2,
                VIEW.w * 0.5, VIEW.h * 0.5, VIEW.h * 0.85);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(1, b.fog);
            c.fillStyle = g;
            c.fillRect(0, 0, VIEW.w, VIEW.h);
            c.restore();
        }
        // vinheta
        c.save();
        const vg = c.createRadialGradient(VIEW.w / 2, VIEW.h / 2, Math.min(VIEW.w, VIEW.h) * 0.35,
            VIEW.w / 2, VIEW.h / 2, Math.max(VIEW.w, VIEW.h) * 0.78);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(0.72, 'rgba(0,0,0,0.24)');
        vg.addColorStop(1, 'rgba(0,0,0,0.72)');
        c.fillStyle = vg;
        c.fillRect(0, 0, VIEW.w, VIEW.h);
        c.restore();
        // vida baixa
        if (this.player && this.player.hp > 0 && this.player.hp < this.player.maxHp * 0.3) {
            const p = 0.35 + Math.sin(this.time * 6) * 0.12;
            c.save();
            c.fillStyle = `rgba(120,0,18,${0.10 + p * 0.12})`;
            c.fillRect(0, 0, VIEW.w, VIEW.h);
            c.restore();
        }
        if (this.flash.alpha > 0) {
            c.save();
            c.globalAlpha = clamp(this.flash.alpha, 0, 0.65);
            c.fillStyle = this.flash.color;
            c.fillRect(0, 0, VIEW.w, VIEW.h);
            c.restore();
        }
    },

    drawReticle() {
        if (!this.player) return;
        const c = ctx;
        const m = UI.mouse;
        if (m.x < 0 || m.y < 0) return;
        const color = UI.pointInHot(m.x, m.y) ? UI_COLORS.gold : '#e9e3d6';
        c.save();
        c.translate(m.x, m.y);
        c.strokeStyle = hexToRgba(color, 0.85);
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(0, 0, 8, 0, TAU);
        c.stroke();
        c.beginPath();
        c.moveTo(-14, 0); c.lineTo(-9, 0);
        c.moveTo(14, 0); c.lineTo(9, 0);
        c.moveTo(0, -14); c.lineTo(0, -9);
        c.moveTo(0, 14); c.lineTo(0, 9);
        c.stroke();
        c.fillStyle = color;
        c.beginPath();
        c.arc(0, 0, 1.7, 0, TAU);
        c.fill();
        c.restore();
    },

    // =============================================================
    // HUD
    // =============================================================
    drawHUD() {
        const c = ctx;
        const s = UI.s;
        const p = this.player;
        if (!p) return;

        // ---------------- jogador ----------------
        const px = 16 * s, py = 16 * s;
        const pw = 318 * s, ph = 112 * s;
        c.save();
        c.fillStyle = 'rgba(10,8,16,0.72)';
        roundRect(c, px, py, pw, ph, 10 * s);
        c.fill();
        c.strokeStyle = hexToRgba(CLASSES[p.classId].color, 0.35);
        c.lineWidth = 1;
        c.stroke();
        c.restore();

        const cls = CLASSES[p.classId];
        // retrato
        c.save();
        c.fillStyle = hexToRgba(cls.color, 0.12);
        c.beginPath();
        c.arc(px + 36 * s, py + 36 * s, 25 * s, 0, TAU);
        c.fill();
        c.strokeStyle = hexToRgba(cls.color, 0.65);
        c.lineWidth = 1.5;
        c.stroke();
        c.restore();
        UI.icon(cls.icon, px + 36 * s, py + 36 * s, 27 * s, cls.color);

        UI.text(cls.short, px + 68 * s, py + 20 * s, 12.5, '#f2ead9', 'left', '700');
        UI.text(`Nv ${p.level}`, px + pw - 16 * s, py + 20 * s, 10.5, UI_COLORS.gold, 'right', '700');

        // vida
        const bx = px + 68 * s, bw = pw - 86 * s;
        UI.bar(bx, py + 32 * s, bw, 13 * s, p.hp, p.maxHp, UI_COLORS.hp, {
            light: UI_COLORS.hpLight, label: `${Math.ceil(Math.max(0, p.hp))} / ${Math.round(p.maxHp)}`, labelSize: 9
        });
        if (p.shield > 0) {
            UI.bar(bx, py + 48 * s, bw * clamp(p.shield / (p.maxHp * 0.8), 0.04, 1), 3.5 * s, 1, 1, UI_COLORS.shield, { glow: false });
            UI.text(`${Math.round(p.shield)}`, bx + bw - 4 * s, py + 49 * s, 8, UI_COLORS.shield, 'right', '700');
        }
        // mana
        UI.bar(bx, py + 58 * s, bw, 8 * s, p.mana, p.maxMana, UI_COLORS.mana, {
            light: UI_COLORS.manaLight, glow: false
        });
        UI.text(`${Math.round(p.mana)}`, bx + bw - 3 * s, py + 62 * s, 7.5, '#dbe9ff', 'right', '700');
        // xp
        UI.bar(bx, py + 72 * s, bw, 4.5 * s, p.xp, p.xpToNext, UI_COLORS.xp, { glow: false });
        UI.text(`XP ${Math.floor(p.xp)}/${Math.round(p.xpToNext)}`, bx, py + 87 * s, 8.5, UI_COLORS.dim);
        UI.text(cls.passive, bx + bw, py + 87 * s, 8.5, hexToRgba(cls.color, 0.9), 'right', '600');

        // status/buffs
        let sx0 = px + 12 * s;
        if (p.buffs && p.buffs.length) {
            for (const b of p.buffs.slice(0, 5)) {
                c.save();
                c.fillStyle = 'rgba(97,192,255,0.18)';
                roundRect(c, sx0, py + 94 * s, 30 * s, 10 * s, 3 * s);
                c.fill();
                c.restore();
                UI.text(b.id.slice(0, 6), sx0 + 15 * s, py + 99 * s, 6.5, '#9fd8ff', 'center', '700');
                sx0 += 34 * s;
            }
        }

        // ---------------- minimapa / topo direito ----------------
        const rightX = VIEW.w - 16 * s;
        this.hudIconButton(rightX - 32 * s, 16 * s, 30 * s, 'pause', () => this.setState('paused'), 'Pausar (ESC)');
        this.hudIconButton(rightX - 68 * s, 16 * s, 30 * s, 'chest', () => this.setState('inventory'), 'Inventário (I)');

        const mw = Math.min(196 * s, VIEW.w * 0.24);
        const mh = mw * 0.66;
        UI.drawMinimap(this, rightX - mw, 54 * s, mw, mh);

        const infoX = rightX - mw;
        let iy = 54 * s + mh + 15 * s;
        UI.text(`ONDA ${this.wave}`, infoX, iy, 12, UI_COLORS.gold, 'left', '700');
        const wavesToBoss = 5 - ((this.wave - 1) % 5);
        UI.text(wavesToBoss === 1 ? 'CHEFE AGORA' : `CHEFE EM ${wavesToBoss - 1}`,
            infoX + 52 * s, iy, 8.5, wavesToBoss === 1 ? '#ff5f6d' : UI_COLORS.faint, 'left', '600');
        iy += 16 * s;
        UI.text(this.biome ? this.biome.name : '—', infoX, iy, 9.5, this.biome ? this.biome.accent : UI_COLORS.dim);
        iy += 16 * s;
        if (this.waveState === 'intermission') {
            UI.text(`Próxima onda em ${Math.max(0, this.waveTimer).toFixed(1)}s`, infoX, iy, 9, UI_COLORS.dim);
        } else {
            const rem = this.enemies.length + this.spawnQueue.length;
            UI.text(`${rem} criatura${rem === 1 ? '' : 's'} restante${rem === 1 ? '' : 's'}`, infoX, iy, 9, UI_COLORS.dim);
        }
        iy += 17 * s;
        UI.icon('coin', infoX + 6 * s, iy, 11 * s, UI_COLORS.gold);
        UI.text(fmt(this.gold), infoX + 16 * s, iy, 10.5, UI_COLORS.gold, 'left', '700');
        UI.icon('xp', infoX + 70 * s, iy, 11 * s, UI_COLORS.xp);
        UI.text(fmt(this.soulsRun), infoX + 80 * s, iy, 10.5, UI_COLORS.xp, 'left', '700');
        iy += 16 * s;
        UI.text(`${this.difficulty.name} · ${fmtTime(this.runTime)}`, infoX, iy, 8.5, this.difficulty.color);
        if (SAVE.selected.modifiers.length) {
            iy += 13 * s;
            UI.text(SAVE.selected.modifiers.map(id => MODIFIERS[id] ? MODIFIERS[id].name : id).join(' · '), infoX, iy, 7.5, '#b06bff');
        }

        // ---------------- combo ----------------
        if (this.combo >= 2) {
            const a = clamp(this.comboTimer / 4.5, 0, 1);
            c.save();
            c.globalAlpha = 0.35 + a * 0.65;
            const cx = VIEW.w - 74 * s;
            const cy = VIEW.h * 0.46;
            const scale = 1 + Math.sin(this.time * 8) * 0.04;
            c.translate(cx, cy);
            c.scale(scale, scale);
            c.textAlign = 'center';
            c.font = `800 ${34 * s}px Georgia, serif`;
            c.fillStyle = '#ffd166';
            c.shadowColor = '#ffb347';
            c.shadowBlur = 16;
            c.fillText(String(this.combo), 0, 0);
            c.shadowBlur = 0;
            c.font = `700 ${9 * s}px Segoe UI, sans-serif`;
            c.fillStyle = '#e8c46a';
            c.fillText('COMBO', 0, 14 * s);
            c.restore();
        }

        // ---------------- habilidades ----------------
        const n = p.skills.length;
        const slot = 60 * s, gap = 10 * s;
        const total = n * slot + (n - 1) * gap;
        let skx = (VIEW.w - total) / 2 + 54 * s;
        const sky = VIEW.h - 76 * s;
        p.skills.forEach((id, i) => {
            const def = SKILLS[id];
            if (!def) return;
            const x = skx + i * (slot + gap);
            const y = sky;
            const cd = p.getCooldown(id);
            const cdMax = def.cooldown * p.stats.cooldownMult;
            const hot = UI.hover(x, y, slot, slot);
            const clicked = UI.consumeClick(x, y, slot, slot);
            UI.push(x, y, slot, slot, 'skill_' + i, () => p.castSkill(i, this));
            c.save();
            c.fillStyle = hot ? 'rgba(46,39,62,0.96)' : 'rgba(14,11,22,0.92)';
            roundRect(c, x, y, slot, slot, 8 * s);
            c.fill();
            c.strokeStyle = hot ? hexToRgba(def.color, 0.9) : hexToRgba(def.color, 0.32);
            c.lineWidth = hot ? 1.7 : 1;
            c.stroke();
            c.restore();
            UI.icon(def.icon, x + slot / 2, y + slot / 2 - 3 * s, 25 * s, cd > 0 ? '#5a5464' : def.color);
            UI.text(['Q', 'E', 'R', 'F'][i] || '', x + slot / 2, y + slot - 9 * s, 9, UI_COLORS.gold, 'center', '700');
            if (cd > 0) {
                const ratio = clamp(cd / Math.max(0.001, cdMax), 0, 1);
                c.save();
                c.fillStyle = 'rgba(5,4,10,0.72)';
                roundRect(c, x + 1, y + 1, slot - 2, (slot - 2) * ratio, 7 * s);
                c.fill();
                c.restore();
                UI.text(cd.toFixed(1), x + slot / 2, y + slot / 2 - 3 * s, 14, '#ffffff', 'center', '800');
            }
            if (p.mana < p.getSkillCost(def)) {
                c.save();
                c.fillStyle = 'rgba(20,40,80,0.35)';
                roundRect(c, x, y, slot, slot, 8 * s);
                c.fill();
                c.restore();
            }
            if (clicked) {
                const ok = p.castSkill(i, this);
                if (!ok) Sound.play('denied', 0.4);
            }
        });

        // dash
        const dx = skx + total + 20 * s;
        const dashReady = p.dashCd <= 0;
        c.save();
        c.fillStyle = 'rgba(14,11,22,0.92)';
        roundRect(c, dx, sky + 6 * s, 48 * s, 48 * s, 24 * s);
        c.fill();
        c.strokeStyle = dashReady ? 'rgba(127,231,255,0.65)' : 'rgba(127,231,255,0.18)';
        c.lineWidth = 1.4;
        c.stroke();
        c.restore();
        UI.icon('boots', dx + 24 * s, sky + 30 * s, 20 * s, dashReady ? '#7fe7ff' : '#4a5460');
        UI.text('SHIFT', dx + 24 * s, sky + 48 * s, 7.5, UI_COLORS.faint, 'center', '700');
        if (!dashReady) {
            c.save();
            c.strokeStyle = hexToRgba('#7fe7ff', 0.75);
            c.lineWidth = 2.5;
            c.beginPath();
            c.arc(dx + 24 * s, sky + 30 * s, 20 * s, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - p.dashCd / Math.max(0.001, p.stats.dashCdMax)));
            c.stroke();
            c.restore();
        }

        // ---------------- chefe ----------------
        if (this.boss && this.boss.hp > 0) {
            const bw = Math.min(660 * s, VIEW.w * 0.56);
            const bx2 = (VIEW.w - bw) / 2;
            const by2 = VIEW.h - 140 * s;
            c.save();
            c.fillStyle = 'rgba(10,6,12,0.8)';
            roundRect(c, bx2 - 10 * s, by2 - 22 * s, bw + 20 * s, 52 * s, 8 * s);
            c.fill();
            c.strokeStyle = hexToRgba(this.boss.color, 0.5);
            c.lineWidth = 1;
            c.stroke();
            c.restore();
            UI.text(this.boss.name, bx2, by2 - 6 * s, 11.5, '#ffe8ea', 'left', '700');
            UI.text(this.boss.phase === 2 ? 'FASE II' : 'GUARDIÃO DO SELO', bx2 + bw, by2 - 6 * s, 8.5,
                this.boss.phase === 2 ? '#ff4d6d' : UI_COLORS.dim, 'right', '700');
            UI.bar(bx2, by2 + 4 * s, bw, 13 * s, this.boss.hp, this.boss.maxHp, '#c0392b', {
                light: '#ff6b5a', label: `${Math.ceil(Math.max(0, this.boss.hp))} / ${Math.round(this.boss.maxHp)}`, labelSize: 8.5
            });
            c.save();
            c.strokeStyle = 'rgba(255,255,255,0.35)';
            c.beginPath();
            c.moveTo(bx2 + bw * 0.5, by2 + 4 * s);
            c.lineTo(bx2 + bw * 0.5, by2 + 17 * s);
            c.stroke();
            c.restore();
        }

        // ---------------- objetivo ----------------
        if (this.waveState === 'intermission' && !this.boss) {
            const oy = VIEW.h * 0.36;
            UI.text('ONDA LIMPA', VIEW.w / 2, oy, 15, UI_COLORS.success, 'center', '700', 'Georgia, serif');
            UI.text(`Próxima investida em ${Math.max(0, this.waveTimer).toFixed(1)}s`, VIEW.w / 2, oy + 18 * s, 9.5, UI_COLORS.dim, 'center');
        }
    },

    hudIconButton(x, y, size, icon, cb, tooltip) {
        const c = ctx;
        const hot = UI.hover(x, y, size, size);
        const clicked = UI.consumeClick(x, y, size, size);
        UI.push(x, y, size, size, 'hud_' + icon, cb);
        c.save();
        c.fillStyle = hot ? 'rgba(50,42,68,0.95)' : 'rgba(12,9,20,0.78)';
        roundRect(c, x, y, size, size, 7 * UI.s);
        c.fill();
        c.strokeStyle = hot ? hexToRgba(UI_COLORS.gold, 0.8) : 'rgba(168,140,220,0.28)';
        c.lineWidth = 1;
        c.stroke();
        c.restore();
        UI.icon(icon, x + size / 2, y + size / 2, size * 0.5, hot ? UI_COLORS.gold : UI_COLORS.dim);
        if (hot && tooltip) UI.tooltip(tooltip, [], x, y + size, UI_COLORS.gold);
        if (clicked) {
            Sound.play('ui');
            cb();
        }
    },

    drawBanner() {
        if (!this.banner) return;
        const b = this.banner;
        const s = UI.s;
        const c = ctx;
        const life = b.life, max = b.maxLife;
        const a = clamp(Math.min(max - life, life) * 2.6, 0, 1);
        if (a <= 0) return;
        const y = VIEW.h * 0.27;
        c.save();
        c.globalAlpha = a;
        c.textAlign = 'center';
        const size = (b.boss ? 34 : 28) * s;
        c.font = `700 ${size}px Georgia, serif`;
        c.shadowColor = b.color;
        c.shadowBlur = 24;
        c.fillStyle = b.boss ? '#ffe3e6' : '#f2ead9';
        c.fillText(b.text, VIEW.w / 2, y);
        c.shadowBlur = 0;
        c.font = `700 ${10.5 * s}px Segoe UI, sans-serif`;
        c.fillStyle = b.color;
        c.fillText(b.sub || '', VIEW.w / 2, y + 24 * s);
        c.strokeStyle = hexToRgba(b.color, 0.5);
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(VIEW.w / 2 - 150 * s, y - size * 0.9);
        c.lineTo(VIEW.w / 2 + 150 * s, y - size * 0.9);
        c.stroke();
        c.beginPath();
        c.moveTo(VIEW.w / 2 - 110 * s, y + 34 * s);
        c.lineTo(VIEW.w / 2 + 110 * s, y + 34 * s);
        c.stroke();
        c.restore();
    }
});

// =============================================================
// INPUT
// =============================================================
function setupInput(game) {
    const c = canvas;

    const updateMouse = (e) => {
        const r = c.getBoundingClientRect();
        UI.mouse.x = (e.clientX - r.left) * (VIEW.w / Math.max(1, r.width));
        UI.mouse.y = (e.clientY - r.top) * (VIEW.h / Math.max(1, r.height));
    };

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('pointermove', updateMouse);

    const isRun = () => game.state === 'playing';
    const overHud = (x, y) => UI.pointInHot(x, y);

    c.addEventListener('pointerdown', (e) => {
        updateMouse(e);
        Sound.ensure();
        UI.click = { x: UI.mouse.x, y: UI.mouse.y, button: e.button };
        if (!isRun()) return;
        if (e.button === 0 && !overHud(UI.mouse.x, UI.mouse.y)) game.attackHeld = true;
        if (e.button === 2 && !overHud(UI.mouse.x, UI.mouse.y)) game.heavyQueued = true;
    });
    c.addEventListener('pointerup', (e) => {
        if (e.button === 0) game.attackHeld = false;
    });
    c.addEventListener('pointerleave', () => { game.attackHeld = false; });
    window.addEventListener('blur', () => {
        game.attackHeld = false;
        game.keys = {};
    });
    c.addEventListener('contextmenu', e => e.preventDefault());
    c.addEventListener('auxclick', e => e.preventDefault());

    window.addEventListener('keydown', (e) => {
        Sound.ensure();
        const k = e.key;
        game.keys[k] = true;
        if (k.length === 1) game.keys[k.toLowerCase()] = true;

        if (k === ' ' || k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') {
            if (game.state !== 'menu') e.preventDefault();
        }

        if (k === 'Escape') {
            e.preventDefault();
            if (game.state === 'playing') game.setState('paused');
            else if (game.state === 'paused') game.resumeRun();
            else if (game.state === 'inventory') game.setState('paused');
            else if (game.state === 'settings') game.closeSettings();
            else if (game.state === 'story') game.closeStory();
            else if (game.state === 'levelup') { /* escolha obrigatória */ }
            else if (game.state === 'relic') { /* escolha obrigatória */ }
            return;
        }

        if (game.state === 'playing') {
            if (k === 'i' || k === 'I') { game.setState('inventory'); return; }
            if (k === 'p' || k === 'P') { game.setState('paused'); return; }
            if (k === 'g' || k === 'G') { game.interactWith(); return; }
            if (k === 'Shift' || k === ' ') { game.dashQueued = true; return; }
            const skillIndex = { q: 0, Q: 0, e: 1, E: 1, r: 2, R: 2, f: 3, F: 3 };
            if (skillIndex[k] !== undefined && game.player) {
                game.player.castSkill(skillIndex[k], game);
                return;
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const k = e.key;
        game.keys[k] = false;
        if (k.length === 1) game.keys[k.toLowerCase()] = false;
    });
}

// =============================================================
// INICIALIZAÇÃO / LOOP
// =============================================================
const game = new GameSession();
window.game = game;
setupInput(game);
UI.mouse.x = -999;
UI.mouse.y = -999;

let lastFrame = performance.now();
let lastLoggedError = 0;
function safeStep(fn, label) {
    try {
        fn();
    } catch (err) {
        const now = performance.now();
        if (now - lastLoggedError > 1200) {
            lastLoggedError = now;
            console.error('[Shadow Dungeon] falha em ' + label, err);
        }
    }
}

function loop(now) {
    let dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.06);

    game.fpsAccum += dt;
    game.fpsFrames++;
    if (game.fpsAccum >= 0.5) {
        game.fps = game.fpsFrames / game.fpsAccum;
        game.fpsAccum = 0;
        game.fpsFrames = 0;
    }

    safeStep(() => game.update(dt), 'update');
    UI.begin(dt);
    // Garante que um erro de desenho não deixe transforms/composite vazando.
    ctx.setTransform(VIEW.dpr, 0, 0, VIEW.dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    safeStep(() => game.render(), 'render');
    safeStep(() => UI.end(), 'ui');
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

