import { ScrollView, View, Text, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppTheme } from '@/components/material3-provider';

type FilterTabsProps = {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'reading', label: 'Reading' },
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'completed', label: 'Completed' },
];

export const FilterTabs = ({ selectedStatus, onStatusChange }: FilterTabsProps) => {
  const [activeStatus, setActiveStatus] = useState(selectedStatus);
  const { colors } = useAppTheme();

  useEffect(() => {
    setActiveStatus(selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    onStatusChange(status);
  };

  return (
    <View className="px-4 py-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleStatusChange(option.value)}
              className={`px-4 py-2 rounded-full ${
                activeStatus === option.value ? '' : ''
              }`}
              style={{
                backgroundColor: activeStatus === option.value ? colors.primary : colors.surfaceContainerHighest,
              }}
            >
              <Text
                className={`text-sm font-medium ${
                  activeStatus === option.value ? '' : ''
                }`}
                style={{
                  color: activeStatus === option.value ? colors.onPrimary : colors.onSurfaceVariant,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
