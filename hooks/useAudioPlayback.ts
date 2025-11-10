
import { useState, useCallback, useRef, useEffect } from 'react';

// Helper functions for base64 encoding/decoding
const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encode = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const useAudioPlayback = (sampleRate: number) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    useEffect(() => {
        // Initialize AudioContext
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const context = new AudioContext({ sampleRate });
            gainNodeRef.current = context.createGain();
            gainNodeRef.current.connect(context.destination);
            audioContextRef.current = context;
        }

        return () => {
            // Stop all playing sources when the component unmounts
            sourcesRef.current.forEach(source => {
                try {
                    source.stop();
                } catch (e) {
                    // Ignore errors if source has already stopped
                }
            });
            sourcesRef.current.clear();
            audioContextRef.current?.close();
        };
    }, [sampleRate]);


    const playAudio = useCallback(async (base64Audio: string) => {
        const audioContext = audioContextRef.current;
        const gainNode = gainNodeRef.current;
        if (!audioContext || !gainNode || !base64Audio) return;

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        setIsPlaying(true);
        const audioData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioData, audioContext, sampleRate, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.onended = () => {
            setIsPlaying(false);
            sourcesRef.current.delete(source);
        };
        source.start();
        sourcesRef.current.add(source);
    }, [sampleRate]);

    return { isPlaying, playAudio };
};