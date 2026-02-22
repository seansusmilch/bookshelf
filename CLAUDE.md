# Agent Guidelines

## Orchestration

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

Core principle: Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## Commands

### Development

- `pnpm start` - Start Expo development server with tunneling (for remote device testing)
    - Use when: Developing on a physical device without a local network, or when you need to test with Expo Go on a device not on the same network
    - Opens Expo DevTools in browser

- `pnpm dev` - Start Convex backend in development mode
    - Use when: You need to interact with Convex backend functions during development
    - Runs alongside `pnpm start` (typically run in separate terminal)

- `pnpm android` - Run app on Android emulator or connected device
    - Use when: Testing on Android specifically, requires Android dev environment set up
    - Builds and runs the native Android app

- `pnpm ios` - Run app on iOS simulator or connected device
    - Use when: Testing on iOS specifically (macOS only)
    - Requires Xcode and iOS dev environment

- `pnpm web` - Run app in web browser
    - Use when: Quick testing or when native environment unavailable
    - Note: Some native APIs may not work fully on web

### Code Quality

- `pnpm lint` - Run ESLint checks
    - Use when: Checking code for linting errors before committing
    - Does NOT auto-fix issues (use `pnpm format` instead)

- `pnpm format` - Auto-fix linting errors and format code with Prettier
    - Use when: Fixing code style issues automatically
    - Runs Prettier write then ESLint with --fix flag

- `pnpm check [path]` - Run TypeScript type checking without emitting files
    - Use when: Verifying type correctness after completing work
    - With no arguments: checks entire codebase
    - With file path: checks only that file (e.g., `pnpm check app/book.tsx`)
    - **Required**: Run this before committing changes
    - Note: Path aliases may show errors when checking single files; run without arguments for complete type checking

### Utilities

- `pnpm reset-project` - Reset project to initial state
    - Use when: Starting fresh from a clean slate (destructive)
    - Runs scripts/reset-project.js

- `pnpm clear-cache` - Clear Metro bundler cache and restart dev server
    - Use when: Experiencing caching issues or weird build behavior
    - Equivalent to `npx expo start -c`
    - Commonly needed after:
        - Native module installations
        - Babel config changes
        - Tailwind config changes
        - Unexplained rendering issues

### Testing

- No test framework configured yet. When adding tests, use Jest/React Native Testing Library.

## Tech Stack

- **Framework**: Expo SDK 54, React Native 0.81, React 19
- **Router**: Expo Router (file-based routing)
- **Styling**: NativeWind v4.2.1 + Tailwind CSS v3.3.3 (Babel plugin approach)
- **UI Components**: react-native-paper (Material Design 3)
- **Theming**: @pchmn/expo-material3-theme (Material Design 3 dynamic colors)
- **Backend**: Convex
- **Data Fetching**: TanStack React Query
- **Authentication**: Clerk
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm

## Project Structure

- `app/` - Expo Router pages (file-based routing)
- `components/` - Reusable UI components
- `components/tw/` - NativeWind-wrapped components for type safety (View, Text, ScrollView, etc.)
- `tailwind.config.js` - Tailwind CSS configuration with nativewind preset
- `components/ui/` - Generic UI components (buttons, cards, inputs, etc.)
- `components/book/` - Book-specific components (modals, sheets, menus)
- `components/list/` - List-related components
- `components/material3-provider.tsx` - Material Design 3 theme provider
- `components/m3-tab-bar.tsx` - M3 navigation bar component
- `convex/` - Convex backend functions and schema
- `hooks/` - Custom React hooks (useBooks, useStats, useAddBook, etc.)
- `lib/` - Utility libraries and providers (query-client, etc.)
- `assets/` - Images and fonts
- `tailwind.config.js` - Tailwind CSS configuration
- `nativewind-env.d.ts` - TypeScript types for NativeWind v4

### Folder Rules

- **NO `src/` folder** - All code should be at the root level in appropriate directories
- `lib/` - For providers, utilities, and helper functions (e.g., `lib/query-client.tsx`)
- `hooks/` - For all custom React hooks
- `components/` - For all React components, organized by domain (ui, book, list, etc.)

## Available Skills

Use these skills when relevant

- **openlibrary** - Book metadata, author information, search, covers API
- **native-data-fetching** - Network requests, API calls, data fetching patterns
- **expo-tailwind-setup** - Tailwind CSS v3 + NativeWind v4 configuration
- **building-native-ui** - Expo Router components, styling, navigation, Material Design 3
- **convex** - All Convex patterns (functions, realtime, agents)
- **convex-best-practices** - Production-ready Convex architecture
- **clerk** - Authentication flows and organization management
- **clerk-setup** - Clerk integration quickstart
- **root-cause-analysis** - Systematic debugging methodology
- **log-analysis** - Log analysis and error patterns

## MCP Integration

This project uses Model Context Protocol (MCP) servers configured in `.mcp.json`.

- **Convex MCP** - Use when inspecting database state, debugging backend functions, viewing logs, or managing environment variables. Tools are available as `mcp__convex__*`.
- **Context7 MCP** - Use when you need up-to-date documentation for any library or framework (React Native, Expo, Convex, etc.). First resolve the library ID with `mcp__context7__resolve-library-id`, then query docs with `mcp__context7__query-docs`.

## Code Style

### Imports

- Order: React Native → Third-party → Local
- Use path aliases: `@/*`, `~/lib/*`, or `~/*` for root imports
    - `@/*` - Root-level imports (e.g., `@/components`, `@/hooks`)
    - `~/lib/*` - Library utilities (e.g., `~/lib/query-client`)
- No default exports for components (use named exports)
- Keep imports organized and deduplicated

```typescript
import {View, Text} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {ScreenContent} from '@/components/ScreenContent'
import {QueryProvider} from '~/lib/query-client'
```

### Components

- Use named exports: `export const Button = () => {}`
- Use forwardRef when ref forwarding is needed
- Add displayName for forwardRef components
- Define props as type interfaces before the component

```typescript
type ButtonProps = {
  title: string;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(({ title, ...props }, ref) => {
  return <TouchableOpacity ref={ref} {...props} />;
});

Button.displayName = 'Button';
```

### Styling

- Use NativeWind v4 with Tailwind CSS v3 for styling
- Import components from `@/tw` for type safety with className props
- Use Tailwind className directly on all components
- className works out of the box on React Native components via Babel plugin
- Use template literals for style objects when needed
- Define styles as const objects at file bottom
- Tailwind classes should follow utility-first approach

```typescript
import { View, Text } from "react-native";

// Preferred
<View className="flex items-center justify-center p-4 bg-white" />

// Alternative for style objects
const styles = {
  container: `flex flex-1 px-4 bg-white items-center justify-center`,
};
```

**NativeWind v4 Configuration:**

- Babel config in `babel.config.js` includes `nativewind/babel` plugin for className transformation
- Tailwind config in `tailwind.config.js` configures content paths (no preset needed)
- No Metro wrapper needed (default config is fine)
- No global.css import needed - babel plugin handles all transformations at build time
- Components in `components/tw/` export React Native components directly
- TypeScript types in `nativewind-env.d.ts` from nativewind/types

### TypeScript

- Strict mode enabled - all types must be properly defined
- Use type aliases for object shapes, interfaces for extendable contracts
- Use React utility types (ComponentProps, ReactNode, etc.)
- Avoid `any` and `as` casts
- Explicitly type function parameters and return values

### Naming Conventions

- Components: PascalCase (ScreenContent, Button, TabBarIcon)
- Functions: camelCase (formatDate, getUserData)
- Variables: camelCase (userName, isLoading)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Types: PascalCase (ButtonProps, UserData)
- Style objects: camelCase with semantic names (container, buttonText)

### Navigation

- Use Expo Router's Link component for navigation
- Screen options defined in route files
- Use Stack.Screen for modal presentation
- Tab layouts use Tabs component from expo-router
- Navigation bar uses custom M3TabBar component with Material Design 3

```typescript
<Link href="/modal" asChild>
  <HeaderButton />
</Link>
```

### Material Design 3

- Use `Material3Provider` for M3 theme in app/\_layout.tsx
- Access theme with `useAppTheme()` hook from react-native-paper
- Use `useMaterial3ThemeContext()` for dynamic theme updates
- Custom components should use M3 color scheme for consistency
- Navigation bar uses `M3TabBar` with `BottomNavigation.Bar` from react-native-paper

```typescript
import { useAppTheme } from '@/components/material3-provider';

function MyComponent() {
  const { colors } = useAppTheme();
  return <View style={{ backgroundColor: colors.primary }} />;
}
```

### Error Handling

- Use TypeScript strict mode for type safety
- Wrap async operations in try-catch blocks
- Consider adding ErrorBoundary for unhandled errors
- Use Convex's built-in error handling for backend operations

### Data Fetching (React Query)

- Use TanStack React Query for all data fetching from Convex
- Define query hooks as named exports in separate hook files
- Use `useQuery` for fetching data, `useMutation` for mutations
- Leverage React Query's built-in caching and stale-while-revalidate
- Configure QueryClient with sensible defaults (staleTime, gcTime, retries)

```typescript
// hooks/useBooks.ts
import {useQuery} from '@tanstack/react-query'
import {api} from 'convex/_generated/api'

export const useBooks = () => {
    return useQuery({
        queryKey: ['books'],
        queryFn: () => convex.query(api.books.list),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
```

### File Organization

- One component per file
- Co-locate related components
- Keep index files minimal
- Use barrel exports for component groups

### Formatting (Prettier)

- 100 character line width
- 2 space indentation
- Single quotes
- Trailing commas (ES5 style)
- Brackets on same line

### Linting (ESLint)

- Uses expo/flat config
- React displayName rule disabled
- Run `pnpm lint` before committing

## Backend (Convex)

- Functions in `convex/` directory
- Use generated types from `convex/_generated/`
- Define schema in `convex/schema.ts` when created
- Use Convex CLI for backend management

### Testing Convex Changes

**REQUIRED**: After making any changes to Convex code, you MUST manually test using the Convex MCP tools before considering the work complete:

1. **Get deployment status** - Use `mcp__convex__status` to identify the deployment selector
2. **Run modified functions** - Use `mcp__convex__run` to execute functions with test arguments
3. **Verify database state** - Use `mcp__convex__data` to query tables and confirm expected data
4. **Check for errors** - Use `mcp__convex__logs` with status "failure" to review any errors

Example testing workflow:

```typescript
// After editing convex/books.ts
// 1. Run the function to test it
mcp__convex__run({
    deploymentSelector: 'ownDev',
    functionName: 'convex/books.ts:list',
    args: '{}',
})

// 2. Verify the data
mcp__convex__data({
    deploymentSelector: 'ownDev',
    tableName: 'books',
    order: 'desc',
})
```

## Mobile-First Design

- Responsive layouts using Tailwind
- Consider both iOS and Android platforms
- Test on multiple screen sizes
- Use Expo's cross-platform APIs
- Follow Material Design 3 guidelines for UI components
- Dynamic color generation from source color for light/dark modes

## Configuration Notes

### Styling Setup

- NativeWind v4.2.1 uses babel plugin for className transformation
- babel.config.js must include `nativewind/babel` plugin
- tailwind.config.js configures content paths (no preset needed with Tailwind CSS v3)
- metro.config.js uses default configuration (no NativeWind wrapper)
- No global.css import needed - babel plugin handles all transformations at build time
- Components export React Native components directly (className handled by babel plugin)
- nativewind-env.d.ts provides TypeScript types from nativewind/types
- Restart dev server with `-c` flag after config changes: `npx expo start -c`

### Troubleshooting

- If styles don't apply on Android/iOS: clear Metro cache with `-c` flag
- Ensure babel.config.js has `nativewind/babel` plugin
- Verify tailwind.config.js has correct content paths
- Check nativewind-env.d.ts has `/// <reference types="nativewind/types" />`
- Do NOT import global.css in app/\_layout.tsx (causes PostCSS async errors)
- Make sure `react-native-css` and `@tailwindcss/postcss` are NOT installed (v4 doesn't use them)
- Ensure Tailwind CSS v3.3.3 is installed (v3.4+ has PostCSS 8 compatibility issues)
- Verify components are imported from `@/tw` (className won't work with direct react-native imports)

### Development Notes

- No test framework currently - add tests when appropriate
- No CI/CD configured yet
- Environment files: .env.local (not committed)
- No global styles file needed - NativeWind babel plugin handles all styling
