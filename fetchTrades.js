const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyDksEsBF9Nyq94OjJ-rkW9HlfMQ0gEHnrw",
  authDomain: "traderkishann-e33ff.firebaseapp.com",
  projectId: "traderkishann-e33ff",
  storageBucket: "traderkishann-e33ff.firebasestorage.app",
  messagingSenderId: "228433487881",
  appId: "1:228433487881:web:5a30a8403ffa72370e30d8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  const email = process.argv[2] || "trader@gmail.com";
  const password = process.argv[3] || "password";

  console.log(`Authenticating user ${email}...`);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`Authentication successful! UID: ${user.uid}`);
    
    console.log("Fetching trading journal data from database...");
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error("Error: User document not found in Firestoreusers collection.");
      process.exit(1);
    }

    const userData = userDocSnap.data();
    console.log("\n==================================================");
    console.log(`USER PROFILE FOUND: ${userData.displayName} (${userData.email})`);
    console.log(`Current Balance: $${userData.balance ?? 100000}`);
    console.log(`Total Trades Saved: ${(userData.trades || []).length}`);
    console.log("==================================================\n");

    const trades = userData.trades || [];
    if (trades.length === 0) {
      console.log("No trades found in the journal database for this user.");
    } else {
      console.log(JSON.stringify(trades, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error("Fetch/Authentication Error:", error.message || error);
    process.exit(1);
  }
}

run();
