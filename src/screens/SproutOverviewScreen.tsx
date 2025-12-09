import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BackButton } from '../components/buttons/BackButton';
import { IconButton } from '../components/buttons/IconButton';
import { SproutAvatar } from '../components/sprites/SproutAvatar';
import { useAppStore } from '../stores/useAppStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SproutOverview'>;

export const SproutOverviewScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { selectedSprout } = useAppStore();

    if (!selectedSprout) {return null;}

    const affirmations = selectedSprout.affirmations ?? [];
    const firstReframe = affirmations[0]?.text ?? 'No reframes yet';
    const triggers = selectedSprout.triggers ?? [];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} />
                <IconButton icon="⋮" onPress={() => navigation.navigate('SproutSettings')} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.sproutContainer}>
                    <SproutAvatar 
                        variant="full"
                        color={selectedSprout.color}
                        shapeId={selectedSprout.shapeId}
                        hatId={selectedSprout.hatId}
                        scale={1.2}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Reframes</Text>
                        <TouchableOpacity 
                            style={styles.sectionButton}
                            onPress={() => navigation.navigate('ReframesList')}
                        >
                            <Text style={styles.sectionButtonText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.previewCard}>
                        <Text style={styles.previewText}>{firstReframe}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Triggers</Text>
                        <TouchableOpacity 
                            style={styles.sectionButton}
                            onPress={() => navigation.navigate('TriggersList')}
                        >
                            <Text style={styles.sectionButtonText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {triggers.length > 0 ? (
                        <View style={styles.tagsContainer}>
                            {triggers.map((trigger) => (
                                <View key={trigger.id} style={styles.tag}>
                                    <Text style={styles.tagText}>{trigger.text}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No triggers added yet.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('SproutSettings')}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>✎</Text>
            </TouchableOpacity>
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
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    sproutContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    divider: {
        height: 2,
        backgroundColor: theme.colors.altGreen,
        marginVertical: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.black,
    },
    sectionButton: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
    },
    sectionButtonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.midGreen,
        fontWeight: theme.fontWeight.medium,
    },
    previewCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
    },
    previewText: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.black,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    tag: {
        backgroundColor: theme.colors.altGreen,
        borderRadius: theme.radius.full,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
    },
    tagText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.white,
        fontWeight: theme.fontWeight.medium,
    },
    emptyState: {
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.gray,
        fontStyle: 'italic',
    },
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
    fabIcon: {
        fontSize: 28,
        color: theme.colors.darkGreen,
    },
}));