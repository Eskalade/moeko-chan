# Changelog

## 2026-01-17 - BPM Detection Critical Bug Fixes

### Bug Fixes

#### 1. Fixed Bass Level Always Capped at 1.0 (CRITICAL)
**File:** `hooks/use-audio-capture.ts`

**Problem:** Bass level was always capped at 1.0 due to `Math.min(1, ...)`, making it impossible to detect beats. Since microphone picks up strong low frequencies, the bass level would hit the cap and stay at 1.0. With threshold = avgBass * 1.3 = 1.0 * 1.3 = 1.3, the bass (1.0) could never exceed threshold (1.3), resulting in no beats detected after initial warmup.

**Fix:**
- Introduced `rawBassLevel` that can exceed 1.0 for beat detection (line 171)
- Keep `bassLevel` capped at 1.0 for display purposes (line 173)
- Energy history now tracks `rawBassLevel` instead of capped value (line 218)
- Beat detection now compares `rawBassLevel` against threshold (line 244)
- Debug logs now show both `bass` (capped) and `rawBass` (uncapped) values

**Impact:** Beat detection now works correctly by allowing transient detection through uncapped raw values.

#### 2. Fixed realtime-bpm-analyzer Connection Errors
**File:** `hooks/use-audio-capture.ts`

**Problem:** The type assertions for connecting the BPM processor were causing runtime errors:
```
TypeError: Failed to execute 'connect' on 'AudioNode': Overload resolution failed.
```

**Fix:**
- Added runtime type checking before attempting connection (line 456)
- Gracefully handles non-standard object return types from the library
- Separated connection logic from message handler setup (lines 456-466)
- Added debug logging to identify processor type (line 449-450)

**Impact:** The realtime-bpm-analyzer now either connects properly or gracefully falls back to custom beat detection without throwing errors.

#### 3. Added Minimum Energy Requirement for Beat Detection
**File:** `hooks/use-audio-capture.ts`

**Problem:** Initial false beats during startup noise were poisoning the threshold calculation. The first 3 false beats filled the energy history with 1.0 values, causing the threshold to jump to 1.3 immediately and preventing any future beat detection.

**Fix:**
- Added `rawBassLevel > 0.1` minimum energy check to beat detection (line 244)
- Prevents beats from being detected during initial warmup noise
- Debug logs now show `minEnergyMet` status (line 239)

**Impact:** Eliminates false positive beats during startup, allowing the threshold to stabilize with real audio data.

### Expected Behavior After Fix

Debug logs should now show proper beat detection:
```
Levels: {energy: '0.10', bass: '1.00', rawBass: '2.45', mid: '0.85', treble: '0.42', maxFreq: 180}
Beat check: {rawBass: '2.45', threshold: '1.89', diff: '0.56', aboveThreshold: true, timeSinceLast: '520ms', canTrigger: true, minEnergyMet: true}
[AUDIO-DBG] BEAT DETECTED! interval: 520ms beatCount: 4
[AUDIO-DBG] BPM calculated: {calculated: 115, smoothed: 117, previous: 118, medianInterval: '521ms', beatCount: 4}
```

Key differences:
- `rawBass` can exceed 1.0 and varies with actual audio transients
- Threshold comparison is now meaningful
- Beats are detected consistently when audio has real bass transients
