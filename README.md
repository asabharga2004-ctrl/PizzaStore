# Pizza Store — Full Stack MERN (Domino's Style)
# Redux + Formik + Yup + Jest + Mocha + Chai + Supertest

=================================================
PROJECT STRUCTURE
=================================================

PizzaStore/
├── backend/
│   ├── models/          ← 8 MongoDB models (ER Diagram)
│   ├── routes/          ← All REST API routes
│   ├── middleware/       ← JWT auth middleware
│   ├── tests/
│   │   └── api.test.js  ← Mocha + Chai + Supertest
│   ├── server.js
│   ├── seed.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── store/
    │   │   ├── index.js         ← Redux store
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       ├── menuSlice.js
    │   │       ├── cartSlice.js
    │   │       ├── orderSlice.js
    │   │       └── messageSlice.js
    │   ├── pages/
    │   │   ├── Login.js         ← Formik + Yup
    │   │   ├── Register.js      ← Formik + Yup
    │   │   ├── MenuPage.js      ← Redux
    │   │   ├── CartPage.js      ← Redux + Formik + Yup (address)
    │   │   ├── OrdersPage.js    ← Redux
    │   │   ├── MessagesPage.js  ← Redux
    │   │   ├── AdminMenu.js     ← Redux + Formik + Yup
    │   │   ├── AdminOrders.js   ← Redux
    │   │   └── AdminRevenue.js  ← Redux
    │   ├── __tests__/
    │   │   ├── authSlice.test.js   ← Jest
    │   │   ├── cartSlice.test.js   ← Jest
    │   │   ├── menuSlice.test.js   ← Jest
    │   │   └── orderSlice.test.js  ← Jest
    │   └── App.js


=================================================
STEP-BY-STEP COMMANDS
=================================================

TERMINAL 1 — MongoDB (Keep open always)
  mongod --dbpath C:\data\db


TERMINAL 2 — Backend
  cd backend
  npm install
  node seed.js
  node server.js

  Wait for:
    MongoDB connected!
    Backend running at http://localhost:5000


TERMINAL 3 — Frontend
  cd frontend
  npm install
  npm start

  Wait for: Compiled successfully!
  Opens: http://localhost:3000


=================================================
RUN TESTS
=================================================

Backend tests (Mocha + Chai + Supertest):
  cd backend
  npm test

Frontend tests (Jest - Redux slice unit tests):
  cd frontend
  npm test


=================================================
LOGIN CREDENTIALS
=================================================
  Admin:    admin@pizza.com / admin123
  Customer: Register a new account at /register


=================================================
TECHNOLOGIES USED
=================================================
  Redux Toolkit     → Global state management
  Formik            → Form handling (Login, Register, Cart address, Admin menu)
  Yup               → Form validation schemas
  Jest              → Frontend unit tests (Redux slices)
  Mocha             → Backend API test runner
  Chai              → Assertion library
  Supertest         → HTTP endpoint testing
  Bebas Neue font   → Domino's style headings
  Dark theme (#0f0f0f + #e63312) → Domino's red-black color scheme
