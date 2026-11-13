import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();

  // Mock matchMedia for reduced motion & standalone detection
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock canvas getContext for ParticleCanvas in jsdom
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
    lineCap: 'round',
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
