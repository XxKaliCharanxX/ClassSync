# ClassSync
**A Location-Based Attendance System with Geofencing & Bluetooth Verification**

ClassSync is a web-based attendance application designed to prevent proxy attendance by verifying student presence through two layers of security: **GPS Geofencing** and **Bluetooth Proximity**.

---

## Prototype Status & Disclaimer
> **Note: This project is currently in the PROTOTYPING phase.**
> The core functionality, particularly the Bluetooth verification method, is experimental. The current implementation relies on the Web Bluetooth API, which has specific browser and OS limitations (detailed below). Future updates will aim to improve compatibility, potentially integrating a Dynamic QR Code fallback for wider device support.

---

## Features

### 1. GPS Geofencing
* **Teacher Mode:** Sets a virtual perimeter (geofence) around the teacher's current location when a class starts.
* **Student Mode:** Checks if the student is physically within a **40-meter radius** of the teacher.
* **Precision:** Uses the Haversine formula to calculate real-time distance between coordinates.

### 2. Bluetooth Proximity Check
* **Proof of Presence:** Adds a second layer of verification to ensure students are in the same room, not just the same building area.
* **Scanning:** Students' devices scan for the teacher's device (e.g., laptop) to confirm close-range proximity.

### 3. Real-Time Dashboard
* **Live Updates:** Teachers can view a live list of students as they mark their attendance.
* **Secure:** Powered by Google Firebase (Firestore) for real-time data syncing.

---

## How It Works

### For Teachers
1.  **Login** to the application.
2.  Enable **Bluetooth** on your device and ensure it is **Discoverable** (Visible to other devices).
3.  Click **"Start Class"**.
4.  Enter your device's Bluetooth name (e.g., `Prof-MacBook` or `Room-302-PC`).
5.  A session is created in the database with your GPS coordinates.

### For Students
1.  **Login** to the application using Chrome on Android (or a supported browser).
2.  Click **"Mark Attendance"**.
3.  **Step 1 (GPS):** The app verifies you are within 40m of the teacher.
4.  **Step 2 (Bluetooth):** A scanner pops up. Select the teacher's device name from the list.
5.  **Success:** Attendance is marked in the database.

---

## Current Limitations & Flaws

### 1. iOS / iPhone Incompatibility
* **The Issue:** Apple's iOS (iPhones/iPads) **does not support** the Web Bluetooth API in any browser (Safari, Chrome, etc.).
* **Result:** iPhone users currently cannot pass the Bluetooth check step.
* **Future Fix:** We plan to implement a **Dynamic QR Code** system as an alternative for iOS users.

### 2. Browser Requirements
* **Web Bluetooth API:** Only works on **Google Chrome**, **Edge**, and **Opera**. It does not work on Firefox.
* **HTTPS Required:** The application must be hosted on a secure server (HTTPS) for Geolocation and Bluetooth features to function.

### 3. "Discoverable" Mode
* The teacher's device must remain in "Discoverable/Visible" mode for the duration of attendance taking. On some operating systems (like Windows), this mode may time out automatically to save battery.

---

## Setup & Installation

1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/yourusername/classsync.git](https://github.com/yourusername/classsync.git)
    ```
2.  **Configure Firebase:**
    * Create a project at [console.firebase.google.com](https://console.firebase.google.com).
    * Enable **Authentication** (Email/Password).
    * Enable **Firestore Database**.
    * Copy your config keys into `app.js` and `dashboard.js`.
3.  **Set Database Rules:**
    * Go to Firestore -> Rules and ensure users can only write to their own attendance records.
4.  **Run Locally:**
    * Use a local server (e.g., Live Server in VS Code).
    * **Note:** For Bluetooth testing on mobile, you must use **USB Debugging** (Port Forwarding) or deploy to a live HTTPS URL (like Firebase Hosting or Vercel).

---

## License
This project is open-source and available under the [MIT License](LICENSE).
