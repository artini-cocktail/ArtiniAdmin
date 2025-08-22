# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Artini Admin dashboard - a React-based cocktail management system built with Material-UI components. It provides interfaces for managing cocktails, articles, users, and products with Firebase backend integration.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 3030)
npm run dev

# Build for production (outputs to ./build)
npm run build

# Linting
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors

# Code formatting
npm run prettier    # Format all source files

# Preview production build
npm start
```

## Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **UI Framework**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Forms**: React Hook Form
- **Charts**: ApexCharts
- **Styling**: Emotion (CSS-in-JS)

### Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React contexts
├── hooks/          # Custom React hooks
├── layouts/        # Layout components (Dashboard)
├── pages/          # Page components (route endpoints)
├── routes/         # Routing configuration with PrivateRoute wrapper
├── sections/       # Feature-specific components
├── services/       # External services (Firebase)
├── theme/          # MUI theme configuration
└── utils/          # Utility functions
```

### Key Architectural Patterns

1. **Route Protection**: All admin routes are wrapped with `PrivateRoute` component for authentication
2. **Lazy Loading**: Pages use React.lazy() for code splitting
3. **Path Aliasing**: `src/` prefix is aliased for clean imports
4. **Firebase Services**: Centralized in `src/services/firebase.js` with environment variables

### Firebase Configuration

Firebase services are initialized in `src/services/firebase.js`:
- **Firestore** (`db`): Document database
- **Authentication** (`auth`): User authentication
- **Storage** (`storage`): File uploads

Environment variables required (in `.env`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Main Features & Routes

- `/` - Dashboard overview
- `/user` - User management
- `/products` - Product catalog
- `/blog` - Blog/article management
- `/create-cocktail` - Cocktail creation interface
- `/view-cocktail` - Cocktail viewer
- `/create-article` - Article creation
- `/login` - Authentication page

## Code Style & Conventions

### ESLint Configuration
- Based on Airbnb style guide with modifications
- Perfectionist plugin for import/export sorting
- Prettier integration for formatting

### Import Order (enforced by ESLint)
1. Built-in and external packages
2. MUI components (`@mui/**`)
3. Routes (`src/routes/**`)
4. Hooks (`src/hooks/**`)
5. Utils (`src/utils/**`)
6. Components (`src/components/**`)
7. Sections (`src/sections/**`)
8. Other internal imports

### Component Patterns
- Functional components with hooks
- Material-UI components for all UI elements
- Iconify for icons
- CSS-in-JS with Emotion for custom styling

## Development Tips

1. **Port**: Dev server runs on port 3030 (configured in vite.config.js)
2. **Build Output**: Production builds go to `./build` directory
3. **Code Splitting**: Pages are lazy-loaded automatically
4. **Hot Reload**: Vite provides fast HMR in development
5. **Type Checking**: No TypeScript, but PropTypes are used for runtime checking

## Important Files

- `vite.config.js` - Build configuration
- `.eslintrc` - Linting rules
- `src/services/firebase.js` - Firebase setup
- `src/routes/sections.jsx` - Route definitions
- `src/routes/components/private-route/` - Authentication wrapper