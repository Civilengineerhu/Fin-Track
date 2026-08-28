# FinTrack Pro - Android & Mobile Deployment Guide

This guide provides instructions for compiling **FinTrack Pro** into a native Android APK or installing it as a standalone Progressive Web App (PWA).

---

## 📱 Option A: 1-Click Automated Android APK Build (Windows)

1. Ensure **Android Studio** is installed on your computer.
2. Unzip or clone the repository to your local drive (e.g. `C:\Projects\FinTrackPro`).
3. Double-click **`BUILD_ANDROID_APK.bat`** in the root directory.
4. The script will automatically:
   - Install all required dependencies (`npm install`)
   - Compile production frontend bundles (`npm run build`)
   - Synchronize Android native assets (`npx cap sync android`)
   - Launch **Android Studio** with the project loaded.
5. In **Android Studio**:
   - Navigate to menu: **Build** ➜ **Build Bundle(s) / APK(s)** ➜ **Build APK(s)**.
   - Click the **"locate"** link in the bottom-right notification once the build finishes to find your `app-debug.apk`.
   - Transfer `app-debug.apk` to your phone and install.

---

## 🛠️ Option B: Manual Command Line Build (macOS / Linux / Windows)

```bash
# 1. Install dependencies
npm install

# 2. Build production web bundle
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web assets with native project
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

From Android Studio, click **Run on Device** or use the **Build APK** menu.

---

## 🌐 Option C: Instant PWA Installation (No Compilation Needed)

1. Open your live app URL (or GitHub Pages URL / Cloud Run URL) in **Google Chrome** on your Android phone.
2. Tap the three-dot menu (**⋮**) in Chrome.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. The application will be added to your app drawer and home screen, running full-screen with offline caching enabled.
