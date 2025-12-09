import { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../components/buttons/BackButton';
import { FAB } from '../components/buttons/FAB';
import { IconButton } from '../components/buttons/IconButton';
import { useAppStore } from '../stores/useAppStore';
import { Affirmation } from '../domain/types/Sprout.types';

export const ReframesListScreen = () => {
    const navigation = useNavigation();
    const { selectedSprout, addAffirmation, removeAffirmation, updateAffirmation } = useAppStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReframe, setEditingReframe] = useState<Affirmation | null>(null);
    const [reframeText, setReframeText] = useState('');

    if (!selectedSprout) {return null;}

    const affirmations = selectedSprout.affirmations ?? [];
    
    const filteredAffirmations = affirmations.filter(a => 
        a.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleAddNew = () => {
        setEditingReframe(null);
        setReframeText('');
        setModalVisible(true);
    };

    const handleEdit = (reframe: Affirmation) => {
        setEditingReframe(reframe);
        setReframeText(reframe.text);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!reframeText.trim()) {return;}

        try {
            if (editingReframe) {
                await updateAffirmation(editingReframe.id, reframeText);
            } else {
                await addAffirmation(reframeText);
            }
            setModalVisible(false);
            setReframeText('');
            setEditingReframe(null);
        } catch (_error) { // FIX 1: 'error' changed to '_error'
            Alert.alert('Error', 'Failed to save reframe');
        }
    };

    const handleDelete = (reframeId: string) => {
        Alert.alert(
            'Delete Reframe',
            'Are you sure you want to delete this reframe?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeAffirmation(reframeId);
                        } catch (_error) { // FIX 2: 'error' changed to '_error'
                            Alert.alert('Error', 'Failed to delete reframe');
                        }
                    },
                },
            ],
        );
    };

    const handleItemMenu = (reframe: Affirmation) => {
        Alert.alert(
            'Options',
            undefined,
            [
                { text: 'Edit', onPress: () => handleEdit(reframe) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(reframe.id) },
                { text: 'Cancel', style: 'cancel' },
            ],
        );
    };

    const renderItem = ({ item }: { item: Affirmation }) => (
        <View style={styles.card}>
            <Text style={styles.cardText}>{item.text}</Text>
            <IconButton icon="⋮" onPress={() => handleItemMenu(item)} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Your Reframes</Text>
                
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#9E9E9E"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredAffirmations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No reframes yet</Text>
                            <Text style={styles.emptySubtext}>Tap + to add your first reframe</Text>
                        </View>
                    }
                />
            </View>

            <FAB onPress={handleAddNew} />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingReframe ? 'Edit Reframe' : 'New Reframe'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your reframe..."
                            placeholderTextColor="#9E9E9E"
                            value={reframeText}
                            onChangeText={setReframeText}
                            multiline
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.saveButton} 
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.gray + '30',
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    searchIcon: {
        fontSize: theme.fontSize.md,
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.black,
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    cardText: {
        flex: 1,
        fontSize: theme.fontSize.lg,
        color: theme.colors.black,
        lineHeight: 24,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: theme.spacing.xxxl,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
    },
    modalTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.black,
        marginBottom: theme.spacing.lg,
    },
    input: {
        backgroundColor: theme.colors.cream,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.black,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.cream,
    },
    cancelButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.gray,
    },
    saveButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primaryGreen,
    },
    saveButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.darkGreen,
    },
}));