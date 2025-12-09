import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useAppStore } from '../stores/useAppStore';
import { SproutAvatar } from '../components/sprites/SproutAvatar';

export const LoginScreen = () => {
    const login = useAppStore(state => state.login);
    const loadSprouts = useAppStore(state => state.loadSprouts);
  
    const handleLogin = async () => {
        login('mock-user-id');
        await loadSprouts();
    };
  
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <View style={styles.hero}>
                    <SproutAvatar variant="full" />
                </View>
                
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Bloom</Text>
                    <Text style={styles.subtitle}>Grow your daily affirmations</Text>
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin} activeOpacity={0.6}>
                        <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.cream,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        justifyContent: 'center',
    },
    hero: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    title: {
        fontSize: theme.fontSize.xxxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.black,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.gray,
    },
    buttonContainer: {
        gap: theme.spacing.md,
    },
    button: {
        backgroundColor: theme.colors.primaryGreen,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.md,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.darkGreen,
    },
    secondaryButton: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.gray,
    },
}));