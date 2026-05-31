# Backend Requirements — Adaptive University Student Portal

> **Course:** Human Computer Interaction — Assignment 3
> **Group Members:** Eman Razzaq (4679-FOC/BSSE/F23), Maliha Zaheer (4676-FOC/BSSE/F23)
> **Submitted to:** Maam Talat Ambreen

---

## Tech Stack

| Concern               | Choice                                |
| --------------------- | ------------------------------------- |
| Runtime               | Node.js (NestJS 11)                   |
| Language              | TypeScript 5                          |
| API Style             | REST (JSON)                           |
| Auth Framework        | Passport (`@nestjs/passport`)         |
| JWT Strategy          | `AuthGuard("access")` for protected routes |
| ORM                   | Prisma                                |
| Database              | Supabase (PostgreSQL)                 |
| Validation            | `class-validator` + `ValidationPipe`  |
| Testing               | Jest (unit) + SuperTest (e2e)         |

---

## Personas (Reference)

The backend must support the workflows of these target users:

| Persona          | Role    | Technical Skill | Key Needs                                      |
| ---------------- | ------- | --------------- | ---------------------------------------------- |
| Ayesha Khan      | Student | Moderate        | Simple access to assignments, grades, deadlines |
| Ahmed Ali        | Teacher | Good           | Quick uploading, efficient grading              |
| Admin (unnamed)  | Admin   | High            | User/course management, system maintenance      |

---

## Architecture — Feature-First Clean Architecture

The entire backend is organized by **feature modules**. Each module is self-contained with its own Clean Architecture layers. Shared infrastructure lives in `src/core/`.

```
src/features/<module-name>/
├── <module-name>.module.ts           # NestJS @Module definition
├── controllers/
│   └── <entity>.controller.ts        # Route handlers (AuthGuard("access"))
├── application/
│   ├── <entity>.service.ts           # Business logic
│   └── dtos/
│       ├── <action>-request.dto.ts   # class-validator rules
│       └── <action>-response.dto.ts  # Response shape
├── domain/
│   ├── <entity>.repository.interface.ts  # Abstract class (Injectable)
│   ├── types.ts                       # Action params / shaped types
│   └── entities/
│       └── <entity>.entity.ts         # Domain entity (no Prisma dep)
└── infrastructure/
    └── <entity>.repository.ts         # Prisma implementation
```

### Dependency Direction

```
controllers/  →  application/  →  domain/  ←  infrastructure/
```

- `domain/` must never import from `application/`, `controllers/`, or `infrastructure/`
- `application/` must never import from `infrastructure/` — inject abstract interfaces only
- `controllers/` must never import from `infrastructure/` — always go through the service layer

### Naming Conventions

- Route prefix is plural: `students`, `teachers`, `admin`, `auth`
- Every protected controller handler uses `@UseGuards(AuthGuard("access"))` and extracts `req.user!.id`
- Return shape: `{ status: "success", data?: T }` or `{ status: "error", message: string, code: number }`
- Every controller handler wraps logic in `try/catch` and calls `this.errorHandlerService.handleError(error)` in the catch block

---

## Authentication & Authorization

### JWT Strategy

- Strategy name: `"access"` (defined in `core/infrastructure/jwt-strategies/`)
- Guard usage:
  ```typescript
  @UseGuards(AuthGuard("access"))
  ```
- The authenticated user's UUID is available at `req.user!.id`
- The user's role is available at `req.user!.role`

### Role-Based Access

Three roles exist, enforced at the route level — each user sees only relevant options:

| Role    | Prefix Pattern        |
| ------- | --------------------- |
| Student | `/student/*`          |
| Teacher | `/teacher/*`          |
| Admin   | `/admin/*`            |
| All     | `/auth/*`, `/profile` |

- Admin endpoints (`/admin/*`) must check that `req.user!.role === "admin"`
- Teacher endpoints (`/teacher/*`) must check that `req.user!.role === "teacher"` or `"admin"`
- Student endpoints (`/student/*`) must check that `req.user!.role === "student"` or `"admin"`

### Module: Auth

| Endpoint       | Method | Auth Required | Description                        |
| -------------- | ------ | ------------- | ---------------------------------- |
| `POST /auth/login` | POST | No           | Returns JWT access token + role + userId |

---

## Database — Prisma + Supabase

- Prisma schema lives in `prisma/schema.prisma`
- Supabase connection string is provided via `DATABASE_URL` env variable
- Prisma client is provided via a global `PrismaService` (`@Global()`)
- Transaction support: `prisma.$transaction(async (tx) => { ... })` in services
- Repository methods accept optional `tx?: Prisma.TransactionClient` as the last parameter
- Every repository has a private `mapToEntity(raw: any): Entity` method to convert Prisma return types to domain entities

---

## Feature Modules — Mapped to Use Cases

### 1. Students Feature

Supports use cases: *View Personalized Dashboard*, *Submit Assignment*, *View Grades*, *Register/Drop Courses*

| Endpoint                             | Method | Auth Required | Description |
| ------------------------------------ | ------ | ------------- | ----------- |
| `GET /student/dashboard`             | GET    | Yes           | Personalized landing page with course progress, notifications, to-do items (Use Case 1) |
| `GET /student/courses/catalog`       | GET    | Yes           | Browse/search available courses for enrollment (Use Case 2) |
| `POST /student/courses/register`     | POST   | Yes           | Enroll in courses — validates prerequisites and seat availability (Use Case 2) |
| `DELETE /student/courses/{courseId}` | DELETE | Yes           | Drop a course (Use Case 2) |
| `POST /student/assignments/submit`   | POST   | Yes           | Upload assignment file — rejects unsupported formats with clear error message (Use Case 1, Scenario 2) |
| `GET /student/grades`                | GET    | Yes           | View grades by semester (Use Case 1) |

**Validation rules for assignment submission:**
- Accept only `.pdf` files (reject unsupported formats)
- Return clear error: `"Invalid file format. Please upload PDF."` (HCI Scenario 2)
- Return success confirmation message on successful upload (HCI Scenario 1)

### 2. Teachers Feature

Supports use cases: *Manage Course Content*, *Enter Student Grades*

| Endpoint                                   | Method | Auth Required | Description |
| ------------------------------------------ | ------ | ------------- | ----------- |
| `GET /teacher/courses/{courseId}/materials` | GET   | Yes           | List uploaded materials for a course |
| `POST /teacher/courses/{courseId}/materials` | POST | Yes          | Upload lectures, assignments, videos — with visibility date and access permissions (Use Case 3) |
| `PUT /teacher/courses/{courseId}/materials/{materialId}` | PUT | Yes | Edit material details / visibility |
| `DELETE /teacher/courses/{courseId}/materials/{materialId}` | DELETE | Yes | Remove material |
| `POST /teacher/courses/{courseId}/assignments` | POST | Yes | Create assignment with due date (Use Case 3 — assign tasks) |
| `GET /teacher/courses/{courseId}/gradebook` | GET   | Yes           | View all student scores and averages (Use Case 4) |
| `PUT /teacher/courses/{courseId}/grades`    | PUT    | Yes           | Enter/update individual or batch grades — auto-calculates course average, flags underperforming students for review (Use Case 4) |
| `POST /teacher/courses/{courseId}/publish`  | POST   | Yes           | Publish grades to make them visible to students (Use Case 4) |

**Business logic for grade entry (Use Case 4):**
- Calculate updated GPA / course average after each entry
- Auto-trigger "Flag for Review" if a student's performance drops below threshold (extend relationship)

**Business logic for course materials (Use Case 3):**
- Support visibility dates (schedule when content appears to students)
- Support access permissions (which students/groups can view)
- Update course repository for all enrolled students

### 3. Admin Feature

Supports use case: *Manage Users and Permissions*

| Endpoint                         | Method | Auth Required | Description |
| -------------------------------- | ------ | ------------- | ----------- |
| `POST /admin/users`              | POST   | Yes           | Create new student/teacher profiles (Use Case 5) |
| `PATCH /admin/users/{userId}/role` | PATCH | Yes         | Assign roles and course-level permissions (Use Case 5) |
| `DELETE /admin/users/{userId}`    | DELETE | Yes           | Deactivate accounts (graduated/former staff) (Use Case 5) |
| `GET /admin/users`               | GET    | Yes           | List all users with roles |
| `POST /admin/courses`            | POST   | Yes           | Add new course with teacher assignment (Use Case 5) |
| `DELETE /admin/courses/{courseId}` | DELETE | Yes         | Remove a course (Use Case 5) |

**Security considerations (Use Case 5):**
- Ensure users can only see information relevant to their role
- Data privacy must be maintained across all operations

### 4. Profile Feature (Shared)

| Endpoint      | Method | Auth Required | Description |
| ------------- | ------ | ------------- | ----------- |
| `GET /profile` | GET   | Yes           | Current user profile (role-dependent) |

---

## Error Handling

- **Controllers**: Wrap every handler in `try/catch`, throw `this.errorHandlerService.handleError(error)` in catch
- **Services**: Throw NestJS exceptions directly:
  - `NotFoundException` — resource not found
  - `BadRequestException` — invalid input / business rule violation (e.g., unsupported file format)
  - `ConflictException` — duplicate resource
- **ErrorHandlerService** (from `ErrorHandlerModule`) converts domain errors to appropriate `HttpException`
- **ValidationPipe** (global in `main.ts`) automatically returns 400 for DTO validation failures
- **Error messages must be clear and simple** (HCI Design Goal #4 — minimize errors, Design Goal #5 — feedback after every action)

### HTTP Error Codes

| Code | Meaning                                    |
| ---- | ------------------------------------------ |
| 400  | Bad request (invalid input, unsupported file format) |
| 401  | Unauthorized (missing / invalid token)     |
| 403  | Forbidden (role lacks permission)          |
| 404  | Resource not found                         |
| 422  | Unprocessable entity (prerequisite failed) |
| 500  | Internal server error                      |

---

## Core Modules (Shared Infrastructure)

| Module / Service           | Scope     | Purpose                         |
| -------------------------- | --------- | ------------------------------- |
| `PrismaService`            | `@Global` | Prisma ORM client              |
| `ErrorHandlerService`      | Imported  | Error-to-HTTP-exception mapping |
| `JwtStrategy`              | Imported  | Passport JWT "access" strategy  |
| `IHashingService`          | `@Global` | Password hashing               |
| `IEmailService`            | `@Global` | Email notifications            |
| `SupabaseClientService`    | `@Global` | Supabase client (storage, etc.) |

### Module Registration Rules

1. Every feature module imports `ErrorHandlerModule`
2. Every domain interface is registered with `{ provide: IInterface, useClass: ConcreteImpl }`
3. Cross-feature dependencies are explicitly provided in the consuming module (e.g., `IGlobalUserRepository`)
4. `@Global()` modules are available without explicit import

---

## Configuration & Environment

| Variable              | Description                        |
| --------------------- | ---------------------------------- |
| `DATABASE_URL`        | Supabase PostgreSQL connection     |
| `JWT_SECRET`          | Secret for signing access tokens   |
| `JWT_EXPIRES_IN`      | Access token expiry (e.g. `15m`)   |
| `PORT`                | Server port (default 3000)         |

---

## Testing

- **Unit tests**: `*.spec.ts` files adjacent to implementation (Jest)
- **E2E tests**: `test/` directory (SuperTest + NestJS testing utilities)
- Run: `npm test` (unit), `npm run test:e2e` (e2e)

---

## References

The following HCI references inform the interaction design principles applied to this backend:

1. Dix, A., Finlay, J., Abowd, G. D., & Beale, R. (2004). *Human-Computer Interaction*. Pearson Education.
2. Preece, J., Rogers, Y., & Sharp, H. (2015). *Interaction Design: Beyond Human-Computer Interaction*. John Wiley & Sons.
3. Norman, D. (2013). *The Design of Everyday Things*. Basic Books.
4. Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
