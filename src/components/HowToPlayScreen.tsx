import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
  onPlayNow: () => void;
}

const STEPS = [
  {
    num: '01',
    title: 'Select Players & Difficulty',
    desc: 'Choose 3 to 20 players on one phone, optionally enter custom player names, and pick Easy, Medium, or Hard imposter hints.',
  },
  {
    num: '02',
    title: 'Private Word Reveal',
    desc: 'Pass the phone around. Each player taps TAP TO GET YOUR WORD in private, memorizes their role card, and taps DONE before passing it on.',
  },
  {
    num: '03',
    title: 'Spot the Imposter',
    desc: 'Every crew player receives the exact same secret word. One random Imposter receives only a difficulty-tuned clue instead of the word.',
  },
  {
    num: '04',
    title: 'Discuss Carefully',
    desc: 'Take turns giving one clue or asking questions. Innocents want to sound clear without exposing the word; the Imposter tries to blend in.',
  },
  {
    num: '05',
    title: 'Collective Vote & Reveal',
    desc: 'Agree on ONE suspect together as a group. Confirm the single collective vote, then tap REVEAL RESULT to update scores and local Game History.',
  },
];

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({
  onBack,
  onPlayNow,
}) => {
  return (
    <div className="safe-screen flex flex-col max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
          How To Play
        </span>
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 py-6 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Rules of Zelora Imposter
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-zinc-400">
            100% offline pass-and-play social deduction with bundled assets and local scoring.
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="gaming-card rounded-2xl p-5 flex items-start gap-4"
            >
              <span className="font-mono text-sm font-bold text-sky-400 tabular-nums pt-0.5 shrink-0">
                {step.num}.
              </span>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-white">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section className="gaming-card rounded-2xl p-5">
          <h2 className="font-display text-base sm:text-lg font-bold text-white">
            Hint Difficulty Tiers
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl border border-sky-400/20 bg-sky-500/8 p-3.5">
              <div className="font-bold text-sky-300 uppercase tracking-wider">
                Easy
              </div>
              <p className="mt-1 text-zinc-300 leading-relaxed">
                Broad category clue (e.g. Hard Disk → Technology).
              </p>
            </div>
            <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3.5">
              <div className="font-bold text-violet-300 uppercase tracking-wider">
                Medium
              </div>
              <p className="mt-1 text-zinc-300 leading-relaxed">
                Indirect contextual clue (e.g. Hard Disk → Digital storage).
              </p>
            </div>
            <div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/8 p-3.5">
              <div className="font-bold text-fuchsia-300 uppercase tracking-wider">
                Hard
              </div>
              <p className="mt-1 text-zinc-300 leading-relaxed">
                Clever abstract clue (e.g. Lion → A symbol of authority in the wild).
              </p>
            </div>
          </div>
        </section>

        <section className="gaming-card rounded-2xl p-5">
          <h2 className="font-display text-base sm:text-lg font-bold text-white">
            Scoring Rules
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/8 p-4">
              <div className="font-semibold text-amber-300">
                Imposter Caught (Correct Vote)
              </div>
              <p className="mt-1 text-zinc-300">
                Every innocent player earns{' '}
                <strong className="text-white">+1 point</strong>. Imposter earns
                0 points.
              </p>
            </div>
            <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4">
              <div className="font-semibold text-red-400">
                Imposter Escapes (Wrong Vote)
              </div>
              <p className="mt-1 text-zinc-300">
                The Imposter earns{' '}
                <strong className="text-white">+1 point</strong>. Other players
                earn 0 points.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="pb-2">
        <button
          type="button"
          onClick={onPlayNow}
          className="w-full min-h-[56px] rounded-xl gaming-btn-primary active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base font-extrabold tracking-wider cursor-pointer"
        >
          PLAY GAME
        </button>
      </footer>
    </div>
  );
};
