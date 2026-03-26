import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Bot, User, CheckCircle, XCircle, FileText } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <header className="border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 bg-white dark:bg-slate-950 z-10">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Wróć do panelu"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-lg">{interview.jobTitle}</h1>
                        <p className="text-xs text-slate-500">
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

            {interview.feedback && (
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-3xl mx-auto p-4">
                        <div className={`p-5 rounded-2xl border ${isHired
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : isRejected
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}>
                            <div className="flex items-center gap-3 mb-3">
                                {isHired ? (
                                    <>
                                        <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                                        <span className="text-lg font-bold text-green-700 dark:text-green-400">
                                            ZATRUDNIONY
                                        </span>
                                    </>
                                ) : isRejected ? (
                                    <>
                                        <XCircle size={24} className="text-red-600 dark:text-red-400" />
                                        <span className="text-lg font-bold text-red-700 dark:text-red-400">
                                            ODRZUCONY
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <FileText size={24} className="text-slate-500" />
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            Podsumowanie
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {interview.feedback}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 pb-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    {interview.messages.map((m) => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[80%] px-4 py-2 rounded-lg ${m.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                }`}>
                                <p className="whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    ))}

                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400">
                            — Koniec transkryptu —
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
