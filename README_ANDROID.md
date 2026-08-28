# FinTrack Pro - Android APK Build Guide

This project is configured with **Capacitor** and **PWA Web Manifest** for 1-click Android app generation.

---

## ⚡ Option A: Automated 1-Click Windows Build (Easiest)

1. Export and unzip the project to a folder on your Windows PC (e.g. `C:\Projects\FinTrackPro`).
2. Double-click the file in the project root:
   **`BUILD_ANDROID_APK.bat`**
3. The script will automatically:
   - Run `npm install`
   - Build production assets (`npm run build`)
   - Add and sync the Android platform (`npx cap sync android`)
   - Launch **Android Studio** directly with the project loaded.
4. In Android Studio:
   - Click menu: **Build** ➜ **Build Bundle(s) / APK(s)** ➜ **Build APK(s)**
   - Click the **"locate"** link in the popup notification to get your `app-debug.apk`.

---

## 🛠️ Option B: Manual Command Line

Run inside the project folder:

```bash
# 1. Install packages
npm install

# 2. Build production assets
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web bundle to Android
npx cap sync android

# 5. Open Android Studio to build APK
npx cap open android
```

---

## 📱 Option C: Direct Phone Installation (No APK Build Required)

Open the app URL in Google Chrome on your Android phone:
`https://ais-pre-bp4wunppvh7ehykqgloscw-895568594616.asia-east1.run.app`
Tap **Menu (⋮)** ➜ **"Install app"** (or **"Add to Home screen"**).
The app runs full-screen natively with offline capability.
