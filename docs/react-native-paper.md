# React Native Paper M3 Navigation Bar Implementation Plan

## Overview

Replace the current Expo Router bottom tabs with a Material Design 3 compliant navigation bar using react-native-paper's `BottomNavigation.Bar` component with dynamically generated M3 colors.

## Requirements

- **Implementation**: Use react-native-paper
- **Label Visibility**: Always show labels (labeled mode)
- **Active Indicator**: Yes, include pill-shaped container indicator
- **Color Generation**: Generate M3 colors from source color
- **Haptics**: No haptic feedback
- **Animations**: Use default M3 animations

---

## Phase 1: Dependencies Installation

### 1.1 Install required packages

```bash
pnpm add react-native-paper @pchmn/expo-material3-theme
```

### 1.2 Install iOS pods (if applicable)

```bash
cd ios && pod install && cd ..
```

### 1.3 Rebuild development build for Android (if using development build)

```bash
npx expo prebuild --platform android
npx expo run:android
```

---

## Phase 2: M3 Theme Provider Setup

### 2.1 Create `components/material3-provider.tsx`

Create a combined provider that wraps `PaperProvider` with M3 theme.

**Key features:**

- Use `useMaterial3Theme` from `@pchmn/expo-material3-theme` to generate dynamic colors
- Configure fallback source colors based on existing app colors:
    - Light mode fallback: `#0a7ea4` (current light tint)
    - Dark mode fallback: `#ffffff` (current dark tint)
- Handle light/dark mode switching with `useColorScheme`
- Export custom `useAppTheme` hook for accessing theme throughout the app
- Export `useMaterial3ThemeContext` for dynamic theme updates

**Provider structure:**

```typescript
<Material3ThemeProvider sourceColor="#0a7ea4">
  <PaperProvider theme={paperTheme}>
    {/* existing providers */}
  </PaperProvider>
</Material3ThemeProvider>
```

---

## Phase 3: Custom M3 Tab Bar Component

### 3.1 Create `components/m3-tab-bar.tsx`

**Interface:**

```typescript
interface M3TabBarProps {
    state: NavigationState
    descriptors: any[]
    navigation: NavigationProp
    insets: EdgeInsets
}
```

**Implementation details:**

- Use `BottomNavigation.Bar` from react-native-paper
- Map navigation state from Expo Router to BottomNavigation state
- Configure props:
    - `labeled={true}` (always show labels)
    - `shifting={false}` (M3 default)
    - `animationEasing`: Use default M3 easing
    - `keyboardHidesNavigationBar`: True on Android
    - `safeAreaInsets`: Pass from props

**Tab configuration:**

- Route keys: 'shelf', 'search', 'stats'
- Titles: 'Shelf', 'Search', 'Stats'
- Icons (using IconSymbol mapping):
    - Shelf: `menu-book` (from MaterialIcons)
    - Search: `search` (from MaterialIcons)
    - Stats: `bar-chart` (from MaterialIcons)

**Navigation handling:**

- Use `CommonActions.navigate` for tab switching
- Emit `tabPress` event to allow prevention
- Maintain scroll-to-top behavior on re-press

**Accessibility:**

- Proper `accessibilityRole` and `accessibilityState`
- Accessibility labels from tab titles

**Platform behaviors:**

- iOS: Pressable with no haptics
- Android: TouchableRipple with default M3 ripple effect

---

## Phase 4: Integration with App Layout

### 4.1 Update `app/_layout.tsx`

**Changes:**

- Import `Material3ThemeProvider` and `useAppTheme`
- Wrap entire provider tree with `Material3ThemeProvider`
- Keep all existing providers intact:
    - GestureHandlerRootView
    - SafeAreaProvider
    - QueryProvider
    - ClerkProvider
    - ConvexProviderWithClerk
    - ThemeProvider (React Navigation)
    - ErrorBoundary
    - ToastProvider

**Updated structure:**

```typescript
<GestureHandlerRootView>
  <SafeAreaProvider>
    <Material3ThemeProvider sourceColor="#0a7ea4">
      <QueryProvider>
        <ClerkProvider>
          <ConvexProviderWithClerk>
            <ThemeProvider>
              <ErrorBoundary>
                <ToastProvider>
                  <Stack>...</Stack>
                </ToastProvider>
              </ErrorBoundary>
            </ThemeProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </QueryProvider>
    </Material3ThemeProvider>
  </SafeAreaProvider>
</GestureHandlerRootView>
```

### 4.2 Update `app/(tabs)/_layout.tsx`

**Changes:**

- Remove `HapticTab` import (no haptics needed)
- Remove `Colors` import (using M3 theme instead)
- Keep `Tabs` component but add custom `tabBar` prop
- Create inline tab bar configuration using `M3TabBar`

**New configuration:**

```typescript
<Tabs
  screenOptions={{
    headerShown: false,
  }}
  tabBar={({ state, descriptors, navigation, insets }) => (
    <M3TabBar
      state={state}
      descriptors={descriptors}
      navigation={navigation}
      insets={insets}
    />
  )}
>
  <Tabs.Screen
    name="shelf"
    options={{
      title: 'Shelf',
      tabBarIcon: ({ color }) => (
        <IconSymbol size={24} name="book.fill" color={color} />
      ),
    }}
  />
  {/* Search and Stats screens with similar configuration */}
</Tabs>
```

---

## Phase 5: Theme Cleanup (Optional)

### 5.1 Deprecate `components/haptic-tab.tsx`

- File no longer needed (no haptics)
- Can remove or keep for potential future use

### 5.2 Update `constants/theme.ts`

- Keep `Colors` object for backward compatibility
- Add comment indicating M3 theme is now primary
- Other components may still reference these colors

---

## Phase 6: M3 Navigation Bar Specifications

### 6.1 Applied specifications

| Specification        | Implementation                                                 |
| -------------------- | -------------------------------------------------------------- |
| **Height**           | 80dp (M3 default with labels, built into BottomNavigation.Bar) |
| **Active indicator** | 64×32dp pill shape (built into M3 theme)                       |
| **Icon containers**  | 32×32dp centered (M3 default)                                  |
| **Icon size**        | 24dp (configured in IconSymbol)                                |
| **Label**            | 14px with 20px line height (labelMedium variant, M3 default)   |
| **Elevation**        | 0 (M3 default) with surface variant background                 |
| **Spacing**          | 12dp top, 16dp bottom (safe area aware, M3 default)            |
| **Animation**        | Default M3 transitions (150ms with easing)                     |
| **Haptics**          | Disabled (no haptics)                                          |
| **Ripple**           | Enabled on Android (TouchableRipple)                           |

### 6.2 Generated M3 color scheme

Using `@pchmn/expo-material3-theme`, following color roles will be automatically generated from source color `#0a7ea4`:

#### Light mode

- `primary`: Generated from #0a7ea4
- `onPrimary`: Contrast color for text on primary
- `primaryContainer`: Container background using primary
- `onPrimaryContainer`: Contrast text on primaryContainer
- `secondary`: Secondary color derived from source
- `secondaryContainer`: **Active indicator background**
- `onSecondaryContainer`: **Active icon/label color**
- `tertiary`: Tertiary accent color
- `background`: Main background color
- `onBackground`: Text on background
- `surface`: Surface color
- `onSurface`: Text on surface
- `surfaceVariant`: **Navigation bar background**
- `onSurfaceVariant`: **Inactive icon/label color**
- `elevation.level2`: Alternative surface color
- `error`: Error color
- And more...

#### Dark mode

- All same roles with dark variant colors
- Automatically generated from same source color
- Proper contrast ratios for dark backgrounds

---

## Phase 7: Testing & Validation

### 7.1 Manual testing checklist

- [ ] Navigation bar renders correctly on iOS and Android
- [ ] All three tabs display proper icons and labels
- [ ] Active indicator (pill shape) shows on selected tab
- [ ] Labels are always visible
- [ ] Light/dark mode switching works correctly
- [ ] No haptic feedback on iOS (as requested)
- [ ] Ripple effect works on Android
- [ ] Safe area insets respected (iOS home indicator)
- [ ] Navigation between tabs works smoothly
- [ ] Keyboard hides navigation bar on Android
- [ ] Scroll-to-top behavior on tab re-press
- [ ] Authentication flow still works (Convex/Clerk)
- [ ] M3 colors are visually appealing and contrast well

### 7.2 Run quality checks

```bash
pnpm lint
pnpm type-check
```

### 7.3 Test on multiple devices

- iOS (various screen sizes, iPhone home indicator)
- Android (various screen sizes, navigation gestures)
- Both light and dark modes

---

## File Structure

```
bookshelf/
├── components/
│   ├── material3-provider.tsx    (NEW - M3 theme provider)
│   ├── m3-tab-bar.tsx            (NEW - custom M3 tab bar)
│   └── haptic-tab.tsx           (DEPRECATE - no haptics needed)
├── app/
│   ├── _layout.tsx               (MODIFY - add Material3ThemeProvider)
│   └── (tabs)/
│       └── _layout.tsx           (MODIFY - use custom tab bar)
└── constants/
    └── theme.ts                  (OPTIONAL - cleanup or keep)
```

---

## Key Benefits

✅ **Fully M3 compliant** - Complete Material Design 3 implementation
✅ **Dynamic color generation** - Automatic M3 color scheme from source color
✅ **Dark mode support** - Proper contrast ratios for both light and dark
✅ **Active indicator** - Pill-shaped container as M3 spec
✅ **Platform-optimized** - Ripples on Android, pressable on iOS
✅ **No haptics** - Clean implementation as requested
✅ **Default animations** - Smooth M3 transitions
✅ **Accessibility** - Proper roles and states built-in
✅ **Type safety** - Full TypeScript support
✅ **Easy maintenance** - Well-documented, widely used libraries

---

## Risk Mitigation

### Potential Issues

1. **Native module compatibility** - `@pchmn/expo-material3-theme` requires native code
    - **Mitigation**: Works with Expo SDK 54, development build required for Android

2. **Theme conflicts** - React Navigation theme vs Paper theme
    - **Mitigation**: Keep both providers, use Paper theme for Paper components, React Navigation theme for navigation

3. **Authentication flow** - Complex provider tree
    - **Mitigation**: Wrap all existing providers with Material3ThemeProvider, don't change nesting order

4. **Color migration** - Existing components using old Colors object
    - **Mitigation**: Keep `constants/theme.ts` for backward compatibility, gradually migrate components to use `useAppTheme()`

---

## Resources

- [react-native-paper Documentation](https://callstack.github.io/react-native-paper/)
- [BottomNavigation.Bar API](https://callstack.github.io/react-native-paper/docs/components/BottomNavigation/BottomNavigationBar)
- [Using BottomNavigation with React Navigation](https://callstack.github.io/react-native-paper/docs/guides/bottom-navigation)
- [Material Design 3 Color System](https://m3.material.io/styles/color/the-color-system)
- [@pchmn/expo-material3-theme](https://github.com/pchmn/expo-material3-theme)
- [Material Design 3 Navigation Bar](https://m3.material.io/components/navigation-bar/overview)

---

## Current Implementation

### Current tab configuration

```typescript
// app/(tabs)/_layout.tsx
<Tabs>
  <Tabs.Screen
    name="shelf"
    options={{
      title: 'Shelf',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
    }}
  />
  <Tabs.Screen
    name="search"
    options={{
      title: 'Search',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
    }}
  />
  <Tabs.Screen
    name="stats"
    options={{
      title: 'Stats',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
    }}
  />
</Tabs>
```

### Current theme colors

```typescript
// constants/theme.ts
const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

export const Colors = {
    light: {
        text: '#11181C',
        background: '#fff',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: '#ECEDEE',
        background: '#151718',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
    },
}
```

### Icon mappings (from components/ui/icon-symbol.tsx)

```typescript
const MAPPING = {
    'book.fill': 'menu-book',
    magnifyingglass: 'search',
    'chart.bar.fill': 'bar-chart',
} as IconMapping
```
