import { TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface BackButtonProps {
  onPress: () => void;
}

export const BackButton = ({ onPress }: BackButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.icon}>←</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    color: theme.colors.gray,
  },
}));