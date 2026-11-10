// Generador de sonido 'beep' estándar de pistola escáner láser usando Web Audio API
export function playScannerBeep(success: boolean = true) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = success ? 'sine' : 'square';
    // 1760 Hz (La6) para éxito, 300 Hz para error
    osc.frequency.setValueAtTime(success ? 1760 : 320, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (success ? 0.12 : 0.25));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (success ? 0.12 : 0.25));
  } catch (err) {
    // Si el navegador bloquea audio por políticas de interacción, continúa silenciosamente
  }
}
