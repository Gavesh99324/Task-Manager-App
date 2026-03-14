# TaskFlow — Task Manager Application

A full-stack, production-ready task management application built with **Spring Boot 3** (backend) and **React 18** (frontend). Supports JWT authentication, task CRUD, user assignment, filtering, pagination, search, and a live dashboard with charts.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Database Choice](#database-choice)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)

---

## Technology Stack

| Layer    | Technology                                                               |
| -------- | ------------------------------------------------------------------------ |
| Backend  | Java 17, Spring Boot 3.2, Spring Security, Spring Data MongoDB, Maven    |
| Database | MongoDB Atlas (Spring Data MongoDB / MongoTemplate)                      |
| Auth     | JWT (JJWT 0.12.x), BCrypt password hashing                               |
| Frontend | React 18, Vite, React Router v6, Redux Toolkit, Axios                    |
| UI       | Tailwind CSS 3, MUI 5, Recharts, react-hot-toast                         |

---

## Database Choice

**MongoDB Atlas** was chosen for the following reasons:

1. **Schema flexibility** — Task documents can evolve freely (add fields, store nested objects) without migration scripts, making iteration fast.
2. **Native document model** — Tasks are naturally self-contained documents. Embedding `createdBy` info directly on the task avoids JOINs and reduces round-trips.
3. **Spring Data MongoDB** — First-class Spring Boot support via `MongoRepository` and `MongoTemplate` for complex filtered queries with the `Criteria` API.
4. **MongoDB Atlas free tier** — Zero-cost cloud-hosted cluster with built-in replication, monitoring, and Atlas Search — ideal for this assessment.
5. **Horizontal scalability** — MongoDB shards natively, making it a natural choice should the task volume grow significantly beyond what a single relational instance handles.
6. **`@CreatedDate` auditing** — Spring Data's `@EnableMongoAuditing` handles `createdAt` auto-population cleanly, the same way JPA's `@CreationTimestamp` did.

---

## Project Structure

```
Task Manager App/
├── backend/                       # Spring Boot Maven project
│   └── src/main/java/com/taskmanager/
│       ├── config/                # Security, CORS configuration
│       ├── controller/            # REST controllers (Auth, Tasks, Dashboard)
│       ├── dto/                   # Request / Response DTOs
│       │   ├── request/
│       │   └── response/
│       ├── enums/                 # TaskStatus, TaskPriority
│       ├── exception/             # Custom exceptions + GlobalExceptionHandler
│       ├── model/                 # MongoDB Documents (User, Task)
│       ├── repository/            # Spring Data MongoDB repositories + MongoTemplate impl
│       ├── security/              # JWT utility, filter, UserDetailsService
│       └── service/               # Business logic (Auth, Task, Dashboard)
├── frontend/                      # Vite + React project
│   └── src/
│       ├── app/                   # Redux store configuration
│       ├── features/              # Redux slices (auth, tasks)
│       ├── components/
│       │   ├── common/            # Layout, Navbar, Sidebar, dialogs, spinners
│       │   └── tasks/             # TaskCard, TaskForm, TaskFilters
│       ├── pages/                 # Route-level page components
│       ├── services/              # Axios API client
│       └── utils/                 # Formatting helpers, constants
└── README.md
```

---

## Prerequisites

- **Java 17+** (`java -version`)
- **Maven 3.8+** (or use the included Maven wrapper: `./mvnw`)
- **MongoDB Atlas account** — free tier at [cloud.mongodb.com](https://cloud.mongodb.com) (or a local MongoDB 6+ instance)
- **Node.js 18+** & **npm 9+** (`node -v`, `npm -v`)

---

## Running Locally

### 1. Clone & enter the repository

```bash
git clone https://github.com/Gavesh99324/Task-Manager-App.git
cd "Task-Manager-App"
```

### 2. Set up MongoDB Atlas

1. Sign in at [cloud.mongodb.com](https://cloud.mongodb.com) and create a free **M0** cluster.
2. Under **Database Access**, create a database user (e.g. `taskmanager_user`).
3. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development).
4. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskmanager?retryWrites=true&w=majority
   ```

> **Local alternative:** Install MongoDB 6+ locally and use `mongodb://localhost:27017/taskmanager`.

### 3. Configure backend environment

Create a local properties file from the provided example:

```bash
cp backend/src/main/resources/application-local.properties.example \
   backend/src/main/resources/application-local.properties
```

Then open `application-local.properties` and fill in your values:

```properties
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskmanager?retryWrites=true&w=majority
app.jwt.secret=<any-long-random-string>
```

> **Environment variable alternative:** You can skip the file and instead export `MONGODB_URI` and `JWT_SECRET` in your terminal before running the backend.

| Variable               | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `MONGODB_URI`          | Full MongoDB Atlas connection string (required)       |
| `MONGODB_DB`           | Database name — default `taskmanager`                 |
| `JWT_SECRET`           | HS256 signing secret (min 32 chars)                   |
| `JWT_EXPIRATION_MS`    | Token TTL in milliseconds — default `86400000` (24 h) |
| `CORS_ALLOWED_ORIGINS` | Allowed origins — default `http://localhost:5173`     |

### 4. Build & start the backend

```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The API will be available at **http://localhost:8080/api**

### 5. Configure & start the frontend

```bash
cd frontend
cp .env.example .env          # Already pre-filled for local development
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

---

## API Endpoints

### Authentication — `/api/auth`

| Method | Path             | Auth | Description         |
| ------ | ---------------- | ---- | ------------------- |
| POST   | `/auth/register` | No   | Register a new user |
| POST   | `/auth/login`    | No   | Login, returns JWT  |

### Tasks — `/api/tasks`

All task endpoints require `Authorization: Bearer <token>`.

| Method | Path                   | Description                                  |
| ------ | ---------------------- | -------------------------------------------- |
| GET    | `/tasks`               | List tasks (paginated, filterable, sortable) |
| GET    | `/tasks/{id}`          | Get a single task                            |
| POST   | `/tasks`               | Create a new task                            |
| PUT    | `/tasks/{id}`          | Update all fields of a task                  |
| PATCH  | `/tasks/{id}/complete` | Mark task as DONE, records `completedAt`     |
| DELETE | `/tasks/{id}`          | Delete a task                                |

#### Query Parameters for `GET /tasks`

| Parameter       | Type    | Description                                        |
| --------------- | ------- | -------------------------------------------------- |
| `status`        | Enum    | `TODO` / `IN_PROGRESS` / `DONE`                    |
| `priority`      | Enum    | `LOW` / `MEDIUM` / `HIGH`                          |
| `assigneeEmail` | String  | Filter by assignee email (exact, case-insensitive) |
| `search`        | String  | Keyword search in task title                       |
| `sortBy`        | String  | `createdAt` (default) / `dueDate` / `priority`     |
| `sortDir`       | String  | `asc` / `desc` (default)                           |
| `page`          | Integer | Zero-based page index (default: `0`)               |
| `size`          | Integer | Page size (default: `10`, max: `100`)              |

### Dashboard — `/api/dashboard`

| Method | Path         | Auth | Description                            |
| ------ | ------------ | ---- | -------------------------------------- |
| GET    | `/dashboard` | Yes  | Aggregated statistics for current user |

### Consistent Response Shape

**Success:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... },
  "timestamp": "2025-06-01T10:30:00"
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Title is required", "Priority is required"],
  "timestamp": "2025-06-01T10:30:00"
}
```

---

## Data Model

### `users` collection

| Field        | Type      | Constraints        |
| ------------ | --------- | ------------------ |
| `_id`        | ObjectId  | PK, auto-generated |
| `email`      | String    | required, unique index |
| `name`       | String    | required           |
| `password`   | String    | required (BCrypt)  |
| `created_at` | Date      | auto-set on insert |

### `tasks` collection

| Field            | Type     | Constraints                        |
| ---------------- | -------- | ---------------------------------- |
| `_id`            | ObjectId | PK, auto-generated                 |
| `title`          | String   | required                           |
| `description`    | String   | optional                           |
| `status`         | String   | required — `TODO/IN_PROGRESS/DONE` |
| `priority`       | String   | required — `LOW/MEDIUM/HIGH`       |
| `priority_order` | Integer  | `1/2/3` — numeric sort helper      |
| `due_date`       | Date     | optional                           |
| `assignee_email` | String   | optional, indexed                  |
| `assignee_name`  | String   | optional                           |
| `created_at`     | Date     | auto-set on insert                 |
| `completed_at`   | Date     | set when status → DONE             |
| `created_by_id`  | String   | indexed — ObjectId of creator      |
| `created_by_name`| String   | denormalized from User             |
| `created_by_email`| String  | denormalized from User             |

---

## Design Decisions

1. **Tasks are scoped to their creator.** Each user can only view, edit, and delete tasks they created. The `created_by_id` field is indexed on the `tasks` collection, and ownership is enforced in `TaskService`.

2. **Creator info is denormalized onto the task document.** `created_by_id`, `created_by_name`, and `created_by_email` are stored directly on each task. This follows the MongoDB document model — reads are fast and do not require a separate lookup for the creator's name.

3. **`priority_order` integer field for reliable sort.** MongoDB stores enums as strings (`LOW`, `MEDIUM`, `HIGH`). Alphabetical sort would produce `HIGH < LOW < MEDIUM` — wrong. A `priority_order` field (LOW=1, MEDIUM=2, HIGH=3) is maintained automatically by `TaskService` and used as the sort target.

4. **Complex filtering uses `MongoTemplate` + `Criteria` API.** `TaskRepositoryImpl` builds dynamic `Criteria` chains to support any combination of status, priority, assignee, and search filters — equivalent to the JPQL dynamic query replaced from the JPA version.

5. **`PATCH /tasks/{id}/complete`** is a dedicated endpoint for the "mark complete" action, keeping the state transition semantic explicit and auditable.

6. **Global exception handler** centralises all error responses, ensuring the frontend always receives the same `ApiResponse` envelope regardless of which layer throws.

7. **JWT is stateless.** No server-side session. Token expiry is configurable via `app.jwt.expiration-ms` in `application.properties`.

8. **Debounced search on the frontend.** The search input waits 350 ms after the user stops typing before issuing a request, preventing unnecessary API calls.

9. **Redux Toolkit** is used for all async state management. Optimistic UI updates are applied for complete/delete operations so the list feels instant.

10. **Tailwind + MUI together.** Tailwind handles layout, spacing, and custom component styles; MUI provides accessible icon components, date pickers, and dialog primitives without heavy theming.

---

## Known Limitations & Future Improvements

- **No email verification.** Registration accepts any valid email string without sending a confirmation email.
- **No refresh token.** The JWT expires in 24 h and the user must log in again. A proper refresh-token rotation mechanism would be the next step.
- **No file attachments.** Task attachments (PDFs, images) are out of scope but could be added with an S3 / MinIO integration.
- **Single-user task ownership.** Users cannot share or collaborate on tasks. A team/workspace model would extend this to multi-user collaboration.
- **No real-time updates.** If two users share access (future feature), changes from one session are not pushed to the other. WebSocket / SSE would address this.
- **Test coverage.** Unit tests for the service layer and integration tests for the controllers would improve confidence — omitted here for brevity.
- **Docker Compose setup.** A `docker-compose.yml` covering a local MongoDB instance + Spring Boot + the React build would make the project zero-effort to spin up without needing an Atlas account.
