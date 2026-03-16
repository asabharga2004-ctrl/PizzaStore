#  Pizza Store — MERN App
> Domino's style pizza ordering app — Redux + Formik + Yup + Jest + Mocha
##  Project Structure
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

## ▶ Run Locally
# Terminal 1 — Backend
cd backend
npm install
node seed.js
node server.js

# Terminal 2 — Frontend
cd frontend
npm install
npm start

##  Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@pizza.com | admin123 |
| Customer | Register at /register | — |

##  Tests
cd backend && npm test
cd frontend && npm test

##  Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Redux Toolkit, Formik, Yup |
| Backend | Node.js, Express, MongoDB, JWT |
| Testing | Jest, Mocha, Chai, Supertest |