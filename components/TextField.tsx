import { forwardRef, useState } from 'react';
import { Controller, Control, FieldValues, FieldPath } from 'react-hook-form';
import { Text, TextInput, TextInputProps, View } from 'react-native';

type ControlledTextFieldProps<T extends FieldValues = FieldValues> = {
  label?: string;
  error?: string;
  control: Control<T>;
  name: FieldPath<T>;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

type UncontrolledTextFieldProps = {
  label?: string;
  error?: string;
} & TextInputProps;

export const TextField = forwardRef<
  TextInput,
  ControlledTextFieldProps | UncontrolledTextFieldProps
>((props, ref) => {
  const { label, error, onFocus, onBlur, ...rest } = props;
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

  const ControlledField = <T extends FieldValues>({
    control,
    name,
    ...textInputProps
  }: ControlledTextFieldProps<T>) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur: fieldOnBlur, value } }) => (
          <View className={containerStyle}>
            {label && <Text className={labelStyle}>{label}</Text>}
            <View className={inputContainerStyle}>
              <TextInput
                ref={ref}
                value={value}
                onChangeText={onChange}
                onFocus={handleFocus}
                onBlur={(e) => {
                  fieldOnBlur();
                  handleBlur(e);
                }}
                placeholderTextColor="rgba(29, 25, 43, 0.5)"
                className={inputStyle}
                {...textInputProps}
                {...rest}
              />
            </View>
            {error && <Text className={helperTextStyle}>{error}</Text>}
          </View>
        )}
      />
    );
  };

  const UncontrolledField = ({
    value,
    onChangeText,
    ...textInputProps
  }: UncontrolledTextFieldProps) => {
    return (
      <View className={containerStyle}>
        {label && <Text className={labelStyle}>{label}</Text>}
        <View className={inputContainerStyle}>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="rgba(29, 25, 43, 0.5)"
            className={inputStyle}
            {...textInputProps}
            {...rest}
          />
        </View>
        {error && <Text className={helperTextStyle}>{error}</Text>}
      </View>
    );
  };

  if ('control' in props && 'name' in props) {
    const { control, name } = props as ControlledTextFieldProps;
    return <ControlledField control={control} name={name} />;
  }

  return <UncontrolledField {...(rest as UncontrolledTextFieldProps)} />;
});

TextField.displayName = 'TextField';
