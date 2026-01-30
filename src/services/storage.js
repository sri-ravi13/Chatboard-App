// src/services/storage.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

// ==================================================================
// ✅ YOUR REAL FIREBASE CONFIGURATION IS NOW CORRECTLY PLACED
// ==================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDVf-BzvXHf7X-Lykvp2ded6hs_mafd4lw",
  authDomain: "chatboard-b7194.firebaseapp.com",
  databaseURL: "https://chatboard-b7194-default-rtdb.firebaseio.com",
  projectId: "chatboard-b7194",
  storageBucket: "chatboard-b7194.appspot.com", // Corrected from .firebasestorage.app
  messagingSenderId: "809504326884",
  appId: "1:809504326884:web:da0e28ac4420c985e5d8f1",
  measurementId: "G-N2Z01WBB50"
};
// ==================================================================

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

const storageWithFirebase = {
  async get(key, shared = false) {
    try {
      const storageKey = shared ? `shared/${key}` : `local/${key}`;
      const dbRef = ref(database, storageKey);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        return { key, value: JSON.stringify(snapshot.val()), shared };
      }
      return null;
    } catch (error) {
      console.error('Firebase GET error:', error.message);
      return null;
    }
  },

  async set(key, value, shared = false) {
    try {
      const storageKey = shared ? `shared/${key}` : `local/${key}`;
      const dbRef = ref(database, storageKey);
      const parsedValue = JSON.parse(value);
      await set(dbRef, parsedValue);
      return { key, value, shared };
    } catch (error) {
      console.error('Firebase SET error:', error.message);
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      const storageKey = shared ? `shared/${key}` : `local/${key}`;
      const dbRef = ref(database, storageKey);
      await remove(dbRef);
      return { key, deleted: true, shared };
    } catch (error) {
      console.error('Firebase DELETE error:', error.message);
      return null;
    }
  },

  onDataChange(key, shared, callback) {
    if (!shared) {
      console.warn("Real-time listeners should only be used on 'shared' data.");
      return () => {}; // Return an empty unsubscribe function
    }
    const storageKey = `shared/${key}`;
    const dbRef = ref(database, storageKey);
    // onValue returns the unsubscribe function directly
    return onValue(dbRef, (snapshot) => {
      // If data exists, pass it. If not, pass a default value (e.g., null).
      callback(snapshot.val() || null);
    });
  }
};

export default storageWithFirebase;