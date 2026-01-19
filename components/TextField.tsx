import { forwardRef, useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

type TextFieldProps = {
  label?: string;
  error?: string;
} & TextInputProps;

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, value, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const containerStyle = `w-full mb-4`;

    const labelStyle = `ml-4 mb-2 text-sm font-medium ${error ? 'text-[--color-error]' : 'text-[--color-on-surface-variant]'}`;

    const inputContainerStyle = `
      bg-[--color-surface-container-low]
      rounded-2xl
      px-4
      py-4
      ${isFocused ? 'border-2 border-[--color-primary]' : 'border-2 border-transparent'}
      ${error ? 'border-[--color-error]' : ''}
    `;

    const inputStyle = `
      text-base
      text-[--color-on-surface]
      placeholder:text-[--color-on-surface-variant]
    `;

    const helperTextStyle = `ml-4 mt-1 text-xs ${error ? 'text-[--color-error]' : 'text-[--color-on-surface-variant]'}`;

    return (
      <View className={containerStyle}>
        {label && <Text className={labelStyle}>{label}</Text>}
        <View className={inputContainerStyle}>
          <TextInput
            ref={ref}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="rgba(29, 25, 43, 0.5)"
            className={inputStyle}
            {...props}
          />
        </View>
        {error && <Text className={helperTextStyle}>{error}</Text>}
      </View>
    );
  }
);

TextField.displayName = 'TextField';
