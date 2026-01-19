import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonProps = {
  title: string;
  variant?: 'filled' | 'outlined' | 'text';
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'filled', ...touchableProps }, ref) => {
    const getButtonStyle = () => {
      switch (variant) {
        case 'outlined':
          return styles.outlinedButton;
        case 'text':
          return styles.textButton;
        default:
          return styles.filledButton;
      }
    };

    const getTextStyle = () => {
      switch (variant) {
        case 'outlined':
          return styles.outlinedButtonText;
        case 'text':
          return styles.textButtonText;
        default:
          return styles.filledButtonText;
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        activeOpacity={0.8}
        {...touchableProps}
        className={`${getButtonStyle()} ${touchableProps.className}`}>
        <Text className={getTextStyle()}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = {
  filledButton:
    'items-center justify-center bg-[--color-primary] rounded-full h-14 px-8 w-full active:opacity-90',
  filledButtonText: 'text-[--color-on-primary] text-base font-medium text-center',
  outlinedButton:
    'items-center justify-center bg-transparent border-2 border-[--color-primary] rounded-full h-14 px-8 w-full active:opacity-90',
  outlinedButtonText: 'text-[--color-primary] text-base font-medium text-center',
  textButton:
    'items-center justify-center bg-transparent rounded-full h-14 px-8 w-full active:opacity-90',
  textButtonText: 'text-[--color-primary] text-base font-medium text-center',
};
