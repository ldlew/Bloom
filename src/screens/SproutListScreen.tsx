import { useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SproutListCard } from '../components/cards/SproutListCard';
import { FAB } from '../components/buttons/FAB';
import { BackButton } from '../components/buttons/BackButton';
import { useAppStore } from '../stores/useAppStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SproutList'>;

export const SproutListScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { sprouts, createSprout, deleteSprout, selectSprout, logout, loadSprouts } = useAppStore();

    useEffect(() => {
        loadSprouts();
    }, []);

    const handleAddSprout = async () => {
        try {
            await createSprout();
        } catch (error) {
            Alert.alert('Error', 'Failed to create sprout');
        }
    };

    const handleDeleteSprout = (sproutId: string) => {
        Alert.alert(
            'Delete Sprout',
            'Are you sure you want to delete this sprout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteSprout(sproutId) },
            ],
        );
    };

    const handleSproutPress = async (sproutId: string) => {
        await selectSprout(sproutId);
        navigation.navigate('SproutDetail', { sproutId });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <BackButton onPress={logout} />
                    <Text style={styles.title}>Your Sprouts</Text>
                </View>

                {sprouts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No sprouts yet!</Text>
                        <Text style={styles.emptySubtext}>Tap + to create your first sprout</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sprouts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <SproutListCard
                                text={item.firstAffirmationText ?? 'No affirmations yet'}
                                color={item.color}
                                shapeId={item.shapeId}
                                hatId={item.hatId}
                                onPress={() => handleSproutPress(item.id)}
                                onLongPress={() => handleDeleteSprout(item.id)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <FAB onPress={handleAddSprout} />
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
    },
    header: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.black,
        marginTop: theme.spacing.sm,
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: theme.fontSize.xl,
        color: theme.colors.black,
        opacity: 0.4,
    },
    emptySubtext: {
        fontSize: theme.fontSize.md,
        color: theme.colors.black,
        opacity: 0.3,
        marginTop: theme.spacing.sm,
    },
}));