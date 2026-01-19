import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet } from 'react-native';

export const HeaderButton = forwardRef<typeof Pressable, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <FontAwesome
            name="info-circle"
            size={24}
            color="var(--color-on-surface-variant)"
            style={[
              styles.headerRight,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          />
        )}
      </Pressable>
    );
  }
);

HeaderButton.displayName = 'HeaderButton';

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
  },
});
