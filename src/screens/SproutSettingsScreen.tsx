import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BackButton } from '../components/buttons/BackButton';
import { useAppStore } from '../stores/useAppStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SproutSettings'>;

interface MenuItemProps {
    label: string;
    onPress: () => void;
}

const MenuItem = ({ label, onPress }: MenuItemProps) => (
    <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.7}>
        <Text style={menuStyles.label}>{label}</Text>
        <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
);

const menuStyles = StyleSheet.create((theme) => ({
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.black,
        fontWeight: theme.fontWeight.medium,
    },
    arrow: {
        fontSize: theme.fontSize.xl,
        color: theme.colors.altGreen,
        fontWeight: theme.fontWeight.bold,
    },
}));

export const SproutSettingsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { selectedSprout, deleteSprout, clearSelectedSprout, loadSprouts } = useAppStore();

    if (!selectedSprout) {return null;}

    const handleDelete = () => {
        Alert.alert(
            'Delete Sprout',
            'Are you sure you want to delete this sprout? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSprout(selectedSprout.id);
                            clearSelectedSprout();
                            await loadSprouts();
                            navigation.navigate('SproutList');
                        } catch (_error) {
                            Alert.alert('Error', 'Failed to delete sprout');
                        }
                    },
                },
            ],
        );
    };

    const handleComingSoon = (feature: string) => {
        Alert.alert('Coming Soon', `${feature} will be available in a future update.`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} />
                <TouchableOpacity onPress={handleDelete}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Your Sprout</Text>
                
                <MenuItem label="Reframes" onPress={() => navigation.navigate('ReframesList')} />
                <MenuItem label="Triggers" onPress={() => navigation.navigate('TriggersList')} />
                <MenuItem label="Appearance" onPress={() => navigation.navigate('SproutAppearance')} />
                <MenuItem label="Plant Sprout" onPress={() => handleComingSoon('Plant Sprout')} />

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Options</Text>
                
                <MenuItem label="Notifications" onPress={() => handleComingSoon('Notifications')} />
                <MenuItem label="Widgets" onPress={() => handleComingSoon('Widgets')} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.cream,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    deleteText: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.altGreen,
        fontWeight: theme.fontWeight.medium,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.black,
        marginBottom: theme.spacing.lg,
        marginTop: theme.spacing.md,
    },
    divider: {
        height: 2,
        backgroundColor: theme.colors.altGreen,
        marginVertical: theme.spacing.lg,
    },
}));