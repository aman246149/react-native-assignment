import { useCallback, useEffect, useState } from 'react';
import cricketStreamService, { CricketEvent, MatchStats } from './cricketStream';

export interface UseCricketStreamReturn {
  currentEvent: CricketEvent | null;
  matchStats: MatchStats;
  isStreaming: boolean;
  eventIndex: number;
  totalEvents: number;
  allEvents: CricketEvent[];
  startStream: () => void;
  stopStream: () => void;
  pauseStream: () => void;
  resumeStream: () => void;
  resetStream: () => void;
  getEventsByType: (type: CricketEvent['type']) => CricketEvent[];
}

export const useCricketStream = (): UseCricketStreamReturn => {
  const [currentEvent, setCurrentEvent] = useState<CricketEvent | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats>(cricketStreamService.getCurrentStats());
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);

  // Subscribe to cricket events
  useEffect(() => {
    const unsubscribe = cricketStreamService.subscribe((event: CricketEvent) => {
      setCurrentEvent(event);
      setEventIndex(cricketStreamService.getCurrentIndex());
    });

    return unsubscribe;
  }, []);

  // Subscribe to match stats updates
  useEffect(() => {
    const unsubscribe = cricketStreamService.subscribeToStats((stats: MatchStats) => {
      setMatchStats(stats);
    });

    return unsubscribe;
  }, []);

  // Stream control functions
  const startStream = useCallback(() => {
    cricketStreamService.startStream();
    setIsStreaming(true);
  }, []);

  const stopStream = useCallback(() => {
    cricketStreamService.stopStream();
    setIsStreaming(false);
  }, []);

  const pauseStream = useCallback(() => {
    cricketStreamService.pauseStream();
    setIsStreaming(false);
  }, []);

  const resumeStream = useCallback(() => {
    cricketStreamService.resumeStream();
    setIsStreaming(true);
  }, []);

  const resetStream = useCallback(() => {
    cricketStreamService.resetStream();
    setEventIndex(0);
    setCurrentEvent(null);
    setMatchStats(cricketStreamService.getCurrentStats());
  }, []);

  const getEventsByType = useCallback((type: CricketEvent['type']) => {
    return cricketStreamService.getEventsByType(type);
  }, []);

  return {
    currentEvent,
    matchStats,
    isStreaming,
    eventIndex,
    totalEvents: cricketStreamService.getTotalEvents(),
    allEvents: cricketStreamService.getAllEvents(),
    startStream,
    stopStream,
    pauseStream,
    resumeStream,
    resetStream,
    getEventsByType,
  };
};
