// Sound effects and haptic feedback utility

const sounds = {
  success: () => playTone(800, 100, 'sine'),
  pop: () => playTone(600, 50, 'sine'),
  complete: () => {
    playTone(523, 100, 'sine'); // C5
    setTimeout(() => playTone(659, 100, 'sine'), 100); // E5
    setTimeout(() => playTone(784, 150, 'sine'), 200); // G5
  },
};

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

function triggerHaptic(pattern: 'light' | 'medium' | 'success' = 'light') {
  if (!('vibrate' in navigator)) return;

  try {
    switch (pattern) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10, 50, 20]);
        break;
    }
  } catch (e) {
    console.warn('Haptic not supported:', e);
  }
}

export function useFeedback() {
  const playerAdded = () => {
    sounds.pop();
    triggerHaptic('light');
  };

  const settlementPaid = () => {
    sounds.success();
    triggerHaptic('medium');
  };

  const gameEnded = () => {
    sounds.complete();
    triggerHaptic('success');
  };

  return {
    playerAdded,
    settlementPaid,
    gameEnded,
  };
}
