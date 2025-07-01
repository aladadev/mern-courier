# 📦 Courier Management System (MERN)

A simplified MERN stack-based courier and parcel management system tailored for small logistics teams. It supports booking, assignment, tracking, and administrative operations.

---

## 🚀 Features

### 👥 Multi-Role Access

* **Admin**: Manage users, monitor operations, assign agents
* **Agent**: View and update assigned deliveries
* **Customer**: Book parcels, view history, track in real-time

### 🎯 Functional Overview

#### Customer

* ✅ Register, login, and manage profile
* 📦 Book pickup & delivery with addresses and parcel type
* 💰 Specify Cash on Delivery (COD) or prepaid
* 📜 Track parcel status and view history

#### Agent

* 📋 View assigned parcels
* 🔄 Update parcel delivery status (Picked Up, In Transit, etc.)

#### Admin

* 👥 Manage users (CRUD, assign roles)
* 🚚 Assign agents to parcels
* 📊 View analytics and export reports

### 🔐 Technical Highlights

* JWT-based role authentication
* REST API using Express.js & MongoDB
* Responsive frontend with React, Tailwind, ShadCN
* Axios-based API layer

---

## 🛠️ Tech Stack

* **Frontend**: React, Vite, TailwindCSS, ShadCN
* **Backend**: Node.js, Express, Mongoose (MongoDB)
* **Authentication**: JWT with access/refresh tokens
* **API Tooling**: Postman (included), dotenv, ESLint

---

## 📁 Project Structure

```
courier-ala/
├── client/       # React frontend
│   └── src/components, auth, api, pages
├── server/       # Express backend
│   └── routes, controllers, models, middlewares
├── .env.example
├── README.md
└── docs/
    ├── Final_Report.pdf
    └── Postman_Collection.json
```

---

## ⚙️ Setup Guide

### Prerequisites

* Node.js >= 18
* MongoDB Atlas

### Installation

1. Clone the project:

```bash
git clone https://github.com/yourusername/courier-ala.git
cd courier-ala
```

2. Install dependencies:

```bash
npm install       # Installs workspaces (client & server)
```

3. Set up environment:

```bash
cp .env.example server/.env
# Fill in Mongo URI, JWT secret
```

4. Run both servers:

```bash
cd server && npm run dev
cd client && npm run dev
```

---

## 📬 API Endpoints (Partial)

* `POST /api/auth/register` – Register a new user
* `POST /api/auth/login` – Login and receive token
* `GET /api/users` – Admin fetch users
* `POST /api/pickup` – Book a parcel
* `PATCH /api/parcels/:id/status` – Update parcel status (agent)
* `PATCH /api/parcels/:id/assign-agent` – Admin assigns parcel

*Full collection: See `docs/Postman_Collection.json`*

---

## 📑 Documentation & Report

* Final PDF: `docs/Final_Report.pdf`
* Postman: `docs/Postman_Collection.json`
* Video Demo: \[Recorded separately]

---

## 👨‍💻 Author

**alaDaDev**
Software Engineer
GitHub: [@aladadev](https://github.com/aladadev)

---

⭐ Star this repo if it helped you!
