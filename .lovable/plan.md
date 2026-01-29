

# Fix: Invalid Capacitor App ID

## The Problem

The current App ID `app.lovable.96ad2b28a078437da0c8d7a1b5e01b74` is invalid because:
- The last segment starts with a number (`96ad2b28...`)
- iOS and Android require each segment to start with a letter
- All segments must be alphanumeric or underscores only (no dashes)

## The Solution

Change the App ID to a valid format that follows Java package naming conventions.

**New App ID:** `com.pokersplit.app`

This format:
- Uses reverse domain notation (standard convention)
- Each segment starts with a letter
- Contains only alphanumeric characters
- Is memorable and relates to your app name

## What Will Be Changed

**File:** `capacitor.config.ts`

```text
Line 4:
Before: appId: 'app.lovable.96ad2b28a078437da0c8d7a1b5e01b74',
After:  appId: 'com.pokersplit.app',
```

## After the Fix

Once I make this change, you'll need to:

1. **Pull the updated code** from GitHub
2. **Re-run the Capacitor commands:**
   ```bash
   cd pokersplit
   git pull
   npm install
   npx cap add ios
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

The iOS platform will be added successfully and Xcode will open with your project.

