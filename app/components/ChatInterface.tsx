'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    });

    const isLoading = status === 'submitted' || status === 'streaming';
    const [input, setInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [isInterviewFinished, setIsInterviewFinished] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [hasCredits, setHasCredits] = useState<boolean | null>(null);
    const router = useRouter();
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (interviewId && !isInterviewFinished) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [interviewId, isInterviewFinished]);

    const handleBackClick = (e: React.MouseEvent) => {
        if (interviewId && !isInterviewFinished) {
            e.preventDefault();
            setShowExitConfirm(true);
        } else {
            router.push('/dashboard');
        }
    };

    const exitInterview = async () => {
        if (interviewId && messages.length > 0) {
            try {
                await fetch('/api/interviews/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interviewId, messages, isCompleted: false })
                });
            } catch (e) {
                console.error("Błąd zapisu postępu:", e);
            }
        }
        router.push('/dashboard');
    };

    useEffect(() => {
        if (!isLoading && interviewId && messages.length > 0 && !isInterviewFinished) {
            fetch('/api/interviews/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interviewId, messages, isCompleted: false })
            }).catch(console.error);
        }
    }, [isLoading, interviewId, messages, isInterviewFinished]);

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
            return m.parts.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isInterviewFinished) return;

        if (!interviewId) {
            try {
                const res = await fetch('/api/interview/start', { method: 'POST' });
                if (!res.ok) {
                    if (res.status === 403) { setHasCredits(false); return; }
                    throw new Error('Nie udało się rozpocząć wywiadu');
                }
                const data = await res.json();
                setInterviewId(data.interviewId);
            } catch (error) {
                console.error(error);
                alert('Błąd przy rozpoczynaniu wywiadu.');
                return;
            }
        }

        sendMessage({ text: input });
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'inherit';
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
            const response = await fetch('/api/interviews/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interviewId, messages, isCompleted: true })
            });
            if (!response.ok) throw new Error('Błąd zapisu');
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
            <div className="flex h-screen items-center justify-center" style={{ background: '#121212' }}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#888888' }} />
            </div>
        );
    }

    if (hasCredits === false) {
        return (
            <div className="flex h-screen items-center justify-center p-4" style={{ background: '#121212' }}>
                <div
                    className="max-w-md text-center space-y-6 p-8 rounded-2xl"
                    style={{ background: '#1C1C1C', border: '1px solid #444444' }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: '#2a0d0d', color: '#ef5350' }}
                    >
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>Brak dostępnych wywiadów</h2>
                    <p style={{ color: '#888888' }}>
                        Wykorzystałeś już wszystkie swoje kredyty. Przejdź do panelu, aby sprawdzić swoje wyniki.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block w-full py-3 px-4 font-medium rounded-xl transition-colors duration-200"
                        style={{ background: '#FFFFFF', color: '#121212' }}
                    >
                        Wróć do Panelu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Exit confirmation modal */}
            {showExitConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                    <div
                        className="max-w-md w-full p-6 rounded-2xl"
                        style={{ background: '#1C1C1C', border: '1px solid #444444' }}
                    >
                        <h3 className="text-xl font-bold mb-4" style={{ color: '#E0E0E0' }}>Przerwać wywiad?</h3>
                        <p className="mb-6" style={{ color: '#888888' }}>
                            Kredyt za ten wywiad został już pobrany. Jeśli wyjdziesz, wywiad zostanie oznaczony jako przerwany. Historia dotychczasowej rozmowy zostanie zapisana na Twoim profilu.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="px-4 py-2 rounded-xl font-medium transition-colors duration-200 cursor-pointer"
                                style={{ background: '#222222', color: '#B0B0B0', border: '1px solid #444444' }}
                            >
                                Zostań
                            </button>
                            <button
                                onClick={exitInterview}
                                className="px-4 py-2 rounded-xl font-medium transition-colors duration-200 cursor-pointer"
                                style={{ background: '#7f1d1d', color: '#fca5a5' }}
                            >
                                Przerwij i wyjdź
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-screen" style={{ background: '#121212', color: '#E0E0E0' }}>
                {/* Header */}
                <header
                    className="p-4 sticky top-0 z-10"
                    style={{ background: '#1C1C1C', borderBottom: '1px solid #444444' }}
                >
                    <div className="max-w-3xl mx-auto flex items-center gap-3">
                        <button
                            onClick={handleBackClick}
                            className="p-1 rounded transition-colors duration-200 cursor-pointer"
                            style={{ color: '#888888' }}
                            title="Wróć do panelu"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-semibold text-lg" style={{ color: '#E0E0E0' }}>Rozmowa Kwalifikacyjna</h1>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.length === 0 ? (
                            <div className="text-center mt-20" style={{ color: '#888888' }}>
                                Napisz "Cześć", aby rozpocząć.
                            </div>
                        ) : (
                            messages.map((m: any) => (
                                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: '#222222', color: '#888888' }}
                                    >
                                        {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div
                                        className="max-w-[80%] px-4 py-2 rounded-lg"
                                        style={
                                            m.role === 'user'
                                                ? { background: '#333333', color: '#E0E0E0' }
                                                : { background: '#1C1C1C', color: '#B0B0B0', border: '1px solid #444444' }
                                        }
                                    >
                                        <p className="whitespace-pre-wrap">{getMessageText(m)}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#222222', color: '#888888' }}
                                >
                                    <Bot size={16} />
                                </div>
                                <div
                                    className="px-4 py-3 rounded-lg flex items-center gap-2"
                                    style={{ background: '#1C1C1C', border: '1px solid #444444' }}
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#888888' }} />
                                </div>
                            </div>
                        )}

                        {isInterviewFinished && (
                            <div
                                className="mt-8 p-6 rounded-2xl text-center"
                                style={{ background: '#1C1C1C', border: '1px solid #444444' }}
                            >
                                <h3 className="text-xl font-bold mb-2" style={{ color: '#E0E0E0' }}>
                                    Wywiad dobiegł końca
                                </h3>
                                <p className="mb-6" style={{ color: '#888888' }}>
                                    Rekruter wydał ostateczny werdykt. Zapisz tę rozmowę w swoim profilu.
                                </p>
                                <button
                                    onClick={saveInterview}
                                    disabled={isSaving}
                                    className="px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto transition-colors duration-200 cursor-pointer disabled:opacity-50"
                                    style={{ background: '#FFFFFF', color: '#121212' }}
                                >
                                    {isSaving ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Zapisywanie...</>
                                    ) : (
                                        "Zapisz wynik i zakończ"
                                    )}
                                </button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
                <div
                    className="p-4"
                    style={{ background: '#1C1C1C', borderTop: '1px solid #444444' }}
                >
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                className="flex-1 p-3 rounded-lg resize-none focus:outline-none max-h-32"
                                style={{
                                    background: '#222222',
                                    color: '#E0E0E0',
                                    border: '1px solid #444444',
                                    opacity: isInterviewFinished ? 0.5 : 1,
                                    cursor: isInterviewFinished ? 'not-allowed' : 'text',
                                }}
                                placeholder={isInterviewFinished ? "Wywiad zakończony." : "Napisz wiadomość..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading || isInterviewFinished}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim() || isInterviewFinished}
                                className="p-3 rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: '#FFFFFF', color: '#121212' }}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}