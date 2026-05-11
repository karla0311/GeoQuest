# GeoQuest

A multi-stage Geography quiz game!

Repository Link: https://github.com/karla0311/GeoQuest

---

## 📌  Overview

**GeoQuest** is a full-stack, multi-stage geography game for geography enthusiasts and students who need an engaging, interactive way to test & improve their global knowledge. Our game is a "gamified learning environment" that challenges you via flag identification, coordinate pinpointing, & capital recognition. Unlike other geography games and trainers, our product offers a dynamic, competitive, multi-stage gameplay loop that tracks your journey to mastery!

---

## ✨ Features

### Multi-stage Gameplay
- Daily play and practice mode
- First stage: Flag identification
- Second stage: Map pinpointing
- Third stage: Guess the capital 

### User Authentication
- Secure register and login/logout
- Password encryption
- Session management 

### Community Forum Page
- Post onto forum page to interact with other users
- Toggle through posts with `Latest`, `Hottest`, `Unanswered` or through tags
- Comment or upvote on other users post

### Analytics & Leaderboard 
- Detailed stats of user gameplay: Accuracy, Score, and games played
- Compare scores with Top 10 Leaderboard (Daily and Practice mode) 

---

## 🛠️ Tech Stack

### Frontend
- React  
- Tailwind CSS  
- React Router  
- Context API  

### Backend
- Node.js  
- Express.js  

### Database
- Supabase  

### Other Tools
- GitHub  
- .env  

---

## 📂 Project Setup

Requires Node 18+.

```bash
# client
cd client
npm install
npm run dev

# server (in a separate terminal)
cd server
npm install
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:8000`.

Create a `server/.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Create a `client/.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```


