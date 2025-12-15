# Apple AI Native Module Setup Guide

Complete guide for setting up and using the Apple Intelligence API integration.

## 📁 File Structure

```
src/native/AppleAI/
├── package.json                    # Module package definition
├── index.ts                        # Module entry point
├── AppleAIModule.ts                # TypeScript module wrapper
├── AppleAIModule.types.ts          # TypeScript type definitions
├── expo-module.config.json         # Expo module configuration
├── tsconfig.json                   # TypeScript config
├── README.md                       # Module documentation
└── ios/
    ├── AppleAIModule.swift         # Main Swift implementation
    ├── AppleAIModule.m             # Objective-C bridge (optional)
    ├── AppleAIModule-Bridging-Header.h  # Bridging header
    └── Podfile                     # CocoaPods config
```

## 🚀 Quick Start

### 1. Module is Already Configured

The module is already added to `app.json`:
```json
{
  "plugins": [
    "expo-router",
    "./src/native/AppleAI"
  ]
}
```

### 2. Build the App

The native module will be automatically included when you build:

```bash
# Development build (for testing)
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

### 3. Test on Device

- **Requires physical iOS device** (Core ML doesn't work in simulator)
- **Requires iOS 18.0+**
- Install the build and the module will load automatically

## 🔧 How It Works

### Architecture

```
TypeScript (React Native)
    ↓
src/services/appleAI.ts
    ↓
src/native/AppleAI/AppleAIModule.ts
    ↓
Native Bridge
    ↓
AppleAIModule.swift (iOS)
    ↓
Apple Intelligence APIs
    - Core ML
    - Natural Language
    - App Intents
```

### Features

1. **Workout Recommendations**
   - Uses Natural Language Processing to analyze workout patterns
   - Generates personalized recommendations
   - Can be enhanced with Core ML models

2. **Pattern Analysis**
   - Analyzes workout trends (improving/stable/declining)
   - Provides insights and suggestions
   - Uses statistical analysis and NLP

3. **Recovery Prediction**
   - Calculates optimal recovery time
   - Considers intensity, frequency, and volume
   - Returns hours with confidence score

## 📱 API Reference

### TypeScript API

The module is automatically used by `src/services/appleAI.ts`:

```typescript
import { generateAIRecommendations } from '../services/appleAI';

const recommendations = await generateAIRecommendations(
  workouts,
  personalRecords,
  currentWeek,
  streak
);
```

### Native Module API

Direct access (if needed):

```typescript
import AppleAIModule from '../native/AppleAI';

// Check availability
const isAvailable = AppleAIModule.isAvailable();

// Generate recommendations
const recommendations = await AppleAIModule.generateWorkoutRecommendation(
  JSON.stringify(workoutData)
);

// Analyze patterns
const analysis = await AppleAIModule.analyzeWorkoutPattern(
  JSON.stringify(workouts)
);

// Predict recovery
const recovery = await AppleAIModule.predictOptimalRecovery(
  JSON.stringify(recoveryData)
);
```

## 🎯 Adding Core ML Models (Optional)

To enhance recommendations with custom Core ML models:

### 1. Prepare Your Model

- Train or obtain a `.mlmodel` file
- Convert to `.mlmodelc` (compiled) for better performance
- Place in `src/native/AppleAI/ios/` directory

### 2. Update Swift Code

Edit `src/native/AppleAI/ios/AppleAIModule.swift`:

```swift
private func loadRecommendationModel() {
    guard let modelURL = Bundle.main.url(
        forResource: "WorkoutRecommendation",
        withExtension: "mlmodelc"
    ) else {
        print("Model not found, using fallback")
        return
    }
    
    do {
        recommendationModel = try MLModel(contentsOf: modelURL)
        print("Recommendation model loaded successfully")
    } catch {
        print("Failed to load model: \(error)")
    }
}
```

### 3. Use Model in Predictions

Update `enhanceWithCoreML` method to use your model:

```swift
private func enhanceWithCoreML(
    recommendations: [[String: Any]],
    model: MLModel,
    workoutData: [String: Any]
) async -> [[String: Any]] {
    // Create input features from workoutData
    // Run model prediction
    // Enhance recommendations with model output
    return recommendations
}
```

## 🔍 Debugging

### Check if Module is Loaded

Add logging in `src/services/appleAI.ts`:

```typescript
console.log('Apple AI Available:', isAppleAIAvailable());
```

### Check Native Module

In Xcode console or device logs, look for:
- "Recommendation model loaded successfully"
- "Apple Intelligence available: true"

### Common Issues

1. **Module not loading**
   - Ensure you built a development/production build (not Expo Go)
   - Check `app.json` has the plugin
   - Verify iOS deployment target is 18.0+

2. **Core ML not working**
   - Requires physical device
   - Check device supports Core ML (iPhone 8+)
   - Verify model files are in bundle

3. **Apple Intelligence unavailable**
   - Requires iOS 18.0+
   - Requires compatible device
   - Falls back gracefully

## 📊 Data Formats

### Workout Recommendation Input

```json
{
  "workouts": [
    {
      "date": "2024-01-15T10:00:00Z",
      "exercises": [
        {
          "exerciseId": "pushup",
          "repsCompleted": [10, 12, 10],
          "sets": 3
        }
      ]
    }
  ],
  "personalRecords": [
    {
      "exerciseId": "pushup",
      "exerciseName": "Push-ups",
      "value": 15,
      "date": "2024-01-10T10:00:00Z"
    }
  ],
  "currentWeek": 2,
  "streak": {
    "current": 5,
    "longest": 7
  }
}
```

### Recommendation Output

```json
[
  {
    "id": "progressive-pushup",
    "type": "progressive_overload",
    "title": "Time to Progress",
    "message": "You've been doing the same reps for 3 workouts...",
    "priority": "medium",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

## 🛡️ Fallback Behavior

The module gracefully falls back if:
- Native module not available (Expo Go, etc.)
- iOS version < 18.0
- Core ML not available
- Model files missing

Fallback uses rule-based recommendations that work identically to the AI version, just without ML enhancement.

## 📝 Next Steps

1. **Build and Test**: Create a development build and test on device
2. **Add Models** (optional): Train and add Core ML models for enhanced predictions
3. **Customize**: Modify Swift code to add custom analysis logic
4. **Monitor**: Check logs to ensure module is working correctly

## 🔗 Resources

- [Apple Intelligence Documentation](https://developer.apple.com/apple-intelligence/)
- [Core ML Documentation](https://developer.apple.com/documentation/coreml)
- [Natural Language Framework](https://developer.apple.com/documentation/naturallanguage)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)

