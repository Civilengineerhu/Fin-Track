# 📱 1-Click Android APK & Mobile Installation Guide

This folder contains automated tools to compile and install **FinTrack Pro** onto your Android device.

---

## ⚡ Method 1: 1-Click APK Builder (Recommended)

1. Double-click **`1-Click_Build_Android_APK.bat`**.
2. The script will automatically:
   - Verify Node.js & dependencies.
   - Compile the optimized production build.
   - Sync the Capacitor Android project.
   - Automatically compile `FinTrack_Pro.apk` directly (or launch Android Studio with the project pre-loaded).
3. Once generated, **`FinTrack_Pro.apk`** will be placed in this folder and the root directory.
4. Transfer `FinTrack_Pro.apk` to your phone via WhatsApp/USB/Drive and tap to install!

---

## 🔌 Method 2: Direct Install to Connected Phone (via USB)

If you have USB Debugging enabled on your Android phone and connected via cable:
1. Double-click **`1-Click_Install_To_Connected_Phone.bat`**.
2. It will build and push the APK directly to your phone.

---

## 🌐 Method 3: Instant PWA Install (No APK Needed)

1. Open your live app URL (or GitHub Pages URL) in **Google Chrome** on your Android phone.
2. Tap the three-dot menu (**⋮**) in Chrome.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. FinTrack Pro will install instantly on your home screen and run full-screen offline.
