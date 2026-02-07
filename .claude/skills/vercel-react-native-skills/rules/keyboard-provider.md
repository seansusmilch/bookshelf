# keyboard-provider

**Impact: HIGH (required for keyboard handling to work)**

Wrap your app with `KeyboardProvider` from `react-native-keyboard-controller` in the root layout. This enables the `KeyboardAwareScrollView` and other keyboard handling features throughout the app.

**Installation:**

```bash
npx expo install react-native-keyboard-controller
```

**Setup:**

```tsx
// app/_layout.tsx
import { KeyboardProvider } from 'react-native-keyboard-controller'

export default function RootLayout() {
  return (
    <KeyboardProvider>
      {/* your app content */}
    </KeyboardProvider>
  )
}
```

**Incorrect: missing provider**

```tsx
// app/_layout.tsx
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* All components here lose keyboard handling */}
        <Stack />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

**Correct: with KeyboardProvider**

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <Stack />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

**Note:** `KeyboardProvider` should wrap your navigation stack. Place it inside any existing providers (like `SafeAreaProvider`) but at a high enough level that all screens can access it.

**Reference:** [react-native-keyboard-controller](https://kirillzyusko.github.io/react-native-keyboard-controller)
