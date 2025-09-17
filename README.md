# 🏏 Real-Time Cricket Commentary Feed

A React Native application that displays a dynamic feed of events for a live T20 cricket match. The app consumes a real-time data stream and renders an engaging "commentary" or "play-by-play" feed with intelligent UI that reacts differently to various types of match events.

## 📱 App Video

https://github.com/user-attachments/assets/9beea250-76dd-4fcf-9ac9-6330f47c07b0

## 🎯 Project Overview

This project demonstrates React Native development skills including:
- **Real-time data streaming** with event-driven architecture
- **Intelligent UI design** that emphasizes different event types
- **Score aggregation** from individual events
- **Robust error handling** for unknown event types
- **Professional animations** and visual feedback
- **TypeScript** for type safety

## 🏗️ Folder Structure

```
my-app/
├── app/                           # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout with Stack navigator
│   ├── index.tsx                 # Main screen entry point
│   ├── ui/
│   │   └── home_screen.tsx       # Main cricket commentary UI
│   └── data/
│       ├── cricket_events.json   # Mock cricket events data (35+ events)
│       ├── cricketStream.ts      # Core streaming service
│       └── useCricketStream.ts   # React hook for stream management
├── components/                    # Reusable UI components
├── constants/                     # App constants and themes
├── hooks/                        # Custom React hooks
├── assets/                       # Images and static assets
├── package.json                  # Dependencies and scripts
└── app.json                      # Expo configuration
```

## 🎮 Event Types & Handling

### **Supported Event Types:**

#### 1. **BALL Events**
```json
{
  "type": "BALL",
  "payload": {
    "runs": 1,
    "commentary": "Pushed to mid-on for a quick single."
  }
}
```
- **Visual**: Green solid border, ⚾ icon
- **Animation**: None
- **Score Impact**: Adds runs to total, increments ball count

#### 2. **BOUNDARY Events**
```json
{
  "type": "BOUNDARY",
  "payload": {
    "runs": 4,
    "commentary": "Classic cover drive, races to the boundary!"
  }
}
```
- **Visual**: Orange solid border, 🏏 icon
- **Animation**: Pulse effect (if newest event)
- **Score Impact**: Adds runs to total, increments ball count

#### 3. **WICKET Events**
```json
{
  "type": "WICKET",
  "payload": {
    "playerOut": "R. Sharma",
    "dismissal": "LBW",
    "commentary": "Big appeal... and he's out!"
  }
}
```
- **Visual**: Red solid border, 🎯 icon
- **Animation**: Pulse effect (if newest event)
- **Score Impact**: Increments wicket count, increments ball count
- **Special UI**: Red wicket info box with player details

#### 4. **MATCH_STATUS Events**
```json
{
  "type": "MATCH_STATUS",
  "payload": {
    "status": "Innings Break",
    "summary": "Team A finishes on 175/7."
  }
}
```
- **Visual**: Blue solid border, 📊 icon
- **Animation**: None
- **Score Impact**: Updates match status, triggers context changes
- **Special UI**: Blue status info box, changes screen context

### **Unknown Event Handling:**

The app gracefully handles unknown or invalid event types:

```json
// These are handled gracefully:
{ "type": null, "payload": {...} }
{ "type": undefined, "payload": {...} }
{ "type": "UNKNOWN_TYPE", "payload": {...} }
{ "type": "ball", "payload": {...} }  // Case insensitive
```

**User Experience:**
- Shows as **"UPDATE"** with 📝 icon
- Gray color (subtle, not alarming)
- Normal solid border
- All commentary still displays
- No scary warnings for users

**Developer Benefits:**
- Console warnings for debugging
- Statistics protection (unknown events don't affect scores)
- Robust error handling
- Future-proof for new event types

## 🔄 Real-Time Streaming Architecture

### **Stream Service (`cricketStream.ts`)**
- **Event Emission**: Every 3 seconds
- **Subscriber Pattern**: Multiple components can subscribe
- **Statistics Aggregation**: Calculates runs, wickets, overs from events
- **Error Resilience**: Handles unknown events gracefully
- **Auto-restart**: Cycles through all events continuously

### **React Hook (`useCricketStream.ts`)**
- **State Management**: Current event, match stats, streaming status
- **Event History**: Maintains list of all events
- **Control Functions**: Start, stop, pause, resume, reset
- **Real-time Updates**: Automatic UI updates on new events

## 🎨 UI Features

### **Visual Emphasis System:**
- **WICKET & BOUNDARY**: Pulse animations, "⚡ LIVE ⚡" indicators
- **Color Coding**: Green (BALL), Orange (BOUNDARY), Red (WICKET), Blue (MATCH_STATUS)
- **Event History**: Scrollable list with newest events at top
- **Timestamps**: Each event shows when it occurred

### **Match Statistics:**
- **Live Score**: `runs/wickets` format
- **Over Tracking**: `currentOver.currentBall` format
- **Status Updates**: Live, Innings Break, etc.
- **Context Changes**: Screen styling changes for different match phases

### **Stream Controls:**
- **Start Stream**: Begin event emission
- **Stop Stream**: End event emission
- **Pause/Resume**: Temporary stream control
- **Reset**: Clear history and restart from beginning

## 🚀 Getting Started

### **Prerequisites:**
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### **Installation:**
```bash
# Clone the repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

### **Running the App:**
```bash
# Start with specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Or use the interactive menu
npx expo start
# Then press 'i' for iOS, 'a' for Android, 'w' for web
```

## 🧪 Testing the App

1. **Start the Stream**: Click "▶️ Start Stream" button
2. **Watch Events**: Events appear every 3 seconds with different visual treatments
3. **Observe Animations**: WICKET and BOUNDARY events pulse and show "LIVE" indicators
4. **Check Statistics**: Score updates in real-time based on events
5. **Test Controls**: Use pause, resume, stop, and reset buttons
6. **Scroll History**: View all previous events in the scrollable list

## 🛠️ Technical Implementation

### **Key Technologies:**
- **React Native** with Expo Router
- **TypeScript** for type safety
- **React Hooks** for state management
- **Animated API** for smooth animations
- **FlatList** for performant event rendering

### **Architecture Patterns:**
- **Service Layer**: Centralized stream management
- **Hook Pattern**: Reusable state logic
- **Subscriber Pattern**: Event-driven updates
- **Error Boundaries**: Graceful error handling

### **Performance Optimizations:**
- **FlatList**: Efficient rendering of event history
- **Native Driver**: Hardware-accelerated animations
- **Memoization**: Optimized re-renders
- **Event Batching**: Efficient state updates

## 🎯 Assignment Requirements Met

### **✅ Different Event Types with Visual Emphasis:**
- WICKET events get red color + pulse animation + "IMPORTANT EVENT" indicator
- BOUNDARY events get orange color + pulse animation
- MATCH_STATUS events get blue color + special context styling
- BALL events get green color + standard styling

### **✅ Unknown Event Type Handling:**
- Graceful fallback for unknown event types
- Console warnings for debugging
- Generic display for unrecognized events
- App never crashes from unknown events

### **✅ Score Aggregation:**
- Total runs calculated from all BALL and BOUNDARY events
- Total wickets counted from WICKET events
- Over calculation (6 balls = 1 over)
- Real-time updates as events stream

### **✅ Match Status Context Changes:**
- Innings Break detection changes entire screen styling
- Status updates affect match statistics display
- Visual indicators for different match phases

## 📝 Development Notes

- **Event Data**: 35+ realistic cricket events in `cricket_events.json`
- **Streaming**: Events emit every 3 seconds for demo purposes
- **Error Handling**: Comprehensive validation and fallbacks
- **UI/UX**: Professional design with smooth animations
- **Scalability**: Easy to add new event types and features

## 🤝 Contributing

This project demonstrates React Native development skills and serves as a portfolio piece showcasing:
- Real-time data handling
- Intelligent UI design
- Robust error handling
- Professional code organization
- TypeScript best practices

