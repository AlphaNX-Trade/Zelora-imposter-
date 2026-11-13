import { useCallback, useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { WifiOff } from 'lucide-react';
import { AboutScreen } from './components/AboutScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { ExitGameModal } from './components/ExitGameControl';
import {
  GameLoadingScreen,
  type LoadingTransitionState,
} from './components/GameLoadingScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { HomeScreen } from './components/HomeScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { PreRevealScreen } from './components/PreRevealScreen';
import { ResultScreen } from './components/ResultScreen';
import { RevealScreen } from './components/RevealScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SetupScreen } from './components/SetupScreen';
import { VotingScreen } from './components/VotingScreen';
import type {
  GameHistoryRecord,
  GameScreen,
  GameSession,
  GameSettings,
} from './types/game';
import { audioEngine } from './utils/audio';
import {
  clampPlayerCount,
  createNewSession,
  evaluateCollectiveVote,
  getPlayerDisplayName,
  getSortedLeaderboard,
} from './utils/gameEngine';
import {
  appendGameHistory,
  clearAllLocalHistory,
  clearSessionStorage,
  loadActiveGameState,
  loadGameHistory,
  loadSettings,
  loadUsedWordIds,
  saveActiveGameState,
  saveSettings,
  saveUsedWordIds,
} from './utils/storage';

const STARTUP_LOADING_MS = 240;
const TRANSITION_LOADING_MS = 280;

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [usedWordIds, setUsedWordIds] = useState<string[]>(() =>
    loadUsedWordIds(),
  );
  const [gameHistory, setGameHistory] = useState<GameHistoryRecord[]>(() =>
    loadGameHistory(),
  );
  const [savedState] = useState(() => loadActiveGameState());
  const [session, setSession] = useState<GameSession | null>(
    () => savedState.session,
  );
  const [screen, setScreen] = useState<GameScreen>(() => {
    if (!savedState.session || !savedState.screen) return 'HOME';
    if (savedState.screen === 'RESULT' && !savedState.session.outcome) {
      return savedState.session.voteLocked &&
        savedState.session.selectedSuspect !== null
        ? 'PRE_REVEAL'
        : 'DISCUSSION';
    }
    if (
      savedState.screen === 'PRE_REVEAL' &&
      (!savedState.session.voteLocked ||
        savedState.session.selectedSuspect === null)
    ) {
      return 'VOTING';
    }
    if (savedState.screen === 'VOTING' && savedState.session.voteLocked) {
      return savedState.session.outcome ? 'RESULT' : 'PRE_REVEAL';
    }
    return savedState.screen;
  });
  const [setupPlayerCount, setSetupPlayerCount] = useState<number>(() =>
    clampPlayerCount(loadSettings().playerCount),
  );
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [loadingTransition, setLoadingTransition] =
    useState<LoadingTransitionState | null>(() => ({
      mode: 'startup',
      title: savedState.session ? 'RESTORING SESSION' : 'ZELORA IMPOSTER',
      subtitle: savedState.session
        ? 'Recovering your saved pass-and-play round...'
        : 'Loading 572-word offline deck...',
      playerCount: savedState.session?.playerCount,
      roundNumber: savedState.session?.roundNumber,
    }));

  const [exitModalOpen, setExitModalOpen] = useState(false);

  const transitionTimerRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLoadingTransition((prev) => (prev?.mode === 'startup' ? null : prev));
    }, STARTUP_LOADING_MS);
    return () => {
      window.clearTimeout(id);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const runSessionTransition = useCallback(
    (
      nextTransition: LoadingTransitionState,
      commitFn: () => void,
      durationMs: number = TRANSITION_LOADING_MS,
    ) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }

      setLoadingTransition(nextTransition);

      transitionTimerRef.current = window.setTimeout(() => {
        transitionTimerRef.current = null;
        try {
          commitFn();
        } finally {
          isTransitioningRef.current = false;
          setLoadingTransition(null);
        }
      }, durationMs);
    },
    [],
  );

  useEffect(() => {
    audioEngine.configure(settings.soundEnabled, settings.musicEnabled);
  }, [settings.soundEnabled, settings.musicEnabled]);

  useEffect(() => {
    const unlock = () => {
      audioEngine.unlock();
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

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

  useEffect(() => {
    const persistableScreens: GameScreen[] = [
      'HOME',
      'REVEAL',
      'DISCUSSION',
      'VOTING',
      'PRE_REVEAL',
      'RESULT',
    ];
    if (session && persistableScreens.includes(screen)) {
      saveActiveGameState(session, screen);
    }
  }, [session, screen]);

  useEffect(() => {
    const sensitiveScreens: GameScreen[] = [
      'REVEAL',
      'DISCUSSION',
      'VOTING',
      'PRE_REVEAL',
    ];
    if (!sensitiveScreens.includes(screen)) return;

    window.history.pushState({ zeloraGuard: true }, '');
    const handlePopState = () => {
      window.history.pushState({ zeloraGuard: true }, '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen]);

  useEffect(() => {
    const escapableScreens: GameScreen[] = [
      'SETUP',
      'HISTORY',
      'HOW_TO_PLAY',
      'SETTINGS',
      'ABOUT',
    ];
    if (!escapableScreens.includes(screen) || loadingTransition) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        audioEngine.playTap();
        setScreen('HOME');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, loadingTransition]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (loadingTransition) return;

      if (exitModalOpen) {
        setExitModalOpen(false);
        return;
      }

      if (
        screen === 'SETUP' ||
        screen === 'HISTORY' ||
        screen === 'HOW_TO_PLAY' ||
        screen === 'SETTINGS' ||
        screen === 'ABOUT' ||
        screen === 'RESULT'
      ) {
        audioEngine.playTap();
        setScreen('HOME');
        return;
      }

      if (screen === 'VOTING' && session && !session.voteLocked) {
        audioEngine.playTap();
        setScreen('DISCUSSION');
        return;
      }

      if (
        screen === 'REVEAL' ||
        screen === 'DISCUSSION' ||
        screen === 'VOTING' ||
        screen === 'PRE_REVEAL'
      ) {
        audioEngine.playTap();
        setExitModalOpen(true);
        return;
      }

      if (screen === 'HOME') {
        void CapacitorApp.exitApp();
      }
    });

    return () => {
      void listenerPromise.then((handle) => handle.remove());
    };
  }, [screen, exitModalOpen, session, loadingTransition]);

  const handleUpdateSettings = useCallback((next: GameSettings) => {
    setSettings((prev) => {
      if (next.playerCount !== prev.playerCount) {
        setSetupPlayerCount(clampPlayerCount(next.playerCount));
      }
      return next;
    });
    saveSettings(next);
  }, []);

  const handleStartFreshGame = useCallback(
    (playerCount: number) => {
      const clampedCount = clampPlayerCount(playerCount);
      audioEngine.playTap();

      runSessionTransition(
        {
          mode: 'dealing',
          title: 'SHUFFLING DECK',
          subtitle: `Assigning secret roles for ${clampedCount} players...`,
          playerCount: clampedCount,
          roundNumber: 1,
        },
        () => {
          const updatedSettings: GameSettings = {
            ...settings,
            playerCount: clampedCount,
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
          setScreen('REVEAL');
        },
      );
    },
    [settings, usedWordIds, runSessionTransition],
  );

  const handleResumeGame = useCallback(() => {
    if (!session) return;
    audioEngine.playTap();

    runSessionTransition(
      {
        mode: 'resuming',
        title: `RESUMING ROUND ${String(session.roundNumber).padStart(2, '0')}`,
        subtitle: `Restoring ${session.playerCount}-player session privately...`,
        playerCount: session.playerCount,
        roundNumber: session.roundNumber,
      },
      () => {
        if (session.outcome) {
          setScreen('RESULT');
        } else if (session.voteLocked && session.selectedSuspect !== null) {
          setScreen('PRE_REVEAL');
        } else if (session.revealIndex >= session.playerCount) {
          setScreen('DISCUSSION');
        } else {
          setSession({ ...session, revealStep: 'PROMPT' });
          setScreen('REVEAL');
        }
      },
    );
  }, [session, runSessionTransition]);

  const handleTapRevealWord = useCallback(() => {
    if (!session || session.revealStep === 'SECRET') return;
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
    if (!session || session.revealStep !== 'SECRET') return;
    audioEngine.playDone();
    const nextIndex = session.revealIndex + 1;
    if (nextIndex >= session.playerCount) {
      setSession({
        ...session,
        revealIndex: session.playerCount,
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
    if (session.outcome) {
      setScreen('RESULT');
      return;
    }
    if (session.voteLocked && session.selectedSuspect !== null) {
      setScreen('PRE_REVEAL');
      return;
    }
    setScreen('VOTING');
  }, [session]);

  const handleBackToDiscussion = useCallback(() => {
    if (!session || session.voteLocked || session.outcome !== null) return;
    audioEngine.playTap();
    setScreen('DISCUSSION');
  }, [session]);

  const handleConfirmCollectiveVote = useCallback(
    (targetPlayer: number) => {
      if (
        !session ||
        session.voteLocked ||
        session.selectedSuspect !== null ||
        session.outcome !== null
      ) {
        return;
      }
      if (
        !Number.isInteger(targetPlayer) ||
        targetPlayer < 1 ||
        targetPlayer > session.playerCount
      ) {
        return;
      }

      audioEngine.playVoteLock();
      setSession({
        ...session,
        selectedSuspect: targetPlayer,
        voteLocked: true,
      });
      setScreen('PRE_REVEAL');
    },
    [session],
  );

  const handleRevealResult = useCallback(() => {
    if (
      !session ||
      session.outcome !== null ||
      !session.voteLocked ||
      session.selectedSuspect === null
    ) {
      return;
    }

    audioEngine.unlock();

    runSessionTransition(
      {
        mode: 'tallying',
        title: 'CHECKING GROUP VOTE',
        subtitle: 'Uncovering the imposter & updating leaderboard...',
        playerCount: session.playerCount,
        roundNumber: session.roundNumber,
      },
      () => {
        const evaluation = evaluateCollectiveVote(
          session,
          settings.hintDifficulty,
        );

        if (evaluation.outcome.winningSide === 'PLAYERS') {
          audioEngine.playVictory();
        } else {
          audioEngine.playDefeat();
        }

        const record: GameHistoryRecord = {
          id: `${Date.now()}-${session.roundNumber}-${Math.random().toString(36).slice(2, 7)}`,
          playedAt: Date.now(),
          roundNumber: evaluation.outcome.roundNumber,
          playerCount: session.playerCount,
          winningSide: evaluation.outcome.winningSide,
          imposterPlayer: evaluation.outcome.imposterPlayer,
          votedOutPlayer: evaluation.outcome.votedOutPlayer,
          imposterLabel: getPlayerDisplayName(
            evaluation.outcome.imposterPlayer,
            session.playerNames,
          ),
          votedOutLabel: getPlayerDisplayName(
            evaluation.outcome.votedOutPlayer,
            session.playerNames,
          ),
          secretWord: evaluation.outcome.secretWord,
          category: evaluation.outcome.category,
          hintDifficulty: evaluation.outcome.hintDifficulty,
          hintShown: evaluation.outcome.hintShown,
        };
        setGameHistory(appendGameHistory(record));

        setSession({
          ...session,
          scores: evaluation.updatedScores,
          outcome: evaluation.outcome,
        });
        setScreen('RESULT');
      },
    );
  }, [session, settings.hintDifficulty, runSessionTransition]);

  const handlePlayNextRound = useCallback(() => {
    if (!session) return;
    audioEngine.playTap();
    const nextRound = session.roundNumber + 1;

    runSessionTransition(
      {
        mode: 'next-round',
        title: `PREPARING ROUND ${String(nextRound).padStart(2, '0')}`,
        subtitle: 'Cycling offline word deck & carrying over scores...',
        playerCount: session.playerCount,
        roundNumber: nextRound,
      },
      () => {
        const { session: nextRoundSession, updatedUsedIds } = createNewSession(
          { ...settings, playerCount: session.playerCount },
          usedWordIds,
          session.scores,
          nextRound,
        );
        setUsedWordIds(updatedUsedIds);
        saveUsedWordIds(updatedUsedIds);
        setSession(nextRoundSession);
        setScreen('REVEAL');
      },
    );
  }, [session, settings, usedWordIds, runSessionTransition]);

  const handleReturnHome = useCallback(() => {
    audioEngine.playTap();
    setExitModalOpen(false);
    setSession((prev) => (prev ? { ...prev, revealStep: 'PROMPT' } : null));
    setScreen('HOME');
  }, []);

  const handleRequestExit = useCallback(() => {
    audioEngine.playTap();
    setExitModalOpen(true);
  }, []);

  const handleCancelAndExitGame = useCallback(() => {
    audioEngine.playTap();
    setExitModalOpen(false);
    clearSessionStorage();
    setSession(null);
    setScreen('HOME');
  }, []);

  const handleResetCurrentGame = useCallback(() => {
    clearSessionStorage();
    setSession(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearAllLocalHistory();
    setSession(null);
    setUsedWordIds([]);
    setGameHistory([]);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#07070B] text-[#F8FAFC] relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.14),transparent_48%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.1),transparent_45%)]"
      />

      {!isOnline && (
        <div
          role="status"
          className="relative z-40 bg-indigo-950/85 border-b border-sky-400/25 px-4 pb-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-center text-xs text-sky-100 flex items-center justify-center gap-2"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0 text-sky-400" />
          <span>Offline Mode · Game &amp; 572 words available locally</span>
        </div>
      )}

      <div className="relative z-10">
        {loadingTransition ? (
          <GameLoadingScreen transition={loadingTransition} />
        ) : (
          <>
            {screen === 'HOME' && (
              <HomeScreen
                hasActiveSession={!!session}
                activeRound={session?.roundNumber ?? 1}
                activePlayerCount={session?.playerCount ?? settings.playerCount}
                historyCount={gameHistory.length}
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
                onHistory={() => {
                  audioEngine.playTap();
                  setScreen('HISTORY');
                }}
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
                onUpdateSettings={handleUpdateSettings}
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
                onRequestExit={handleRequestExit}
              />
            )}

            {screen === 'DISCUSSION' && session && (
              <DiscussionScreen
                roundNumber={session.roundNumber}
                playerCount={session.playerCount}
                timerDurationSeconds={settings.discussionTimerSeconds}
                onStartVoting={handleStartVoting}
                onRequestExit={handleRequestExit}
              />
            )}

            {screen === 'VOTING' && session && (
              <VotingScreen
                session={session}
                onConfirmVote={handleConfirmCollectiveVote}
                onBackToDiscussion={handleBackToDiscussion}
                onRequestExit={handleRequestExit}
              />
            )}

            {screen === 'PRE_REVEAL' &&
              session &&
              session.selectedSuspect !== null && (
                <PreRevealScreen
                  roundNumber={session.roundNumber}
                  selectedSuspect={session.selectedSuspect}
                  playerNames={session.playerNames}
                  onRevealResult={handleRevealResult}
                  onRequestExit={handleRequestExit}
                />
              )}

            {screen === 'RESULT' && session && session.outcome && (
              <ResultScreen
                outcome={session.outcome}
                leaderboard={getSortedLeaderboard(
                  session.scores,
                  session.playerCount,
                  session.playerNames,
                )}
                playerNames={session.playerNames}
                onPlayNextRound={handlePlayNextRound}
                onReturnHome={handleReturnHome}
                onViewHistory={() => {
                  audioEngine.playTap();
                  setScreen('HISTORY');
                }}
              />
            )}

            {screen === 'HISTORY' && (
              <HistoryScreen
                history={gameHistory}
                onClearHistory={handleClearHistory}
                onBack={() => {
                  audioEngine.playTap();
                  setScreen('HOME');
                }}
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
                historyCount={gameHistory.length}
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

            {session && (
              <ExitGameModal
                isOpen={exitModalOpen}
                roundNumber={session.roundNumber}
                onContinue={() => {
                  audioEngine.playTap();
                  setExitModalOpen(false);
                }}
                onSaveAndExit={handleReturnHome}
                onCancelGame={handleCancelAndExitGame}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
