# DermaAI — Graduation Project

AI-powered skin disease diagnosis system with a mobile app, doctor dashboard, chatbot, and multiple backend services.

---

## Project Structure

```
GradProject/
├── Back-End/          # Main backend (Patient API on port 5000, Doctor API on port 5001)
│   ├── Patient/       # Patient-facing API
│   └── Doctor/        # Doctor-facing API
├── Front-End/         # Patient mobile app (React Native / Expo)
├── Front-End-Doctor/  # Doctor mobile app (React Native / Expo)
├── Chatbot/           # AI chatbot (Python / Streamlit)
└── Skin-diagnose-dashboard/
    ├── dashboard/          # Dashboard frontend (React / Vite)
    └── dashboard-backend/  # Dashboard backend (Node.js)
```

---

## Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL (database name: `DermaAi`)
- Expo Go app on your phone (for mobile development)

---

## 1. Patient Backend

Navigate to the Patient backend directory and run:

```bash
cd Back-End/Patient
```

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

```

Start the development server (port 5000):

```bash
npm run dev
```

---

## 2. Doctor Backend

Navigate to the Doctor backend directory and run:

```bash
cd Back-End/Doctor
```

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

```

Start the development server (port 5001):

```bash
npm run dev
```

---

## 3. Patient Mobile App (Front-End)

Navigate to the frontend directory:

```bash
cd Front-End
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press `w` to open in the browser.

---

```

---

## 5. Skin Diagnosis Dashboard

### Dashboard Frontend

Navigate to the dashboard frontend:

```bash
cd Skin-diagnose-dashboard/dashboard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### Dashboard Backend

Navigate to the dashboard backend:

```bash
cd Skin-diagnose-dashboard/dashboard-backend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 6. Chatbot

Navigate to the chatbot directory:

```bash
cd Chatbot
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the chatbot:

```bash
streamlit run app.py
```

Open your browser at **http://localhost:8501**

---

## Environment Variables

Each backend service requires a `.env` file in its directory. At minimum:

**Back-End/Patient/.env** and **Back-End/Doctor/.env**:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/DermaAi
JWT_SECRET=your_jwt_secret
```

---

## Quick Start Order

Run services in this order to avoid connection errors:

1. PostgreSQL database
2. Patient Backend (`Back-End/Patient`)
3. Doctor Backend (`Back-End/Doctor`)
4. Dashboard Backend (`Skin-diagnose-dashboard/dashboard-backend`)
5. Dashboard Frontend (`Skin-diagnose-dashboard/dashboard`)
6. Patient App (`Front-End`)
7. Doctor App (`Front-End-Doctor`)
8. Chatbot (`Chatbot`)
