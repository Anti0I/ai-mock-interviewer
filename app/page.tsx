import { HeroSection } from "./sections/HeroSection";
import { Navbar } from "./sections/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <HeroSection />
    </div>
  );
}
