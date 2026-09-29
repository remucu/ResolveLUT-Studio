import { useState, useRef, useCallback, useEffect } from 'react';
import { GradingState } from '../types/lut';

const MAX_HISTORY_STEPS = 50;
const DEBOUNCE_TIME_MS = 600;

export interface HistoryItem {
  state: GradingState;
  actionName: string;
  timestamp: number;
}

export function useGradingHistory(initialState: GradingState) {
  const [present, setPresent] = useState<GradingState>(initialState);
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  // Refs to avoid stale closures in listeners and timers
  const presentRef = useRef<GradingState>(initialState);
  presentRef.current = present;

  const lastPushTimeRef = useRef<number>(0);
  const lastActionNameRef = useRef<string>('Inițializare');

  // Push new state with automatic batching for smooth continuous sliders
  const pushState = useCallback((
    newStateOrUpdater: GradingState | ((prev: GradingState) => GradingState),
    actionName = 'Modificare Valoare',
    forceNewEntry = false
  ) => {
    const now = Date.now();
    const currentState = presentRef.current;
    const computedNewState = typeof newStateOrUpdater === 'function'
      ? newStateOrUpdater(currentState)
      : newStateOrUpdater;

    // Fast reference check or shallow change check
    if (computedNewState === currentState) return;

    const timeSinceLastPush = now - lastPushTimeRef.current;
    const shouldCreateNewEntry = forceNewEntry || timeSinceLastPush > DEBOUNCE_TIME_MS || actionName !== lastActionNameRef.current;

    if (shouldCreateNewEntry) {
      setPast((prevPast) => {
        const nextPast = [
          ...prevPast,
          {
            state: currentState,
            actionName: lastActionNameRef.current,
            timestamp: now,
          },
        ];
        if (nextPast.length > MAX_HISTORY_STEPS) {
          return nextPast.slice(nextPast.length - MAX_HISTORY_STEPS);
        }
        return nextPast;
      });
      // Clear redo stack on any new edit
      setFuture([]);
      lastPushTimeRef.current = now;
      lastActionNameRef.current = actionName;
    }

    setPresent(computedNewState);
  }, []);

  // Update partial grading state
  const updateGradingState = useCallback((
    patch: Partial<GradingState>,
    actionName = 'Ajustare Parametru',
    forceNewEntry = false
  ) => {
    pushState(
      (prev) => ({ ...prev, ...patch }),
      actionName,
      forceNewEntry
    );
  }, [pushState]);

  // Undo action
  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previousItem = prevPast[prevPast.length - 1];
      const remainingPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [
        {
          state: presentRef.current,
          actionName: lastActionNameRef.current,
          timestamp: Date.now(),
        },
        ...prevFuture,
      ]);

      setPresent(previousItem.state);
      presentRef.current = previousItem.state;
      lastActionNameRef.current = previousItem.actionName;
      lastPushTimeRef.current = 0; // reset debounce

      return remainingPast;
    });
  }, []);

  // Redo action
  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const nextItem = prevFuture[0];
      const remainingFuture = prevFuture.slice(1);

      setPast((prevPast) => [
        ...prevPast,
        {
          state: presentRef.current,
          actionName: lastActionNameRef.current,
          timestamp: Date.now(),
        },
      ]);

      setPresent(nextItem.state);
      presentRef.current = nextItem.state;
      lastActionNameRef.current = nextItem.actionName;
      lastPushTimeRef.current = 0; // reset debounce

      return remainingFuture;
    });
  }, []);

  // Reset entire history (e.g. when loading new project)
  const resetHistory = useCallback((newState: GradingState, actionName = 'Resetare Completă') => {
    setPast([]);
    setFuture([]);
    setPresent(newState);
    presentRef.current = newState;
    lastPushTimeRef.current = 0;
    lastActionNameRef.current = actionName;
  }, []);

  // Keyboard shortcut listener (Ctrl+Z, Cmd+Z, Ctrl+Y, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing text in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        (target as HTMLInputElement).type !== 'range'
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z / Cmd+Shift+Z
      else if (
        e.key.toLowerCase() === 'y' ||
        (e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: present,
    setState: pushState,
    updateGradingState,
    undo,
    redo,
    resetHistory,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoCount: past.length,
    redoCount: future.length,
    lastActionName: lastActionNameRef.current,
  };
}
