import { View } from 'react-native';

type CardProps = {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
} & React.ComponentProps<typeof View>;

export const Card = ({ children, variant = 'elevated', ...props }: CardProps) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.filledCard;
      case 'outlined':
        return styles.outlinedCard;
      default:
        return styles.elevatedCard;
    }
  };

  return <View className={`${getCardStyle()} ${props.className}`}>{children}</View>;
};

const styles = {
  elevatedCard: 'bg-[--color-surface-container-low] rounded-2xl p-4',
  filledCard: 'bg-[--color-primary-container] rounded-2xl p-4',
  outlinedCard: 'bg-[--color-surface] border-2 border-[--color-outline] rounded-2xl p-4',
};
