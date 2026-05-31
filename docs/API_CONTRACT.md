# API Contract — Adaptive University Student Portal

## Base URL

```
http://localhost:3000/api
```

## Authentication

**Header:** `Authorization: Bearer <jwt_token>`

## Common Response Formats

**Success:**
```json
{ "status": "success", "data": { ... } }
```

**Error:**
```json
{ "status": "error", "message": "string", "code": 400 }
```

---

## 1. Student Endpoints

### 1.1 Get Personalized Dashboard

`GET /student/dashboard`

**Role:** Student

**Response:**
```json
{
  "status": "success",
  "data": {
    "courses": [
      {
        "courseId": "CS101",
        "name": "Programming Fundamentals",
        "progress": 65,
        "nextDeadline": "2026-06-05T23:59:59Z",
        "pendingAssignments": 2
      }
    ],
    "notifications": ["Grade posted for Assignment 2", "Course registration opens June 10"],
    "todoItems": ["Submit Lab 5", "Review lecture 7"]
  }
}
```

### 1.2 Submit Assignment

`POST /student/assignments/submit`

**Request:**
```json
{
  "courseId": "CS101",
  "assignmentId": "asg_456",
  "fileUrl": "https://storage.../assignment.pdf"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "submissionId": "sub_789",
    "message": "Assignment submitted successfully",
    "timestamp": "2026-05-31T10:30:00Z"
  }
}
```

**Error example (unsupported file format):**
```json
{
  "status": "error",
  "message": "Invalid file format. Please upload PDF.",
  "code": 400
}
```

### 1.3 View Grades

`GET /student/grades?semester=Spring2026`

**Response:**
```json
{
  "status": "success",
  "data": {
    "semester": "Spring2026",
    "courses": [
      { "courseId": "CS101", "name": "Programming", "grade": "A", "gpa": 4.0 },
      { "courseId": "MATH201", "name": "Calculus", "grade": "B+", "gpa": 3.3 }
    ],
    "overallGPA": 3.65
  }
}
```

### 1.4 Register for Courses

`POST /student/courses/register`

**Request:**
```json
{
  "courseIds": ["CS205", "ENG102"]
}
```

**Response (success):**
```json
{
  "status": "success",
  "data": {
    "registered": ["CS205", "ENG102"],
    "failed": [],
    "message": "Registration successful"
  }
}
```

**Response (prerequisite / seat error):**
```json
{
  "status": "error",
  "message": "Prerequisites not met for CS205: Missing CS104",
  "code": 422
}
```

### 1.5 Drop Course

`DELETE /student/courses/{courseId}`

**Response:**
```json
{ "status": "success", "message": "Course dropped successfully" }
```

---

## 2. Teacher Endpoints

### 2.1 Upload Course Material

`POST /teacher/courses/{courseId}/materials`

**Request:**
```json
{
  "title": "Lecture 6 - Sorting Algorithms",
  "type": "video",
  "fileUrl": "https://storage.../lecture6.mp4",
  "visibilityDate": "2026-06-02T08:00:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "data": { "materialId": "mat_123", "message": "Material uploaded" }
}
```

### 2.2 Get Gradebook for a Course

`GET /teacher/courses/{courseId}/gradebook`

**Response:**
```json
{
  "status": "success",
  "data": {
    "courseId": "CS101",
    "students": [
      { "studentId": "S1001", "name": "Ayesha Khan", "scores": { "asg1": 85, "midterm": 78 }, "average": 81.5 },
      { "studentId": "S1002", "name": "Bilal Ahmed", "scores": { "asg1": 62, "midterm": 70 }, "average": 66.0 }
    ]
  }
}
```

### 2.3 Enter / Update Grades

`PUT /teacher/courses/{courseId}/grades`

**Request:**
```json
{
  "assignmentId": "asg_456",
  "grades": [
    { "studentId": "S1001", "score": 92 },
    { "studentId": "S1002", "score": 78 }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Grades updated. Flagged 0 students for review."
}
```

### 2.4 Publish Grades

`POST /teacher/courses/{courseId}/publish`

**Response:**
```json
{ "status": "success", "message": "Grades published and visible to students" }
```

---

## 3. Admin Endpoints

### 3.1 Create User (Student / Teacher)

`POST /admin/users`

**Request:**
```json
{
  "role": "student",
  "email": "newstudent@uni.edu",
  "name": "Fatima Zafar",
  "program": "BSCS"
}
```

**Response:**
```json
{
  "status": "success",
  "data": { "userId": "u789", "tempPassword": "Welcome@123" }
}
```

### 3.2 Assign Role / Permission to User

`PATCH /admin/users/{userId}/role`

**Request:**
```json
{
  "role": "teacher",
  "coursePermissions": ["CS101", "CS102"]
}
```

**Response:**
```json
{ "status": "success", "message": "Role and permissions updated" }
```

### 3.3 Deactivate User Account

`DELETE /admin/users/{userId}`

**Response:**
```json
{ "status": "success", "message": "User account deactivated" }
```

### 3.4 Manage Courses (Add / Remove)

`POST /admin/courses`

**Request:**
```json
{
  "courseId": "CS205",
  "name": "Data Structures",
  "credits": 3,
  "teacherId": "t456"
}
```

**Response:**
```json
{ "status": "success", "data": { "courseId": "CS205", "created": true } }
```

---

## 4. Shared Endpoints (All Roles)

### 4.1 Login

`POST /auth/login`

**Request:**
```json
{ "email": "ayesha@uni.edu", "password": "****" }
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "jwt_token_string",
    "role": "student",
    "userId": "S1001",
    "name": "Ayesha Khan"
  }
}
```

### 4.2 Get Current User Profile

`GET /profile`

**Response (role-dependent):**
```json
{
  "status": "success",
  "data": {
    "userId": "S1001",
    "name": "Ayesha Khan",
    "role": "student",
    "email": "ayesha@uni.edu"
  }
}
```

---

## Error Codes Summary

| Code | Meaning |
|------|---------|
| 400  | Bad request (e.g., invalid file format) |
| 401  | Unauthorized (missing / invalid token) |
| 403  | Forbidden (role lacks permission) |
| 404  | Resource not found |
| 422  | Unprocessable entity (e.g., prerequisite failed) |
| 500  | Internal server error |
