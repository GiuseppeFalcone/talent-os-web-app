# Talent OS Web App

A modern talent management system built with Angular 20, featuring CV management, user administration, and role-based access control. This application provides a comprehensive platform for managing employees, their curricula vitae, skills, and organizational domains.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Building](#building)
- [Testing](#testing)
- [Code Style](#code-style)
- [Contributing](#contributing)

## ✨ Features

- **Authentication & Authorization**: Secure login system with role-based access control (RBAC)
- **User Management**: Create, update, and manage users with different roles (Admin, Manager, Employee, SuperAdmin)
- **CV Management**: Comprehensive curriculum vitae management system including:
  - Personal information
  - Education history
  - Project experience
  - Skills and competencies
  - Driving licenses
- **Dashboard**: Overview of users and system statistics
- **Domain Management**: Manage organizational domains and skill categories
- **Employee Management**: Managers can view and manage their team members
- **Profile Management**: Users can update their personal profiles
- **Responsive Design**: Built with PrimeNG and Tailwind CSS for a modern, responsive UI

## 🚀 Technology Stack

- **Framework**: Angular 20.3.0
- **UI Components**: PrimeNG 20.3.0 with Aura theme
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with RxJS
- **Routing**: Angular Router with lazy loading
- **Testing**: Jasmine & Karma
- **Build Tool**: Angular CLI 20.3.5
- **TypeScript**: 5.9.2

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Angular CLI](https://angular.dev/tools/cli) (optional, but recommended)

```bash
npm install -g @angular/cli
```

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/GiuseppeFalcone/talent-os-web-app.git
cd talent-os-web-app
```

2. Install dependencies:

```bash
npm install
```

## 💻 Development

### Development Server

To start a local development server, run:

```bash
npm start
# or
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the project for production
- `npm run watch` - Build the project in watch mode for development
- `npm test` - Run unit tests

### Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## 📁 Project Structure

The project follows a domain-driven structure:

```
src/
├── app/
│   ├── auth/              # Authentication (login, forgot password, guards)
│   ├── dashboard/         # Dashboard component and services
│   ├── manage-domain/     # Domain management
│   ├── manage-user/       # User management
│   ├── your-cv/           # CV management
│   ├── your-employee/     # Employee management
│   ├── profile/           # User profile
│   ├── rbac/              # Role-based access control directives
│   ├── enumeration/       # Shared enumerations
│   ├── response/          # API response models
│   ├── navbar/            # Navigation bar component
│   ├── footer/            # Footer component
│   ├── homepage/          # Homepage component
│   ├── not-found/         # 404 page
│   ├── unauthorized/      # 401 page
│   ├── theme/             # Theme configuration
│   ├── app.routes.ts      # Application routing
│   └── app.ts             # Root component
├── environments/          # Environment configurations
├── index.html            # Main HTML file
├── main.ts               # Application entry point
└── styles.css            # Global styles
```

Each domain follows a consistent structure:
- **Component**: Main component file
- **Models**: TypeScript interfaces and DTOs
- **Services**: Business logic and state management
- **Client**: HTTP client wrappers for API calls

## ⚙️ Environment Configuration

The application uses environment-specific configuration files:

- `src/environments/environment.ts` - Default environment configuration
- `src/environments/environment.development.ts` - Development environment (replaces environment.ts during development builds)

Default configuration (`environment.ts`):
```typescript
export const environment = {
  production: false,
  baseBffUrl: 'http://localhost:8080/api/bff-web-app',
};
```

Development configuration (`environment.development.ts`):
```typescript
export const environment = {
  production: false,
  // Add baseBffUrl and other development-specific settings here if needed
};
```

The Angular build system automatically replaces `environment.ts` with `environment.development.ts` when running in development mode (`ng serve`).

**Note**: For production deployments, update `environment.ts` with:
- Set `production: true`
- Use your production API URL for `baseBffUrl`

## 🏗️ Building

To build the project for production, run:

```bash
npm run build
# or
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. The production build optimizes your application for performance and speed with:

- Code minification
- Tree shaking
- Output hashing for cache busting
- Production mode optimizations

Build size budgets are configured in `angular.json`:
- Initial bundle: max 1MB (warning at 500kB)
- Component styles: max 8kB (warning at 4kB)

## 🧪 Testing

### Unit Tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, run:

```bash
npm test
# or
ng test
```

This will run all unit tests and generate a coverage report.

## 🎨 Code Style

This project follows strict coding conventions and best practices:

### TypeScript
- Strict type checking enabled
- Prefer type inference when obvious
- Avoid `any` type; use `unknown` when type is uncertain

### Angular
- Standalone components (default, no `standalone: true` needed)
- Signals for state management
- Lazy loading for feature routes
- `OnPush` change detection strategy
- `input()` and `output()` functions instead of decorators
- Native control flow (`@if`, `@for`, `@switch`)
- Reactive forms over template-driven forms

### Styling
- PrimeNG Aura theme
- Tailwind CSS 4 utility classes
- Use `class` bindings instead of `ngClass`
- Use `style` bindings instead of `ngStyle`

### Code Formatting
- Prettier is configured with:
  - Print width: 100 characters
  - Single quotes
  - Special Angular HTML parser

Format your code by running:
```bash
npx prettier --write .
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Follows the project's coding conventions
- Includes appropriate tests
- Is properly formatted with Prettier
- Passes all existing tests

## 📄 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [PrimeNG Documentation](https://primeng.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Note**: This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.
