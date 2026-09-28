/**
 * Web Audio Player for 24kHz raw PCM audio streamed/returned by Gemini 3.8 Flash TTS
 */

let activeAudioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

export function stopCurrentAudio() {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {
      // ignore
    }
    currentSourceNode = null;
  }
}

/**
 * Plays base64-encoded 24kHz raw linear PCM 16-bit audio
 */
export async function playPcmAudio(base64Pcm: string, onEnded?: () => void): Promise<void> {
  stopCurrentAudio();

  const binaryString = atob(base64Pcm);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert 16-bit signed PCM to float32
  const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }

  if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
    activeAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000
    });
  }

  if (activeAudioCtx.state === 'suspended') {
    await activeAudioCtx.resume();
  }

  const audioBuffer = activeAudioCtx.createBuffer(1, float32.length, 24000);
  audioBuffer.copyToChannel(float32, 0);

  const source = activeAudioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(activeAudioCtx.destination);
  currentSourceNode = source;

  source.onended = () => {
    currentSourceNode = null;
    if (onEnded) onEnded();
  };

  source.start();
}
