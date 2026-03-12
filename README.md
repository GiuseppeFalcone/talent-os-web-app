# TalentOS Web App

> Angular frontend for TalentOS, providing authentication, role-based navigation, domain administration, user management, CV management, and employee views through the BFF API.

## Overview

**TalentOS Web App** is a standalone Angular 20 application that serves as the user-facing portal of the TalentOS ecosystem.

It integrates with the TalentOS BFF (`/api/bff-web-app`) for authentication and business workflows, and uses PrimeNG + Tailwind CSS for a modern component-driven UI.

The application is organized by domains (auth, dashboard, CV, users, domains, employees) and uses lazy-loaded route components, HTTP interceptors, and role-aware route access control.

## Key Features

- **Authentication Flow**: Login, password reset, logout, and automatic token refresh support
- **Role-Based Access Control**: Guarded routes with role constraints (Admin, SuperAdmin, Manager, Employee)
- **Domain Management**: CRUD operations for domains and domain options
- **User Management**: Search, create, update, patch, delete users, and password reset
- **CV Management**: Create, update, list, and delete curriculum data with filtering
- **Employee View**: Manager-focused employee and curriculum overview with filters
- **Lazy-Loaded Screens**: Route-level component lazy loading for better startup performance
- **HTTP Pipeline**: Centralized auth interceptor with JWT injection and refresh handling
- **Reactive UI State**: Angular signals and computed state for predictable local state updates
- **UI Foundation**: PrimeNG 20 components with Tailwind 4 utility styling

## Technology Stack

| Component            | Technology                | Version   |
| -------------------- | ------------------------- | --------- |
| **Framework**        | Angular                   | 20.3.x    |
| **Language**         | TypeScript                | 5.9.x     |
| **UI Components**    | PrimeNG                   | 20.3.x    |
| **Theme System**     | @primeng/themes           | 20.3.x    |
| **Styling**          | Tailwind CSS              | 4.1.x     |
| **Reactive Library** | RxJS                      | 7.8.x     |
| **Build/Serve Tool** | Angular CLI / Angular Dev | 20.3.x    |
| **Unit Test Runner** | Karma + Jasmine           | 6.4 / 5.9 |

## Project Structure

```text
src/
├── app/
│   ├── app.config.ts                    # App-wide providers (router, http, interceptor, PrimeNG)
│   ├── app.routes.ts                    # Route definitions + role-based guards
│   ├── auth/                            # Login, forgot-password, guard, interceptor, auth client/service
│   ├── dashboard/                       # User dashboard and profile-oriented entry views
│   ├── manage-domain/                   # Domain and domain-option management UI/client/service/models
│   ├── manage-user/                     # User administration UI/client/service/models
│   ├── your-cv/                         # CV management and editing flows
│   ├── your-employee/                   # Employee and curriculum overview for managers
│   ├── navbar/                          # Role-aware top navigation and user actions
│   ├── footer/                          # App footer
│   ├── rbac/directive/                  # RBAC directive(s) for template-level role checks
│   ├── response/                        # Shared API response contracts and pagination DTOs
│   ├── enumeration/                     # Shared enums (including user roles)
│   ├── unauthorized/                    # Unauthorized access page
│   └── not-found/                       # Fallback route page
├── environments/
│   ├── environment.ts                   # Base environment settings
│   └── environment.development.ts       # Development overrides
├── main.ts                              # Angular bootstrap entry point
└── styles.css                           # Global styles and Tailwind/Prime styling hooks
```

## Getting Started

### Prerequisites

- **Node.js 20+**
- **npm 10+**
- Running TalentOS BFF service reachable at `http://localhost:8080`

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd web-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the application**

   ```bash
   npm start
   ```

4. **Open in browser**

   ```text
   http://localhost:4200
   ```

## Scripts

```bash
npm start   # Run development server (ng serve)
npm run build   # Production build
npm run watch   # Development build in watch mode
npm test    # Run unit tests (Karma/Jasmine)
```

## Application Routes

### Public Routes

- `/` - Homepage
- `/login` - Login screen
- `/forgot-password` - Password reset flow
- `/unauthorized` - Access denied page

### Protected Routes

- `/profile` - User profile
- `/dashboard` - Dashboard
- `/cv` and `/cv/:userId` - CV management (Admin, SuperAdmin, Manager, Employee)
- `/domains` - Domain management (Admin, SuperAdmin)
- `/manage-users` - User management (Admin, SuperAdmin)
- `/employees` - Employee view (Manager)

## Backend Integration

The frontend communicates with the TalentOS BFF under:

```text
http://localhost:8080/api/bff-web-app
```

Primary integration areas:

- **Auth**: `/auth/login`, `/auth/reset`, `/auth/refresh`
- **Domains**: `/domains`
- **Users**: `/users`
- **Curriculums**: `/curriculums`, `/views/your-cv`
- **Employees View**: `/views/your-employees`

All API calls use a shared `ApiResponse<T>` envelope and pagination contracts in `src/app/response`.

## Security & Access

- JWT access token is injected through the auth HTTP interceptor
- Expired token handling triggers refresh flow using refresh token
- Session storage keys are used for user and token persistence
- Route-level checks enforce role constraints via `authGuard`
- Unauthorized role access redirects to `/unauthorized`

## Configuration

### Environment Files

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

### Notes

- The project includes environment files, but several API clients currently use explicit localhost BFF URLs.
- Keep frontend and BFF base paths aligned when moving between local, test, and production deployments.

## Build & Testing

### Build

```bash
npm run build
```

Build output is generated under `dist/`.

### Test

```bash
npm test
```

Unit tests run with Karma + Jasmine.

## Development Guidelines

- Keep domain logic inside feature services and client wrappers
- Reuse shared response contracts from `src/app/response`
- Preserve role checks in both routing metadata and RBAC directives
- Keep components focused and maintain signal-based local state when extending screens
- Update this README when new routes, integrations, or runtime requirements are introduced

## Contributing

When contributing to this project:

1. Follow existing domain-based folder organization
2. Add/update tests for modified business flows
3. Keep API contracts and DTO usage consistent with backend response models
4. Document configuration or route changes in this README

## License

MIT License. See [LICENSE](LICENSE) for details.

---

**Developed by Giuseppe Falcone**
