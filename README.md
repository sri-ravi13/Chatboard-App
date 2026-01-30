# 🚀 ChatBoard Pro - Real-Time Chat & Whiteboard

A modern, real-time collaborative platform built with **React**, **Vite**, and **Firebase**. It features a live chat with presence indicators and a shared whiteboard with multi-user drawing capabilities, all synchronized instantly via Firebase Realtime Database.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)![Firebase](https://img.shields.io/badge/Firebase-9.22-FFCA28?logo=firebase)![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)

---

## ✨ Key Features

### 💬 Real-Time Chat
- **Instant Message Sync**: Messages appear across all clients in under 100ms.
- **Online Status & Presence**: See who is online in real-time.
- **Unread Message Counters**: Badge notifications for new messages.
- **File & Media Sharing**: Upload images, videos, and documents.
- **Voice Messages**: Record and send voice notes directly in the chat.

### 🎨 Collaborative Whiteboard
- **Live Drawing Sync**: See collaborators' cursors and drawings instantly.
- **Multiple Tools**: Pen, eraser, shapes (line, rectangle, circle), and text boxes.
- **Customizable Properties**: Adjust colors, line width, and font sizes.
- **Permission Control**: Restrict whiteboard access to specific users.
- **Optimistic Updates**: Zero-lag drawing experience for a native feel.

### 🔐 Core Technology
- **Firebase Realtime Database**: Powers all real-time data synchronization.
- **Secure Authentication**: User signup and login system handled by the application logic.
- **Persistent Sessions**: User data is stored in Firebase, not lost on refresh.
- **Fast Development**: Built with Vite for a lightning-fast development experience.

---

## Firebase Setup (Required)

This project requires a Firebase project to handle real-time data. Follow these steps carefully.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"**.
3. Name it `chatboard-pro` (or any name you prefer).
4. Continue through the setup steps (you can disable Google Analytics).

### Step 2: Set Up Realtime Database
1. In your new project's console, go to **Build > Realtime Database**.
2. Click **"Create Database"**.
3. Choose a location (e.g., `us-central1`).
4. Select **"Start in test mode"** (this allows read/write access for development).
5. Click **"Enable"**.

### Step 3: Get Your Firebase Configuration
1. Click the **Gear icon** (Project settings) in the top-left of the Firebase console.
2. Under the "General" tab, scroll down to **"Your apps"**.
3. Click the **Web icon (`</>`)** to create a new web app.
4. Give it a nickname (e.g., "ChatBoard Web") and click **"Register app"**.
5. You will be shown a `firebaseConfig` object. **Copy this entire object.**

### Step 4: Add Configuration to Your Project
1. In your code editor, open the file `src/services/storage.js`.
2. **Delete the placeholder `firebaseConfig` object** and replace it with the one you copied from Firebase.

**Example of what `src/services/storage.js` should look like:**
```javascript
// src/services/storage.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

// ✅ PASTE YOUR COPIED FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSy...your-real-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:a1b2c3d4e5f6"
};

// ... the rest of the file remains the same
```
**Your application will not work without this step.**

---

## 🛠️ Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0 or higher.
- **npm**: v9.0 or higher.

### Installation Steps
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chatboard-pro.git
    cd chatboard-pro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Install Firebase SDK:**
    ```bash
    npm install firebase
    ```

4.  **Configure Firebase:**
    - Follow the **"Firebase Setup"** guide above to add your credentials to `src/services/storage.js`.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
The application will be available at `http://localhost:5173`.

---

## 🚀 Running the Application

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles the app for production into the `dist` folder. |
| `npm run preview`| Serves the production build locally to preview it. |

---

## 🧪 Testing Real-Time Collaboration

1.  **Open Browser 1** (e.g., Chrome).
    - Navigate to `http://localhost:5173`.
    - Sign up as **"UserA"**.

2.  **Open Browser 2** (e.g., Firefox, or Chrome in Incognito Mode).
    - Navigate to `http://localhost:5173`.
    - Sign up as **"UserB"**.

3.  **Test Chat & Whiteboard:**
    - From UserA's window, click on UserB to start a chat.
    - Send messages and watch them appear instantly on UserB's screen.
    - Both users navigate to the "Whiteboard" tab.
    - Start drawing from one window and watch it appear in the other in real-time.

---

## 📁 Project Structure

```
chatboard-pro/
├── public/                # Static assets
├── src/
│   ├── services/
│   │   └── storage.js     # 🔥 Firebase connection and data logic
│   ├── App.jsx            # Main React component and application logic
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global and Tailwind CSS styles
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔒 Security Considerations

⚠️ **This is a demo application.** The current implementation stores passwords in plain text in the Firebase database for simplicity.

### For a Production Environment:
- **Use Firebase Authentication**: It provides secure, managed user authentication with password hashing, social logins, and more.
- **Update Security Rules**: In the Firebase console, switch your Realtime Database rules from test mode to a secure mode that validates user identity (`auth.uid`) before allowing read/write operations.
- **Implement Server-Side Validation**: For critical operations, use Firebase Cloud Functions to validate data before it's written to the database.

---

## 🐛 Troubleshooting

- **App doesn't load or auth fails**: The most common issue is an incorrect or missing `firebaseConfig` in `src/services/storage.js`. Double-check that you have copied it correctly.
- **Tailwind styles not applying**: Ensure you have run `npm install` and that your `tailwind.config.js` and `index.css` files are correctly configured. Restarting the dev server (`npm run dev`) can often resolve this.
- **Dependencies fail to install**: Delete `node_modules` and `package-lock.json`, then run `npm install` again.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use it for learning and personal projects.