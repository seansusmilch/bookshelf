import React, {Component, ReactNode} from 'react'
import {View, Text, TouchableOpacity} from 'react-native'

type ErrorBoundaryProps = {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

type ErrorBoundaryState = {
    hasError: boolean
    error: Error | null
}

export const ErrorBoundary = class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {hasError: false, error: null}
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {hasError: true, error}
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.props.onError?.(error, errorInfo)
    }

    handleReset = (): void => {
        this.setState({hasError: false, error: null})
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <View className="flex-1 items-center justify-center bg-gray-50 px-6">
                    <View className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
                        <Text className="mb-2 text-2xl font-bold text-red-500">Oops!</Text>
                        <Text className="mb-4 text-gray-600">
                            Something went wrong. Please try again.
                        </Text>
                        {this.state.error && (
                            <Text className="mb-4 font-mono text-sm text-gray-400">
                                {this.state.error.message}
                            </Text>
                        )}
                        <TouchableOpacity
                            onPress={this.handleReset}
                            className="w-full rounded-lg bg-blue-500 px-4 py-3 active:bg-blue-600">
                            <Text className="text-center font-semibold text-white">Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        return this.props.children
    }
}
