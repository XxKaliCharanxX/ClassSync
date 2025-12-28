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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const list = document.getElementById("list");
const sessionId = localStorage.getItem("sessionId");

if (!sessionId) {
  list.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = "No active session found.";
  li.style.justifyContent = "center";
  li.style.border = "1px dashed var(--border)";
  const style = document.createElement('style');
  style.innerHTML = `ul#list li:last-child::after { content: none; }`;
  document.head.appendChild(style);
  list.appendChild(li);
} else {
  db.collection("attendance")
    .where("sessionId", "==", sessionId)
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      list.innerHTML = "";
      
      if (snapshot.empty) {
        list.innerHTML = "<p style='text-align:center; color:#6b7280;'>Waiting for students...</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        
        const date = data.timestamp ? data.timestamp.toDate() : new Date();
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        li.innerHTML = `
          <div>
            <strong>${data.studentId}</strong><br>
            <span class="time">${timeString}</span>
          </div>
        `;
        list.appendChild(li);
      });
    });
}