# Module Architecture — Backend (Feature-First)

This project follows a **feature-first architecture**: code is grouped by business capability (feature), not by technical layer. Each feature is a self-contained module with its own Clean Architecture layers (`controllers/`, `application/`, `domain/`, `infrastructure/`). Shared cross-cutting concerns live in `core/`, and features communicate through core abstractions — never by importing each other's internals.

## Module Structure

Every feature module follows the same layout:

```
src/features/<module-name>/
├── <module-name>.module.ts          # NestJS @Module definition
├── README.md                        # API reference (optional)
├── controllers/
│   └── <entity>.controller.ts       # Route handlers
├── application/
│   ├── <entity>.service.ts          # Business logic
│   └── dtos/
│       ├── <action>-request.dto.ts  # Validation rules (class-validator)
│       └── <action>-response.dto.ts # Response shapes
├── domain/
│   ├── <entity>.repository.interface.ts  # Abstract persistence contract
│   ├── types.ts                      # Action-specific types/params
│   └── entities/
│       └── <entity>.entity.ts        # Domain entity type/class
└── infrastructure/
    └── <entity>.repository.ts        # Prisma persistence implementation
```

### Conventions
- **No sub-entities**: If a module has multiple related entities (e.g., gym has `Gym` + `Plan`), keep them under the **same module** with parallel files (`gym.service.ts`, `plan.service.ts`; `gym.controller.ts`, `plan.controller.ts`; etc.).
- **No `utils/` folder** unless the utility is non-trivial and truly module-specific (e.g., auth OTP generation).
- **No `interfaces/` folder** — controllers go in `controllers/`, not `interfaces/`.

### Strict Dependency Direction

Dependencies must always point **inward** toward the domain layer. Violations are not allowed:

```
controllers/  →  application/  →  domain/  ←  infrastructure/
```

| Direction | Allowed? | Rule |
|---|---|---|
| `controllers/` → `application/` | ✅ | Controllers call services |
| `controllers/` → `domain/` | ✅ | Controllers may reference domain types |
| `application/` → `domain/` | ✅ | Services inject domain interfaces |
| `infrastructure/` → `domain/` | ✅ | Repositories implement domain interfaces |
| `domain/` → anything | ❌ | NEVER import from application, controllers, or infrastructure |
| `application/` → `infrastructure/` | ❌ | NEVER import concrete repos; inject abstract interfaces instead |
| `controllers/` → `infrastructure/` | ❌ | NEVER bypass the service layer |
| `infrastructure/` → `application/` | ❌ | NEVER import services; infra only implements domain interfaces |

---

## Layer Rules

### Controllers (`controllers/`)
- Route prefix matches the resource (plural): `gyms`, `auth`, `attendance`, `products`
- Constructor injects **both** the service and `ErrorHandlerService`:
  ```typescript
  constructor(
    private readonly gymService: GymService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}
  ```
- Every handler follows this exact pattern:
  ```typescript
  @Post()
  @UseGuards(AuthGuard("access"))
  async create(@Body() dto: CreateDto, @Req() req: Request) {
    try {
      await this.gymService.create(dto, req.user!.id);
      return { message: "Created successfully" };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }
  ```
- Return shape is always `{ message: string, data?: T }`.
- Use `@UseGuards(AuthGuard("access"))` for JWT-protected endpoints.
- Extract `userId` from `req.user!.id`.

### Application Service (`application/`)
- Injects **domain repository interfaces** (abstract classes), **never** concrete infrastructure:
  ```typescript
  constructor(
    private readonly gymRepository: IGymRepository,
    private readonly globalUserRepository: IGlobalUserRepository,
  ) {}
  ```
- Business logic lives here — validation, orchestration, transaction management.
- For multi-repo operations, use `prisma.$transaction(async (tx) => { ... })`.
- Pass `tx` to repository methods that accept it as optional last parameter.
- Throw NestJS exceptions (`NotFoundException`, `BadRequestException`) from `@nestjs/common` — do NOT use generic `Error`.

### Domain (`domain/`)
- **Repository interface**: `abstract class` with `@Injectable()` decorator for NestJS DI:
  ```typescript
  @Injectable()
  export abstract class IGymRepository {
    abstract createGym(params: CreateGymType): Promise<GymEntity>;
    abstract getGym(gymId: string): Promise<GymEntity | null>;
    // ...
  }
  ```
- **Entity types**: Simple TypeScript types or classes — no Prisma dependency.
- **Types file** (`types.ts`): Parameter/shape types used across layers (e.g., `CreateGymType`, `UpdateGymType`).
- If the repository should serve as a global cross-feature contract, extend the core interface:
  ```typescript
  export abstract class IGymRepository implements IGlobalGymRepository { ... }
  ```

### Infrastructure (`infrastructure/`)
- `@Injectable()` class implementing the domain interface.
- Transaction support pattern:
  ```typescript
  async createGym(params: CreateGymType, tx?: Prisma.TransactionClient): Promise<GymEntity> {
    const client = tx ?? prisma;
    const created = await client.gym.create({ data: { ... } });
    return this.mapToEntity(created);
  }
  ```
- Private `mapToEntity(gym: any): GymEntity` converts Prisma return types to domain entities.
- Use Prisma client from `prisma/prisma.service.ts` or the shared `prisma` singleton.

### DTOs (`application/dtos/`)
- Use `class-validator` decorators for validation:
  ```typescript
  export class CreateGymRequestDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  }
  ```
- Applied via `ValidationPipe` (global in `main.ts`).

---

## Module Registration (`<module-name>.module.ts`)

Every module imports `ErrorHandlerModule` and registers its service + repository bindings:

```typescript
@Module({
  imports: [ErrorHandlerModule],
  providers: [
    GymService,
    PlanService,
    { provide: IGymRepository, useClass: GymRepository },
    { provide: IPlanRepository, useClass: PlanRepository },
    // Cross-feature dependency:
    { provide: IGlobalUserRepository, useClass: UsersRepositoryImpl },
  ],
  controllers: [GymController, PlanController],
})
```

### Rules
1. **Always** import `ErrorHandlerModule`.
2. Register every domain interface → concrete implementation pair with `{ provide, useClass }`.
3. Register cross-feature dependencies explicitly (e.g., `IGlobalUserRepository`).
4. Use `exports` only if other modules need to inject this module's service.
5. `@Global()` modules (`HashingServiceModule`, `EmailServiceModule`, `SupabaseModule`) are available without explicit import.

---

## Cross-Module Communication

### Via Core Interfaces (Preferred)
Define an interface in `src/core/domain/interfaces/`, implement it in a feature module, and provide it in the consuming module's providers:

| Global Interface | Location | Implemented By |
|---|---|---|
| `IGlobalUserRepository` | `core/domain/interfaces/user.interface.ts` | `UsersRepositoryImpl` (users feature) |
| `IGlobalGymRepository` | `core/domain/interfaces/gym.interface.ts` | `GymRepository` (gym feature) |
| `IGlobalMembershipService` | `core/domain/interfaces/membership.interface.ts` | `PlanSubscriptionService` |

Wiring example:
```typescript
// In gym.module.ts:
providers: [
  { provide: IGlobalUserRepository, useClass: UsersRepositoryImpl },
]
```

### Via Direct Module Import
For feature-to-feature service access (e.g., users importing plan-subscription):
```typescript
// In users.module.ts:
imports: [ErrorHandlerModule, PlanSubscriptionModule],
```

### Via Core Infrastructure
- `ErrorHandlerService` — every module imports `ErrorHandlerModule`
- `IHashingService` — `@Global()`, inject directly
- `IEmailService` — `@Global()`, inject directly
- `SupabaseClientService` — `@Global()`, inject directly
- `JwtStrategy` — import in `providers` of the consuming module

---

## Error Handling

- Wrap every controller handler in try/catch.
- Throw `this.errorHandlerService.handleError(error)` in catch.
- `ErrorHandlerService` converts to appropriate `HttpException` (NestJS built-in).
- In services, throw NestJS exceptions directly:
  - `NotFoundException` — resource not found
  - `BadRequestException` — invalid input / business rule violation
  - `ConflictException` — duplicate resource

---

## Auth Guard Usage

```typescript
import { AuthGuard } from "@nestjs/passport";
import { UseGuards } from "@nestjs/common";

@UseGuards(AuthGuard("access"))     // Standard JWT (access token)
@UseGuards(AuthGuard("invitation")) // Invitation token (used in gym invites)
```

- `req.user!.id` gives the authenticated user's UUID.
- Guard strategies are defined in `core/infrastructure/jwt-strategies/`.

---
