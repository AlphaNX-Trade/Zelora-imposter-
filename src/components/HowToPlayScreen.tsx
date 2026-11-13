import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
  onPlayNow: () => void;
}

const STEPS = [
  {
    num: '01',
    title: 'Select Player Count',
    desc: 'Choose 3 to 20 players using one phone. Everyone gets a seat number from PLAYER 01 up to PLAYER 20.',
  },
  {
    num: '02',
    title: 'Private Word Reveal',
    desc: 'Pass the phone around. Each player taps TAP TO GET YOUR WORD in private, memorizes their info, and taps DONE before passing it on.',
  },
  {
    num: '03',
    title: 'Spot the Imposter',
    desc: 'Every innocent player receives the same secret word. One random player is the Imposter and receives only a related hint.',
  },
  {
    num: '04',
    title: 'Discuss Carefully',
    desc: 'Take turns describing or asking questions about the word. Innocents want to sound clear without giving the word away; the Imposter tries to blend in.',
  },
  {
    num: '05',
    title: 'Private Vote & Reveal',
    desc: 'Each player votes privately for who they suspect (no self-votes). Once everyone has voted, tap REVEAL RESULT to uncover the truth!',
  },
];

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({
  onBack,
  onPlayNow,
}) => {
  return (
    <div className="min-h-[100dvh] flex flex-col px-5 py-6 sm:px-8 max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
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
            100% offline pass-and-play social deduction for 3–20 players.
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border border-white/10 bg-[#12121A] p-5 flex items-start gap-4"
            >
              <span className="font-mono text-sm font-bold text-violet-400 tabular-nums pt-0.5 shrink-0">
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

        <section className="rounded-2xl border border-white/10 bg-[#12121A] p-5">
          <h2 className="font-display text-base sm:text-lg font-bold text-white">
            Scoring Rules
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/8 p-4">
              <div className="font-semibold text-amber-300">
                Imposter Caught (Correct Vote)
              </div>
              <p className="mt-1 text-zinc-300">
                Every innocent player earns <strong className="text-white">+1 point</strong>.
                Imposter earns 0 points.
              </p>
            </div>
            <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4">
              <div className="font-semibold text-red-400">
                Imposter Escapes (Wrong Vote)
              </div>
              <p className="mt-1 text-zinc-300">
                The Imposter earns <strong className="text-white">+1 point</strong>.
                Other players earn 0 points.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="pb-2">
        <button
          type="button"
          onClick={onPlayNow}
          className="w-full min-h-[56px] rounded-xl bg-violet-600 hover:bg-violet-500 border-b-[3px] border-violet-800 active:border-b-0 active:translate-y-[2px] transition-all text-white font-display text-base font-extrabold tracking-wider cursor-pointer"
        >
          PLAY GAME
        </button>
      </footer>
    </div>
  );
};
