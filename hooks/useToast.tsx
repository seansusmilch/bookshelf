import {useAppTheme} from '@/components/material3-provider'
import React, {createContext, ReactNode, useCallback, useContext} from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import Toast from 'react-native-toast-message'

type ToastContextType = {
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showInfo: (message: string) => void
    hide: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const SuccessToast = ({message}: {message: string}) => {
    const {colors} = useAppTheme()

    return (
        <View
            style={[
                styles.toastContainer,
                {backgroundColor: colors.surface, borderColor: colors.primary},
            ]}>
            <View style={styles.iconContainer}>
                <Text style={[styles.icon, {color: colors.primary}]}>✓</Text>
            </View>
            <Text style={[styles.message, {color: colors.onSurface}]}>{message}</Text>
        </View>
    )
}

const ErrorToast = ({message}: {message: string}) => {
    const {colors} = useAppTheme()

    return (
        <View
            style={[
                styles.toastContainer,
                {backgroundColor: colors.surface, borderColor: colors.error},
            ]}>
            <View style={styles.iconContainer}>
                <Text style={[styles.icon, {color: colors.error}]}>✕</Text>
            </View>
            <Text style={[styles.message, {color: colors.onSurface}]}>{message}</Text>
        </View>
    )
}

const InfoToast = ({message}: {message: string}) => {
    const {colors} = useAppTheme()

    return (
        <View
            style={[
                styles.toastContainer,
                {backgroundColor: colors.surface, borderColor: colors.primary},
            ]}>
            <View style={styles.iconContainer}>
                <Text style={[styles.icon, {color: colors.primary}]}>ℹ</Text>
            </View>
            <Text style={[styles.message, {color: colors.onSurface}]}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 16,
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
})

const toastConfig = {
    success: ({props}: any) => <SuccessToast {...props} />,
    error: ({props}: any) => <ErrorToast {...props} />,
    info: ({props}: any) => <InfoToast {...props} />,
}

export const ToastProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const showSuccess = useCallback((message: string) => {
        Toast.show({
            type: 'success',
            props: {message},
            position: 'bottom',
            visibilityTime: 3000,
            autoHide: true,
            bottomOffset: Platform.OS === 'ios' ? 90 : 120,
        })
    }, [])

    const showError = useCallback((message: string) => {
        Toast.show({
            type: 'error',
            props: {message},
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
            bottomOffset: Platform.OS === 'ios' ? 90 : 120,
        })
    }, [])

    const showInfo = useCallback((message: string) => {
        Toast.show({
            type: 'info',
            props: {message},
            position: 'bottom',
            visibilityTime: 3000,
            autoHide: true,
            bottomOffset: Platform.OS === 'ios' ? 90 : 120,
        })
    }, [])

    const hide = useCallback(() => {
        Toast.hide()
    }, [])

    const contextValue: ToastContextType = {showSuccess, showError, showInfo, hide}

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <Toast config={toastConfig} />
        </ToastContext.Provider>
    )
}

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
