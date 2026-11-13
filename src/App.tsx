import { useCallback, useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { AboutScreen } from './components/AboutScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { HomeScreen } from './components/HomeScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { PreRevealScreen } from './components/PreRevealScreen';
import { ResultScreen } from './components/ResultScreen';
import { RevealScreen } from './components/RevealScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SetupScreen } from './components/SetupScreen';
import { TieScreen } from './components/TieScreen';
import { VotingScreen } from './components/VotingScreen';
import type { GameScreen, GameSession, GameSettings } from './types/game';
import { audioEngine } from './utils/audio';
import {
  clampPlayerCount,
  createNewSession,
  evaluateVotingResult,
  getSortedLeaderboard,
} from './utils/gameEngine';
import {
  clearAllLocalHistory,
  clearSessionStorage,
  loadActiveGameState,
  loadSettings,
  loadUsedWordIds,
  saveActiveGameState,
  saveSettings,
  saveUsedWordIds,
} from './utils/storage';

interface TieState {
  tiedPlayers: number[];
  voteCounts: Record<number, number>;
}

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [usedWordIds, setUsedWordIds] = useState<string[]>(() =>
    loadUsedWordIds(),
  );
  const [savedState] = useState(() => loadActiveGameState());
  const [session, setSession] = useState<GameSession | null>(
    () => savedState.session,
  );
  const [screen, setScreen] = useState<GameScreen>('HOME');
  const [setupPlayerCount, setSetupPlayerCount] = useState<number>(() =>
    clampPlayerCount(loadSettings().playerCount),
  );
  const [tieState, setTieState] = useState<TieState | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  // Sync audio configuration
  useEffect(() => {
    audioEngine.configure(settings.soundEnabled, settings.musicEnabled);
  }, [settings.soundEnabled, settings.musicEnabled]);

  // Unlock audio context on first user gesture
  useEffect(() => {
    const unlock = () => {
      audioEngine.unlock();
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // Track online/offline status for subtle offline indicator
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Persist active gameplay state on transitions
  useEffect(() => {
    const gameplayScreens: GameScreen[] = [
      'REVEAL',
      'DISCUSSION',
      'VOTING',
      'PRE_REVEAL',
      'TIE_NOTIFICATION',
      'RESULT',
    ];
    if (session && gameplayScreens.includes(screen)) {
      saveActiveGameState(session, screen);
    }
  }, [session, screen]);

  // Prevent accidental browser back-navigation into previous reveal/voting secrets
  useEffect(() => {
    const sensitiveScreens: GameScreen[] = [
      'REVEAL',
      'DISCUSSION',
      'VOTING',
      'PRE_REVEAL',
      'TIE_NOTIFICATION',
    ];
    if (!sensitiveScreens.includes(screen)) return;

    window.history.pushState({ zeloraGuard: true }, '');
    const handlePopState = () => {
      window.history.pushState({ zeloraGuard: true }, '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [screen]);

  const handleUpdateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
    setSetupPlayerCount(clampPlayerCount(next.playerCount));
    saveSettings(next);
  }, []);

  const handleStartFreshGame = useCallback(
    (playerCount: number) => {
      audioEngine.playTap();
      const updatedSettings: GameSettings = {
        ...settings,
        playerCount: clampPlayerCount(playerCount),
      };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);

      const { session: newSession, updatedUsedIds } = createNewSession(
        updatedSettings,
        usedWordIds,
      );
      setUsedWordIds(updatedUsedIds);
      saveUsedWordIds(updatedUsedIds);
      setSession(newSession);
      setTieState(null);
      setScreen('REVEAL');
    },
    [settings, usedWordIds],
  );

  const handleResumeGame = useCallback(() => {
    if (!session) return;
    audioEngine.playTap();
    if (session.outcome) {
      setScreen('RESULT');
    } else if (
      Object.keys(session.votes).length >= session.playerCount
    ) {
      setScreen('PRE_REVEAL');
    } else if (session.revealIndex >= session.playerCount) {
      setScreen('DISCUSSION');
    } else {
      setSession({ ...session, revealStep: 'PROMPT' });
      setScreen('REVEAL');
    }
  }, [session]);

  const handleTapRevealWord = useCallback(() => {
    if (!session) return;
    const currentPlayer = session.revealIndex + 1;
    if (currentPlayer === session.imposterPlayer) {
      audioEngine.playRevealImposter();
    } else {
      audioEngine.playRevealNormal();
    }
    setSession({
      ...session,
      revealStep: 'SECRET',
    });
  }, [session]);

  const handleTapDoneReveal = useCallback(() => {
    if (!session) return;
    audioEngine.playDone();
    const nextIndex = session.revealIndex + 1;
    if (nextIndex >= session.playerCount) {
      setSession({
        ...session,
        revealIndex: nextIndex,
        revealStep: 'PROMPT',
      });
      setScreen('DISCUSSION');
    } else {
      setSession({
        ...session,
        revealIndex: nextIndex,
        revealStep: 'PROMPT',
      });
    }
  }, [session]);

  const handleStartVoting = useCallback(() => {
    if (!session) return;
    audioEngine.playTap();
    setSession({
      ...session,
      voterIndex: 0,
      votingHandoff: false,
      votes: {},
    });
    setScreen('VOTING');
  }, [session]);

  const handleConfirmVote = useCallback(
    (targetPlayer: number) => {
      if (!session) return;
      const currentVoter = session.voterIndex + 1;
      // Prevent duplicate voting and self-voting
      if (session.votes[currentVoter] !== undefined) return;
      if (targetPlayer === currentVoter) return;
      if (!session.candidatePool.includes(targetPlayer)) return;

      audioEngine.playVoteLock();
      const nextVotes = {
        ...session.votes,
        [currentVoter]: targetPlayer,
      };
      const nextVoterIndex = session.voterIndex + 1;

      if (nextVoterIndex >= session.playerCount) {
        setSession({
          ...session,
          votes: nextVotes,
          voterIndex: nextVoterIndex,
          votingHandoff: false,
        });
        setScreen('PRE_REVEAL');
      } else {
        setSession({
          ...session,
          votes: nextVotes,
          voterIndex: nextVoterIndex,
          votingHandoff: true,
        });
      }
    },
    [session],
  );

  const handleStartNextVoter = useCallback(() => {
    if (!session) return;
    audioEngine.playTap();
    setSession({
      ...session,
      votingHandoff: false,
    });
  }, [session]);

  const handleRevealResult = useCallback(() => {
    if (!session) return;
    const evaluation = evaluateVotingResult(session, settings.hintDifficulty);

    if (evaluation.isTie) {
      audioEngine.playTimerEnd();
      setTieState({
        tiedPlayers: evaluation.tiedPlayers,
        voteCounts: evaluation.voteCounts,
      });
      setScreen('TIE_NOTIFICATION');
      return;
    }

    if (evaluation.outcome.winningSide === 'PLAYERS') {
      audioEngine.playVictory();
    } else {
      audioEngine.playDefeat();
    }

    setTieState(null);
    setSession({
      ...session,
      scores: evaluation.updatedScores,
      outcome: evaluation.outcome,
    });
    setScreen('RESULT');
  }, [session, settings.hintDifficulty]);

  const handleStartRevote = useCallback(() => {
    if (!session || !tieState) return;
    audioEngine.playTap();
    setSession({
      ...session,
      candidatePool: tieState.tiedPlayers,
      voterIndex: 0,
      votingHandoff: false,
      votes: {},
      revoteRound: session.revoteRound + 1,
    });
    setTieState(null);
    setScreen('VOTING');
  }, [session, tieState]);

  const handlePlayNextRound = useCallback(() => {
    if (!session) return;
    audioEngine.playTap();
    const { session: nextRoundSession, updatedUsedIds } = createNewSession(
      { ...settings, playerCount: session.playerCount },
      usedWordIds,
      session.scores,
      session.roundNumber + 1,
    );
    setUsedWordIds(updatedUsedIds);
    saveUsedWordIds(updatedUsedIds);
    setSession(nextRoundSession);
    setTieState(null);
    setScreen('REVEAL');
  }, [session, settings, usedWordIds]);

  const handleReturnHome = useCallback(() => {
    audioEngine.playTap();
    setScreen('HOME');
  }, []);

  const handleResetCurrentGame = useCallback(() => {
    clearSessionStorage();
    setSession(null);
    setTieState(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearAllLocalHistory();
    setSession(null);
    setTieState(null);
    setUsedWordIds([]);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#09090D] text-[#F8FAFC] relative overflow-x-hidden">
      {/* Subtle atmospheric background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.13),transparent_55%)]"
      />

      {/* Offline status notice only when actually offline */}
      {!isOnline && (
        <div
          role="status"
          className="relative z-40 bg-violet-950/80 border-b border-violet-500/25 px-4 py-1.5 text-center text-xs text-violet-200 flex items-center justify-center gap-2"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Offline Mode · Full game &amp; 550 words available locally</span>
        </div>
      )}

      <div className="relative z-10">
        {screen === 'HOME' && (
          <HomeScreen
            hasActiveSession={!!session}
            activeRound={session?.roundNumber ?? 1}
            activePlayerCount={session?.playerCount ?? settings.playerCount}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() =>
              handleUpdateSettings({
                ...settings,
                soundEnabled: !settings.soundEnabled,
              })
            }
            onPlayGame={() => {
              audioEngine.playTap();
              setSetupPlayerCount(clampPlayerCount(settings.playerCount));
              setScreen('SETUP');
            }}
            onResumeGame={handleResumeGame}
            onHowToPlay={() => {
              audioEngine.playTap();
              setScreen('HOW_TO_PLAY');
            }}
            onSettings={() => {
              audioEngine.playTap();
              setScreen('SETTINGS');
            }}
            onAbout={() => {
              audioEngine.playTap();
              setScreen('ABOUT');
            }}
          />
        )}

        {screen === 'SETUP' && (
          <SetupScreen
            playerCount={setupPlayerCount}
            settings={settings}
            onChangePlayerCount={(count) => {
              audioEngine.playTap();
              setSetupPlayerCount(clampPlayerCount(count));
            }}
            onStartGame={() => handleStartFreshGame(setupPlayerCount)}
            onBack={() => {
              audioEngine.playTap();
              setScreen('HOME');
            }}
          />
        )}

        {screen === 'REVEAL' && session && (
          <RevealScreen
            session={session}
            hintDifficulty={settings.hintDifficulty}
            onTapReveal={handleTapRevealWord}
            onTapDone={handleTapDoneReveal}
          />
        )}

        {screen === 'DISCUSSION' && session && (
          <DiscussionScreen
            roundNumber={session.roundNumber}
            playerCount={session.playerCount}
            timerDurationSeconds={settings.discussionTimerSeconds}
            onStartVoting={handleStartVoting}
          />
        )}

        {screen === 'VOTING' && session && (
          <VotingScreen
            session={session}
            onConfirmVote={handleConfirmVote}
            onStartNextVoter={handleStartNextVoter}
          />
        )}

        {screen === 'PRE_REVEAL' && session && (
          <PreRevealScreen
            roundNumber={session.roundNumber}
            playerCount={session.playerCount}
            onRevealResult={handleRevealResult}
          />
        )}

        {screen === 'TIE_NOTIFICATION' && session && tieState && (
          <TieScreen
            roundNumber={session.roundNumber}
            tiedPlayers={tieState.tiedPlayers}
            voteCounts={tieState.voteCounts}
            revoteRound={session.revoteRound}
            onStartRevote={handleStartRevote}
          />
        )}

        {screen === 'RESULT' && session && session.outcome && (
          <ResultScreen
            outcome={session.outcome}
            leaderboard={getSortedLeaderboard(
              session.scores,
              session.playerCount,
            )}
            onPlayNextRound={handlePlayNextRound}
            onReturnHome={handleReturnHome}
          />
        )}

        {screen === 'HOW_TO_PLAY' && (
          <HowToPlayScreen
            onBack={() => {
              audioEngine.playTap();
              setScreen('HOME');
            }}
            onPlayNow={() => {
              audioEngine.playTap();
              setSetupPlayerCount(clampPlayerCount(settings.playerCount));
              setScreen('SETUP');
            }}
          />
        )}

        {screen === 'SETTINGS' && (
          <SettingsScreen
            settings={settings}
            hasActiveSession={!!session}
            usedWordCount={usedWordIds.length}
            onUpdateSettings={handleUpdateSettings}
            onResetCurrentGame={handleResetCurrentGame}
            onClearHistory={handleClearHistory}
            onBack={() => {
              audioEngine.playTap();
              setScreen('HOME');
            }}
          />
        )}

        {screen === 'ABOUT' && (
          <AboutScreen
            onBack={() => {
              audioEngine.playTap();
              setScreen('HOME');
            }}
          />
        )}
      </div>
    </div>
  );
}
