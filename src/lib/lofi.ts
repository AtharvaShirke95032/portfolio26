// A tiny procedural lofi beat made with the Web Audio API — so the music widget
// works even without an mp3 in /public/music.

export type Preset = {
  title: string;
  bpm: number;
  chords: number[][]; // midi notes per bar
  cover: string; // css gradient
};

export const PRESETS: Preset[] = [
  {
    title: "lofi for debugging",
    bpm: 74,
    chords: [
      [53, 57, 60, 64], // Fmaj7
      [52, 55, 59, 62], // Em7
      [50, 53, 57, 60], // Dm7
      [48, 52, 55, 59], // Cmaj7
    ],
    cover: "linear-gradient(135deg,#ff9a8b,#ff6a88 45%,#8b5cf6)",
  },
  {
    title: "merge conflict blues",
    bpm: 68,
    chords: [
      [45, 52, 55, 60], // Am7
      [50, 57, 60, 65], // Dm9-ish
      [43, 50, 53, 59], // G7
      [48, 55, 59, 64], // Cmaj7
    ],
    cover: "linear-gradient(135deg,#43cea2,#185a9d)",
  },
  {
    title: "npm install (and chill)",
    bpm: 80,
    chords: [
      [51, 55, 58, 62], // Ebmaj7
      [53, 56, 60, 63], // Fm7
      [55, 58, 62, 65], // Gm7
      [48, 55, 58, 63], // Cm7
    ],
    cover: "linear-gradient(135deg,#f6d365,#fda085 50%,#f093fb)",
  },
];

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class LofiEngine {
  private ctx: AudioContext;
  private out: GainNode;
  private noise: AudioBuffer;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;
  preset: Preset = PRESETS[0];

  constructor() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    const comp = this.ctx.createDynamicsCompressor();
    this.out = this.ctx.createGain();
    this.out.gain.value = 0.5;
    this.out.connect(lp).connect(comp).connect(this.ctx.destination);

    this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  setVolume(v: number) {
    this.out.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  async start(preset: Preset) {
    this.preset = preset;
    await this.ctx.resume();
    this.stopLoop();
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.startCrackle();
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop() {
    this.stopLoop();
    this.crackle?.stop();
    this.crackle = null;
  }

  private stopLoop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private startCrackle() {
    if (this.crackle) return;
    // sparse vinyl pops over a whisper of hiss
    const len = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0004 ? (Math.random() - 0.5) * 0.6 : 0);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0.5;
    src.connect(g).connect(this.out);
    src.start();
    this.crackle = src;
  }

  private schedule() {
    const sixteenth = 60 / this.preset.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      // lazy swing on off-beats
      const t = this.nextTime + (this.step % 2 ? sixteenth * 0.18 : 0);
      this.playStep(this.step, t, sixteenth);
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % 64;
    }
  }

  private playStep(step: number, t: number, s: number) {
    const bar = Math.floor(step / 16);
    const inBar = step % 16;
    const chord = this.preset.chords[bar % this.preset.chords.length];

    if (inBar === 0) {
      chord.forEach((n, i) => this.pad(hz(n), t + i * 0.012, s * 16));
      this.bass(hz(chord[0] - 12), t, s * 5);
    }
    if (inBar === 10) this.bass(hz(chord[0] - 12), t, s * 3);
    if (inBar === 0 || inBar === 7 || inBar === 10) this.kick(t);
    if (inBar === 4 || inBar === 12) this.snare(t);
    if (inBar % 2 === 0) this.hat(t, inBar % 4 === 2 ? 0.07 : 0.035);

    // noodly pentatonic melody, sometimes
    if (inBar % 4 === 2 && Math.random() < 0.35) {
      const scale = [0, 2, 4, 7, 9, 12, 14];
      const note = chord[0] + 12 + scale[Math.floor(Math.random() * scale.length)];
      this.keys(hz(note), t, s * 3);
    }
  }

  private env(g: GainNode, t: number, peak: number, attack: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  private pad(f: number, t: number, dur: number) {
    for (const detune of [-7, 6]) {
      const o = this.ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.detune.value = detune;
      const g = this.ctx.createGain();
      this.env(g, t, 0.035, 0.25, dur * 0.98);
      o.connect(g).connect(this.out);
      o.start(t);
      o.stop(t + dur);
    }
  }

  private keys(f: number, t: number, dur: number) {
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = this.ctx.createGain();
    this.env(g, t, 0.06, 0.01, dur);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + dur);
  }

  private bass(f: number, t: number, dur: number) {
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = this.ctx.createGain();
    this.env(g, t, 0.22, 0.02, dur);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + dur);
  }

  private kick(t: number) {
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    const g = this.ctx.createGain();
    this.env(g, t, 0.5, 0.003, 0.28);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.3);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, peak: number, dur: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    this.env(g, t, peak, 0.002, dur);
    src.connect(f).connect(g).connect(this.out);
    src.start(t, Math.random());
    src.stop(t + dur + 0.02);
  }

  private snare(t: number) {
    this.noiseHit(t, "bandpass", 1800, 0.16, 0.18);
  }

  private hat(t: number, peak: number) {
    this.noiseHit(t, "highpass", 7500, peak, 0.04);
  }
}
