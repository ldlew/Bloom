import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { SproutAvatar } from '../sprites/SproutAvatar';

interface SproutListCardProps {
    text: string;
    color: string;
    shapeId?: string;
    hatId?: string;
    onPress: () => void;
    onLongPress?: () => void;
}

export const SproutListCard = ({ 
    text, 
    color, 
    shapeId,
    hatId,
    onPress, 
    onLongPress, 
}: SproutListCardProps) => {
    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <SproutAvatar 
                variant="small" 
                color={color}
                shapeId={shapeId}
                hatId={hatId}
            />
            <Text style={styles.text} numberOfLines={2}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.md,
    },
    text: {
        flex: 1,
        fontSize: theme.fontSize.lg,
        color: theme.colors.black,
        lineHeight: 24,
    },
}));