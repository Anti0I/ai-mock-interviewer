'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ interviewId }: { interviewId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        // Zatrzymuje nawigację w komponencie <Link>
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm("Czy na pewno chcesz usunąć ten wywiad z historii? Tej operacji nie można cofnąć.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/interviews/${interviewId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh(); // Odświeża komponent Server Side (Dashboard)
            } else {
                alert("Nie udało się usunąć wywiadu.");
            }
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas usuwania.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Usuń wywiad"
        >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    );
}
