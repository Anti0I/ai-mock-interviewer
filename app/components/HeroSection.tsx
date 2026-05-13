import { Show } from "@clerk/nextjs";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="text-center pt-36 pb-20 px-4 max-w-3xl mx-auto">
      <h1
        className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
        style={{ color: '#E0E0E0' }}
      >
        Przygotuj się do rozmowy<br />kwalifikacyjnej z AI
      </h1>
      <p
        className="mb-10 max-w-2xl mx-auto text-lg leading-relaxed"
        style={{ color: '#888888' }}
      >
        Ćwicz odpowiedzi na najczęstsze pytania rekrutacyjne, otrzymuj natychmiastowy feedback i zwiększ swoje szanse na zdobycie wymarzonej pracy.
      </p>

      <Show when="signed-out">
        <p style={{ color: '#B0B0B0' }}>Zaloguj się, aby zacząć.</p>
      </Show>

      <Show when="signed-in">
        <div className="flex flex-col items-center gap-4">
          <p className="font-medium" style={{ color: '#B0B0B0' }}>
            Jesteś zalogowany. Witamy z powrotem.
          </p>
          <Link
            href="/chat"
            className="px-8 py-4 rounded-lg font-bold transition-colors duration-200 cursor-pointer"
            style={{ background: '#FFFFFF', color: '#121212' }}
          >
            Rozpocznij wywiad →
          </Link>
        </div>
      </Show>
    </section>
  );
}