import { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../components/buttons/BackButton';
import { FAB } from '../components/buttons/FAB';
import { IconButton } from '../components/buttons/IconButton';
import { useAppStore } from '../stores/useAppStore';
import { Trigger } from '../domain/types/Sprout.types';

export const TriggersListScreen = () => {
    const navigation = useNavigation();
    
    // Connect to global store
    const { selectedSprout, addTrigger, removeTrigger, updateTrigger } = useAppStore();
    
    // Use real data from the store
    const triggers = selectedSprout?.triggers ?? [];
    
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
    const [triggerText, setTriggerText] = useState('');

    const filteredTriggers = triggers.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleAddNew = () => {
        setEditingTrigger(null);
        setTriggerText('');
        setModalVisible(true);
    };

    const handleEdit = (trigger: Trigger) => {
        setEditingTrigger(trigger);
        setTriggerText(trigger.text);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!triggerText.trim()) {return;}

        try {
            if (editingTrigger) {
                await updateTrigger(editingTrigger.id, triggerText.trim());
            } else {
                await addTrigger(triggerText.trim());
            }
            
            setModalVisible(false);
            setTriggerText('');
            setEditingTrigger(null);
        } catch (_error) {
            Alert.alert('Error', 'Could not save trigger. Please try again.');
        }
    };

    const handleDelete = (triggerId: string) => {
        Alert.alert(
            'Delete Trigger',
            'Are you sure you want to delete this trigger?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeTrigger(triggerId);
                        } catch (_error) {
                            Alert.alert('Error', 'Could not delete trigger.');
                        }
                    },
                },
            ],
        );
    };

    const handleItemMenu = (trigger: Trigger) => {
        Alert.alert(
            'Options',
            undefined,
            [
                { text: 'Edit', onPress: () => handleEdit(trigger) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(trigger.id) },
                { text: 'Cancel', style: 'cancel' },
            ],
        );
    };

    const renderItem = ({ item }: { item: Trigger }) => (
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
                <Text style={styles.title}>Your Triggers</Text>
                
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
                    data={filteredTriggers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No triggers yet</Text>
                            <Text style={styles.emptySubtext}>Tap + to add your first trigger</Text>
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
                            {editingTrigger ? 'Edit Trigger' : 'New Trigger'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your trigger..."
                            placeholderTextColor="#9E9E9E"
                            value={triggerText}
                            onChangeText={setTriggerText}
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