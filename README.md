# MongoDB Student Management System

## Practical No. 11
Build a mini-project in MongoDB to implement a real-life scenario.

## Technologies
- MongoDB
- Node.js
- Express.js
- Mongoose
- HTML/CSS/JavaScript

## Features
- Add student
- View students
- Search students
- Update student
- Delete student
- MongoDB aggregation dashboard
- Branch-wise student statistics
- Average/highest/lowest marks
- Indexed student ID

## Requirements
1. Install MongoDB Community Server and Node.js.
2. Start MongoDB.
3. Open this project folder in VS Code.
4. Run:

```bash
npm install
```

5. Copy `.env.example` to `.env`.
6. For sample data run:

```bash
npm run seed
```

7. Start the application:

```bash
npm start
```

8. Open:

http://localhost:5000

## Main MongoDB Database

StudentManagement

## Collection

students

## Important API routes

GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/stats
