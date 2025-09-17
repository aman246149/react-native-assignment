import cricketEvents from './cricket_events.json';

export interface CricketEvent {
  type: 'BALL' | 'BOUNDARY' | 'WICKET' | 'MATCH_STATUS';
  payload: {
    runs?: number;
    commentary: string;
    playerOut?: string;
    dismissal?: string;
    status?: string;
    summary?: string;
  };
}

export interface MatchStats {
  totalRuns: number;
  totalWickets: number;
  totalBalls: number;
  currentOver: number;
  currentBall: number;
  isInningsBreak: boolean;
  currentStatus: string;
}

class CricketStreamService {
  private eventIndex: number = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private subscribers: ((event: CricketEvent) => void)[] = [];
  private statsSubscribers: ((stats: MatchStats) => void)[] = [];
  private matchStats: MatchStats = {
    totalRuns: 0,
    totalWickets: 0,
    totalBalls: 0,
    currentOver: 0,
    currentBall: 0,
    isInningsBreak: false,
    currentStatus: 'Live'
  };

  // Subscribe to cricket events
  subscribe(callback: (event: CricketEvent) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Subscribe to match stats updates
  subscribeToStats(callback: (stats: MatchStats) => void): () => void {
    this.statsSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.statsSubscribers = this.statsSubscribers.filter(sub => sub !== callback);
    };
  }

  // Start streaming events every 3 seconds
  startStream(): void {
    if (this.intervalId) {
      console.log('Stream already running');
      return;
    }

    console.log('Starting cricket event stream...');
    
    this.intervalId = setInterval(() => {
      if (this.eventIndex < cricketEvents.length) {
        const event = cricketEvents[this.eventIndex] as CricketEvent;
        
        // Update match stats based on event
        this.updateMatchStats(event);
        
        // Emit event to all subscribers
        this.subscribers.forEach(callback => {
          callback(event);
        });

        // Emit stats to all stats subscribers
        this.statsSubscribers.forEach(callback => {
          callback(this.matchStats);
        });
        
        console.log(`Event ${this.eventIndex + 1}/${cricketEvents.length}:`, event);
        this.eventIndex++;
      } else {
        // All events completed, restart from beginning
        console.log('All events completed, restarting stream...');
        this.eventIndex = 0;
        this.resetMatchStats();
      }
    }, 3000); // 3 seconds
  }

  // Update match statistics based on event
  private updateMatchStats(event: CricketEvent): void {
    // Validate event structure
    if (!event || !event.type) {
      console.warn('Invalid event structure received:', event);
      return;
    }

    const eventType = event.type.toUpperCase();
    
    switch (eventType) {
      case 'BALL':
        if (event.payload?.runs !== undefined) {
          this.matchStats.totalRuns += event.payload.runs;
          this.matchStats.totalBalls++;
          this.updateOver();
        }
        break;
      case 'BOUNDARY':
        if (event.payload?.runs !== undefined) {
          this.matchStats.totalRuns += event.payload.runs;
          this.matchStats.totalBalls++;
          this.updateOver();
        }
        break;
      case 'WICKET':
        this.matchStats.totalWickets++;
        this.matchStats.totalBalls++;
        this.updateOver();
        break;
      case 'MATCH_STATUS':
        if (event.payload?.status === 'Innings Break') {
          this.matchStats.isInningsBreak = true;
        }
        this.matchStats.currentStatus = event.payload?.status || 'Live';
        break;
      default:
        // Handle unknown event types gracefully
        console.warn(`Unknown event type received: ${event.type}. Event will be displayed but not processed for statistics.`);
        // Don't update stats for unknown events, but still emit them to UI
    }
  }

  // Update over and ball count
  private updateOver(): void {
    this.matchStats.currentBall = (this.matchStats.totalBalls % 6) + 1;
    this.matchStats.currentOver = Math.floor(this.matchStats.totalBalls / 6);
  }

  // Reset match stats
  private resetMatchStats(): void {
    this.matchStats = {
      totalRuns: 0,
      totalWickets: 0,
      totalBalls: 0,
      currentOver: 0,
      currentBall: 0,
      isInningsBreak: false,
      currentStatus: 'Live'
    };
  }

  // Stop the stream
  stopStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cricket event stream stopped');
    }
  }

  // Pause the stream
  pauseStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cricket event stream paused');
    }
  }

  // Resume the stream
  resumeStream(): void {
    if (!this.intervalId) {
      this.startStream();
    }
  }

  // Get current event index
  getCurrentIndex(): number {
    return this.eventIndex;
  }

  // Get total events count
  getTotalEvents(): number {
    return cricketEvents.length;
  }

  // Reset stream to beginning
  resetStream(): void {
    this.eventIndex = 0;
    this.resetMatchStats();
    console.log('Stream reset to beginning');
  }

  // Get all events
  getAllEvents(): CricketEvent[] {
    return cricketEvents as CricketEvent[];
  }

  // Get events by type
  getEventsByType(type: CricketEvent['type']): CricketEvent[] {
    return cricketEvents.filter(event => event.type === type) as CricketEvent[];
  }

  // Get current match stats
  getCurrentStats(): MatchStats {
    return { ...this.matchStats };
  }

  // Check if stream is running
  isStreaming(): boolean {
    return this.intervalId !== null;
  }
}

// Create singleton instance
const cricketStreamService = new CricketStreamService();

export default cricketStreamService;
