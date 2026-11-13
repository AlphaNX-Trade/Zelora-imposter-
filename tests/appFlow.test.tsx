import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { WORD_LIBRARY } from '../src/data/words';
import { audioEngine } from '../src/utils/audio';
import * as gameEngine from '../src/utils/gameEngine';

const flushTransition = () => {
  act(() => {
    vi.advanceTimersByTime(350);
  });
};

describe('ZELORA IMPOSTER End-to-End Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows graceful startup skeleton then renders Home screen with branding, tagline, menu buttons, and developer credits', () => {
    render(<App />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByText(/Loading 572-word offline deck/i),
    ).toBeInTheDocument();

    flushTransition();

    expect(
      screen.getByRole('heading', { name: /ZELORA IMPOSTER/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Think Carefully. Speak Wisely. Find the Imposter.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PLAY GAME/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /HISTORY/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /HOW TO PLAY/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SETTINGS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ABOUT/i })).toBeInTheDocument();
    expect(screen.getByText(/Developed by Zelora/i)).toBeInTheDocument();
  });

  it('FINAL ACCEPTANCE TEST: 5-player round with Hard Disk -> Technology isolation, single collective vote, reveal result, game history, and round 2 reset', () => {
    const hardDiskEntry = WORD_LIBRARY.find((w) => w.word === 'Hard Disk')!;
    const realCreate = gameEngine.createNewSession;
    vi.spyOn(gameEngine, 'createNewSession').mockImplementation(
      (settings, usedIds, existingScores, roundNum = 1) => {
        const res = realCreate(settings, usedIds, existingScores, roundNum);
        return {
          ...res,
          session: {
            ...res.session,
            imposterPlayer: 3,
            wordEntry: hardDiskEntry,
          },
        };
      },
    );

    render(<App />);
    flushTransition();

    // Home -> Setup (5 players default)
    fireEvent.click(screen.getByRole('button', { name: /PLAY GAME/i }));
    expect(screen.getByText('PLAYER 05')).toBeInTheDocument();

    // Start Game -> Dealing skeleton -> Reveal Players 01..05
    fireEvent.click(screen.getByRole('button', { name: /START GAME/i }));
    expect(screen.getByText('SHUFFLING DECK')).toBeInTheDocument();
    flushTransition();

    for (let p = 1; p <= 5; p++) {
      const label = `PLAYER ${String(p).padStart(2, '0')}`;
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText(hardDiskEntry.word)).not.toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }),
      );

      if (p === 3) {
        expect(screen.getByText('IMPOSTER')).toBeInTheDocument();
        expect(screen.getByText('EASY CLUE')).toBeInTheDocument();
        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.queryByText('Hard Disk')).not.toBeInTheDocument();
      } else {
        expect(screen.getByText('YOUR SECRET WORD')).toBeInTheDocument();
        expect(screen.getByText('Hard Disk')).toBeInTheDocument();
        expect(screen.queryByText('Technology')).not.toBeInTheDocument();
        expect(screen.queryByText('IMPOSTER')).not.toBeInTheDocument();
      }

      fireEvent.click(screen.getByRole('button', { name: /DONE/i }));
    }

    // Discussion Screen
    expect(
      screen.getByText('EVERYONE HAS RECEIVED THEIR WORD!'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /START VOTING/i }));

    // Single Collective Voting Screen displaying all 5 player numbers
    expect(screen.getByText('WHO IS THE IMPOSTER?')).toBeInTheDocument();
    expect(screen.queryByText(/Voter:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vote Saved/i)).not.toBeInTheDocument();
    for (let p = 1; p <= 5; p++) {
      const btn = screen.getByRole('button', {
        name: new RegExp(`PLAYER ${String(p).padStart(2, '0')}`),
      });
      expect(btn).toBeEnabled();
    }

    // Group selects Player 03 once and confirms once
    fireEvent.click(screen.getByRole('button', { name: /PLAYER 03/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /CONFIRM VOTE · PLAYER 03/i }),
    );

    // Locked screen before result reveal (never goes to Voter 02!)
    expect(screen.getByText('GROUP VOTE LOCKED!')).toBeInTheDocument();
    expect(screen.getByText(/Suspect: PLAYER 03/i)).toBeInTheDocument();
    expect(screen.queryByText('IMPOSTER FOUND!')).not.toBeInTheDocument();

    // Reveal Result -> Checking skeleton -> Result Screen
    fireEvent.click(screen.getByRole('button', { name: /REVEAL RESULT/i }));
    expect(screen.getByText('CHECKING GROUP VOTE')).toBeInTheDocument();
    flushTransition();

    expect(screen.getByText('IMPOSTER FOUND!')).toBeInTheDocument();
    expect(screen.getByText('YOU CAUGHT THE IMPOSTER!')).toBeInTheDocument();
    expect(screen.getByText('PLAYER 03 WAS THE IMPOSTER!')).toBeInTheDocument();
    expect(screen.getAllByText('Hard Disk').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/votes\)/i)).not.toBeInTheDocument();

    // Verify Leaderboard: 4 innocents = 1 POINT, Player 03 = 0 POINTS
    const leaderboardSection = screen
      .getByRole('heading', { name: 'LEADERBOARD' })
      .closest('section')!;
    expect(within(leaderboardSection).getAllByText('1 POINT')).toHaveLength(4);
    expect(within(leaderboardSection).getByText('0 POINTS')).toBeInTheDocument();

    // Game History saved -> inspect from Result header
    fireEvent.click(screen.getByRole('button', { name: /History/i }));
    expect(screen.getByText('Game History')).toBeInTheDocument();
    expect(screen.getByText('Hard Disk')).toBeInTheDocument();
    expect(screen.getByText('Crew Won')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));

    // Resume into Result and start Next Round -> resets collective vote cleanly for Round 02
    fireEvent.click(screen.getByRole('button', { name: /RESUME ROUND 1/i }));
    flushTransition();
    fireEvent.click(screen.getByRole('button', { name: /PLAY NEXT ROUND/i }));
    expect(screen.getByText('PREPARING ROUND 02')).toBeInTheDocument();
    flushTransition();

    expect(screen.getByText(/Round 02/i)).toBeInTheDocument();
    expect(screen.getAllByText('PLAYER 01').length).toBeGreaterThanOrEqual(1);
  });

  it('supports Hard hint difficulty and custom player names across Setup, Reveal, Collective Vote, and Result', () => {
    const hardDiskEntry = WORD_LIBRARY.find((w) => w.word === 'Hard Disk')!;
    const realCreate = gameEngine.createNewSession;
    vi.spyOn(gameEngine, 'createNewSession').mockImplementation(
      (settings, usedIds, existingScores, roundNum = 1) => {
        const res = realCreate(settings, usedIds, existingScores, roundNum);
        return {
          ...res,
          session: {
            ...res.session,
            imposterPlayer: 2,
            wordEntry: hardDiskEntry,
          },
        };
      },
    );

    render(<App />);
    flushTransition();

    fireEvent.click(screen.getByRole('button', { name: /PLAY GAME/i }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));

    // Select Hard difficulty
    fireEvent.click(screen.getByRole('button', { name: /Hard/i }));

    // Edit player names
    fireEvent.click(screen.getByRole('button', { name: /Edit Names/i }));
    fireEvent.change(screen.getByLabelText('Name for PLAYER 01'), {
      target: { value: 'Aarav' },
    });
    fireEvent.change(screen.getByLabelText('Name for PLAYER 02'), {
      target: { value: 'Zoya' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Done Naming/i }));

    fireEvent.click(screen.getByRole('button', { name: /START GAME/i }));
    flushTransition();

    // Player 01 = Aarav (Innocent)
    expect(screen.getAllByText('Aarav').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }));
    expect(screen.getByText('Hard Disk')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /DONE/i }));

    // Player 02 = Zoya (Imposter receives Hard clue)
    expect(screen.getAllByText('Zoya').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }));
    expect(screen.getByText('IMPOSTER')).toBeInTheDocument();
    expect(screen.getByText('HARD CLUE')).toBeInTheDocument();
    expect(
      screen.getByText('A place where forgotten memories wait'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /DONE/i }));

    // Player 03 (default label)
    fireEvent.click(screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }));
    fireEvent.click(screen.getByRole('button', { name: /DONE/i }));

    fireEvent.click(screen.getByRole('button', { name: /START VOTING/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoya' }));
    fireEvent.click(
      screen.getByRole('button', { name: /CONFIRM VOTE · Zoya/i }),
    );
    expect(screen.getByText(/Suspect: Zoya/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /REVEAL RESULT/i }));
    flushTransition();

    expect(screen.getByText('Zoya WAS THE IMPOSTER!')).toBeInTheDocument();
    expect(screen.getByText('Hint (HARD)')).toBeInTheDocument();
  });

  it('handles wrong collective vote (+1 to imposter) and allows returning to discussion before vote confirmation', () => {
    const lionEntry = WORD_LIBRARY.find((w) => w.word === 'Lion')!;
    const realCreate = gameEngine.createNewSession;
    vi.spyOn(gameEngine, 'createNewSession').mockImplementation(
      (settings, usedIds, existingScores, roundNum = 1) => {
        const res = realCreate(settings, usedIds, existingScores, roundNum);
        return {
          ...res,
          session: {
            ...res.session,
            imposterPlayer: 3,
            wordEntry: lionEntry,
          },
        };
      },
    );

    render(<App />);
    flushTransition();

    fireEvent.click(screen.getByRole('button', { name: /PLAY GAME/i }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: /START GAME/i }));
    flushTransition();

    for (let i = 0; i < 3; i++) {
      fireEvent.click(
        screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }),
      );
      fireEvent.click(screen.getByRole('button', { name: /DONE/i }));
    }

    fireEvent.click(screen.getByRole('button', { name: /START VOTING/i }));

    // Group cannot agree yet -> returns to discussion
    fireEvent.click(screen.getByRole('button', { name: /Discuss More/i }));
    expect(
      screen.getByText('EVERYONE HAS RECEIVED THEIR WORD!'),
    ).toBeInTheDocument();

    // Return to collective voting and vote out innocent Player 01
    fireEvent.click(screen.getByRole('button', { name: /START VOTING/i }));
    fireEvent.click(screen.getByRole('button', { name: /PLAYER 01/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /CONFIRM VOTE · PLAYER 01/i }),
    );

    fireEvent.click(screen.getByRole('button', { name: /REVEAL RESULT/i }));
    flushTransition();

    expect(screen.getByText('WRONG VOTE!')).toBeInTheDocument();
    expect(screen.getByText('THE IMPOSTER ESCAPED!')).toBeInTheDocument();
    expect(screen.getByText(/Group voted for PLAYER 01/i)).toBeInTheDocument();
    expect(screen.getAllByText('PLAYER 03').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Lion').length).toBeGreaterThanOrEqual(1);
  });

  it('recovers active game cleanly across simulated browser reload without exposing secrets', () => {
    const realCreate = gameEngine.createNewSession;
    vi.spyOn(gameEngine, 'createNewSession').mockImplementation(
      (settings, usedIds, existingScores, roundNum = 1) => {
        const res = realCreate(settings, usedIds, existingScores, roundNum);
        return {
          ...res,
          session: {
            ...res.session,
            imposterPlayer: 2,
            wordEntry: WORD_LIBRARY[0],
          },
        };
      },
    );

    const { unmount } = render(<App />);
    flushTransition();

    fireEvent.click(screen.getByRole('button', { name: /PLAY GAME/i }));
    fireEvent.click(screen.getByRole('button', { name: /START GAME/i }));
    flushTransition();

    fireEvent.click(
      screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }),
    );
    expect(screen.getByText('YOUR SECRET WORD')).toBeInTheDocument();
    unmount();

    render(<App />);
    expect(screen.getByText('RESTORING SESSION')).toBeInTheDocument();
    flushTransition();

    expect(screen.getAllByText('PLAYER 01').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('YOUR SECRET WORD')).not.toBeInTheDocument();
  });

  it('supports top-right exit/cancel button during gameplay for both pausing and ending the game', () => {
    render(<App />);
    flushTransition();

    fireEvent.click(screen.getByRole('button', { name: /PLAY GAME/i }));
    fireEvent.click(screen.getByRole('button', { name: /START GAME/i }));
    flushTransition();

    // Tap top-right Exit button during Reveal
    fireEvent.click(
      screen.getByRole('button', { name: /Cancel and exit game/i }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Save & Exit to Home keeps Resume Round available
    fireEvent.click(
      screen.getByRole('button', { name: /SAVE & EXIT TO HOME/i }),
    );
    expect(
      screen.getByRole('button', { name: /RESUME ROUND 1/i }),
    ).toBeInTheDocument();

    // Resume back into Reveal -> open Exit again -> Cancel & End Game discards session
    fireEvent.click(screen.getByRole('button', { name: /RESUME ROUND 1/i }));
    flushTransition();
    fireEvent.click(
      screen.getByRole('button', { name: /Cancel and exit game/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /CANCEL & END GAME/i }),
    );
    expect(
      screen.queryByRole('button', { name: /RESUME ROUND 1/i }),
    ).not.toBeInTheDocument();
  });

  it('unlocks audio synchronously and plays distinct win and loss sounds on result reveal', () => {
    const unlockSpy = vi.spyOn(audioEngine, 'unlock');
    const victorySpy = vi.spyOn(audioEngine, 'playVictory');
    const defeatSpy = vi.spyOn(audioEngine, 'playDefeat');

    const realCreate = gameEngine.createNewSession;
    vi.spyOn(gameEngine, 'createNewSession').mockImplementation(
      (settings, usedIds, existingScores, roundNum = 1) => {
        const res = realCreate(settings, usedIds, existingScores, roundNum);
        return {
          ...res,
          session: {
            ...res.session,
            imposterPlayer: 2,
            wordEntry: WORD_LIBRARY[0],
          },
        };
      },
    );

    render(<App />);
    flushTransition();

    // Round 1: Win (vote for actual imposter Player 02)
    fireEvent.click(screen.getByRole('button', { name: /PLAY GAME/i }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: /START GAME/i }));
    flushTransition();

    for (let i = 0; i < 3; i++) {
      fireEvent.click(
        screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }),
      );
      fireEvent.click(screen.getByRole('button', { name: /DONE/i }));
    }

    fireEvent.click(screen.getByRole('button', { name: /START VOTING/i }));
    fireEvent.click(screen.getByRole('button', { name: /PLAYER 02/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /CONFIRM VOTE · PLAYER 02/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /REVEAL RESULT/i }));
    expect(unlockSpy).toHaveBeenCalled();
    flushTransition();

    expect(victorySpy).toHaveBeenCalledTimes(1);
    expect(defeatSpy).not.toHaveBeenCalled();

    // Round 2: Loss (vote for innocent Player 01)
    fireEvent.click(screen.getByRole('button', { name: /PLAY NEXT ROUND/i }));
    flushTransition();

    for (let i = 0; i < 3; i++) {
      fireEvent.click(
        screen.getByRole('button', { name: /TAP TO GET YOUR WORD/i }),
      );
      fireEvent.click(screen.getByRole('button', { name: /DONE/i }));
    }

    fireEvent.click(screen.getByRole('button', { name: /START VOTING/i }));
    fireEvent.click(screen.getByRole('button', { name: /PLAYER 01/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /CONFIRM VOTE · PLAYER 01/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /REVEAL RESULT/i }));
    flushTransition();

    expect(victorySpy).toHaveBeenCalledTimes(1);
    expect(defeatSpy).toHaveBeenCalledTimes(1);
  });
});
