import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useCricketStream } from '../data/useCricketStream';

export default function HomeScreen() {
  const {
    currentEvent,
    matchStats,
    isStreaming,
    eventIndex,
    totalEvents,
    startStream,
    stopStream,
    pauseStream,
    resumeStream,
    resetStream,
  } = useCricketStream();

  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Handle new events and add to history
  useEffect(() => {
    if (currentEvent) {
      // Add new event to the top of history
      const newEvent = {
        ...currentEvent,
        id: Date.now() + Math.random(), // Unique ID for FlatList
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setEventHistory(prev => [newEvent, ...prev]);

      // Pulse animation for important events
      if (currentEvent.type === 'WICKET' || currentEvent.type === 'BOUNDARY') {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [currentEvent]);

  const getEventColor = (type: string) => {
    // Handle undefined/null types
    if (!type || typeof type !== 'string') {
      console.warn('Invalid event type received:', type);
      return '#9E9E9E'; // Gray for unknown
    }
    
    switch (type.toUpperCase()) {
      case 'BALL': return '#4CAF50';
      case 'BOUNDARY': return '#FF9800';
      case 'WICKET': return '#F44336';
      case 'MATCH_STATUS': return '#2196F3';
      default: 
        console.warn('Unknown event type:', type);
        return '#9E9E9E'; // Gray for unknown types
    }
  };

  const getEventIcon = (type: string) => {
    // Handle undefined/null types
    if (!type || typeof type !== 'string') {
      return '❓'; // Question mark for invalid
    }
    
    switch (type.toUpperCase()) {
      case 'BALL': return '⚾';
      case 'BOUNDARY': return '🏏';
      case 'WICKET': return '🎯';
      case 'MATCH_STATUS': return '📊';
      default: 
        console.warn('Unknown event type for icon:', type);
        return '📝'; // Generic note icon
    }
  };

  const getEventEmphasis = (type: string) => {
    // Handle undefined/null types
    if (!type || typeof type !== 'string') {
      return 'LOW';
    }
    
    switch (type.toUpperCase()) {
      case 'WICKET': return 'HIGH';
      case 'BOUNDARY': return 'MEDIUM';
      case 'MATCH_STATUS': return 'HIGH';
      default: return 'LOW';
    }
  };

  const handleUnknownEvent = (event: any) => {
    console.warn('Unknown event type received:', event);
    Alert.alert(
      'Unknown Event',
      `Received unknown event type: ${event.type || 'undefined'}. This event will be displayed as a generic event.`,
      [{ text: 'OK' }]
    );
  };

  const handleReset = () => {
    resetStream();
    setEventHistory([]);
  };

  const renderEventCard = ({ item, index }: { item: any; index: number }) => {
    const isNewEvent = index === 0; // First item is the newest
    const emphasis = getEventEmphasis(item.type);
    const isUnknownType = !item.type || typeof item.type !== 'string' || 
      !['BALL', 'BOUNDARY', 'WICKET', 'MATCH_STATUS'].includes(item.type.toUpperCase());
    
    return (
      <Animated.View 
        style={[
          styles.eventCard, 
          { 
            borderColor: getEventColor(item.type),
            transform: [
              { scale: isNewEvent && emphasis === 'HIGH' ? pulseAnim : 1 }
            ]
          }
        ]}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventIcon}>
            {getEventIcon(item.type)}
          </Text>
          <Text style={[styles.eventType, { color: getEventColor(item.type) }]}>
            {item.type || 'UPDATE'}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        {/* Unknown events display normally without any warning */}
        
        {item.payload.runs !== undefined && (
          <Text style={styles.runsText}>
            {item.payload.runs} {item.payload.runs === 1 ? 'run' : 'runs'}
          </Text>
        )}
        
        <Text style={[
          styles.commentary,
          emphasis === 'HIGH' && styles.highEmphasisCommentary
        ]}>
          {item.payload.commentary}
        </Text>
        
        {item.payload.playerOut && (
          <View style={styles.wicketInfo}>
            <Text style={styles.wicketText}>
              🎯 {item.payload.playerOut} ({item.payload.dismissal})
            </Text>
          </View>
        )}
        
        {item.payload.status && (
          <View style={styles.matchStatusInfo}>
            <Text style={styles.matchStatusText}>
              📊 {item.payload.status}
            </Text>
            <Text style={styles.matchSummaryText}>
              {item.payload.summary}
            </Text>
          </View>
        )}

        {emphasis === 'HIGH' && isNewEvent && (
          <View style={styles.emphasisIndicator}>
            <Text style={styles.emphasisText}>⚡ LIVE ⚡</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏏 Live Cricket Commentary</Text>
        <Text style={styles.subtitle}>Real-time match updates</Text>
      </View>

      {/* Match Stats */}
      <View style={[styles.statsContainer, matchStats.isInningsBreak && styles.inningsBreakContainer]}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>
            {matchStats.totalRuns}/{matchStats.totalWickets}
          </Text>
          <Text style={styles.overText}>
            ({matchStats.currentOver}.{matchStats.currentBall})
          </Text>
        </View>
        <Text style={styles.statusText}>
          {matchStats.currentStatus}
        </Text>
        {matchStats.isInningsBreak && (
          <Text style={styles.breakText}>🏁 Innings Break</Text>
        )}
      </View>

      {/* Stream Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.startButton]} 
          onPress={startStream}
          disabled={isStreaming}
        >
          <Text style={styles.buttonText}>▶️ Start Stream</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.stopButton]} 
          onPress={stopStream}
          disabled={!isStreaming}
        >
          <Text style={styles.buttonText}>⏹️ Stop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.pauseButton]} 
          onPress={isStreaming ? pauseStream : resumeStream}
        >
          <Text style={styles.buttonText}>
            {isStreaming ? '⏸️ Pause' : '▶️ Resume'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Stream Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isStreaming ? '🟢 Live' : '🔴 Stopped'}
        </Text>
        <Text style={styles.statusText}>
          Event: {eventIndex + 1} / {totalEvents}
        </Text>
      </View>

      {/* Live Commentary Feed */}
      <View style={styles.feedContainer}>
        <Text style={styles.feedTitle}>📢 Live Commentary Feed</Text>
        <Text style={styles.feedSubtitle}>
          {eventHistory.length} events • Latest at top
        </Text>
        
        <FlatList
          data={eventHistory}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id.toString()}
          style={styles.eventList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                🏏 No events yet. Start the stream to see live commentary!
              </Text>
            </View>
          }
        />
      </View>

      {/* Instructions - Only show when stream is not running */}
      {!isStreaming && eventHistory.length === 0 && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionText}>• Click "Start Stream" to begin live commentary</Text>
          <Text style={styles.instructionText}>• Events stream every 3 seconds automatically</Text>
          <Text style={styles.instructionText}>• WICKET and BOUNDARY events are emphasized</Text>
          <Text style={styles.instructionText}>• MATCH_STATUS events change screen context</Text>
          <Text style={styles.instructionText}>• Score is calculated from all events</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inningsBreakContainer: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  overText: {
    fontSize: 18,
    color: '#666',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  breakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    gap: 10,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resetButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  feedContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  feedSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  eventList: {
    flex: 1,
    maxHeight: 400,
  },
  eventCard: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  eventType: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  runsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commentary: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  highEmphasisCommentary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  wicketInfo: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  wicketText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    textAlign: 'center',
  },
  matchStatusInfo: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  matchStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  matchSummaryText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 5,
  },
  emphasisIndicator: {
    backgroundColor: '#FFF9C4',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  emphasisText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
