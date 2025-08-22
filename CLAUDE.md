# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 frontend application that connects to a Rails 8 API backend (separate project). The application is building a workflow automation platform where users can create multi-step workflows that can be executed multiple times.

### Core Workflow Concept
- **Workflows**: Sequences of steps that can be run multiple times
- **Steps**: Individual workflow components with specific types, inputs, and outputs
- **Step Types**: Predefined list of available step types (e.g., "Generate Text", "Process Data", etc.)
- **Execution Flow**: Each step runs as a background job, and upon completion triggers the next step
- **AI Integration**: Steps like "Generate Text" allow users to select AI models (Claude versions, ChatGPT versions, Gemini, etc.) and provide prompts as input

The app also includes chat/conversation features with research assistants, projects, and user management. UI built with React 19, TypeScript, Ant Design components, and SCSS for styling.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19 with React DOM 19
- **Language**: TypeScript 5
- **UI Framework**: Ant Design v5 with React 19 patch
- **Styling**: SCSS modules + global styles
- **HTTP Client**: Axios with automatic token refresh
- **State Management**: React Query (TanStack Query v5) + React Context
- **Build Tool**: Next.js with Turbopack for dev
- **Authentication**: Custom JWT-based auth with refresh tokens

## Common Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack on port 3001

# Build & Deploy  
npm run build        # Production build
npm start           # Start production server

# Code Quality
npm run lint        # ESLint with Next.js rules
```

## Architecture & Key Patterns

### API Integration
- All API calls go through `lib/api.ts` which configures axios with:
  - Base URL from `NEXT_PUBLIC_API_URL` environment variable (points to Rails 8 backend)
  - Automatic JWT token refresh on 401 responses
  - Credentials included for refresh token cookies
- Authentication endpoints follow Rails Devise patterns (`/users/sign_in`, `/users/sign_out`, `/me`)
- Workflow-related endpoints handle step definitions, workflow execution, and background job status

### Authentication Flow
- JWT access tokens with refresh token cookies
- `useAuth` hook manages auth state and API calls
- `UserContext` provides user data across components
- Auth is currently disabled in layout.tsx (see line 81-86)
- Login redirects to `/dashboard`, logout to `/login`

### Routing Structure
- App Router with nested layouts
- Main routes: `/dashboard`, `/projects`, `/chat`, `/admin`
- Dynamic routes: `/chat/[uuid]`, `/projects/[id]`, `/chat/projects/[project_id]/new/[assistant_id]`
- Authentication redirects handled in root layout

### Component Architecture
- Components in `/components` with co-located SCSS modules
- Main chat component: `AssistantChat` handles conversation flow
- Layout includes collapsible sidebar with navigation and user profile
- Uses Ant Design components extensively with custom styling

### Directory Structure & Component Patterns
- **Component Organization**: Each component lives in its own directory under `/components/ComponentName/`
- **File Naming**: Components use PascalCase (e.g., `WorkflowDetail.tsx`)
- **Co-located Files**: All related files are siblings within the component directory:
  - `ComponentName.tsx` - Main component file
  - `ComponentName.module.scss` - SCSS module for styling
  - `columns.tsx` - For table components, column definitions live separately
  - `utils.ts` - Component-specific utilities (when needed)
  - Tests and other assets are also co-located as siblings
- **Parent Directories**: Related components are grouped under parent directories (e.g., `Workflows/` contains workflow-related components)
- **Module SCSS**: Always use SCSS modules with camelCase class names
- **Ant Design Preference**: Prefer Ant Design components over custom implementations
- **Table Pattern**: For tables, separate column definitions into `columns.tsx` files as siblings to the main component

### State Management
- React Query for server state and API calls
- React Context for user authentication state
- Local component state for UI interactions
- No global state management library (Redux/Zustand)

### Styling Approach
- SCSS modules for component-specific styles
- Global styles in `app/globals.scss`
- Ant Design theme customization through component props
- Responsive design with CSS Grid/Flexbox

## Key Files & Directories

- `app/layout.tsx` - Root layout with sidebar navigation and auth wrapper
- `lib/api.ts` - Axios instance with interceptors for token refresh
- `hooks/useAuth.ts` - Authentication logic and user management
- `components/AssistantChat/` - Main chat interface component
- `contexts/UserContext.tsx` - User data provider
- `app/globals.scss` - Global styles and CSS resets

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Rails 8 backend API base URL (separate project)

## Development Notes

- Development server runs on port 3001 (configured in package.json)
- Uses Turbopack for faster development builds
- TypeScript with strict mode enabled
- ESLint configured with Next.js and TypeScript rules
- Path aliases configured with `@/*` pointing to root directory

## API Integration Patterns

- All API calls use the configured axios instance from `lib/api.ts`
- Error handling includes automatic token refresh logic
- Conversations are fetched using OpenAI thread IDs
- File uploads supported through Ant Design Upload component
- Real-time message updates through polling or WebSocket (implementation in AssistantChat)

## Workflow System Architecture

The application's core feature is a workflow automation system with the following patterns:

### Workflow Execution Model
- **Sequential Processing**: Steps execute in order, each triggering the next upon completion
- **Background Jobs**: All step execution happens asynchronously in Rails background jobs
- **State Management**: Frontend polls or receives real-time updates on workflow/step status
- **Error Handling**: Failed steps can halt workflow or trigger retry logic

### Step Type System
- **Predefined Types**: Frontend provides UI for selecting from available step types
- **Dynamic Inputs**: Each step type defines its required input fields (e.g., prompt, model selection)
- **Model Selection**: AI-powered steps allow choosing between different providers/versions
- **Output Chaining**: Step outputs can be used as inputs for subsequent steps

### UI Patterns for Workflows
- **Step Builder**: Drag-and-drop or form-based step creation interface
- **Execution Monitor**: Real-time status updates during workflow runs
- **Result Display**: Structured presentation of step outputs and final results
- **Reusability**: Save and rerun workflows with different inputs