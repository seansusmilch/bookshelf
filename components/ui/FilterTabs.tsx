import { ScrollView as RNScrollView } from 'react-native';
import { View, Text, Pressable } from '@/tw';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setActiveStatus(selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    onStatusChange(status);
  };

  return (
    <View className="px-4 py-2">
      <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleStatusChange(option.value)}
              className={`px-4 py-2 rounded-full ${
                activeStatus === option.value ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeStatus === option.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </RNScrollView>
    </View>
  );
};
