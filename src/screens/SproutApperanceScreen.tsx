import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { BackButton } from '../components/buttons/BackButton';
import { SproutAvatar } from '../components/sprites/SproutAvatar';
import { useAppStore } from '../stores/useAppStore';
import { COLOR_OPTIONS, BODY_OPTIONS, HAT_OPTIONS, getHatComponent } from '../components/constants/sprout.registry';

export const SproutAppearanceScreen = () => {
    const navigation = useNavigation();
    const { selectedSprout, updateAppearance } = useAppStore();
    
    const [selectedColor, setSelectedColor] = useState(selectedSprout?.color ?? '#5BBFBA');
    const [selectedShape, setSelectedShape] = useState(selectedSprout?.shapeId ?? 'rounded');
    const [selectedHat, setSelectedHat] = useState(selectedSprout?.hatId ?? 'leaves');
    const [scale, setScale] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    if (!selectedSprout) {return null;}

    const hasChanges = 
        selectedColor !== selectedSprout.color ||
        selectedShape !== selectedSprout.shapeId ||
        selectedHat !== selectedSprout.hatId;

const handleSave = async () => {
    console.log('handleSave called');
    console.log('selectedColor:', selectedColor);
    console.log('selectedShape:', selectedShape);
    console.log('selectedHat:', selectedHat);
    console.log('sprout.color:', selectedSprout.color);
    console.log('sprout.shapeId:', selectedSprout.shapeId);
    console.log('sprout.hatId:', selectedSprout.hatId);
    console.log('hasChanges:', hasChanges);

    if (!hasChanges) {
        console.log('No changes detected, going back');
        navigation.goBack();
        return;
    }

    console.log('Changes detected, saving...');
    setIsSaving(true);
    try {
        await updateAppearance({
            color: selectedColor,
            shapeId: selectedShape,
            hatId: selectedHat,
        });
        console.log('updateAppearance completed');
        navigation.goBack();
    } catch (error) {
        console.error('Save error:', error);
        Alert.alert('Error', 'Failed to save appearance');
    } finally {
        setIsSaving(false);
    }
};
    const CurrentHatIcon = getHatComponent(selectedHat);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Edit Sprout</Text>

                {/* Main editing area */}
                <View style={styles.editArea}>
                    {/* Sprout preview on left */}
                    <View style={styles.previewColumn}>
                        <SproutAvatar 
                            variant="full"
                            color={selectedColor}
                            shapeId={selectedShape}
                            hatId={selectedHat}
                            scale={scale}
                        />
                    </View>

                    {/* Controls on right */}
                    <View style={styles.controlsColumn}>
                        {/* Hat selector button */}
                        <TouchableOpacity 
                            style={styles.hatButton}
                            onPress={() => {
                                const currentIndex = HAT_OPTIONS.findIndex(h => h.id === selectedHat);
                                const nextIndex = (currentIndex + 1) % HAT_OPTIONS.length;
                                setSelectedHat(HAT_OPTIONS[nextIndex].id);
                            }}
                        >
                            <CurrentHatIcon width={50} height={40} />
                        </TouchableOpacity>

                        {/* Vertical slider */}
                        <View style={styles.sliderContainer}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0.6}
                                maximumValue={1.2}
                                value={scale}
                                onValueChange={setScale}
                                minimumTrackTintColor={selectedColor}
                                maximumTrackTintColor={selectedColor + '40'}
                                thumbTintColor="white"
                            />
                        </View>

                        {/* Shape buttons */}
                        <View style={styles.shapeButtons}>
                            {BODY_OPTIONS.map((body) => (
                                <TouchableOpacity
                                    key={body.id}
                                    style={[
                                        styles.shapeButton,
                                        selectedShape === body.id && styles.shapeButtonSelected,
                                    ]}
                                    onPress={() => setSelectedShape(body.id)}
                                >
                                    <View style={[
                                        styles.shapeIcon,
                                        body.id === 'rounded' && styles.shapeIconRounded,
                                        body.id === 'square' && styles.shapeIconSquare,
                                        body.id === 'pill' && styles.shapeIconPill,
                                        { backgroundColor: selectedShape === body.id ? selectedColor : selectedColor + '60' },
                                    ]} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Color grid */}
                <View style={styles.colorGrid}>
                    {COLOR_OPTIONS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                selectedColor === color && styles.colorSelected,
                            ]}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={[styles.fab, isSaving && styles.fabDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isSaving}
            >
                <Text style={styles.fabIcon}>✓</Text>
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
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.black,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    editArea: {
        flexDirection: 'row',
        minHeight: 320,
    },
    previewColumn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsColumn: {
        width: 100,
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    hatButton: {
        width: 90,
        height: 70,
        backgroundColor: theme.colors.altGreen + '30',
        borderRadius: theme.radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderContainer: {
        flex: 1,
        width: 40,
        justifyContent: 'center',
    },
    slider: {
        width: 180,
        height: 40,
        transform: [{ rotate: '-90deg' }],
    },
    shapeButtons: {
        gap: theme.spacing.sm,
    },
    shapeButton: {
        width: 70,
        height: 50,
        backgroundColor: theme.colors.altGreen + '30',
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shapeButtonSelected: {
        backgroundColor: theme.colors.altGreen + '50',
    },
    shapeIcon: {
        width: 28,
        height: 20,
    },
    shapeIconRounded: {
        borderRadius: 10,
    },
    shapeIconSquare: {
        borderRadius: 4,
    },
    shapeIconPill: {
        borderRadius: 10,
        width: 20,
        height: 20,
    },
    divider: {
        height: 2,
        backgroundColor: theme.colors.altGreen + '40',
        marginVertical: theme.spacing.xl,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
        justifyContent: 'center',
        paddingBottom: 100,
    },
    colorOption: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    colorSelected: {
        borderWidth: 4,
        borderColor: theme.colors.white,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
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
    fabDisabled: {
        opacity: 0.5,
    },
    fabIcon: {
        fontSize: 28,
        color: theme.colors.darkGreen,
        fontWeight: theme.fontWeight.bold,
    },
}));