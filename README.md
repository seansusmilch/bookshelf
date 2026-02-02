# Welcome to your Expo app 👋

Open Library API: <https://openlibrary.org/developers/api>

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
    npx expo start
    ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Tailwind CSS & NativeWind

This project is set up with Tailwind CSS v4 and NativeWind v5 for utility-first styling.

### Usage

Import React Native components directly. className is supported via Babel plugin:

```tsx
import { View, Text, ScrollView } from "react-native";

export default function MyScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 gap-4">
        <Text className="text-xl font-bold text-gray-900">Hello Tailwind!</Text>
      </View>
    </ScrollView>
  );
}
```

**Note:** The CSS-wrapped components are located in `components/tw/`.

```

### Available Components

- `View` - Container element
- `Text` - Text element
- `ScrollView` - Scrollable container
- `Pressable` - Touchable element
- `TextInput` - Input field
- `Image` - Image component (supports `object-fit`)
- `Link` - Expo Router navigation link
- `Animated.View` - Animated view component
- `useCSSVariable` - Hook to access CSS variables

### Platform-Specific Styles

Use platform media queries in global.css for platform-specific styling:

```css
@media ios {
  :root {
    --font-sans: system-ui;
  }
}

@media android {
  :root {
    --font-sans: normal;
  }
}
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
