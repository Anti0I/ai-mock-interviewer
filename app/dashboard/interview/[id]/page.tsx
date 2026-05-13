import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Bot, User, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({ params }: PageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/');
    }

    const { id } = await params;

    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!interview || interview.userId !== userId) {
        redirect('/dashboard');
    }

    const isHired = interview.feedback?.includes('[ZATRUDNIONY]');
    const isRejected = interview.feedback?.includes('[ODRZUCONY]');
    const isInterrupted = interview.status === 'INTERRUPTED';

    return (
        <div className="min-h-screen" style={{ background: '#121212', color: '#E0E0E0' }}>
            {/* Header */}
            <header
                className="p-4 sticky top-0 z-10"
                style={{ background: '#1C1C1C', borderBottom: '1px solid #444444' }}
            >
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="p-1 rounded transition-colors duration-200 cursor-pointer"
                        title="Wróć do panelu"
                        style={{ color: '#888888' }}
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-lg" style={{ color: '#E0E0E0' }}>{interview.jobTitle}</h1>
                        <p className="text-xs" style={{ color: '#888888' }}>
                            {new Date(interview.createdAt).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Verdict / Status banner */}
            {(interview.feedback || isInterrupted) && (
                <div style={{ borderBottom: '1px solid #444444' }}>
                    <div className="max-w-3xl mx-auto p-4">
                        <div
                            className="p-5 rounded-2xl"
                            style={{
                                background: isHired
                                    ? '#0d2a0d'
                                    : isRejected
                                        ? '#2a0d0d'
                                        : isInterrupted
                                            ? '#2a1a00'
                                            : '#1C1C1C',
                                border: `1px solid ${isHired ? '#2e5e2e' : isRejected ? '#5e2e2e' : isInterrupted ? '#5e3a00' : '#444444'}`
                            }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {isHired ? (
                                    <>
                                        <CheckCircle size={24} style={{ color: '#4caf50' }} />
                                        <span className="text-lg font-bold" style={{ color: '#4caf50' }}>ZATRUDNIONY</span>
                                    </>
                                ) : isRejected ? (
                                    <>
                                        <XCircle size={24} style={{ color: '#ef5350' }} />
                                        <span className="text-lg font-bold" style={{ color: '#ef5350' }}>ODRZUCONY</span>
                                    </>
                                ) : isInterrupted ? (
                                    <>
                                        <Clock size={24} style={{ color: '#cc7700' }} />
                                        <span className="text-lg font-bold" style={{ color: '#cc7700' }}>WYWIAD PRZERWANY</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText size={24} style={{ color: '#888888' }} />
                                        <span className="text-lg font-bold" style={{ color: '#E0E0E0' }}>Podsumowanie</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#B0B0B0' }}>
                                {isInterrupted && !interview.feedback
                                    ? 'Wywiad nie został dokończony. Poniżej widoczna jest historia rozmowy do momentu przerwania.'
                                    : interview.feedback}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="p-4 pb-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    {interview.messages.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-medium mb-2" style={{ color: '#E0E0E0' }}>
                                Brak historii wiadomości
                            </h3>
                            <p className="max-w-sm mx-auto" style={{ color: '#888888' }}>
                                Ta rozmowa nie zawiera zapisanych wiadomości.
                            </p>
                        </div>
                    ) : (
                        <>
                            {interview.messages.map((m) => (
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
                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="text-center py-8">
                                <p className="text-sm" style={{ color: '#444444' }}>— Koniec transkryptu —</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
