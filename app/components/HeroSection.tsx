import { Show } from "@clerk/nextjs";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="text-center pt-32 pb-20 px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
                Przygotuj się do rozmowy<br />kwalifikacyjnej z AI
            </h1>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
                Ćwicz odpowiedzi na najczęstsze pytania rekrutacyjne, otrzymuj natychmiastowy feedback i zwiększ swoje szanse na zdobycie wymarzonej pracy.
            </p>


            <Show when="signed-out">
                <p >
                    Zaloguj sie aby zacząć
                </p>
            </Show>
            <Show when="signed-in">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-green-600 font-semibold text-xl">
                        Jesteś zalogowany! Witamy w panelu.
                    </p>
                    <Link
                        href="/chat"
                        className="bg-green-600 px-8 py-4 rounded-lg font-bold hover:bg-green-700">
                        Przejdź do czatu →
                    </Link>
                </div>
            </Show>
        </section>
    );
}