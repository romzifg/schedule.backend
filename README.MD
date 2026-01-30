# 🗓️ Microservice Appointment System

Backend microservice system untuk manajemen **Customer, Doctor, dan Schedule** dengan autentikasi terpisah menggunakan **NestJS + GraphQL + PostgreSQL**.

Project ini menerapkan:
- Microservice Architecture
- GraphQL API
- JWT Authentication
- Inter-service authentication (Auth Service → Schedule Service)
- Prisma ORM
- Unit Test & E2E Test
- Docker & Docker Compose

---

## 📐 Arsitektur Sistem (Diagram Sederhana)

```
Client (Web / Mobile / Postman)
        |
        | Authorization: Bearer <JWT>
        v
+---------------------+
|  Schedule Service   |  (Port 3002)
|  - Customer Module  |
|  - Doctor Module    |
|  - Schedule Module  |
+----------+----------+
           |
           | validateToken (GraphQL)
           v
+---------------------+
|    Auth Service     |  (Port 3001)
|  - Register         |
|  - Login            |
|  - Validate Token   |
+---------------------+

Database:
- PostgreSQL (Prisma ORM)
```

---

## 🚀 Cara Menjalankan Project

### 1️⃣ Clone Repository
```bash
git clone <repo-url>
cd project-root
```

---

### 2️⃣ Setup Environment Variables

#### Auth Service (`auth-service/.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
JWT_SECRET=supersecretkey
JWT_EXPIRES=1d
```

#### Schedule Service (`schedule-service/.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/schedule_db
AUTH_SERVICE_URL=http://auth-service:3001/graphql
```

---

### 3️⃣ Jalankan Database Migration
```bash
# Auth Service
cd auth-service
npx prisma migrate dev

# Schedule Service
cd ../schedule-service
npx prisma migrate dev
```

---

### 4️⃣ Jalankan Service (Local)

```bash
# Auth Service
cd auth-service
npm run start:dev

# Schedule Service
cd ../schedule-service
npm run start:dev
```

Akses GraphQL Playground:
- Auth Service → http://localhost:3001/graphql
- Schedule Service → http://localhost:3002/graphql

---

## 🔐 Environment Variables

### Auth Service
| Variable | Deskripsi |
|--------|----------|
| DATABASE_URL | PostgreSQL connection |
| JWT_SECRET | Secret untuk JWT |
| JWT_EXPIRES | Expiry token |

### Schedule Service
| Variable | Deskripsi |
|--------|----------|
| DATABASE_URL | PostgreSQL connection |
| AUTH_SERVICE_URL | Endpoint Auth Service |

---

## 📚 Contoh GraphQL Queries

### Register
```graphql
mutation {
  register(input: {
    email: "test@mail.com"
    password: "123456"
  })
}
```

### Login
```graphql
mutation {
  login(input: {
    email: "test@mail.com"
    password: "123456"
  })
}
```

### Create Customer
```graphql
mutation {
  createCustomer(input: {
    name: "John Doe"
    email: "john@mail.com"
  }) {
    id
    name
  }
}
```

### Create Doctor
```graphql
mutation {
  createDoctor(input: {
    name: "Dr. Strange"
  }) {
    id
    name
  }
}
```

### Create Schedule
```graphql
mutation {
  createSchedule(input: {
    objective: "Consultation"
    customerId: "CUSTOMER_ID"
    doctorId: "DOCTOR_ID"
    scheduledAt: "2026-01-30T09:00:00Z"
  }) {
    id
    objective
  }
}
```

---

## 🧪 Testing

```bash
npm run test
npm run test:e2e
```

---

## 🧠 Teknologi
- NestJS
- GraphQL (Apollo)
- PostgreSQL
- Prisma ORM
- JWT
- Jest
- Docker

---

## 👨‍💻 Author
Backend microservice implementation – production ready architecture.
