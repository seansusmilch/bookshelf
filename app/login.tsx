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

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type AuthFormData = z.infer<typeof authSchema>;

type AuthMode = 'signIn' | 'signUp' | 'verify';

export default function LoginScreen() {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  const [authMode, setAuthMode] = React.useState<AuthMode>('signIn');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');

  const authForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    mode: 'onBlur',
  });

  const handleSignIn = async (data: AuthFormData) => {
    if (!signInLoaded) return;

    setAuthError('');
    setUserEmail(data.email);

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        strategy: 'email_code',
      });

      if (signInAttempt.status === 'needs_first_factor') {
        setAuthMode('verify');
      } else if (signInAttempt.status === 'complete') {
        await setSignInActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setAuthError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        switch (clerkError.code) {
          case 'form_identifier_not_found':
            authForm.setError('email', {
              message: 'Email not found. Please check your email or sign up.',
            });
            break;
          case 'form_identifier_missing':
            authForm.setError('email', { message: 'Email is required' });
            break;
          case 'form_identifier_invalid':
            authForm.setError('email', { message: 'Invalid email format' });
            break;
          default:
            setAuthError(clerkError.message || 'Sign in failed. Please try again.');
        }
      } else if (err.message) {
        setAuthError(err.message);
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSignUp = async (data: AuthFormData) => {
    if (!signUpLoaded) return;

    setAuthError('');
    setUserEmail(data.email);

    try {
      await signUp.create({
        emailAddress: data.email,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setAuthMode('verify');
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        switch (clerkError.code) {
          case 'form_identifier_exists':
            authForm.setError('email', { message: 'Email already exists. Please sign in.' });
            break;
          case 'form_identifier_invalid':
            authForm.setError('email', { message: 'Invalid email format' });
            break;
          case 'form_identifier_missing':
            authForm.setError('email', { message: 'Email is required' });
            break;
          default:
            setAuthError(clerkError.message || 'Sign up failed. Please try again.');
        }
      } else if (err.message) {
        setAuthError(err.message);
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleVerify = async () => {
    setAuthError('');

    try {
      if (authMode === 'verify' && signUpLoaded) {
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });

        if (signUpAttempt.status === 'complete') {
          await setSignUpActive({ session: signUpAttempt.createdSessionId });
          router.replace('/(tabs)');
        } else {
          setAuthError('Verification failed. Please try again.');
        }
      } else if (signInLoaded) {
        const signInAttempt = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: verificationCode,
        });

        if (signInAttempt.status === 'complete') {
          await setSignInActive({ session: signInAttempt.createdSessionId });
          router.replace('/(tabs)');
        } else {
          setAuthError('Verification failed. Please try again.');
        }
      }
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        switch (clerkError.code) {
          case 'form_code_incorrect':
            setAuthError('Incorrect verification code. Please try again.');
            break;
          case 'form_code_expired':
            setAuthError('Verification code has expired. Please request a new one.');
            break;
          case 'form_code_invalid':
            setAuthError('Invalid verification code. Please check and try again.');
            break;
          case 'form_code_missing':
            setAuthError('Please enter the verification code.');
            break;
          default:
            setAuthError(clerkError.message || 'Verification failed. Please try again.');
        }
      } else if (err.message) {
        setAuthError(err.message);
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleResendCode = async () => {
    setAuthError('');

    try {
      if (signUpLoaded && authMode === 'verify') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else if (signInLoaded) {
        await signIn.create({
          identifier: userEmail,
          strategy: 'email_code',
        });
      }
    } catch (err: any) {
      if (err.errors) {
        const clerkError = err.errors[0];
        setAuthError(clerkError.message || 'Failed to resend code. Please try again.');
      } else if (err.message) {
        setAuthError(err.message);
      } else {
        setAuthError('Failed to resend code. Please try again.');
      }
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
                <Text className="mb-2 text-lg text-[--color-on-primary-container]">
                  Enter the 6-digit code sent to
                </Text>
                <Text className="text-lg font-semibold text-[--color-primary]">{userEmail}</Text>
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
                  title="Back"
                  variant="text"
                  onPress={() => setAuthMode(signUpLoaded ? 'signUp' : 'signIn')}
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
      className="flex-1 bg-gradient-to-b from-[--color-primary] via-[--color-primary-container] to-[--color-background]">
      <ScrollView contentContainerClassName="flex-1" keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-8">
          <View className="mb-12">
            <View className="mx-auto mb-8 overflow-hidden rounded-full bg-white shadow-xl">
              <View className="h-28 w-28 items-center justify-center bg-gradient-to-br from-[--color-primary] to-[--color-tertiary]">
                <Text className="text-5xl">📚</Text>
              </View>
            </View>
            <View className="text-center">
              <Text className="mb-3 text-[36px] font-bold text-[--color-on-primary]">
                {authMode === 'signIn' ? 'Welcome back' : 'Create account'}
              </Text>
              <Text className="text-lg leading-relaxed text-[--color-on-primary-container]">
                {authMode === 'signIn'
                  ? 'Sign in to continue to Bookshelf'
                  : 'Sign up to get started with Bookshelf'}
              </Text>
            </View>
          </View>

          <View className="mx-auto w-full max-w-sm">
            <View className="mb-8 overflow-hidden rounded-2xl bg-white/90 p-1.5 shadow-lg backdrop-blur-xl">
              <View className="flex-row rounded-xl bg-gray-100 p-1">
                <TouchableOpacity
                  onPress={() => {
                    setAuthMode('signIn');
                    setAuthError('');
                  }}
                  className={`flex-1 rounded-lg py-3.5 transition-all duration-300 ${
                    authMode === 'signIn' ? 'bg-white shadow-md' : ''
                  }`}>
                  <Text
                    className={`text-center text-base font-semibold ${
                      authMode === 'signIn'
                        ? 'text-[--color-primary]'
                        : 'text-[--color-on-surface-variant]'
                    }`}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setAuthMode('signUp');
                    setAuthError('');
                  }}
                  className={`flex-1 rounded-lg py-3.5 transition-all duration-300 ${
                    authMode === 'signUp' ? 'bg-white shadow-md' : ''
                  }`}>
                  <Text
                    className={`text-center text-base font-semibold ${
                      authMode === 'signUp'
                        ? 'text-[--color-primary]'
                        : 'text-[--color-on-surface-variant]'
                    }`}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
              {authError ? (
                <View className="mb-4 rounded-xl bg-[--color-error-container] px-4 py-3">
                  <Text className="text-center text-sm font-medium text-[--color-on-error-container]">
                    {authError}
                  </Text>
                </View>
              ) : null}

              <TextField
                label="Email"
                placeholder="Enter your email"
                control={authForm.control as any}
                name="email"
                error={authForm.formState.errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Button
                title={authMode === 'signIn' ? 'Send Sign In Code' : 'Send Sign Up Code'}
                onPress={
                  authMode === 'signIn'
                    ? authForm.handleSubmit(handleSignIn)
                    : authForm.handleSubmit(handleSignUp)
                }
                className="mb-6 shadow-lg"
              />

              <View className="mb-6 flex-row items-center justify-center">
                <View className="h-px flex-1 bg-gray-200" />
                <View className="px-4">
                  <Text className="text-sm text-[--color-on-surface-variant]">
                    or continue with
                  </Text>
                </View>
                <View className="h-px flex-1 bg-gray-200" />
              </View>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => {}}
                  className="flex-1 flex-row items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white py-4 shadow-sm transition-all active:scale-95">
                  <Text className="text-xl">G</Text>
                  <Text className="font-semibold text-gray-700">Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {}}
                  className="flex-1 flex-row items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white py-4 shadow-sm transition-all active:scale-95">
                  <Text className="text-xl">🍎</Text>
                  <Text className="font-semibold text-gray-700">Apple</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
