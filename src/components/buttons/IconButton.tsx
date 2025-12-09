import { TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
}

export const IconButton = ({ icon, onPress }: IconButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    color: theme.colors.black,
  },
}));