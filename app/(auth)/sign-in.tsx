import { View, Text, Pressable, TextInput, ScrollView } from '@/tw';
import { useSignIn, useSignUp, useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FontAwesome } from '@expo/vector-icons';
import { useWarmUpBrowser } from '@/hooks/use-warm-up-browser';

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
};

function Button({ children, onPress, variant = 'primary', disabled = false, className = '' }: ButtonProps) {
  const baseStyles = 'p-4 rounded-xl items-center justify-center transition-all';
  const variants = {
    primary: 'bg-blue-600',
    secondary: 'bg-white',
    outline: 'border-2 border-gray-300 bg-transparent',
  };
  const textStyles = variant === 'primary' ? 'text-white font-semibold' : 'text-gray-900 font-semibold';

  return (
    <Pressable
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={textStyles}>{children}</Text>
    </Pressable>
  );
}

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  useWarmUpBrowser();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showOTP, setShowOTP] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const isLoaded = signInLoaded && signUpLoaded;

  const onGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startGoogleOAuthFlow();

      if (createdSessionId) {
        setActiveOAuth!({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      console.error('OAuth error', JSON.stringify(err, null, 2));
    }
  }, [startGoogleOAuthFlow, router]);

  const onApplePress = React.useCallback(async () => {
    if (Platform.OS === 'web') {
      alert('Apple Sign In is only available on iOS devices');
      return;
    }

    if (Platform.OS === 'android') {
      alert('Apple Sign In is not available on Android');
      return;
    }

    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startAppleOAuthFlow();

      if (createdSessionId) {
        setActiveOAuth!({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      console.error('OAuth error', JSON.stringify(err, null, 2));
    }
  }, [startAppleOAuthFlow, router]);

  const onSendOTPPress = async () => {
    if (!isLoaded || !emailAddress || loading) return;

    setLoading(true);
    setError('');
    try {
      await signIn.create({
        identifier: emailAddress,
      });

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: 'primary',
      });
      setOtpSent(true);
      setShowOTP(true);
    } catch (err: any) {
      if (err?.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          await signUp.create({
            emailAddress,
          });

          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setOtpSent(true);
          setShowOTP(true);
        } catch (signUpErr) {
          console.error(JSON.stringify(signUpErr, null, 2));
          setError('Something went wrong. Please try again.');
        }
      } else {
        console.error(JSON.stringify(err, null, 2));
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTPPress = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    setError('');
    try {
      let attempt: any;

      try {
        attempt = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });
      } catch (signInErr: any) {
        if (signInErr?.errors?.[0]?.code === 'form_password_incorrect') {
          attempt = await signUp.attemptEmailAddressVerification({
            code,
          });
        } else {
          throw signInErr;
        }
      }

      if (attempt?.status === 'complete') {
        router.replace('/');
      } else {
        console.error(JSON.stringify(attempt, null, 2));
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || !emailAddress || loading) return;

    setLoading(true);
    setError('');
    try {
      try {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: 'primary',
        });
      } catch {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      setError('Code sent again!');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f9fafb' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ justifyContent: 'center', padding: 24, paddingTop: 48, paddingBottom: 48 }}>
            <View style={{ width: '100%', maxWidth: 384, marginHorizontal: 'auto' }}>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">Verification</Text>
            <Text className="text-base text-gray-600 mb-2 text-center">
              We&apos;ve sent a 6-digit code to
            </Text>
              <Text className="text-base text-gray-900 font-semibold mb-8 text-center">
                {emailAddress}
              </Text>

              <TextInput
                className="bg-white border border-gray-300 rounded-xl p-4 text-base mb-6 text-center text-2xl tracking-widest"
                value={code}
                placeholder="000000"
                placeholderTextColor="#9ca3af"
                onChangeText={(code) => setCode(code)}
                keyboardType="numeric"
                maxLength={6}
              />

              <Button onPress={onVerifyOTPPress} disabled={loading || code.length !== 6}>
                {loading ? 'Verifying...' : 'Continue'}
              </Button>

              <Pressable onPress={onResendCode} className="mt-4 py-2">
                <Text className="text-blue-600 text-center text-sm font-semibold">Resend code</Text>
              </Pressable>

              {error && (
                <Text className="text-red-600 text-center text-sm mt-4">{error}</Text>
              )}

              <Button onPress={() => setShowOTP(false)} variant="outline" className="mt-6">
                Use a different email
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ justifyContent: 'center', padding: 24, paddingTop: 48, paddingBottom: 48 }}>
          <View style={{ width: '100%', maxWidth: 384, marginHorizontal: 'auto' }}>
            <Text className="text-4xl font-bold text-gray-900 mb-3 text-center">Welcome!</Text>
            <Text className="text-base text-gray-600 mb-10 text-center">
              Sign in or create an account to get started
            </Text>

            <Button onPress={onGooglePress} variant="outline" className="mb-3">
              <View className="flex-row items-center gap-3">
                <FontAwesome name="google" size={20} color="#4285F4" />
                <Text>Continue with Google</Text>
              </View>
            </Button>

            {Platform.OS === 'ios' && (
              <Button onPress={onApplePress} variant="outline" className="mb-6">
                <View className="flex-row items-center gap-3">
                  <FontAwesome name="apple" size={20} color="#000000" />
                  <Text>Continue with Apple</Text>
                </View>
              </Button>
            )}

            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-gray-500 text-sm">or continue with email</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl p-4 text-base mb-4"
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter your email address"
              placeholderTextColor="#9ca3af"
              onChangeText={(email) => setEmailAddress(email)}
              keyboardType="email-address"
            />

            {otpSent ? (
              <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <Text className="text-green-800 font-semibold mb-1">Code sent successfully!</Text>
                <Text className="text-green-700 text-sm">
                  Check your inbox for the verification code.
                </Text>
              </View>
            ) : (
              <Button onPress={onSendOTPPress} disabled={!emailAddress || loading}>
                {loading ? 'Sending...' : 'Send code'}
              </Button>
            )}

            {error && (
              <Text className="text-red-600 text-center text-sm mt-4">{error}</Text>
            )}

            <View className="flex-row justify-center items-center gap-2 mt-8">
              <Text className="text-gray-600 text-sm">By continuing, you agree to our</Text>
              <Text className="text-blue-600 text-sm font-semibold">Terms</Text>
              <Text className="text-gray-600 text-sm">&</Text>
              <Text className="text-blue-600 text-sm font-semibold">Privacy Policy</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
