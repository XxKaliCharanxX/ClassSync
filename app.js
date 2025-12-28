// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDemhxdzPpdWCvUy5KZcg6xeBZgrk4gWF8",
  authDomain: "classsync-91475.firebaseapp.com",
  projectId: "classsync-91475",
  storageBucket: "classsync-91475.appspot.com",
  messagingSenderId: "602668093780",
  appId: "1:602668093780:web:f6002ec48aba2cbc74b8c1",
  measurementId: "G-4REXJ69X27"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- HELPER FUNCTIONS ---
function showStatus(message, isError = false) {
  const el = document.getElementById("status");
  el.innerText = message;
  // Change color: Red for error, Green/White for success
  el.style.color = isError ? "#ef4444" : "#10b981"; 
  console.log(message);
}

// --- AUTHENTICATION ---
function login() {
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) return alert("Please enter email and password");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => showStatus("Logged in successfully!"))
    .catch(error => showStatus("Login Failed: " + error.message, true));
}

// --- TEACHER FUNCTIONS ---
function startClass() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first");
    return;
  }

  // 1. Ask Teacher for their Device Name (e.g., "Prof-Laptop" or "My-iPhone")
  // This is the name students will look for in the Bluetooth scan.
  const deviceName = prompt("Enter your device's Bluetooth Name (as shown in Settings):", "Teacher-Laptop");
  if (!deviceName) return;

  showStatus("Acquiring GPS location...");

  getTeacherLocation((location) => {
    const sessionId = Date.now().toString();

    db.collection("sessions").doc(sessionId).set({
      teacherId: user.uid,
      deviceName: deviceName, // Save this so students know what to scan
      location: location,     
      radius: 40,             // 40 meters radius
      startTime: new Date(),
      active: true
    }).then(() => {
      localStorage.setItem("sessionId", sessionId);
      showStatus(`Class Started! ID: ${sessionId}. Tell students to scan for: "${deviceName}"`);
    }).catch((error) => {
      showStatus("Database Error: " + error.message, true);
    });
  });
}

function getTeacherLocation(callback) {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  
  navigator.geolocation.getCurrentPosition(
    (pos) => callback({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    (err) => showStatus("Location Error: " + err.message, true),
    { enableHighAccuracy: true }
  );
}

// --- STUDENT FUNCTIONS ---
async function markAttendance() {
  const user = auth.currentUser;
  const sessionId = localStorage.getItem("sessionId");

  if (!user) return alert("Please login first.");
  if (!sessionId) return alert("No active session found. Ask teacher to start class.");

  showStatus("Step 1: Checking GPS Geofence...");

  // 1. Check Geofence First
  checkGeofence(sessionId, async (isInside, teacherDeviceName) => {
    if (!isInside) {
      showStatus("Failed: You are outside the classroom.", true);
      return;
    }

    showStatus(`Geofence Passed. Step 2: Scanning for "${teacherDeviceName}"...`);
    
    // 2. Check Bluetooth
    // We pass the teacher's device name fetched from the DB
    const isClose = await checkBluetooth(teacherDeviceName);
    
    if (isClose) {
      // 3. Mark Attendance
      saveAttendance(user, sessionId);
    } else {
      showStatus("Attendance Failed: Bluetooth verification failed.", true);
    }
  });
}

function checkGeofence(sessionId, callback) {
  db.collection("sessions").doc(sessionId).get()
    .then(doc => {
      if (!doc.exists) return alert("Session expired or invalid");
      const session = doc.data();

      // Get Student Location
      navigator.geolocation.getCurrentPosition((pos) => {
        const distance = getDistance(
          pos.coords.latitude, pos.coords.longitude,
          session.location.lat, session.location.lng
        );

        console.log("Distance:", distance.toFixed(2) + "m");
        
        // Pass result AND the device name to the callback
        callback(distance <= session.radius, session.deviceName);
      }, 
      (err) => showStatus("GPS Error: " + err.message, true),
      { enableHighAccuracy: true });
    });
}

async function checkBluetooth(targetName) {
  try {
    alert(`Please select "${targetName}" from the list.`);
    
    // Triggers the browser's native Bluetooth picker
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: targetName }],
      optionalServices: ['battery_service'] // Required to allow connection
    });

    // If user selects it, we try to connect to prove proximity
    const server = await device.gatt.connect();
    
    // If connected, they are close!
    device.gatt.disconnect(); // Disconnect immediately
    return true;

  } catch (error) {
    console.error(error);
    // Usually happens if user cancels or device not found
    return false;
  }
}

function saveAttendance(user, sessionId) {
  db.collection("attendance").add({
    studentId: user.email, 
    uid: user.uid,
    sessionId: sessionId,
    timestamp: new Date()
  }).then(() => {
    showStatus("SUCCESS: Attendance Marked! ✅");
  }).catch(err => {
    showStatus("Error saving: " + err.message, true);
  });
}

// --- MATH UTILS ---
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radius of earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}