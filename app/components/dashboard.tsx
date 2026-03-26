import { auth } from '@clerk/nextjs/server'; // Najnowszy Clerk
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, MessageSquare, Calendar, Wallet, ChevronRight } from 'lucide-react';

export default async function Dashboard() {
    // 1. Sprawdzamy sesję użytkownika
    const { userId } = await auth();

    // Jeśli nie jest zalogowany, odsyłamy do logowania
    if (!userId) {
        redirect('/');
    }

    // 2. Pobieramy dane użytkownika ORAZ wszystkie jego wywiady z bazy
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            interviews: {
                orderBy: { createdAt: 'desc' } // Sortujemy od najnowszego
            }
        }
    });

    // Zabezpieczenie na wypadek opóźnienia webhooka Clerka
    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <p className="text-slate-500">Trwa konfiguracja Twojego profilu...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* NAGŁÓWEK DASHBOARDU */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Twój Panel</h1>
                        <p className="text-slate-500 mt-1">Przeglądaj swoje wyniki i trenuj dalej.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Wskaźnik kredytów */}
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-xl font-medium border border-blue-200 dark:border-blue-800">
                            <Wallet size={20} />
                            <span>Kredyty: {user.credits}</span>
                        </div>

                        {/* Przycisk startu */}
                        <Link
                            href="/chat"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
                        >
                            <Plus size={20} />
                            Nowy Wywiad
                        </Link>
                    </div>
                </header>

                {/* LISTA WYWIADÓW */}
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Historia rozmów</h2>

                    {user.interviews.length === 0 ? (
                        /* Pusty stan, gdy nie ma jeszcze żadnych wywiadów */
                        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nie masz jeszcze żadnych wyników</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                Rozpocznij swoją pierwszą próbną rozmowę rekrutacyjną z AI, aby sprawdzić swoje umiejętności.
                            </p>
                        </div>
                    ) : (
                        /* Siatka wywiadów */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.interviews.map((interview) => (
                                <Link
                                    key={interview.id}
                                    href={`/dashboard/interview/${interview.id}`}
                                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group cursor-pointer block no-underline"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                {interview.jobTitle}
                                            </h3>
                                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                                <Calendar size={14} />
                                                {new Date(interview.createdAt).toLocaleDateString('pl-PL', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        {/* Status / Werdykt wyciągnięty z feedbacku */}
                                        {interview.feedback?.includes('[ZATRUDNIONY]') ? (
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-bold">
                                                ZATRUDNIONY
                                            </span>
                                        ) : interview.feedback?.includes('[ODRZUCONY]') ? (
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-lg text-sm font-bold">
                                                ODRZUCONY
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-sm font-bold">
                                                ZAKOŃCZONO
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">
                                        {interview.feedback || "Brak podsumowania od rekrutera."}
                                    </p>

                                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Zobacz szczegóły <ChevronRight size={16} />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}