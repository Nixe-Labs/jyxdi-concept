"use client";
/* Ambient score, synthesised live with WebAudio (no audio files):
   a tanpura drone (Karplus–Strong strings with a jawari buzz, cycling
   Pa · Sa' · Sa' · Sa), a temple bell, and a soft shimmer for moments. */
import { create } from "zustand";

let ctx: AudioContext | null = null;
let master: GainNode, verb: ConvolverNode, dry: GainNode;
let running = false, loopT: ReturnType<typeof setTimeout> | undefined, step = 0;
const SA = 138.59;
const CYCLE = [(SA * 1.5) / 2, SA * 2, SA * 2, SA];
const buffers = new Map<string, AudioBuffer>();

function init() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);
  verb = ctx.createConvolver(); verb.buffer = impulse(4.2, 2.6);
  const vg = ctx.createGain(); vg.gain.value = 0.55; verb.connect(vg).connect(master);
  dry = ctx.createGain(); dry.gain.value = 0.6; dry.connect(master); dry.connect(verb);
  return ctx;
}

function impulse(seconds: number, decay: number) {
  const c = ctx!, len = c.sampleRate * seconds, b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return b;
}

function pluck(freq: number) {
  const key = freq.toFixed(2);
  const hit = buffers.get(key); if (hit) return hit;
  const c = ctx!, rate = c.sampleRate, len = Math.floor(rate * 7.5);
  const out = c.createBuffer(1, len, rate), d = out.getChannelData(0);
  const N = Math.round(rate / freq), ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin((i / N) * Math.PI));
  let idx = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx], nxt = ring[(idx + 1) % N];
    ring[idx] = 0.4985 * (cur + nxt);
    let s = cur + 0.42 * Math.tanh(cur * 3.2) * (0.6 + 0.4 * Math.sin((i / rate) * 2.1));
    s = 0.7 * s + 0.3 * prev; prev = s;
    d[i] = s * Math.min(1, i / 120) * 0.55;
    idx = (idx + 1) % N;
  }
  buffers.set(key, out);
  return out;
}

function playString(freq: number, when: number, gain = 0.5) {
  const c = ctx!, src = c.createBufferSource(); src.buffer = pluck(freq);
  const g = c.createGain(); g.gain.value = gain;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
  const pan = c.createStereoPanner(); pan.pan.value = (Math.random() - 0.5) * 0.5;
  src.connect(lp).connect(g).connect(pan).connect(dry);
  src.start(when);
}

function schedule() {
  if (!running || !ctx) return;
  playString(CYCLE[step % 4], ctx.currentTime + 0.05, step % 4 === 3 ? 0.62 : 0.48);
  step++;
  loopT = setTimeout(schedule, step % 4 === 0 ? 1650 : 1150);
}

export function bell(when = 0, base = 523.25, gain = 0.2) {
  const c = init(), t = c.currentTime + when;
  ([[1, 1, 6], [2.76, 0.5, 3.4], [5.4, 0.3, 2.2], [8.93, 0.16, 1.3], [0.5, 0.3, 7]] as const).forEach(([r, a, dur]) => {
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = base * r;
    const g = c.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(a * gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dry); o.start(t); o.stop(t + dur + 0.1);
  });
}

export function shimmer() {
  if (!ctx || !running) return;
  const t = ctx.currentTime;
  [SA * 4, SA * 6, SA * 8].forEach((f, i) => {
    const o = ctx!.createOscillator(); o.type = "triangle"; o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.004);
    const g = ctx!.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.025, t + 0.4 + i * 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    o.connect(g).connect(verb); o.start(t); o.stop(t + 3.4);
  });
}

function start() {
  const c = init();
  if (c.state === "suspended") c.resume();
  if (running) return;
  running = true;
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setTargetAtTime(0.75, c.currentTime, 1.2);
  schedule();
}

function stop() {
  if (!ctx || !running) return;
  running = false; clearTimeout(loopT);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
}

export const useSound = create<{ on: boolean; set: (on: boolean, withBell?: boolean) => void }>((set) => ({
  on: false,
  set: (on, withBell = true) => {
    if (on) { start(); if (withBell) bell(0.02, 523.25, 0.16); } else stop();
    set({ on });
  },
}));
