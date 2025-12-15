# Apple Foundation Kit AI Native Module

This directory should contain the native iOS module for Apple Foundation Kit AI integration.

## Setup Instructions

To enable Apple AI features, you need to create an Expo module that bridges to Apple's Core ML and Apple Intelligence APIs.

### 1. Create Expo Module Structure

Create the following structure:
```
src/native/
├── AppleAI/
│   ├── ios/
│   │   ├── AppleAI.swift (or .m)
│   │   └── AppleAIModule.swift
│   └── package.json
```

### 2. Native Module Implementation (Swift)

```swift
// AppleAIModule.swift
import ExpoModulesCore
import CoreML
import Foundation

public class AppleAIModule: Module {
    public func definition() -> ModuleDefinition {
        Name("AppleAI")
        
        AsyncFunction("generateWorkoutRecommendation") { (data: String) -> String in
            // Implement Core ML model inference
            // Parse workout data and generate recommendations
            return generateRecommendations(data: data)
        }
        
        AsyncFunction("analyzeWorkoutPattern") { (workouts: String) -> String in
            // Analyze workout patterns using Core ML
            return analyzePatterns(workouts: workouts)
        }
        
        AsyncFunction("predictOptimalRecovery") { (data: String) -> String in
            // Predict recovery time using Core ML
            return predictRecovery(data: data)
        }
        
        Function("isAvailable") { () -> Bool in
            // Check if Core ML is available on device
            return MLModelConfiguration().computeUnits != .cpuOnly
        }
    }
    
    private func generateRecommendations(data: String) -> String {
        // Core ML inference logic
        // Return JSON string with recommendations
        return "[]"
    }
    
    private func analyzePatterns(workouts: String) -> String {
        // Pattern analysis logic
        return "{}"
    }
    
    private func predictRecovery(data: String) -> String {
        // Recovery prediction logic
        return "{\"hours\": 24}"
    }
}
```

### 3. Install as Expo Module

Add to `app.json`:
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

### 4. Core ML Model

You'll need to:
1. Train or obtain a Core ML model for workout recommendations
2. Add the `.mlmodel` file to your iOS project
3. Load it in the native module

### 5. Apple Intelligence APIs (iOS 18+)

For iOS 18+, you can also use Apple Intelligence APIs:
- Use `AppIntents` framework for on-device AI
- Integrate with Siri Shortcuts
- Use `NaturalLanguage` framework for text analysis

## Fallback Behavior

The app will automatically fall back to rule-based recommendations if:
- Native module is not available
- Running in Expo Go
- Core ML is not available on device
- iOS version is below 18.0

## Testing

To test without native module:
- The app will use fallback recommendations
- All features work, just without AI enhancement

To test with native module:
- Build a development build: `eas build --profile development --platform ios`
- Install on physical device (Core ML requires device)
- Native module will be loaded automatically

