# Apple AI Expo Module

Native module for integrating Apple Intelligence APIs (iOS 18+) with Expo.

## Features

- **Workout Recommendations**: AI-powered recommendations using Core ML and Natural Language Processing
- **Pattern Analysis**: Analyze workout patterns and trends
- **Recovery Prediction**: Predict optimal recovery time between workouts
- **Apple Intelligence Integration**: Uses iOS 18+ Apple Intelligence APIs when available

## Installation

### 1. Add to app.json

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "./src/native/AppleAI"
    ]
  }
}
```

### 2. Build Native Module

The module will be automatically included when you build a development or production build:

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

### 3. Requirements

- iOS 18.0+
- Physical device (Core ML requires device, not simulator)
- Xcode 16.0+

## Usage

The module is automatically used by `src/services/appleAI.ts`. No additional setup needed.

## API

### `generateWorkoutRecommendation(data: string): Promise<string>`

Generates AI-powered workout recommendations.

**Parameters:**
- `data`: JSON string containing workout data, personal records, current week, and streak

**Returns:** JSON string with array of recommendations

### `analyzeWorkoutPattern(workouts: string): Promise<string>`

Analyzes workout patterns and trends.

**Parameters:**
- `workouts`: JSON string containing array of workouts

**Returns:** JSON string with trend analysis, insights, and suggestions

### `predictOptimalRecovery(data: string): Promise<string>`

Predicts optimal recovery time.

**Parameters:**
- `data`: JSON string containing recent workouts and last workout data

**Returns:** JSON string with recovery hours, confidence, and factors

### `isAvailable(): boolean`

Checks if Apple Intelligence is available on the device.

**Returns:** `true` if available, `false` otherwise

## Implementation Details

### Natural Language Processing

Uses iOS `NaturalLanguage` framework for:
- Sentiment analysis
- Keyword extraction
- Text pattern recognition

### Core ML Integration

The module supports Core ML models for enhanced recommendations:
1. Place `.mlmodel` or `.mlmodelc` files in the iOS bundle
2. Update `loadRecommendationModel()` to load your model
3. The module will automatically use the model if available

### Apple Intelligence APIs

On iOS 18+, the module uses:
- `AppIntents` framework for on-device AI
- `NaturalLanguage` for text analysis
- `CoreML` for machine learning inference

## Fallback Behavior

If the native module is unavailable:
- The TypeScript service (`src/services/appleAI.ts`) automatically falls back to rule-based recommendations
- All features continue to work
- No breaking changes

## Testing

### Without Native Module
- Works in Expo Go
- Uses fallback recommendations
- All UI features work

### With Native Module
1. Build development build: `eas build --profile development --platform ios`
2. Install on physical iOS device
3. Module loads automatically
4. AI features are enhanced

## Troubleshooting

### Module not loading
- Ensure you've built a development/production build (not Expo Go)
- Check that iOS deployment target is 18.0+
- Verify module is in `app.json` plugins

### Core ML not working
- Requires physical device (not simulator)
- Check device supports Core ML (iPhone 8+)
- Verify model files are in bundle

### Apple Intelligence not available
- Requires iOS 18.0+
- Requires compatible device
- Falls back gracefully if unavailable

