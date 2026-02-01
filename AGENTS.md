# Agent Guidelines

## Orchestration

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

Core principle: Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## Commands

### Code Quality

- `pnpm lint` - Run ESLint and Prettier checks
- `pnpm format` - Auto-fix linting and format code
- `pnpm type-check` - Run TypeScript type checking (run this after completing work)

### Testing

- No test framework configured yet. When adding tests, use Jest/React Native Testing Library.

## Tech Stack

- **Framework**: Expo SDK 54, React Native 0.81, React 19
- **Router**: Expo Router (file-based routing)
- **Styling**: NativeWind v5 + Tailwind CSS v4
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
- `components/tw/` - Tailwind CSS-wrapped components (View, Text, ScrollView, etc.)
- `components/ui/` - Generic UI components (buttons, cards, inputs, etc.)
- `components/book/` - Book-specific components (modals, sheets, menus)
- `components/list/` - List-related components
- `components/material3-provider.tsx` - Material Design 3 theme provider
- `components/m3-tab-bar.tsx` - M3 navigation bar component
- `convex/` - Convex backend functions and schema
- `hooks/` - Custom React hooks (useBooks, useStats, useAddBook, etc.)
- `lib/` - Utility libraries and providers (query-client, etc.)
- `assets/` - Images and fonts
- `global.css` - Global Tailwind imports

### Folder Rules

- **NO `src/` folder** - All code should be at the root level in appropriate directories
- `lib/` - For providers, utilities, and helper functions (e.g., `lib/query-client.tsx`)
- `hooks/` - For all custom React hooks
- `components/` - For all React components, organized by domain (ui, book, list, etc.)

## Available Skills

Use these skills when relevant

- **native-data-fetching** - Network requests, API calls, data fetching patterns
- **expo-tailwind-setup** - Tailwind CSS v4 + NativeWind v5 configuration
- **building-native-ui** - Expo Router components, styling, navigation, Material Design 3
- **convex** - All Convex patterns (functions, realtime, agents)
- **convex-best-practices** - Production-ready Convex architecture
- **clerk** - Authentication flows and organization management
- **clerk-setup** - Clerk integration quickstart
- **root-cause-analysis** - Systematic debugging methodology
- **log-analysis** - Log analysis and error patterns

## Code Style

### Imports

- Order: React Native → Third-party → Local
- Use path aliases: `@/*`, `~/lib/*`, or `~/*` for root imports
  - `@/*` - Root-level imports (e.g., `@/components`, `@/hooks`)
  - `~/lib/*` - Library utilities (e.g., `~/lib/query-client`)
- No default exports for components (use named exports)
- Keep imports organized and deduplicated

```typescript
import { View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenContent } from '@/components/ScreenContent';
import { QueryProvider } from '~/lib/query-client';
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

- Prefer NativeWind className over StyleSheet
- Import CSS-wrapped components from `@/tw` (e.g., `import { View, Text } from "@/tw"`)
- Use template literals for style objects when needed
- Define styles as const objects at file bottom
- Tailwind classes should follow utility-first approach

```typescript
import { View, Text } from "@/tw";

// Preferred
<View className="flex items-center justify-center p-4 bg-white" />

// Alternative
const styles = {
  container: `flex flex-1 px-4 bg-white items-center justify-center`,
};
```

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

- Use `Material3Provider` for M3 theme in app/_layout.tsx
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
import { useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: () => convex.query(api.books.list),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
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

## Mobile-First Design

- Responsive layouts using Tailwind
- Consider both iOS and Android platforms
- Test on multiple screen sizes
- Use Expo's cross-platform APIs
- Follow Material Design 3 guidelines for UI components
- Dynamic color generation from source color for light/dark modes

## Notes

- No test framework currently - add tests when appropriate
- No CI/CD configured yet
- Environment files: .env.local (not committed)
- Global styles in global.css
