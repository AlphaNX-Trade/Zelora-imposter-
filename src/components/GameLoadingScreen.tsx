import React from 'react';

export type LoadingMode =
  | 'startup'
  | 'dealing'
  | 'resuming'
  | 'tallying'
  | 'next-round';

export interface LoadingTransitionState {
  mode: LoadingMode;
  title: string;
  subtitle: string;
  playerCount?: number;
  roundNumber?: number;
}

interface GameLoadingScreenProps {
  transition: LoadingTransitionState;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  transition,
}) => {
  const isTally = transition.mode === 'tallying';
  const isStartup = transition.mode === 'startup';
  const seatChips = Math.min(transition.playerCount ?? 5, 8);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={transition.title}
      className="safe-screen flex flex-col justify-between max-w-4xl mx-auto w-full select-none"
    >
      {/* Top skeleton header */}
      <header className="flex items-center justify-between gap-4">
        <div className="h-3.5 w-36 rounded-md bg-white/[0.06] skeleton-shimmer" />
        <div className="h-3.5 w-20 rounded-md bg-white/[0.06] skeleton-shimmer" />
      </header>

      {/* Center Spinner + Mode-Specific Card Skeleton */}
      <main className="my-auto py-8 flex flex-col items-center justify-center gap-8">
        {/* Custom Zelora Dual-Ring Spinner */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-violet-600/20 blur-xl"
            />
            <div
              aria-hidden="true"
              className={`absolute inset-0 rounded-full border-2 border-white/10 ${
                isTally ? 'border-t-amber-400' : 'border-t-violet-400'
              } animate-zelora-orbit`}
            />
            <div
              aria-hidden="true"
              className="absolute inset-2.5 rounded-full border-2 border-white/5 border-b-violet-500/70 animate-zelora-orbit-reverse"
            />
            <div
              aria-hidden="true"
              className={`relative w-4 h-4 rotate-45 rounded-[3px] ${
                isTally ? 'bg-amber-400' : 'bg-violet-400'
              }`}
            />
          </div>

          <h2 className="mt-5 font-display text-xl sm:text-2xl font-extrabold tracking-[0.12em] uppercase text-white">
            {transition.title}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-zinc-400 max-w-sm">
            {transition.subtitle}
          </p>
        </div>

        {/* Layout-matched Skeleton Cards */}
        {isStartup ? (
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 rounded-2xl border border-white/10 bg-[#12121A] p-6 space-y-4">
              <div className="h-8 w-3/4 rounded-lg bg-white/[0.07] skeleton-shimmer" />
              <div className="h-4 w-5/6 rounded-md bg-white/[0.05] skeleton-shimmer" />
              <div className="pt-2 space-y-2.5">
                <div className="h-14 w-full rounded-xl bg-violet-500/18 border border-violet-500/25 skeleton-shimmer" />
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="h-12 rounded-xl bg-white/[0.05] skeleton-shimmer" />
                  <div className="h-12 rounded-xl bg-white/[0.05] skeleton-shimmer" />
                  <div className="h-12 rounded-xl bg-white/[0.05] skeleton-shimmer" />
                </div>
              </div>
            </div>
            <div className="hidden md:flex md:col-span-5 justify-center">
              <div className="w-60 h-72 rounded-2xl border border-violet-500/25 bg-[#12111D] p-5 flex flex-col justify-between skeleton-shimmer">
                <div className="h-3 w-16 rounded bg-white/[0.08]" />
                <div className="space-y-2 self-center w-full">
                  <div className="h-6 w-2/3 mx-auto rounded bg-white/[0.08]" />
                  <div className="h-1 w-10 mx-auto rounded bg-amber-400/40" />
                </div>
                <div className="h-3 w-20 self-end rounded bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ) : isTally ? (
          <div className="w-full max-w-3xl space-y-4">
            <div className="rounded-2xl border border-amber-400/25 bg-[#14131A] p-6 sm:p-8 space-y-4 skeleton-shimmer">
              <div className="h-7 w-2/3 mx-auto rounded-lg bg-amber-400/15" />
              <div className="h-4 w-1/2 mx-auto rounded bg-white/[0.06]" />
              <div className="mt-4 h-20 w-full rounded-xl bg-black/30 border border-white/8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#12121A] p-5 space-y-3">
                <div className="h-4 w-32 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-3.5 w-full rounded bg-white/[0.05] skeleton-shimmer" />
                <div className="h-3.5 w-5/6 rounded bg-white/[0.05] skeleton-shimmer" />
                <div className="h-3.5 w-4/6 rounded bg-white/[0.05] skeleton-shimmer" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#12121A] p-5 space-y-3">
                <div className="h-4 w-28 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-8 w-full rounded-lg bg-white/[0.05] skeleton-shimmer" />
                <div className="h-8 w-full rounded-lg bg-white/[0.05] skeleton-shimmer" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="rounded-2xl border border-violet-500/30 bg-[#12121A] p-6 sm:p-7 min-h-[260px] flex flex-col justify-between skeleton-shimmer">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-white/[0.08]" />
                <div className="h-3 w-14 rounded bg-white/[0.08]" />
              </div>
              <div className="space-y-3 text-center">
                <div className="h-8 w-44 mx-auto rounded-lg bg-white/[0.08]" />
                <div className="h-3.5 w-52 mx-auto rounded bg-white/[0.05]" />
                <div className="h-12 w-full rounded-xl bg-violet-500/20 mt-4" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-white/[0.06]" />
                <div className="h-3 w-16 rounded bg-white/[0.06]" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: seatChips }, (_, idx) => (
                <div
                  key={idx}
                  className="h-8 rounded-lg border border-white/8 bg-[#12121A] skeleton-shimmer"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom skeleton footer */}
      <footer className="flex items-center justify-center">
        <div className="h-3 w-44 rounded-md bg-white/[0.05] skeleton-shimmer" />
      </footer>
    </div>
  );
};
