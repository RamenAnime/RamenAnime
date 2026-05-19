/** Short original synth sting (royalty-free, generated in-browser). */
export function playSplashJingle(): () => void {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return () => undefined;

  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);

  const notes = [
    { f: 392.0, t: 0, d: 0.12 },
    { f: 523.25, t: 0.1, d: 0.14 },
    { f: 659.25, t: 0.22, d: 0.16 },
    { f: 783.99, t: 0.38, d: 0.28 },
    { f: 1046.5, t: 0.62, d: 0.55 },
  ];

  const start = ctx.currentTime + 0.05;
  const oscillators: OscillatorNode[] = [];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = n.f;
    g.gain.setValueAtTime(0.0001, start + n.t);
    g.gain.exponentialRampToValueAtTime(0.9, start + n.t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + n.t + n.d);
    osc.connect(g);
    g.connect(master);
    osc.start(start + n.t);
    osc.stop(start + n.t + n.d + 0.05);
    oscillators.push(osc);
  }

  const whoosh = ctx.createOscillator();
  const whooshGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  whoosh.type = "sawtooth";
  whoosh.frequency.setValueAtTime(180, start);
  whoosh.frequency.exponentialRampToValueAtTime(40, start + 0.35);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, start);
  filter.frequency.exponentialRampToValueAtTime(120, start + 0.35);
  whooshGain.gain.setValueAtTime(0.0001, start);
  whooshGain.gain.linearRampToValueAtTime(0.08, start + 0.04);
  whooshGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);
  whoosh.connect(filter);
  filter.connect(whooshGain);
  whooshGain.connect(master);
  whoosh.start(start);
  whoosh.stop(start + 0.4);

  return () => {
    void ctx.close();
  };
}
