import {ClerkProvider, useAuth} from '@clerk/clerk-expo'
import {tokenCache} from '@clerk/clerk-expo/token-cache'
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import {ConvexReactClient} from 'convex/react'
import {ConvexProviderWithClerk} from 'convex/react-clerk'
import {Stack} from 'expo-router'
import {StatusBar} from 'expo-status-bar'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import 'react-native-reanimated'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {KeyboardProvider} from 'react-native-keyboard-controller'

import {ErrorBoundary} from '@/components/error/ErrorBoundary'
import {Material3Provider} from '@/components/material3-provider'
import {useColorScheme} from '@/hooks/use-color-scheme'
import {ToastProvider} from '@/hooks/useToast'
import {QueryProvider} from '~/lib/query-client'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
    throw new Error(
        'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
    )
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
})

export const unstable_settings = {
    initialRouteName: 'index',
}

export default function RootLayout() {
    const colorScheme = useColorScheme()

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaProvider>
                <Material3Provider sourceColor="#0a7ea4" fallbackSourceColor="#0a7ea4">
                    <QueryProvider>
                        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
                            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                                <ThemeProvider
                                    value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                                    <ErrorBoundary>
                                        <KeyboardProvider>
                                            <ToastProvider>
                                                <Stack>
                                                    <Stack.Screen
                                                        name="index"
                                                        options={{headerShown: false}}
                                                    />
                                                    <Stack.Screen
                                                        name="(auth)"
                                                        options={{headerShown: false}}
                                                    />
                                                    <Stack.Screen
                                                        name="(tabs)"
                                                        options={{headerShown: false}}
                                                    />
                                                    <Stack.Screen
                                                        name="book/[id]"
                                                        options={{
                                                            headerTitle: '',
                                                            headerTransparent: true,
                                                            headerShadowVisible: false,
                                                        }}
                                                    />
                                                    <Stack.Screen
                                                        name="add-book/[workId]"
                                                        options={{
                                                            headerTitle: '',
                                                            headerTransparent: true,
                                                            headerShadowVisible: false,
                                                        }}
                                                    />
                                                </Stack>
                                                <StatusBar style="auto" />
                                            </ToastProvider>
                                        </KeyboardProvider>
                                    </ErrorBoundary>
                                </ThemeProvider>
                            </ConvexProviderWithClerk>
                        </ClerkProvider>
                    </QueryProvider>
                </Material3Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}
