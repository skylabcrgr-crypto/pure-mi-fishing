#!/bin/sh
# Xcode Cloud pre-build script
# Runs before every Xcode Cloud build to install JS deps, patch node_modules for
# Xcode 26 / macOS BSD compatibility, and generate the ios/ native project.

set -e

echo "=== CI: Installing Node via Homebrew ==="
brew install node || true
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
node --version
npm --version

echo "=== CI: Installing CocoaPods ==="
brew install cocoapods || true
pod --version

echo "=== CI: npm install ==="
# CI_PRIMARY_REPOSITORY_PATH is set by Xcode Cloud to the repo root
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile"
npm install --legacy-peer-deps

echo "=== CI: Patching node_modules for Xcode 26 / macOS BSD compatibility ==="

# ── 1. expo/ios/AppDelegates/ExpoReactNativeFactory.h ──────────────────────────
# Guard RCTHostDelegate conformance behind __cplusplus (C++-only header)
python3 - << 'PYEOF'
import re, os

f = "node_modules/expo/ios/AppDelegates/ExpoReactNativeFactory.h"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
old = """@protocol RCTHostDelegate;
@protocol RCTHostRuntimeDelegate;

NS_SWIFT_NAME(ExpoReactNativeFactoryObjC)
#if !TARGET_OS_OSX
@interface EXReactNativeFactory : RCTReactNativeFactory <RCTHostDelegate>
#else
// TODO: remove when bumping to react-native-macos 0.85
@interface EXReactNativeFactory : RCTReactNativeFactory <RCTHostDelegate, RCTHostRuntimeDelegate>
#endif"""
new = """// RCTHost.h pulls in C++ headers; only forward-declare and conform in C++ mode
#if defined(__cplusplus)
@protocol RCTHostDelegate;
@protocol RCTHostRuntimeDelegate;
#endif

NS_SWIFT_NAME(ExpoReactNativeFactoryObjC)
#if !TARGET_OS_OSX
#if defined(__cplusplus)
@interface EXReactNativeFactory : RCTReactNativeFactory <RCTHostDelegate>
#else
@interface EXReactNativeFactory : RCTReactNativeFactory
#endif
#else
#if defined(__cplusplus)
@interface EXReactNativeFactory : RCTReactNativeFactory <RCTHostDelegate, RCTHostRuntimeDelegate>
#else
@interface EXReactNativeFactory : RCTReactNativeFactory
#endif
#endif"""
if old in src:
    with open(f, "w") as fh:
        fh.write(src.replace(old, new))
    print(f"PATCHED: {f}")
elif new in src:
    print(f"already patched: {f}")
else:
    print(f"WARNING: unexpected content in {f}")
PYEOF

# ── 2. expo/ios/AppDelegates/ExpoReactNativeFactory.mm ─────────────────────────
# Add required hostDidStart: method for iOS (RCTHostDelegate conformance)
python3 - << 'PYEOF'
import os

f = "node_modules/expo/ios/AppDelegates/ExpoReactNativeFactory.mm"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
old = """#if TARGET_OS_OSX
// TODO: remove when bumping react-native-macos to 0.85
- (void)hostDidStart:(nonnull RCTHost *)host
{
  host.runtimeDelegate = self;
}
#endif"""
new = """// hostDidStart: is the required method of RCTHostDelegate.
- (void)hostDidStart:(nonnull RCTHost *)host
{
#if TARGET_OS_OSX
  host.runtimeDelegate = self;
#endif
}"""
if old in src:
    with open(f, "w") as fh:
        fh.write(src.replace(old, new))
    print(f"PATCHED: {f}")
elif new in src:
    print(f"already patched: {f}")
else:
    print(f"WARNING: unexpected content in {f}")
PYEOF

# ── 3. expo/ios/AppDelegates/EXAppDelegatesLoader.m ────────────────────────────
# Import ExpoModulesCore-Swift.h so EXAppDelegateSubscriberProtocol is visible
python3 - << 'PYEOF'
import os

f = "node_modules/expo/ios/AppDelegates/EXAppDelegatesLoader.m"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
old = """#if __has_include(<Expo/Expo-Swift.h>)
#import <Expo/Expo-Swift.h>
#else
#import "Expo-Swift.h"
#endif"""
new = """// EXAppDelegateSubscriberProtocol is in the ExpoModulesCore xcframework Swift header
#if __has_include(<ExpoModulesCore/ExpoModulesCore-Swift.h>)
#import <ExpoModulesCore/ExpoModulesCore-Swift.h>
#endif

#if __has_include(<Expo/Expo-Swift.h>)
#import <Expo/Expo-Swift.h>
#else
#import "Expo-Swift.h"
#endif"""
if old in src:
    with open(f, "w") as fh:
        fh.write(src.replace(old, new))
    print(f"PATCHED: {f}")
elif new in src:
    print(f"already patched: {f}")
else:
    print(f"WARNING: unexpected content in {f}")
PYEOF

# ── 4. expo/ios/Fetch/FetchExceptions.swift ─────────────────────────────────────
# Add @unchecked Sendable to Exception subclasses (Swift 6 strict concurrency)
python3 - << 'PYEOF'
import os

f = "node_modules/expo/ios/Fetch/FetchExceptions.swift"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
patched = src
for cls in ["FetchUnknownException", "FetchRequestCanceledException", "FetchRedirectException"]:
    patched = patched.replace(
        f"class {cls}: Exception {{",
        f"class {cls}: Exception, @unchecked Sendable {{"
    )
if patched != src:
    with open(f, "w") as fh:
        fh.write(patched)
    print(f"PATCHED: {f}")
else:
    print(f"already patched or unexpected content: {f}")
PYEOF

# ── 5. expo-router/ios/ExpoHeadModule.swift ─────────────────────────────────────
# @unchecked Sendable + Optional->Any coercions + kUTTypeText deprecation + unused var
python3 - << 'PYEOF'
import os, re

f = "node_modules/expo-router/ios/ExpoHeadModule.swift"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
patched = src

# Sendable
patched = patched.replace(
    "internal class InvalidSchemeException: Exception {",
    "internal class InvalidSchemeException: Exception, @unchecked Sendable {"
)

# Optional->Any in dictionary literals
opt_fields = [
    '"description": activity.contentAttributeSet?.contentDescription',
    '"id": activity.persistentIdentifier',
    '"title": activity.title',
    '"webpageURL": activity.webpageURL',
    '"imageUrl": activity.contentAttributeSet?.thumbnailURL',
    '"keywords": activity.keywords',
    '"dateModified": activity.contentAttributeSet?.metadataModificationDate',
    '"userInfo": activity.userInfo',
]
for field in opt_fields:
    if field + "," in patched and field + " as Any" not in patched:
        patched = patched.replace(field + ",", field + " as Any,")
    elif field + "\n" in patched and field + " as Any" not in patched:
        patched = patched.replace(field + "\n", field + " as Any\n")

# kUTTypeText deprecation
patched = patched.replace(
    'let att = CSSearchableItemAttributeSet(itemContentType: kUTTypeText as String)',
    'let att: CSSearchableItemAttributeSet\n    if #available(iOS 14.0, *) {\n      att = CSSearchableItemAttributeSet(contentType: .text)\n    } else {\n      att = CSSearchableItemAttributeSet(itemContentType: kUTTypeText as String)\n    }'
)

# unused localUrl binding
patched = patched.replace(
    "if let localUrl = value.imageUrl?.path {",
    "if value.imageUrl?.path != nil {"
)

if patched != src:
    with open(f, "w") as fh:
        fh.write(patched)
    print(f"PATCHED: {f}")
else:
    print(f"already patched or unexpected content: {f}")
PYEOF

# ── 6. react-native/scripts/cocoapods/rncore.rb ─────────────────────────────────
python3 - << 'PYEOF'
import os, re

for f in [
    "node_modules/react-native/scripts/cocoapods/rncore.rb",
    "node_modules/react-native/scripts/cocoapods/rndependencies.rb",
]:
    if not os.path.exists(f):
        print(f"SKIP (not found): {f}")
        continue
    with open(f) as fh:
        src = fh.read()
    patched = src.replace(
        "URI::File.build(path: path)",
        "URI::File.build(path: URI::DEFAULT_PARSER.escape(path))"
    )
    if patched != src:
        with open(f, "w") as fh:
            fh.write(patched)
        print(f"PATCHED: {f}")
    else:
        print(f"already patched or unexpected content: {f}")
PYEOF

# ── 7. expo/scripts/autolinking.rb ──────────────────────────────────────────────
python3 - << 'PYEOF'
import os

f = "node_modules/expo/scripts/autolinking.rb"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
old = "require File.join(File.dirname(`node --print \"require.resolve('expo-modules-autolinking/package.json', { paths: ['#{__dir__}'] })\"`), \"scripts/ios/autolinking_manager\")"
new = "_escaped_dir = __dir__.gsub('\"', '\\\\\"')\nrequire File.join(File.dirname(`node --print \"require.resolve('expo-modules-autolinking/package.json', { paths: ['#{_escaped_dir}'] })\"`), \"scripts/ios/autolinking_manager\")"
if old in src:
    with open(f, "w") as fh:
        fh.write(src.replace(old, new))
    print(f"PATCHED: {f}")
elif new in src or "_escaped_dir" in src:
    print(f"already patched: {f}")
else:
    print(f"WARNING: unexpected content in {f}")
PYEOF

# ── 8. hermes-engine.podspec ─────────────────────────────────────────────────────
python3 - << 'PYEOF'
import os

f = "node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec"
if not os.path.exists(f):
    print(f"SKIP (not found): {f}")
    exit(0)
with open(f) as fh:
    src = fh.read()
# Already patched check
if "safe_react_native_path" in src:
    print(f"already patched: {f}")
    exit(0)
old = 'react_native_path = File.dirname(`node --print "require.resolve(\'react-native/package.json\', {paths: [\'.\']})"`.strip)'
new = ('react_native_path = File.dirname(`node --print "require.resolve(\'react-native/package.json\', {paths: [\'.\']})"`.strip)\n'
       '    safe_react_native_path = react_native_path.gsub(\'"\', \'\\\\"\')')
if old in src:
    patched = src.replace(old, new).replace(
        'hermes_dir = File.join(react_native_path,',
        'hermes_dir = File.join(safe_react_native_path,'
    )
    with open(f, "w") as fh:
        fh.write(patched)
    print(f"PATCHED: {f}")
else:
    print(f"WARNING: unexpected content in {f}")
PYEOF

echo "=== CI: Patching CocoaPods-generated scripts (realpath -m -> \${0}) ==="
python3 - << 'PYEOF'
import glob, os

pattern = '$(realpath -mq "${0}")'
replacement = '${0}'
scripts = glob.glob("ios/Pods/Target Support Files/**/*.sh", recursive=True)
for f in scripts:
    with open(f) as fh:
        content = fh.read()
    if pattern in content:
        with open(f, "w") as fh:
            fh.write(content.replace(pattern, replacement))
        print(f"PATCHED: {f}")
PYEOF

echo "=== CI: Running pod install ==="
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/ios"
pod install --repo-update

echo "=== CI: Pre-build complete ==="
