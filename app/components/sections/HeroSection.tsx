import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";

export function HeroSection() {
    return (
        <section className="text-center">
            <SignOutButton>
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block">
                    <SignInButton mode="modal">
                        Zaloguj się, aby zacząć
                    </SignInButton>
                </div>
            </SignOutButton>

            <SignInButton>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-green-600 font-semibold">Jesteś zalogowany! Witamy w panelu.</p>
                    <UserButton />
                </div>
            </SignInButton>
        </section>
    );
}