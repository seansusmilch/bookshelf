import { Pressable, View, Text, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Action = {
  label: string;
  icon: string;
  onPress: () => void;
};

type BookActionsMenuProps = {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
};

export const BookActionsMenu = ({ visible, onClose, actions }: BookActionsMenuProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/50 items-end justify-start pt-16 pr-4"
      >
        <View className="bg-white rounded-xl shadow-lg w-48 overflow-hidden">
          {actions.map((action, index) => (
            <Pressable
              key={index}
              onPress={() => {
                action.onPress();
                onClose();
              }}
              className={`flex-row items-center gap-3 px-4 py-3 ${
                index !== actions.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <FontAwesome name={action.icon as any} size={16} color="#374151" />
              <Text className="text-sm text-gray-900">{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};
