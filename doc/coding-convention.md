
# **Coding Convention for Project Structure**

## **1. Root Structure**
### **1.1 Configuration & Environment Files**
- `.dockerignore` → Ignore files for Docker builds
- `.eslint.js`, `.eslintignore` → ESLint rules & ignored files
- `.gitignore` → Files to be ignored by Git
- `.prettierignore`, `.prettierrc` → Prettier formatting rules
- `tsconfig.json` → TypeScript compiler configuration
- `tsup.config.ts` → TSUP bundler configuration

### **1.2 Documentation & Dependency Management**
- `README.md` → Project documentation
- `package.json`, `package-lock.json` → Node.js dependencies & scripts
- `jest.config.js` → Jest testing configuration

### **1.3 Deployment & Containerization**
- `Dockerfile` → Docker image configuration
- `docker-compose.yml` → Docker Compose configuration

---

## **2. Project Structure (src/)**
### **2.1 Type Definitions** (`src/@types/`)
- `environment.d.ts` → Type definitions for environment variables
- `global.d.ts` → Global type definitions

### **2.2 API Layer** (`src/api/`)
- **Controllers (`src/api/controllers/`)**: Handles requests and responses
- **Middlewares (`src/api/middlewares/`)**: Authentication, validation, error handling
- **Routes (`src/api/routes/`)**: Defines API endpoints and handlers
- **Services (`src/api/services/`)**: Business logic, database interactions
- **Validations (`src/api/validations/`)**: Input validation logic

---

### **2.3 Common Utilities & Shared Resources** (`src/common/`)
- **Constants (`src/common/constants.ts`)**
- **Enums (`src/common/enums/`)**: Predefined values for consistency
- **Interfaces (`src/common/interfaces/`)**: TypeScript interfaces
- **Types (`src/common/types.ts`)**: General type definitions

---

### **2.4 Configuration Files** (`src/configs/`)
- `app-config.ts` → Application-level configurations
- `path.ts` → Path management

---

### **2.5 Loaders (Initialization Modules)** (`src/loaders/`)
- `express.loader.ts` → Express app loader
- `redis.loader.ts` → Redis connection setup
- `websocket.loader.ts` → WebSocket initialization

---

### **2.6 Repositories (Database Layer)** (`src/repositories/`)
- Handles direct interactions with the database (e.g., `prisma.ts`, `user.repository.ts`)

---

### **2.7 Response Handling** (`src/responses/`)
- `error-handler.ts` → Centralized error handling
- `client-errors/` → Common client error responses (e.g., `bad-request.ts`, `unauthorized.ts`)
- `server-errors/` → Internal server error handling

---

### **2.8 Shared Modules & Utilities** (`src/shared/`)
- `logger/` → Logging utilities
- `utils/` → Helper functions

---

## **3. Storage (storage/)**
- `assets/` → Main and temporary asset storage
- `statics/` → Static files

---

## **4. Setup Scripts (setup/)**
- `setup-project.sh` → Script to initialize the project

---

### **Coding Standards**
1. **File Naming**:
    - Use `camelCase` for variables and functions
    - Use `PascalCase` for class names and TypeScript interfaces
    - Use `kebab-case` for file names

2. **Code Formatting**:
    - Follow Prettier & ESLint rules
    - Use 2-space indentation

3. **Project Architecture Principles**:
    - Follow **Separation of Concerns (SoC)**
    - Ensure **Scalability & Maintainability**
    - Adhere to **SOLID principles**

