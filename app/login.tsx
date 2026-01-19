import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React from 'react';

import { Button } from '~/components/Button';
import { TextField } from '~/components/TextField';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

type AuthMode = 'signIn' | 'signUp' | 'verify';

export default function LoginScreen() {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  const [authMode, setAuthMode] = React.useState<AuthMode>('signIn');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [authError, setAuthError] = React.useState('');

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });

  const handleSignIn = async (data: SignInFormData) => {
    if (!signInLoaded) return;

    setAuthError('');

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        await setSignInActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setAuthError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === 'form_identifier_not_found') {
          signInForm.setError('email', { message: 'Email not found' });
        } else if (clerkError.code === 'form_password_incorrect') {
          signInForm.setError('password', { message: 'Incorrect password' });
        } else {
          setAuthError(clerkError.message || 'Sign in failed');
        }
      } else {
        setAuthError('An unexpected error occurred');
      }
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    if (!signUpLoaded) return;

    setAuthError('');

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setAuthMode('verify');
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError.code === 'form_identifier_exists') {
          signUpForm.setError('email', { message: 'Email already exists' });
        } else {
          setAuthError(clerkError.message || 'Sign up failed');
        }
      } else {
        setAuthError('An unexpected error occurred');
      }
    }
  };

  const handleVerify = async () => {
    if (!signUpLoaded) return;

    setAuthError('');

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (signUpAttempt.status === 'complete') {
        await setSignUpActive({ session: signUpAttempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setAuthError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        setAuthError(clerkError.message || 'Verification failed');
      } else {
        setAuthError('An unexpected error occurred');
      }
    }
  };

  const handleResendCode = async () => {
    if (!signUpLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } catch (err) {
      console.error('Failed to resend code:', err);
    }
  };

  if (authMode === 'verify') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gradient-to-b from-[--color-primary] via-[--color-primary-container] to-[--color-background]">
        <ScrollView contentContainerClassName="flex-1" keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-8">
            <View className="mb-16">
              <View className="mx-auto mb-8 overflow-hidden rounded-full bg-white shadow-xl">
                <View className="h-28 w-28 items-center justify-center bg-gradient-to-br from-[--color-primary] to-[--color-tertiary]">
                  <Text className="text-5xl">📚</Text>
                </View>
              </View>
              <View className="text-center">
                <Text className="mb-3 text-[36px] font-bold text-[--color-on-primary]">
                  Verify your email
                </Text>
                <Text className="text-lg leading-relaxed text-[--color-on-primary-container]">
                  Enter the 6-digit code sent to your email to continue
                </Text>
              </View>
            </View>

            <View className="mx-auto w-full max-w-sm rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
              <TextField
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
              />

              {authError ? (
                <View className="mb-4 rounded-xl bg-[--color-error-container] px-4 py-3">
                  <Text className="text-center text-sm font-medium text-[--color-on-error-container]">
                    {authError}
                  </Text>
                </View>
              ) : null}

              <Button title="Verify Email" onPress={handleVerify} className="mb-6 shadow-lg" />

              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-base text-[--color-on-surface-variant]">
                  Didn&apos;t receive a code?
                </Text>
                <Button title="Resend" variant="text" onPress={handleResendCode} />
              </View>

              <View className="mt-4 flex-row items-center justify-center border-t border-gray-200 pt-4">
                <Button
                  title="Back to Sign Up"
                  variant="text"
                  onPress={() => setAuthMode('signUp')}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
              <Text className="mb-2 text-[32px] font-medium text-[--color-on-surface]">
                {authMode === 'signIn' ? 'Welcome back' : 'Create account'}
              </Text>
              <Text className="text-base text-[--color-on-surface-variant]">
                {authMode === 'signIn'
                  ? 'Sign in to continue to Bookshelf'
                  : 'Sign up to get started with Bookshelf'}
              </Text>
            </View>
          </View>

          <View className="mx-auto w-full max-w-sm">
            <View className="mb-6 flex-row rounded-full bg-[--color-surface-container-low] p-1">
              <TouchableOpacity
                onPress={() => {
                  setAuthMode('signIn');
                  setAuthError('');
                }}
                className={`flex-1 rounded-full py-3 ${authMode === 'signIn' ? 'bg-[--color-primary]' : ''}`}>
                <Text
                  className={`text-center text-base font-medium ${authMode === 'signIn' ? 'text-[--color-on-primary]' : 'text-[--color-on-surface-variant]'}`}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode('signUp');
                  setAuthError('');
                }}
                className={`flex-1 rounded-full py-3 ${authMode === 'signUp' ? 'bg-[--color-primary]' : ''}`}>
                <Text
                  className={`text-center text-base font-medium ${authMode === 'signUp' ? 'text-[--color-on-primary]' : 'text-[--color-on-surface-variant]'}`}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {authError ? (
              <Text className="mb-4 text-center text-sm text-[--color-error]">{authError}</Text>
            ) : null}

            <TextField
              label="Email"
              placeholder="Enter your email"
              control={
                authMode === 'signIn' ? (signInForm.control as any) : (signUpForm.control as any)
              }
              name="email"
              error={
                authMode === 'signIn'
                  ? signInForm.formState.errors.email?.message
                  : signUpForm.formState.errors.email?.message
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextField
              label="Password"
              placeholder="Enter your password"
              control={
                authMode === 'signIn' ? (signInForm.control as any) : (signUpForm.control as any)
              }
              name="password"
              error={
                authMode === 'signIn'
                  ? signInForm.formState.errors.password?.message
                  : signUpForm.formState.errors.password?.message
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {authMode === 'signUp' && (
              <TextField
                label="Confirm Password"
                placeholder="Confirm your password"
                control={signUpForm.control as any}
                name="confirmPassword"
                error={signUpForm.formState.errors.confirmPassword?.message}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}

            {authMode === 'signIn' && (
              <View className="mb-6 self-end">
                <Button title="Forgot Password?" variant="text" onPress={() => {}} />
              </View>
            )}

            <Button
              title={authMode === 'signIn' ? 'Sign In' : 'Create Account'}
              onPress={
                authMode === 'signIn'
                  ? signInForm.handleSubmit(handleSignIn)
                  : signUpForm.handleSubmit(handleSignUp)
              }
              className="mb-4"
            />

            <View className="mb-6 flex-row items-center justify-center">
              <View className="h-px flex-1 bg-[--color-outline-variant]" />
              <View className="px-4">
                <Text className="text-sm text-[--color-on-surface-variant]">or continue with</Text>
              </View>
              <View className="h-px flex-1 bg-[--color-outline-variant]" />
            </View>

            <View className="mb-6 flex-row gap-4">
              <Button title="Google" variant="outlined" onPress={() => {}} className="flex-1" />
              <Button title="Apple" variant="outlined" onPress={() => {}} className="flex-1" />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
