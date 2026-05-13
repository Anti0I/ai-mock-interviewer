import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ background: '#121212', borderBottom: '1px solid #444444' }}
    >
      <div className="text-xl font-bold" style={{ color: '#E0E0E0' }}>
        AI Mock Interviewer
      </div>

      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button
              className="px-5 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-200"
              style={{
                background: '#222222',
                color: '#E0E0E0',
                border: '1px solid #444444',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333333')}
              onMouseLeave={e => (e.currentTarget.style.background = '#222222')}
            >
              Zaloguj się
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: '#B0B0B0' }}
          >
            Panel
          </Link>
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
