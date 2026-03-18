'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatPage() {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    });
    const isLoading = status === 'submitted' || status === 'streaming';
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    const getMessageText = (m: any) => {
        if (m.parts && Array.isArray(m.parts)) {
            return m.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('');
        }
        // Fallback dla bezpieczeństwa
        return m.text || m.content || '';
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <h1 className="font-semibold text-lg">Rozmowa Kwalifikacyjna</h1>
                </div>
            </header>

            {/* Chat Container */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-500 mt-20">
                            Napisz "Cześć", aby rozpocząć.
                        </div>
                    ) : (
                        messages.map((m: any) => (
                            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${m.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{getMessageText(m)}</p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className="flex-1 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
                            placeholder="Napisz wiadomość..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}