// A restrained, consonant D-minor drone, synthesized entirely in the browser.
export function createDroneScore(ctx, random = Math.random) {
  const input = ctx.createGain();
  const cabin = ctx.createBiquadFilter();
  cabin.type = 'lowpass'; cabin.frequency.value = 780; cabin.Q.value = .45;
  const lowCut = ctx.createBiquadFilter();
  lowCut.type = 'highpass'; lowCut.frequency.value = 48;
  input.connect(cabin).connect(lowCut);
  const mix = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = .62;
  lowCut.connect(dry).connect(mix);

  // Dark, uneven echoes; feedback stays well below unity.
  const echoBus = ctx.createGain();
  for (const [seconds, panValue] of [[.86, -.82], [1.29, .82]]) {
    const delay = ctx.createDelay(2); delay.delayTime.value = seconds;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass'; damp.frequency.value = 610; damp.Q.value = .4;
    const feedback = ctx.createGain(); feedback.gain.value = .60;
    const wet = ctx.createGain(); wet.gain.value = .54;
    const pan = ctx.createStereoPanner(); pan.pan.value = panValue;
    lowCut.connect(delay); delay.connect(damp);
    damp.connect(feedback).connect(delay);
    damp.connect(wet).connect(pan).connect(echoBus);
  }
  echoBus.connect(mix);
  const reverb = ctx.createConvolver();
  const length = Math.floor(ctx.sampleRate * 7.5);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let smooth = 0;
    for (let i = 0; i < length; i++) {
      smooth = smooth * .84 + (random() * 2 - 1) * .16;
      const seconds = i / ctx.sampleRate;
      const fadeIn = Math.min(1, Math.max(0, (seconds - .025) / .06));
      data[i] = smooth * fadeIn * Math.exp(-seconds * .72) * (1 - i / length);
    }
  }
  reverb.buffer = impulse;
  const room = ctx.createGain(); room.gain.value = .68;
  lowCut.connect(reverb); echoBus.connect(reverb);
  reverb.connect(room).connect(mix);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -19; limiter.knee.value = 16;
  limiter.ratio.value = 3; limiter.attack.value = .025; limiter.release.value = .8;
  const master = ctx.createGain(); master.gain.value = 0;
  mix.connect(limiter).connect(master).connect(ctx.destination);

  const root = 73.416191979; // D2. Pure minor third and fifth avoid beating between tails.
  const notes = [2, 12 / 5, 3, 4, 24 / 5, 6];
  function oscillator(frequency, type, gainValue, destination) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.value = frequency; gain.gain.value = gainValue;
    osc.connect(gain).connect(destination);
    return {osc, gain};
  }
  // Occasional overlapping pairs alternate with pauses; no continuous bed.
  let nextNote = 0, previous = 2, active = false, paired = false;
  function phrase(start) {
    // Prefer neighbouring chord tones, with occasional octave movement.
    const steps = [-2, -1, 1, 1, 2];
    const index = Math.max(0, Math.min(notes.length - 1,
      previous + steps[Math.floor(random() * steps.length)]));
    previous = index;
    const frequency = root * notes[index];
    const envelope = ctx.createGain();
    const pan = ctx.createStereoPanner(); pan.pan.value = (random() - .5) * .6;
    envelope.connect(pan).connect(input);
    const attack = 1.4 + random() * .8, duration = 5.5 + random() * 2;
    const level = .072 + random() * .018;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + attack);
    envelope.gain.linearRampToValueAtTime(level * .16, start + duration * .6);
    envelope.gain.linearRampToValueAtTime(0, start + duration);
    const voices = [oscillator(frequency, 'sine', .85, envelope),
      oscillator(frequency, 'triangle', .15, envelope),
      oscillator(root * 2, 'sine', .18, envelope)];
    let remaining = voices.length;
    for (const {osc, gain} of voices) {
      osc.start(start); osc.stop(start + duration + .05);
      osc.onended = () => {
        osc.disconnect(); gain.disconnect();
        if (--remaining === 0) { envelope.disconnect(); pan.disconnect(); }
      };
    }
    const overlap=!paired&&random()<.48;paired=overlap;
    return overlap?duration*.58:duration+7+random()*4;
  }
  return {
    update(enabled) {
      const now = ctx.currentTime;
      if (enabled !== active) {
        active = enabled;
        master.gain.setTargetAtTime(active ? .9 : 0, now, active ? 1.8 : .18);
        if (active && nextNote < now) nextNote = now + .08;
      }
      // No backlog after a suspended tab; at most one new voice per update.
      if (active && ctx.state === 'running' && nextNote <= now + .15) {
        const start = Math.max(now + .03, nextNote);
        nextNote = start + phrase(start);
      }
    }
  };
}
