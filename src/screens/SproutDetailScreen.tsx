import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BackButton } from '../components/buttons/BackButton';
import { IconButton } from '../components/buttons/IconButton';
import { SproutAvatar } from '../components/sprites/SproutAvatar';
import { useAppStore } from '../stores/useAppStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SproutDetail'>;

export const SproutDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { selectedSprout, clearSelectedSprout } = useAppStore();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isUp, setIsUp] = useState(false);

    const affirmations = selectedSprout?.affirmations ?? [];
    const hasAffirmations = affirmations.length > 0;
    
    useEffect(() => {
        if (currentIndex >= affirmations.length && affirmations.length > 0) {
            setCurrentIndex(affirmations.length - 1);
        } else if (affirmations.length === 0) {
            setCurrentIndex(0);
        }
    }, [affirmations.length, currentIndex]);

    const currentAffirmation = hasAffirmations ? affirmations[currentIndex] : null;

    if (!selectedSprout) {return null;}

    const handleBack = () => {
        clearSelectedSprout();
        navigation.goBack();
    };

    const handleTap = () => {
        // Toggle sprout position
        setIsUp(prev => !prev);
        
        // Go to next affirmation
        if (hasAffirmations) {
            setCurrentIndex((prev) => (prev + 1) % affirmations.length);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <BackButton onPress={handleBack} />
                <IconButton icon="⋮" onPress={() => navigation.navigate('SproutOverview')} />
            </View>

            <View style={styles.content}>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: selectedSprout.color + '30' }]}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: hasAffirmations ? `${((currentIndex + 1) / affirmations.length) * 100}%` : '0%',
                                    backgroundColor: selectedSprout.color, 
                                },
                            ]} 
                        />
                    </View>
                    <Text style={styles.counter}>
                        {hasAffirmations ? currentIndex + 1 : 0}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.affirmationContainer} 
                    onPress={handleTap}
                    activeOpacity={0.9}
                >
                    <Text style={styles.affirmationText}>
                        {currentAffirmation?.text ?? 'No reframes yet. Tap the menu to add some!'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sproutContainer}>
                <SproutAvatar 
                    variant="detail"
                    color={selectedSprout.color} 
                    shapeId={selectedSprout.shapeId}
                    hatId={selectedSprout.hatId}
                    scale={1.4}
                    isUp={isUp}
                />
            </View>
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
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
    counter: {
        fontSize: theme.fontSize.md,
        color: theme.colors.black,
        fontWeight: theme.fontWeight.medium,
        minWidth: 20,
        textAlign: 'right',
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    affirmationContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: theme.spacing.xl,
    },
    affirmationText: {
        fontSize: theme.fontSize.xxxl,
        fontWeight: theme.fontWeight.black,
        color: theme.colors.black,
        lineHeight: 56,
    },
    sproutContainer: {
        position: 'absolute',
        bottom: -60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
}));