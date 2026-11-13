import React from 'react';

interface ZeloraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const ZeloraLogo: React.FC<ZeloraLogoProps> = ({
  size = 'md',
  showWordmark = true,
}) => {
  const dims =
    size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';

  return (
    <div className="inline-flex flex-col items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-violet-600/25 blur-xl"
        />
        <svg
          className={`${dims} relative`}
          viewBox="0 0 128 128"
          fill="none"
          aria-label="Zelora Imposter emblem"
        >
          <defs>
            <linearGradient
              id="zelora-shield-stroke"
              x1="20"
              y1="14"
              x2="108"
              y2="114"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>
            <linearGradient
              id="zelora-gold-core"
              x1="54"
              y1="54"
              x2="74"
              y2="74"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path
            d="M64 12L106 32V66C106 90.5 87.5 109.5 64 117C40.5 109.5 22 90.5 22 66V32L64 12Z"
            fill="#141221"
            stroke="url(#zelora-shield-stroke)"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path
            d="M42 42H86L44 86H86"
            stroke="#F8FAFC"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M64 54L74 64L64 74L54 64L64 54Z"
            fill="url(#zelora-gold-core)"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.14em] text-white text-balance">
            ZELORA <span className="text-violet-400">IMPOSTER</span>
          </h1>
        </div>
      )}
    </div>
  );
};
