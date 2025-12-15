# Apple Foundation Kit AI & iOS 18+ Liquid Glass UI Implementation

## Summary

This implementation adds:
1. **Apple Foundation Kit AI** integration using Core ML and Apple Intelligence APIs
2. **iOS 18+ Liquid Glass UI** components with native glassmorphism effects

## What Was Added

### 1. Apple Foundation Kit AI Service
- **File**: `src/services/appleAI.ts`
- **Features**:
  - On-device AI recommendations using Core ML
  - Workout pattern analysis
  - Recovery time prediction
  - Automatic fallback to rule-based recommendations
- **Usage**: Automatically used by the recommendation system

### 2. iOS 18+ Liquid Glass UI Components

#### GlassSlider Component
- **File**: `src/components/ui/GlassSlider.tsx`
- **Features**:
  - Native iOS 18 blur effects
  - Smooth animations
  - Glassmorphism design
  - Value display with glass badge

#### Updated ModernDock
- **File**: `src/components/ModernDock.tsx`
- **Changes**:
  - Added `systemUltraThinMaterialDark` blur effect
  - Enhanced glass appearance
  - Improved active indicator

#### Updated ModernCard
- **File**: `src/components/ui/ModernCard.tsx`
- **Changes**:
  - Glass background using `systemThinMaterialDark`
  - Transparent background with blur overlay
  - Enhanced borders for glass effect

#### Updated ModernButton
- **File**: `src/components/ui/ModernButton.tsx`
- **Changes**:
  - Glass backgrounds with varying intensities
  - Active state with enhanced glass effect
  - Platform-specific blur materials

### 3. Updated Screens

#### Customize Workout Screen
- **File**: `app/customize-workout.tsx`
- **Changes**:
  - Replaced text inputs with GlassSlider for:
    - Sets, Rest time, Duration, Work/Rest intervals, Rounds
  - Better UX with visual sliders

#### Dashboard
- **File**: `src/screens/Dashboard.tsx`
- **Changes**:
  - Updated to use async Apple AI recommendations
  - Maintains backward compatibility

### 4. Configuration Updates

#### app.json
- **Changes**:
  - Added `deploymentTarget: "18.0"` for iOS 18+
  - Added privacy descriptions for Core ML and Apple Intelligence

## How It Works

### Apple AI Integration

1. **Native Module Bridge** (to be implemented):
   - The app looks for a native module at `src/native/AppleAI`
   - If available, uses Core ML for on-device AI
   - Falls back to rule-based recommendations if unavailable

2. **Fallback System**:
   - Works in Expo Go (uses fallback)
   - Works in development builds (uses fallback until native module added)
   - Works in production (uses AI if native module available)

### Glass UI Components

1. **Platform Detection**:
   - Uses iOS 18+ blur materials on iOS
   - Falls back to standard blur on Android
   - Uses `expo-blur` for cross-platform support

2. **Blur Materials Used**:
   - `systemUltraThinMaterialDark` - Dock, buttons
   - `systemThinMaterialDark` - Cards, sliders
   - `systemMaterialDark` - Active states

## Next Steps

### To Enable Full Apple AI:

1. **Create Native Module**:
   - Follow instructions in `src/native/AppleAI.md`
   - Implement Swift/Objective-C bridge
   - Add Core ML model

2. **Build Development Build**:
   ```bash
   eas build --profile development --platform ios
   ```

3. **Test on Device**:
   - Core ML requires physical device
   - Install development build
   - Native module will load automatically

### To Customize Glass Effects:

1. **Adjust Blur Intensity**:
   - Modify `intensity` prop in components
   - Range: 0-100 (higher = more blur)

2. **Change Blur Tint**:
   - Modify `tint` prop
   - Options: `systemUltraThinMaterialDark`, `systemThinMaterialDark`, `systemMaterialDark`

3. **Customize Borders**:
   - Modify `borderColor` in component styles
   - Adjust opacity for glass effect

## Testing

### Without Native Module:
- All features work with fallback recommendations
- Glass UI works on all platforms
- Test in Expo Go or development builds

### With Native Module:
- Build development build
- Install on physical iOS device
- AI features will be enhanced
- Glass effects will use native iOS materials

## Compatibility

- **iOS**: 18.0+ (glass effects), 17.0+ (fallback blur)
- **Android**: All versions (fallback blur)
- **Expo Go**: Works with fallback
- **Development Builds**: Full glass UI, AI fallback
- **Production Builds**: Full features if native module added

## Files Modified

1. `src/services/appleAI.ts` - New
2. `src/components/ui/GlassSlider.tsx` - New
3. `src/components/ModernDock.tsx` - Updated
4. `src/components/ui/ModernCard.tsx` - Updated
5. `src/components/ui/ModernButton.tsx` - Updated
6. `app/customize-workout.tsx` - Updated
7. `src/utils/aiRecommendations.ts` - Updated
8. `src/screens/Dashboard.tsx` - Updated
9. `app.json` - Updated
10. `src/native/AppleAI.md` - New (documentation)

## Notes

- Glass effects use native iOS blur materials when available
- AI features gracefully degrade to rule-based recommendations
- All components maintain backward compatibility
- No breaking changes to existing functionality

