import { TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface FABProps {
  onPress: () => void;
}

export const FAB = ({ onPress }: FABProps) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 32,
    color: theme.colors.darkGreen,
    fontWeight: theme.fontWeight.medium,
    marginTop: -2,
  },
}));