import {View, Pressable, Text, Image} from 'react-native'
import {forwardRef} from 'react'
import {useAppTheme} from '@/components/material3-provider'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

type CardProps = {
    children: React.ReactNode
    variant?: 'elevated' | 'filled' | 'outlined'
    onPress?: () => void
    className?: string
    style?: any
}

export const Card = forwardRef<any, CardProps>(
    ({children, variant = 'elevated', onPress, className = '', style}, ref) => {
        const {colors} = useAppTheme()

        const variantStyles = {
            elevated: {
                bg: colors.surface,
                borderColor: 'border-transparent',
                elevation: 1,
            },
            filled: {
                bg: colors.surfaceVariant,
                borderColor: 'border-transparent',
                elevation: 0,
            },
            outlined: {
                bg: colors.surface,
                borderColor: `border border-[${colors.outline}]`,
                elevation: 0,
            },
        }

        const styles = variantStyles[variant]

        const Wrapper = onPress ? Pressable : View

        return (
            <Wrapper
                ref={ref as any}
                onPress={onPress}
                className={`overflow-hidden rounded-2xl ${styles.borderColor} ${className}`}
                style={{
                    backgroundColor: styles.bg,
                    elevation: styles.elevation,
                    ...style,
                }}>
                {children}
            </Wrapper>
        )
    }
)

Card.displayName = 'Card'

type CardCoverProps = {
    source: {uri: string} | number
    height?: number
    className?: string
}

export const CardCover = ({source, height = 200, className = ''}: CardCoverProps) => {
    return (
        <Image
            source={source}
            className={`w-full ${className}`}
            style={{height}}
            resizeMode="cover"
        />
    )
}

type CardContentProps = {
    children: React.ReactNode
    className?: string
}

export const CardContent = ({children, className = ''}: CardContentProps) => {
    return (
        <View className={`p-4 ${className}`} style={{backgroundColor: 'transparent'}}>
            {children}
        </View>
    )
}

type CardTitleProps = {
    title: string
    subtitle?: string
    className?: string
}

export const CardTitle = ({title, subtitle, className = ''}: CardTitleProps) => {
    const {colors} = useAppTheme()

    return (
        <View className={`mb-2 ${className}`}>
            <Text
                className="text-lg font-semibold"
                style={{color: colors.onSurface}}
                numberOfLines={2}>
                {title}
            </Text>
            {subtitle && (
                <Text
                    className="mt-0.5 text-sm"
                    style={{color: colors.onSurfaceVariant}}
                    numberOfLines={1}>
                    {subtitle}
                </Text>
            )}
        </View>
    )
}

type CardActionsProps = {
    children: React.ReactNode
    className?: string
}

export const CardActions = ({children, className = ''}: CardActionsProps) => {
    return (
        <View className={`flex-row justify-end gap-2 px-4 pb-4 pt-0 ${className}`}>{children}</View>
    )
}

type CardMediaProps = {
    uri?: string
    title?: string
    size?: 'small' | 'medium' | 'large'
    className?: string
    icon?: React.ReactNode
}

export const CardMedia = ({uri, title, size = 'medium', className = '', icon}: CardMediaProps) => {
    const {colors} = useAppTheme()
    const sizeStyles = {
        small: 'w-12 h-16',
        medium: 'w-20 h-28',
        large: 'w-28 h-40',
    }

    if (uri) {
        return (
            <Image
                source={{uri}}
                className={`${sizeStyles[size]} rounded-xl ${className}`}
                resizeMode="cover"
            />
        )
    }

    return (
        <View
            className={`${sizeStyles[size]} items-center justify-center rounded-xl ${className}`}
            style={{backgroundColor: colors.surfaceContainerHighest}}>
            {icon || (
                <MaterialIcons
                    name="menu-book"
                    size={size === 'small' ? 24 : 32}
                    color={colors.onSurfaceVariant}
                />
            )}
        </View>
    )
}
