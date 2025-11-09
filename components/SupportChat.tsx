import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatbotResponse, getGroundedResponse, getTextToSpeech } from '../services/geminiService';
import { ChatMessage, GroundingSource } from '../types';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

const SupportChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const { playAudio, isPlaying } = useAudioPlayback(24000);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                () => {
                    setError("A geolocalização não está disponível ou a permissão foi negada. A busca com base na localização pode ser menos precisa.");
                }
            );
        }
    }, []);

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const isLocationQuery = /nearby|near me|around here|closest|location|perto|próximo/i.test(input);
            let response;
            if (isLocationQuery && location) {
                response = await getGroundedResponse(input, location);
            } else {
                response = await getChatbotResponse(input);
            }

            const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map((chunk: any) => ({
                    uri: chunk.maps?.uri || chunk.web?.uri,
                    title: chunk.maps?.title || chunk.web?.title,
                }))
                .filter((source: GroundingSource) => source.uri && source.title) ?? [];
            
            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text,
                sources: sources.length > 0 ? sources : undefined,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            setError('Falha ao obter uma resposta. Tente novamente.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSpeak = async (text: string) => {
        if (isPlaying) return;
        const audioContent = await getTextToSpeech(text);
        if (audioContent) {
            playAudio(audioContent);
        } else {
            setError("Não foi possível gerar áudio para esta mensagem.");
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-md dark:border dark:border-slate-700">
            {error && <div className="p-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-center text-sm">{error}</div>}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#0057b8] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                           {msg.role === 'model' && (
                                <div className="mt-2 flex items-center">
                                    <button onClick={() => handleSpeak(msg.text)} disabled={isPlaying} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                           )}
                            {msg.sources && (
                                <div className="mt-3 border-t dark:border-slate-600 pt-2">
                                    <h4 className="text-xs font-semibold mb-1">Fontes:</h4>
                                    <ul className="space-y-1">
                                        {msg.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                    {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 flex items-center space-x-2">
                           <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse delay-75"></div>
                           <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse delay-150"></div>
                           <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 p-3 border-slate-300 dark:border-slate-600 rounded-full focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
                        placeholder="Faça uma pergunta..."
                    />
                    <button onClick={handleSend} disabled={isLoading} className="p-3 bg-[#0057b8] text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportChat;