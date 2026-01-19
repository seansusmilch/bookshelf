import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '~/components/Button';
import { TextField } from '~/components/TextField';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[--color-background]">
      <ScrollView contentContainerClassName="flex-1" keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6">
          <View className="mb-12">
            <View className="mx-auto mb-6 h-24 w-24 items-center justify-center rounded-full bg-[--color-primary-container]">
              <View className="h-12 w-12 rounded-full bg-[--color-primary]" />
            </View>
            <View className="text-center">
              <View className="mb-2 text-[32px] font-medium text-[--color-on-surface]">
                Welcome back
              </View>
              <View className="text-base text-[--color-on-surface-variant]">
                Sign in to continue to Bookshelf
              </View>
            </View>
          </View>

          <View className="mx-auto w-full max-w-sm">
            <TextField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <TextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.password}
            />

            <View className="mb-6 self-end">
              <Button title="Forgot Password?" variant="text" />
            </View>

            <Button title="Sign In" onPress={handleLogin} className="mb-4" />

            <View className="mb-6 flex-row items-center justify-center">
              <View className="h-px flex-1 bg-[--color-outline-variant]" />
              <View className="px-4">
                <View className="text-sm text-[--color-on-surface-variant]">or continue with</View>
              </View>
              <View className="h-px flex-1 bg-[--color-outline-variant]" />
            </View>

            <View className="mb-6 flex-row gap-4">
              <Button title="Google" variant="outlined" onPress={() => {}} className="flex-1" />
              <Button title="Apple" variant="outlined" onPress={() => {}} className="flex-1" />
            </View>

            <View className="flex-row items-center justify-center">
              <View className="text-base text-[--color-on-surface-variant]">
                Don&apos;t have an account?
              </View>
              <Button title="Sign Up" variant="text" />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
