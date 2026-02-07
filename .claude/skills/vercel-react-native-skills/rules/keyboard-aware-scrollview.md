# keyboard-aware-scrollview

**Impact: HIGH (ensures input fields remain visible when keyboard appears)**

Use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `ScrollView` with `KeyboardAvoidingView`. The built-in React Native `KeyboardAvoidingView` is unreliable, especially with Expo Router and modal presentations. `KeyboardAwareScrollView` automatically scrolls to keep the focused input visible.

**Requires:**
- `react-native-keyboard-controller` package installed
- `KeyboardProvider` at app root (see `keyboard-provider` rule)

**Installation:**

```bash
npx expo install react-native-keyboard-controller
```

**Incorrect: unreliable KeyboardAvoidingView**

```tsx
import { ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native'

function AddBookScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView>
        <TextInput placeholder="Page count" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
```

**Correct: KeyboardAwareScrollView**

```tsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { TextInput } from 'react-native'

function AddBookScreen() {
  return (
    <KeyboardAwareScrollView
      bottomOffset={60}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput placeholder="Page count" />
    </KeyboardAwareScrollView>
  )
}
```

**Key props:**

- `bottomOffset` — Extra space below the keyboard (default: 0)
- `keyboardShouldPersistTaps` — `'handled'` to dismiss keyboard when tapping outside inputs
- `behavior` — Set to `'padding'` on iOS for proper offset

**Note:** `KeyboardAwareScrollView` also supports `scrollEventThrottle` and `onScroll` for scroll animations, replacing the need for a separate `Animated.ScrollView`.

**Reference:** [react-native-keyboard-controller](https://kirillzyusko.github.io/react-native-keyboard-controller)
