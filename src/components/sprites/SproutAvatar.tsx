import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { 
    getBodyComponent, 
    getHatComponent, 
    EYES_COMPONENT, 
    MOUTH_COMPONENT,
    LEGS_COMPONENT,
} from '../constants/sprout.registry';

type AvatarVariant = 'small' | 'full' | 'detail';

interface SproutAvatarProps {
    variant: AvatarVariant;
    color?: string;
    shapeId?: string;
    hatId?: string;
    scale?: number;
    isUp?: boolean; // Toggle state
}

export const SproutAvatar = ({ 
    variant, 
    color = '#5BBFBA',
    shapeId = 'rounded',
    hatId = 'leaves',
    scale = 1,
    isUp = false,
}: SproutAvatarProps) => {
    const translateY = useSharedValue(0);
    
    useEffect(() => {
        translateY.value = withTiming(isUp ? -20 : 0, { 
            duration: 200, 
            easing: Easing.out(Easing.quad), 
        });
    }, [isUp, translateY]);
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));
    
    const BodyComponent = getBodyComponent(shapeId);
    const HatComponent = getHatComponent(hatId);

    if (variant === 'small') {
        const borderRadius = shapeId === 'square' ? 6 : shapeId === 'pill' ? 28 : 12;
        
        return (
            <View style={[styles.smallBody, { backgroundColor: color, borderRadius }]}>
                <View style={styles.smallEyeRow}>
                    <View style={styles.smallEye}>
                        <View style={styles.smallPupil} />
                    </View>
                    <View style={styles.smallEye}>
                        <View style={styles.smallPupil} />
                    </View>
                </View>
            </View>
        );
    }

    if (variant === 'detail') {
        const bodyWidth = 280 * scale;
        const bodyHeight = 170 * scale;
        const eyesWidth = 180 * scale;
        const eyesHeight = 80 * scale;
        const mouthWidth = 32 * scale;
        const mouthHeight = 12 * scale;
        const hatWidth = 140 * scale;
        const hatHeight = 110 * scale;

        return (
            <Animated.View style={[styles.container, animatedStyle]}>
                <View style={styles.hatContainer}>
                    <HatComponent width={hatWidth} height={hatHeight} />
                </View>
                
                <View style={styles.bodyContainer}>
                    <BodyComponent width={bodyWidth} height={bodyHeight} color={color} />
                    
                    <View style={styles.faceOverlay}>
                        <EYES_COMPONENT width={eyesWidth} height={eyesHeight} />
                        <MOUTH_COMPONENT width={mouthWidth} height={mouthHeight} />
                    </View>
                </View>
            </Animated.View>
        );
    }

    const bodyWidth = 184 * scale;
    const bodyHeight = 111 * scale;
    const eyesWidth = 120 * scale;
    const eyesHeight = 53 * scale;
    const mouthWidth = 24 * scale;
    const mouthHeight = 10 * scale;
    const hatWidth = 100 * scale;
    const hatHeight = 80 * scale;
    const legsWidth = 80 * scale;
    const legsHeight = 100 * scale;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.hatContainer}>
                <HatComponent width={hatWidth} height={hatHeight} />
            </View>
            
            <View style={styles.bodyContainer}>
                <BodyComponent width={bodyWidth} height={bodyHeight} color={color} />
                
                <View style={styles.faceOverlay}>
                    <EYES_COMPONENT width={eyesWidth} height={eyesHeight} />
                    <MOUTH_COMPONENT width={mouthWidth} height={mouthHeight} />
                </View>
            </View>

            <View style={[styles.legsContainer, { marginTop: -10 * scale }]}>
                <LEGS_COMPONENT width={legsWidth} height={legsHeight} color={color} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create((_theme) => ({
    container: {
        alignItems: 'center',
    },
    hatContainer: {
        marginBottom: -20,
        zIndex: 1,
    },
    bodyContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    faceOverlay: {
        position: 'absolute',
        alignItems: 'center',
        gap: 4,
    },
    legsContainer: {
        zIndex: -1,
    },
    smallBody: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallEyeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    smallEye: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallPupil: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#313131',
    },
}));