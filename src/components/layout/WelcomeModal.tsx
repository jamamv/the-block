import { useState, useEffect, useRef } from 'react';
import type { AuthUser } from '../../hooks/useAuth.ts';

export function WelcomeModal({ user }: { user: AuthUser | null }) {
  const [visible, setVisible] = useState(false);
  const prevUser = useRef<AuthUser | null>(null);

  useEffect(() => {
    if (user && !prevUser.current) setVisible(true);
    if (!user) setVisible(false);
    prevUser.current = user;
  }, [user]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setVisible(false)}
    >
      <div
        className="relative w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <img
          src="/the_block_repo.png"
          alt="The Block by OPENLANE"
          className="w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl"
        />

        <button
          onClick={() => setVisible(false)}
          className="mt-3 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition-colors backdrop-blur-sm"
        >
          Browse Auctions
        </button>
      </div>
    </div>
  );
}
