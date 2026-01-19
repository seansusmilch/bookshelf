# Clerk with Expo

## Overview

Clerk is a complete authentication and user management solution for Expo applications. It provides prebuilt components, hooks, and helpers for authentication, with support for custom authentication flows for native apps.

## Installation

Install Clerk Expo SDK:

```bash
npm install @clerk/clerk-expo expo-secure-store
```

## Setup

### 1. Configure Clerk Dashboard

Enable Native API in the Clerk Dashboard → Native Applications page.

### 2. Set Environment Variables

Add to `.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3. Add ClerkProvider to Root Layout

Wrap your app with `<ClerkProvider>` at the entry point:

```typescript
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  )
}
```

## Core Components and Hooks

### Components

- `<SignedIn>` - Children only visible to signed-in users
- `<SignedOut>` - Children only visible to signed-out users
- `<ClerkProvider>` - Provides auth context to entire app

### Hooks

- `useAuth()` - Access authentication state (`isSignedIn`, `userId`, `sessionId`)
- `useUser()` - Access user data
- `useSignIn()` - Create sign-in flows
- `useSignUp()` - Create sign-up flows
- `useClerk()` - Access Clerk instance (`signOut()`, `openUserProfile()`, etc.)

## Authentication Flows

Clerk for Expo native apps uses **custom flows** (not prebuilt UI components). You build authentication screens using Clerk's hooks.

### Sign-Up Flow

```typescript
// app/(auth)/sign-up.tsx
import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  const onSignUpPress = async () => {
    if (!isLoaded) return

    try {
      await signUp.create({ emailAddress, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <View>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={setCode}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View>
      <Text>Sign up</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={onSignUpPress}>
        <Text>Continue</Text>
      </TouchableOpacity>
      <Link href="/sign-in">
        <Text>Already have an account? Sign in</Text>
      </Link>
    </View>
  )
}
```

### Sign-In Flow

```typescript
// app/(auth)/sign-in.tsx
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onSignInPress = async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View>
      <Text>Sign in</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={onSignInPress}>
        <Text>Continue</Text>
      </TouchableOpacity>
      <Link href="/sign-up">
        <Text>Don't have an account? Sign up</Text>
      </Link>
    </View>
  )
}
```

### Sign-Out

```typescript
// components/SignOutButton.tsx
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/')
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign out</Text>
    </TouchableOpacity>
  )
}
```

## Route Protection

### Protect Auth Routes

Redirect signed-in users away from auth pages:

```typescript
// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href="/" />
  }

  return <Stack />
}
```

### Protect Protected Routes

Redirect signed-out users to sign-in:

```typescript
// app/(protected)/_layout.tsx
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function ProtectedRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return <Stack />
}
```

## Conditional Rendering

Use `<SignedIn>` and `<SignedOut>` to conditionally render content:

```typescript
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { SignOutButton } from '@/components/SignOutButton'

export default function HomePage() {
  const { user } = useUser()

  return (
    <View>
      <SignedIn>
        <Text>Hello, {user?.emailAddresses[0]?.emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </View>
  )
}
```

## Accessing User Data

```typescript
import { useUser, useAuth } from '@clerk/clerk-expo'

export default function UserProfile() {
  const { user, isLoaded } = useUser()
  const { userId } = useAuth()

  if (!isLoaded) return <Text>Loading...</Text>

  return (
    <View>
      <Text>User ID: {userId}</Text>
      <Text>Email: {user?.emailAddresses[0]?.emailAddress}</Text>
      <Text>Name: {user?.fullName}</Text>
      <Text>Username: {user?.username}</Text>
    </View>
  )
}
```

## Token Cache

Clerk uses `expo-secure-store` to securely store session tokens:

```typescript
import { tokenCache } from '@clerk/clerk-expo/token-cache'

<ClerkProvider tokenCache={tokenCache}>
  {/* App content */}
</ClerkProvider>
```

Tokens are automatically removed when users sign out.

## Best Practices

### Error Handling

Always wrap async auth operations in try-catch:

```typescript
try {
  await signUp.create({ emailAddress, password });
} catch (err) {
  // Handle error (show message to user)
  console.error(JSON.stringify(err, null, 2));
}
```

### Loading States

Check `isLoaded` before accessing auth state:

```typescript
const { isLoaded, isSignedIn } = useAuth()

if (!isLoaded) {
  return <ActivityIndicator />
}
```

### Secure Storage

Always use `tokenCache` to store tokens securely:

```typescript
import { tokenCache } from '@clerk/clerk-expo/token-cache';
```

### Route Groups

Organize routes with Expo Router groups:

- `(auth)` - Sign-in, sign-up pages
- `(protected)` - Pages requiring authentication
- `(home)` - Public pages

## Common Patterns

### Access Clerk Instance

```typescript
const clerk = useClerk();

// Open user profile modal
clerk.openUserProfile();

// Sign out
await clerk.signOut();
```

### Session Management

```typescript
const { isLoaded, isSignedIn, sessionId, userId } = useAuth();
```

### User Profile Updates

```typescript
const { user } = useUser();

// Update user metadata
await user.update({
  firstName: 'John',
  lastName: 'Doe',
});
```

## Authentication Methods

### Email/Password

See examples above (most common).

### OAuth

Build custom OAuth flows using Clerk's connections:

```typescript
// Create OAuth sign-in
await signIn.create({
  strategy: 'oauth_google',
  redirectUrl: Linking.createURL('/(home)'),
});

// Handle OAuth redirect
useEffect(() => {
  const handleOAuthFlow = async () => {
    const { createdSessionId } = await signIn.firstFactorVerification.attempt();

    if (createdSessionId) {
      setActive({ session: createdSessionId });
    }
  };

  handleOAuthFlow();
}, []);
```

### Passwordless

Implement email or phone code verification:

```typescript
// Send verification code
await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

// Verify code
const attempt = await signUp.attemptEmailAddressVerification({ code });
```

## Additional Features

### MFA (Multi-Factor Authentication)

Add two-factor authentication to sign-in flows.

### User Profile Management

Allow users to update their profile information, avatar, and preferences.

### Organization Support

Manage organizations and team members with Clerk's organization features.

### Session Management

Handle multiple sessions, session tokens, and revocation.

## Resources

- [Clerk Expo Documentation](https://clerk.com/docs/expo)
- [Clerk Expo SDK Reference](https://clerk.com/docs/reference/expo/overview)
- [Custom Flows Guide](https://clerk.com/docs/guides/development/custom-flows/overview)
- [Error Handling](https://clerk.com/docs/guides/development/custom-flows/error-handling)
- [Clerk Dashboard](https://dashboard.clerk.com)
