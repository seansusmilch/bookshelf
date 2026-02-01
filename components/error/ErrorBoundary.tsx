import React, { Component, ReactNode } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { View as StyledView, Text as StyledText } from '@/tw';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export const ErrorBoundary = class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <StyledView className="flex-1 bg-gray-50 px-6 items-center justify-center">
          <StyledView className="w-full max-w-sm bg-white rounded-lg p-6 shadow-sm">
            <StyledText className="text-2xl font-bold text-red-500 mb-2">
              Oops!
            </StyledText>
            <StyledText className="text-gray-600 mb-4">
              Something went wrong. Please try again.
            </StyledText>
            {this.state.error && (
              <StyledText className="text-gray-400 text-sm mb-4 font-mono">
                {this.state.error.message}
              </StyledText>
            )}
            <TouchableOpacity
              onPress={this.handleReset}
              className="w-full bg-blue-500 rounded-lg py-3 px-4 active:bg-blue-600"
            >
              <Text className="text-white font-semibold text-center">
                Try Again
              </Text>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      );
    }

    return this.props.children;
  }
};
