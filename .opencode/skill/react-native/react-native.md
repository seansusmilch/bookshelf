# React Native Principles

## Overview

React Native is a framework for building native mobile apps using React. It translates React components to native UI elements rather than DOM elements, enabling native performance and platform-specific behavior while maintaining the React development experience.

## Core Differences from React Web

### 1. Component Library

- **React Web**: Uses HTML DOM elements (`<div>`, `<span>`, `<img>`, etc.)
- **React Native**: Uses native components (`<View>`, `<Text>`, `<Image>`, etc.)

```typescript
// React Web
<div className="container">
  <h1>Hello World</h1>
</div>

// React Native
<View className="container">
  <Text>Hello World</Text>
</View>
```

### 2. Styling System

- **React Web**: Uses CSS, CSS-in-JS, or CSS modules
- **React Native**: Uses JavaScript-based StyleSheet API or utility-first libraries like NativeWind

```typescript
// React Web with CSS modules
<div className={styles.container} />

// React Native with StyleSheet
<View style={styles.container} />

// React Native with NativeWind (Tailwind for React Native)
<View className="flex-1 items-center justify-center bg-white" />
```

**Key styling differences:**

- No CSS selectors (no hover, focus, pseudo-elements)
- No CSS Grid (use Flexbox only)
- No cascading (styles don't cascade to children)
- Unitless values for most properties (pixels assumed)
- `flexDirection` defaults to `column` (vs `row` in web)

### 3. Event Handling

- **React Web**: Browser events (`onClick`, `onSubmit`, etc.)
- **React Native**: Touch-based events (`onPress`, `onLongPress`, etc.)

```typescript
// React Web
<button onClick={handleClick}>Submit</button>

// React Native
<TouchableOpacity onPress={handleClick}>
  <Text>Submit</Text>
</TouchableOpacity>
```

### 4. Text Handling

- **React Web**: Any element can contain text
- **React Native**: Only `<Text>` components can contain text

```typescript
// React Web
<div>Hello <span>World</span></div>

// React Native
<Text>Hello <Text style={{fontWeight: 'bold'}}>World</Text></Text>
```

### 5. Layout and Dimensions

- **React Web**: Viewport-based, responsive with media queries
- **React Native**: Screen-based, use `Dimensions`, `useWindowDimensions`, or percentage/flex values

```typescript
// React Native dimension handling
const { width, height } = Dimensions.get('window');
// or
const { width, height } = useWindowDimensions();

// Responsive layout
<View style={{width: '100%', height: 200}} />
```

### 6. Icons

- **React Web**: Icon fonts or SVG libraries
- **React Native**: Icon libraries like `@expo/vector-icons` (Feather, FontAwesome, etc.)

```typescript
import FontAwesome from '@expo/vector-icons/FontAwesome';
<FontAwesome name="home" size={24} color="black" />
```

### 7. Platform-Specific Code

- **React Web**: Feature detection with conditionals
- **React Native**: Platform module for iOS/Android differences

```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.select({
      ios: 20,
      android: 0,
    }),
  },
});
```

### 8. Input Elements

- **React Web**: `<input>`, `<textarea>`, `<select>`
- **React Native**: `<TextInput>` for all text input needs

```typescript
<TextInput
  placeholder="Enter text"
  value={text}
  onChangeText={setText}
  keyboardType="email-address"
/>
```

### 9. Scrolling

- **React Web**: CSS `overflow` property or native scrolling
- **React Native**: Explicit `<ScrollView>` or `<FlatList>` components

```typescript
// ScrollView for small lists
<ScrollView>
  {items.map(item => <Item key={item.id} {...item} />)}
</ScrollView>

// FlatList for large lists (performance optimized)
<FlatList
  data={items}
  renderItem={({item}) => <Item {...item} />}
  keyExtractor={item => item.id}
/>
```

### 10. Navigation

- **React Web**: URL-based routing (React Router, Next.js)
- **React Native**: Stack, tab, and drawer navigation with React Navigation

```typescript
// Expo Router (file-based routing for React Native)
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/details/123');
```

## Best Practices

### Component Organization

- Keep components small and focused
- Use functional components with hooks
- Extract reusable UI components to `components/` directory

### Performance Optimization

- Use `useMemo` and `useCallback` for expensive operations
- Prefer `FlatList` over `ScrollView` with maps for long lists
- Use `React.memo` for pure components that re-render unnecessarily
- Avoid inline styles (use StyleSheet or NativeWind)

### Platform Considerations

- Test on both iOS and Android
- Use `Platform.OS` for platform-specific code
- Consider device screen sizes (iPhone SE vs iPad)
- Be aware of platform UI conventions (back button behavior, status bar)

### State Management

- Use React hooks (`useState`, `useReducer`, `useContext`)
- Consider global state for app-wide data (Convex, Redux, Zustand)
- Use React Query for server state management

### Type Safety

- Leverage TypeScript with strict mode
- Define prop interfaces for all components
- Use proper typing for event handlers

## Common Patterns

### SafeAreaView

Handle device notches and safe areas:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{flex: 1}}>
  {/* Content */}
</SafeAreaView>
```

### Pressable Components

Use `TouchableOpacity`, `Pressable`, or `TouchableHighlight` for interactive elements:

```typescript
<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <View style={styles.button}>
    <Text style={styles.buttonText}>Press Me</Text>
  </View>
</TouchableOpacity>
```

### Conditional Styling

Apply styles conditionally:

```typescript
<View style={[
  styles.container,
  isPressed && styles.containerPressed
]} />
```

### Activity Indicator

Show loading state:

```typescript
<ActivityIndicator size="large" color="#0000ff" />
```

### Modal Presentation

Use Expo Router's modal presentation:

```typescript
import { Stack } from 'expo-router';

<Stack.Screen
  name="modal"
  options={{presentation: 'modal'}}
/>
```

## Anti-Patterns to Avoid

### Don't Use Web APIs

- ❌ `window.scrollTo`, `document.querySelector`, `localStorage`
- ✅ Use `ScrollView`, React state management, AsyncStorage or secure storage

### Don't Nest Too Many Views

- ❌ Deep nesting hurts performance
- ✅ Flatten component tree with better layout design

### Don't Ignore Memory Leaks

- ❌ Forgetting to clean up subscriptions, timers, intervals
- ✅ Use cleanup functions in `useEffect`

### Don't Use Inline Functions in Render

- ❌ `onPress={() => console.log('pressed')}` creates new function each render
- ✅ Define handler outside render or use `useCallback`

### Don't Hardcode Dimensions

- ❌ `width: 375`, `height: 667` breaks on different devices
- ✅ Use `flex: 1`, percentages, or `useWindowDimensions`

## Migration from React Web

When converting React web code to React Native:

1. Replace HTML elements with React Native components
2. Convert CSS to StyleSheet or NativeWind classes
3. Update event handlers (onClick → onPress)
4. Wrap text in `<Text>` components
5. Replace forms with controlled `<TextInput>` components
6. Update navigation to use React Navigation/Expo Router
7. Remove web-specific APIs (localStorage, document, window)
8. Add platform-specific code for iOS/Android differences
9. Implement SafeAreaView for proper spacing
10. Test on actual devices, not just simulators

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind Documentation](https://www.nativewind.dev/)
