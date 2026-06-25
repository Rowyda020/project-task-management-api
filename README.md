# Project Task Management API

REST API for managing projects and tasks with user authentication, role-based access control, and pagination. Users can register, create projects, and manage tasks within those projects. Admins can list all users and access all projects and tasks.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Language | TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Joi |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest + ts-jest |
| Containerization | Docker + Docker Compose |

## API Overview

| Area | Base path | Description |
|---|---|---|
| Health | `GET /health` | Public health check |
| Auth | `/auth` | Register and login (public) |
| Projects | `/projects` | CRUD for projects (authenticated) |
| Tasks | `/projects/:projectId/tasks` | CRUD for tasks within a project (authenticated) |
| Admin | `/admin` | User management (admin only) |
| Docs | `/api-docs` | Swagger UI (public) |

Protected routes require a Bearer token:

```http
Authorization: Bearer <accessToken>
```

## Prerequisites

- Node.js 18+ (22 recommended)
- npm
- PostgreSQL 16 (local install or via Docker)

## Environment Variables

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port for the API |
| `DB_HOST` | Yes | — | PostgreSQL host (`localhost` locally, `db` in Docker Compose) |
| `DB_PORT` | No | `5432` | PostgreSQL port (`5433` if using the Compose DB from your host) |
| `DB_USERNAME` | Yes | — | Database user |
| `DB_PASSWORD` | Yes | — | Database password |
| `DB_NAME` | Yes | — | Database name |
| `NODE_ENV` | No | `development` | Runtime environment |
| `SWAGGER_ENABLED` | No | `true` | Set to `false` to disable Swagger UI |
| `JWT_SECRET` | Yes | — | Secret used to sign JWT access tokens |
| `JWT_EXPIRES_IN` | No | `1d` | Token expiry (e.g. `1d`, `12h`) |
| `BCRYPT_SALT_ROUNDS` | No | `10` | bcrypt cost factor |
| `BOOTSTRAP_ADMIN_EMAIL` | No | — | Email that receives `admin` role on registration |
| `SEED_ADMIN` | No | `false` | Set to `true` to seed an admin user on startup |
| `SEED_ADMIN_EMAIL` | If seeding | — | Email for the seeded admin |
| `SEED_ADMIN_PASSWORD` | If seeding | — | Password for the seeded admin |
| `SEED_ADMIN_NAME` | No | `Admin` | Display name for the seeded admin |

## Running Locally

### Option A — API on your machine, database in Docker

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL:

```bash
docker compose up db -d
```

3. Configure `.env` for the exposed Compose port:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=task_management
```

4. Start the API (migrations run automatically on startup):

```bash
npm run dev
```

The server starts at `http://localhost:3000`. Swagger UI is at `http://localhost:3000/api-docs`.

### Option B — Full stack with Docker Compose

1. Copy and configure `.env`:

```bash
cp .env.example .env
```

2. Optional: enable admin seeding in `.env`:

```env
SEED_ADMIN=true
SEED_ADMIN_PASSWORD=ChangeMe123!
```

3. Start API and database:

```bash
npm run docker:up
```

Docker Compose sets `DB_HOST=db` for the API container. The API is available at `http://localhost:3000`.

Useful commands:

```bash
npm run docker:up:detached   # start in background
npm run docker:down          # stop containers
npm run docker:logs          # follow API logs
```

### Production build (without Docker)

```bash
npm run build
npm start
```

## Database Migrations & Seeds

Schema changes are managed with TypeORM migrations (`synchronize` is disabled). Migrations run automatically when the API starts.

Manual commands:

```bash
npm run migration:run      # apply pending migrations
npm run migration:revert   # undo the last migration
npm run seed               # seed admin user manually
```

Generate a new migration after changing entities:

```bash
npm run migration:generate -- src/database/migrations/YourMigrationName
```

**Existing database from an older `synchronize` setup:** if tables already exist, the initial migration may fail. Either reset the database (`docker compose down -v`) or mark the migration as applied in the `migrations` table.

## Testing

```bash
npm test
```

If Jest runs out of memory on your machine, run tests serially:

```bash
npx jest --runInBand
```

## Assumptions

### Authentication

1. **Access token only — no refresh token**  
   Login returns a single JWT. When it expires, the user must log in again. Refresh tokens, rotation, and revocation are out of scope for now.

2. **Session length: 24 hours by default**  
   `JWT_EXPIRES_IN=1d`. After that the token is rejected with `401 Invalid or expired token`. Adjust per environment (e.g. shorter in production).

3. **Registration does not auto-login**  
   Register returns the user profile only. The client must call `/auth/login` to get a token. This keeps register and login responsibilities separate.

4. **Password rules: min 8 characters with complexity**  
   Joi requires at least one uppercase letter, one lowercase letter, one number, and one special character (`@$!%*?&`). Applied on both register and login.

5. **Passwords hashed with bcrypt (10 salt rounds)**  
   Configurable via `BCRYPT_SALT_ROUNDS`. Plain-text passwords are never stored or returned.

6. **Email is the unique login identifier**  
   One account per email. Duplicate registration returns `409 Email is already registered`.

7. **Invalid login uses a generic error message**  
   `"Invalid email or password"` for both wrong email and wrong password to avoid user enumeration.

8. **Public routes are explicitly allowlisted**  
   Only `/health`, `/auth/*`, and `/api-docs` are public. New routes are protected by default.

### Database

9. **Schema changes use TypeORM migrations**  
   `synchronize` is disabled in all environments. Migrations run automatically on API startup. Use `npm run migration:generate` for new schema changes.

### Projects

10. **Each project belongs to exactly one user** — no shared or team projects.

11. **UUID primary keys** for projects.

12. **Status is required on create** — client must send it; no default to `"in progress"`.

13. **Allowed statuses only** — `"in progress"`, `"completed"`, `"cancelled"`.

14. **Title and description are required** on create (both non-null in DB).

15. **Title max length is 255 characters**.

16. **Hard delete** — no soft delete / `deletedAt`.

17. **No `createdAt` / `updatedAt` on projects** (not exposed or stored yet).

### Roles & Access

18. **Two global roles only** — `admin` and `member`; no custom permissions or per-resource roles.

19. **Registration is always `member`** — except when email matches `BOOTSTRAP_ADMIN_EMAIL` (for the first admin), or when `SEED_ADMIN=true` creates a seeded admin.

20. **Role cannot be self-changed** — admins cannot change their own role (prevents locking yourself out).

21. **Admins create projects under themselves** — creating a project still sets the caller as owner; admins don't assign projects to other users.

22. **Admin access is full read/write** — admins can view and modify any project/task, not read-only.

23. **Role changes require re-login for JWT** — tokens embed `role` at login. After a role change, the user must log in again for the new role to apply (or wait for token expiry).

## Implementation Notes

### Authentication

- All routes except `/health`, `/auth/*`, and `/api-docs` require a valid JWT.
- Tokens are issued on login and include `sub` (user id), `email`, and `role`.
- Passwords are hashed with bcrypt before storage.

### Roles & Access Control

- Two roles: `admin` and `member` (default on registration).
- **Members** can only access projects they own and tasks under those projects.
- **Admins** can access all projects and tasks, and use `/admin` endpoints.
- Admin routes are protected by a roles guard in addition to JWT auth.
- An admin can be bootstrapped in two ways:
  - Register with the email set in `BOOTSTRAP_ADMIN_EMAIL`
  - Set `SEED_ADMIN=true` to create a pre-configured admin on startup (idempotent — skips if the user already exists)

### Pagination & Filtering

- Project and user list endpoints support `page`, `limit`, `sortBy`, and `sortOrder`.
- Task list endpoints also support filtering by `status` and `priority`.

### Project Structure

```
src/
├── auth/          # Registration, login, JWT
├── users/         # User entity, admin endpoints
├── projects/      # Project CRUD
├── tasks/         # Task CRUD (nested under projects)
├── common/        # Guards, DTOs, middleware, error handling
├── config/        # DataSource, Swagger
└── database/      # Migrations and seed scripts
```

### Error Handling

- Validation errors and application errors are returned as JSON with appropriate HTTP status codes via a centralized error filter.
