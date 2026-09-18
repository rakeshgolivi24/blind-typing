# BCAlgorix — Blind Typing Championship Web Application

Official web application for the **BCAlgorix** Blind Typing Contest. Built with **React** (Vite + Tailwind CSS), **Node.js/Express**, and **MongoDB**, featuring a luxurious **burgundy & gold** fest theme.

---

## 🚀 Quick Start Guide

The application is fully configured and ready to run.

### 1. Launch the Application
From the project root:
```bash
npm start
```
The server will start at:
- **Web App**: [http://localhost:5000](http://localhost:5000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Optional for Frontend Development with Hot Reload: `npm run client` on port 3000)*

---

## 🔑 Access Credentials

### 1. Candidate Access (Contestants)
- **Authentication**: Candidates register with:
  - **10-Digit SUC Code** (e.g. `2452890430`)
  - **Full Name** (e.g. `Aryan Sharma`)
  - **Password** (created during registration)
- **Single Attempt Policy**: Each candidate has exactly **1 chance** to attempt each round. Once submitted, the round is locked and cannot be retried.
- **Pacing & Rest**: Candidates are **not** forced to take all 3 rounds in a single sitting. The timer for a round starts **only when the candidate clicks "Start Round"**. Candidates can rest or log back in between rounds.

### 2. Organizer Admin Access
Access the **Admin** tab on the sign-in page:
- **Username**: `admin`
- **Password**: `admin@bcalgorix2026`
*(Can be customized via `server/.env`)*

**Admin Capabilities**:
- **Live Candidate Monitor**: Track registered candidates, rounds completed, individual round metrics, and composite scores.
- **Keystroke Audit**: Inspect candidate's exact typed text vs official prompt text to verify authenticity.
- **Winner Reveal Board**: One-click toggle to unveil the leaderboard to candidates, triggering the elevated Top 3 podium celebration.

---

## 🏆 Round Progression & Permissions Matrix

| Round | Title | Typed Visibility | Backspace | Copy / Paste | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Round 1** | Speed & Mechanics | **Visible Text** | **ALLOWED** | **BLOCKED** | 2 min (120s) |
| **Round 2** | Semi-Blind Precision | **Masked as `*`** | **ALLOWED** | **BLOCKED** | 2.5 min (150s) |
| **Round 3** | Extreme Blind Gauntlet | **Masked as `*`** | **BLOCKED** | **BLOCKED** | 3 min (180s) |

### 🛡️ Anti-Cheating & Blind Typing Mechanics
1. **Ghost Text Display**: In all rounds, the target paragraph is displayed with light transparent typography. As the candidate types:
   - In **Round 1**: Typed characters display as visible typography.
   - In **Round 2 & 3**: Typed characters transform into asterisks (`*`).
2. **Zero Error Feedback**: Neither correct nor mistaken keystrokes are highlighted with red or green. This prevents candidates from guessing or gauging mistakes during the blind rounds.
3. **Anti-Cheat Defenses**:
   - Right-click context menu blocked.
   - Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A blocked.
   - Text selection disabled.
   - Tab-switching / blur listener triggers a direct warning on first occurrence and auto-submits on repeated violations.

---

## 🏅 Scoring & Leaderboard

- **Metrics Calculated**:
  - **Speed (WPM)**: Calculated from net correct keystrokes per minute.
  - **Accuracy (%)**: Exact character-by-character match against original prompt text.
  - **Time Taken**: Execution duration in seconds.
  - **Composite Score**: Fair weighted formula based on Speed and Accuracy.
- **Podium Elevation**:
  - Top 3 contestants are ranked by their **3-round average performance**.
  - 1st Place (Gold Crown), 2nd Place (Silver Medal), 3rd Place (Bronze Trophy).
- **Privacy Lock**:
  - Until the fest organizers toggle the reveal in the Admin Panel, candidates see an official sealed shield.

---

## 🗄️ Database Configuration

By default, the server connects to MongoDB via `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/bcalgorix
```
- **Local / Atlas MongoDB**: If MongoDB is active or if you provide a MongoDB Atlas cloud URI in `server/.env`, Mongoose connects automatically.
- **Resilient File Persistence**: If local MongoDB is not running, the application automatically persists all users, submissions, and settings to `server/data/bcalgorix_store.json` without any interruptions or crashes.
- **Zero Dummy Data**: The database starts completely empty of fake users so you can test live from scratch.
