// AppleAIModule.m
// Objective-C bridge for Swift module (if needed)
#import <ExpoModulesCore/ExpoModulesCore.h>
#import <Foundation/Foundation.h>

// This file is optional - Swift module can be used directly
// Only needed if you need Objective-C compatibility

@interface AppleAIModule : EXModuleBase
@end

@implementation AppleAIModule

EX_EXPORT_MODULE(AppleAI);

@end

