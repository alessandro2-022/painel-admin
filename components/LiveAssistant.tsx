import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getLiveSession } from '../services/geminiService';
import { useAudioPlayback, encode } from '../hooks/useAudioPlayback';

type ConversationState = 'idle' | 'connecting' | 'active' | 'error';

const LiveAssistant: React.FC = () => {
    const [conversationState, setConversationState] = useState<ConversationState>('idle');
    const [userTranscription, setUserTranscription] = useState('');
    const [modelTranscription, setModelTranscription] = useState('');
    
    const { queueAudio, stopAll } = useAudioPlayback(24000);

    const sessionPromiseRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopRecording = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        stopAll();
    }, [stopAll]);

    const startConversation = async () => {
        setConversationState('connecting');
        setUserTranscription('');
        setModelTranscription('');
        let tempUserTranscription = '';
        let tempModelTranscription = '';


        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext({ sampleRate: 16000 });
            
            sessionPromiseRef.current = getLiveSession({
                onopen: () => {
                    if (!audioContextRef.current || !streamRef.current) {
                        console.error("Audio context or stream not available on open.");
                        setConversationState('error');
                        return;
                    }
                    setConversationState('active');
                    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
                    mediaStreamSourceRef.current = source;

                    const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob = {
                           data: encode(new Uint8Array(int16.buffer)),
                           mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session: any) => {
                          session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current.destination);
                },
                onmessage: (message: any) => {
                    if (message.serverContent?.outputTranscription) {
                        tempModelTranscription += message.serverContent.outputTranscription.text;
                        setModelTranscription(tempModelTranscription);
                    }
                    if (message.serverContent?.inputTranscription) {
                        tempUserTranscription += message.serverContent.inputTranscription.text;
                        setUserTranscription(tempUserTranscription);
                    }
                    if (message.serverContent?.turnComplete) {
                        tempUserTranscription += '\n\n';
                        setUserTranscription(tempUserTranscription);
                        tempModelTranscription = '';
                    }
                    const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audio) {
                       queueAudio(audio);
                    }
                     if (message.serverContent?.interrupted) {
                        stopAll();
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setConversationState('error');
                    stopRecording();
                },
                onclose: () => {
                    setConversationState('idle');
                    stopRecording();
                },
            });

        } catch (err) {
            console.error('Failed to start conversation:', err);
            setConversationState('error');
            stopRecording();
        }
    };
    
    const stopConversation = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session: any) => {
                session.close();
            }).catch((e: Error) => console.error("Error closing session", e));
             sessionPromiseRef.current = null;
        }
        stopRecording();
        setConversationState('idle');
    };

    useEffect(() => {
        return () => {
            stopConversation();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getButton = () => {
        switch (conversationState) {
            case 'idle':
            case 'error':
                return <button onClick={startConversation} className="px-8 py-4 bg-[#0057b8] text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all text-lg">Iniciar Conversa</button>;
            case 'connecting':
                return <button disabled className="px-8 py-4 bg-slate-400 text-white font-bold rounded-full shadow-lg transition-all text-lg cursor-not-allowed">Conectando...</button>;
            case 'active':
                return <button onClick={stopConversation} className="px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-all text-lg">Encerrar Conversa</button>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md min-h-[400px] flex flex-col justify-between dark:border dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Transcrição ao Vivo</h2>
                    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/70 rounded-lg h-64 overflow-y-auto text-left whitespace-pre-wrap">
                        <span className="text-slate-500 dark:text-slate-400">{userTranscription}</span>
                        <span className="text-[#0057b8] dark:text-blue-400 font-medium">{modelTranscription}</span>
                    </div>
                </div>
                <div className="mt-8 flex justify-center items-center">
                    {conversationState === 'active' && <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mr-4"></div>}
                    {getButton()}
                </div>
                 {conversationState === 'error' && <p className="text-red-500 mt-4 text-sm">Ocorreu um erro. Por favor, verifique o console e tente novamente.</p>}
            </div>
        </div>
    );
};

export default LiveAssistant;