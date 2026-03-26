'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    });

    const isLoading = status === 'submitted' || status === 'streaming';
    const [input, setInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isInterviewFinished, setIsInterviewFinished] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [hasCredits, setHasCredits] = useState<boolean | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const getMessageText = (m: any) => {
        if (m.parts && Array.isArray(m.parts)) {
            return m.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('');
        }
        return m.text || m.content || '';
    };

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant') {
            const text = getMessageText(lastMessage);
            if (text.includes('[ZATRUDNIONY]') || text.includes('[ODRZUCONY]')) {
                setIsInterviewFinished(true);
            }
        }
    }, [messages]);

    useEffect(() => {
        const checkCredits = async () => {
            try {
                const response = await fetch('/api/user/credits');
                if (response.ok) {
                    const data = await response.json();
                    setHasCredits(data.credits > 0);
                } else {
                    setHasCredits(false);
                }
            } catch (error) {
                console.error("Błąd sprawdzania kredytów:", error);
                setHasCredits(false);
            }
        };

        checkCredits();
    }, []);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isInterviewFinished) return;
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
    const saveInterview = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/interview/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    jobTitle: "Rozmowa - AI Mock Interview"
                })
            });

            if (!response.ok) {
                throw new Error('Błąd zapisu');
            }
            alert("Zapisano!");
            window.location.href = '/dashboard';

        } catch (error) {
            console.error(error);
            alert("Coś poszło nie tak przy zapisie.");
        } finally {
            setIsSaving(false);
        }
    };
    if (hasCredits === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (hasCredits === false) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="max-w-md text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Brak dostępnych wywiadów</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Wykorzystałeś już wszystkie swoje darmowe kredyty na rozmowy rekrutacyjne. Przejdź do panelu, aby sprawdzić swoje dotychczasowe wyniki.
                    </p>
                    <Link href="/dashboard" className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                        Wróć do Panelu
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <header className="border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link href="/dashboard" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Wróć do panelu">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-semibold text-lg">Rozmowa Kwalifikacyjna</h1>
                </div>
            </header>

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

                    {isInterviewFinished && (
                        <div className="mt-8 p-6 bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-2xl text-center">
                            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-2">
                                Wywiad dobiegł końca
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Rekruter wydał ostateczny werdykt. Zapisz tę rozmowę w swoim profilu, aby móc ją przeanalizować.
                            </p>
                            <button
                                onClick={saveInterview}
                                disabled={isSaving}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Zapisywanie w Supabase...</>
                                ) : (
                                    "Zapisz wynik i zakończ (Pobiera 1 kredyt)"
                                )}
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className={`flex-1 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 ${isInterviewFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder={isInterviewFinished ? "Wywiad zakończony." : "Napisz wiadomość..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading || isInterviewFinished}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || isInterviewFinished}
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