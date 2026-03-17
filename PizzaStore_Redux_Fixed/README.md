@"
# 🍕 Pizza Store — MERN App

> Domino's style pizza ordering app

---

## 📁 Project Structure
``````
PizzaStore/
├── backend/
│   ├── models/       ← 8 MongoDB models
│   ├── routes/       ← REST API routes
│   ├── middleware/   ← JWT auth
│   ├── tests/        ← Mocha + Chai + Supertest
│   ├── server.js
│   └── seed.js
└── frontend/
    └── src/
        ├── store/    ← Redux slices
        ├── pages/    ← UI pages
        └── App.js
``````

---

## ▶️ Run Locally
``````bash
cd backend && npm install && node seed.js && node server.js
cd frontend && npm install && npm start
``````

---

## 🔐 Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@pizza.com | admin123 |
| Customer | Register at /register | — |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Redux, Formik, Yup |
| Backend | Node.js, Express, MongoDB, JWT |
| Testing | Jest, Mocha, Chai, Supertest |
"@ | Out-File -FilePath README.md -Encoding utf8