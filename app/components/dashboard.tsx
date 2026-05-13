import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, MessageSquare, Calendar, Wallet } from 'lucide-react';
import DeleteButton from './DeleteButton';

export default async function Dashboard() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            interviews: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) {
        return (
            <p style={{ color: '#B0B0B0' }}>Trwa konfiguracja Twojego profilu...</p>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12" style={{ background: '#121212' }}>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <header
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl"
                    style={{ background: '#1C1C1C', border: '1px solid #444444' }}
                >
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#E0E0E0' }}>Twój Panel</h1>
                        <p className="mt-1" style={{ color: '#888888' }}>Przeglądaj swoje wyniki i trenuj dalej.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
                            style={{ background: '#222222', color: '#B0B0B0', border: '1px solid #444444' }}
                        >
                            <Wallet size={20} />
                            <span>Kredyty: {user.credits}</span>
                        </div>

                        <Link
                            href="/chat"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors duration-200 cursor-pointer"
                            style={{ background: '#FFFFFF', color: '#121212' }}
                        >
                            <Plus size={20} />
                            Nowy Wywiad
                        </Link>
                    </div>
                </header>

                {/* Interview List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#E0E0E0' }}>Historia rozmów</h2>

                    {user.interviews.length === 0 ? (
                        <div
                            className="rounded-2xl p-12 text-center"
                            style={{ border: '1px dashed #444444', background: '#1C1C1C' }}
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ background: '#222222', color: '#888888' }}
                            >
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-lg font-medium" style={{ color: '#E0E0E0' }}>Nie masz jeszcze żadnych wyników</h3>
                            <p className="mt-2 max-w-sm mx-auto" style={{ color: '#888888' }}>
                                Rozpocznij swoją pierwszą próbną rozmowę rekrutacyjną z AI.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.interviews.map((interview) => (
                                <Link
                                    key={interview.id}
                                    href={`/dashboard/interview/${interview.id}`}
                                    className="block no-underline p-6 rounded-2xl group cursor-pointer transition-colors duration-200"
                                    style={{ background: '#1C1C1C', border: '1px solid #444444' }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg" style={{ color: '#E0E0E0' }}>
                                                {interview.jobTitle}
                                            </h3>
                                            <div className="flex items-center gap-1 text-sm mt-1" style={{ color: '#888888' }}>
                                                <Calendar size={14} />
                                                {new Date(interview.createdAt).toLocaleDateString('pl-PL', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        {interview.status === 'IN_PROGRESS' ? (
                                            <span
                                                className="px-3 py-1 rounded-lg text-sm font-bold"
                                                style={{ background: '#2a2500', color: '#b8a020' }}
                                            >
                                                W TRAKCIE
                                            </span>
                                        ) : interview.status === 'INTERRUPTED' ? (
                                            <span
                                                className="px-3 py-1 rounded-lg text-sm font-bold"
                                                style={{ background: '#2a1a00', color: '#cc7700' }}
                                            >
                                                PRZERWANO
                                            </span>
                                        ) : interview.feedback?.includes('[ZATRUDNIONY]') ? (
                                            <span
                                                className="px-3 py-1 rounded-lg text-sm font-bold"
                                                style={{ background: '#0d2a0d', color: '#4caf50' }}
                                            >
                                                ZATRUDNIONY
                                            </span>
                                        ) : interview.feedback?.includes('[ODRZUCONY]') ? (
                                            <span
                                                className="px-3 py-1 rounded-lg text-sm font-bold"
                                                style={{ background: '#2a0d0d', color: '#ef5350' }}
                                            >
                                                ODRZUCONY
                                            </span>
                                        ) : (
                                            <span
                                                className="px-3 py-1 rounded-lg text-sm font-bold"
                                                style={{ background: '#222222', color: '#888888' }}
                                            >
                                                ZAKOŃCZONO
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
                                        {interview.status === 'IN_PROGRESS'
                                            ? "Rozmowa nie została ukończona."
                                            : (interview.feedback
                                                ? interview.feedback.slice(0, 120) + (interview.feedback.length > 120 ? '...' : '')
                                                : "Brak podsumowania od rekrutera.")}
                                    </p>

                                    <div className="flex justify-between items-center mt-4">
                                        <span
                                            className="font-medium text-sm transition-all duration-200"
                                            style={{ color: '#B0B0B0' }}
                                        >
                                            Zobacz szczegóły →
                                        </span>
                                        <DeleteButton interviewId={interview.id} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}