import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const SupportScreen: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        // Mensagem de boas-vindas inicial do bot
        setMessages([{
            id: 'initial',
            role: 'model',
            text: 'Olá! Sou o assistente de suporte da Goly. Como posso ajudar você hoje?'
        }]);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await getChatbotResponse(input);
            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            setError('Falha ao obter uma resposta. Tente novamente.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-xl font-bold text-center">Ajuda e Suporte</h1>
            </div>
            {error && <div className="p-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-center text-sm">{error}</div>}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#0057b8] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center space-x-2">
                           <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse delay-75"></div>
                           <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse delay-150"></div>
                           <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 p-3 border-slate-300 dark:border-slate-600 rounded-full focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
                        placeholder="Digite sua mensagem..."
                    />
                    <button onClick={handleSend} disabled={isLoading} className="p-3 bg-[#0057b8] text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportScreen;
