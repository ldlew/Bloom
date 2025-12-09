// Zustand store manager
import { create } from 'zustand';
import { SproutSummary } from '../domain/types/Sprout.types';
import { Sprout } from '../domain/models/Sprout';
import { appContainer } from '../infrastructure/AppContainer';

interface AuthSlice {
    isAuthenticated: boolean;
    userId: string | null;
    login: (userId: string) => void;
    logout: () => void;
}

interface SproutSlice {
    sprouts: SproutSummary[];
    selectedSprout: Sprout | null;
    isLoading: boolean;
    loadSprouts: () => Promise<void>;
    createSprout: () => Promise<void>;
    deleteSprout: (sproutId: string) => Promise<void>;
    selectSprout: (sproutId: string) => Promise<void>;
    clearSelectedSprout: () => void;
    updateAppearance: (updates: { color?: string; shapeId?:
        string; hatId?: string }) => Promise<void>;
}

interface AffirmationSlice {
    addAffirmation: (text: string) => Promise<void>;
    removeAffirmation: (affirmationId: string) => Promise<void>;
    updateAffirmation: (affirmationId: string, text: string) => Promise<void>;
}

interface TriggerSlice {
    addTrigger: (text: string) => Promise<void>;
    removeTrigger: (triggerId: string) => Promise<void>;
    updateTrigger: (triggerId: string, text: string) => Promise<void>;
}

type AppState = AuthSlice & SproutSlice & AffirmationSlice & TriggerSlice;

// Wraps any sprout mutation with guard + reload pattern
const withSproutMutation = async (
    get: () => AppState,
    set: (state: Partial<AppState>) => void,
    mutation: (sproutId: string) => Promise<void>,
    errorMessage: string,
): Promise<void> => {
    const { selectedSprout } = get();
    if (!selectedSprout) {return;}

    try {
        await mutation(selectedSprout.id);
        const sprout = await appContainer.sproutService.getSprout(selectedSprout.id);
        set({ selectedSprout: sprout });
    } catch (error) {
        console.error(errorMessage, error);
        throw error;
    }
};

export const useAppStore = create<AppState>((set, get) => ({
    // Auth State
    isAuthenticated: false,
    userId: null,

    login: (userId: string) => {
        set({ isAuthenticated: true, userId });
    },

    logout: () => {
        set({ 
            isAuthenticated: false, 
            userId: null, 
            sprouts: [], 
            selectedSprout: null, 
        });
    },

    // Sprout State
    sprouts: [],
    selectedSprout: null,
    isLoading: false,

    loadSprouts: async () => {
        const { userId } = get();
        if (!userId) {return;}

        set({ isLoading: true });
        try {
            const sprouts = await appContainer.sproutService.getUserSproutSummaries(userId);
            set({ sprouts });
        } catch (error) {
            console.error('Failed to load sprouts:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    createSprout: async () => {
        const { userId } = get();
        if (!userId) {return;}

        set({ isLoading: true });
        try {
            await appContainer.sproutService.createSprout(userId);
            const sprouts = await appContainer.sproutService.getUserSproutSummaries(userId);
            set({ sprouts });
        } catch (error) {
            console.error('Failed to create sprout:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteSprout: async (sproutId: string) => {
        const { userId, selectedSprout } = get();
        if (!userId) {return;}

        set({ isLoading: true });
        try {
            await appContainer.sproutService.deleteSprout(sproutId);
            const newSelectedSprout = selectedSprout?.id === sproutId ? null : selectedSprout;
            const sprouts = await appContainer.sproutService.getUserSproutSummaries(userId);
            set({ sprouts, selectedSprout: newSelectedSprout });
        } catch (error) {
            console.error('Failed to delete sprout:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    selectSprout: async (sproutId: string) => {
        set({ isLoading: true });
        try {
            const sprout = await appContainer.sproutService.getSprout(sproutId);
            set({ selectedSprout: sprout });
        } catch (error) {
            console.error('Failed to select sprout:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    clearSelectedSprout: () => {
        set({ selectedSprout: null });
    },

    updateAppearance: async (updates) => {
        const { selectedSprout, userId } = get();
        if (!selectedSprout || !userId) {return;}

        try {
            await appContainer.sproutService.updateSproutAppearance(selectedSprout.id, updates);
            const [sprout, sprouts] = await Promise.all([
                appContainer.sproutService.getSprout(selectedSprout.id),
                appContainer.sproutService.getUserSproutSummaries(userId),
            ]);
            set({ selectedSprout: sprout, sprouts });
        } catch (error) {
            console.error('Failed to update appearance:', error);
            throw error;
        }
    },

    // Affirmation Actions
    addAffirmation: (text: string) => 
        withSproutMutation(get, set, 
            (id) => appContainer.sproutService.addAffirmation(id, text),
            'Failed to add affirmation:',
        ),

    removeAffirmation: (affirmationId: string) => 
        withSproutMutation(get, set,
            (id) => appContainer.sproutService.removeAffirmation(id, affirmationId),
            'Failed to remove affirmation:',
        ),

    updateAffirmation: (affirmationId: string, text: string) => 
        withSproutMutation(get, set,
            (id) => appContainer.sproutService.updateAffirmationText(id, affirmationId, text),
            'Failed to update affirmation:',
        ),

    // Trigger Actions
    addTrigger: (text: string) => 
        withSproutMutation(get, set,
            (id) => appContainer.sproutService.addTrigger(id, text),
            'Failed to add trigger:',
        ),

    removeTrigger: (triggerId: string) => 
        withSproutMutation(get, set,
            (id) => appContainer.sproutService.removeTrigger(id, triggerId),
            'Failed to remove trigger:',
        ),

    updateTrigger: (triggerId: string, text: string) => 
        withSproutMutation(get, set,
            (id) => appContainer.sproutService.updateTriggerText(id, triggerId, text),
            'Failed to update trigger:',
        ),
}));