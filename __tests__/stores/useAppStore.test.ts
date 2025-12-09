import { useAppStore } from '../../src/stores/useAppStore';
import { appContainer } from '../../src/infrastructure/AppContainer';
import { Sprout, SproutSummary } from '../../src/domain';
import { act } from 'react';
import fc from 'fast-check';

interface MockSproutServiceMethods {
    getUserSproutSummaries: jest.Mock;
    getSprout: jest.Mock;
    createSprout: jest.Mock;
    deleteSprout: jest.Mock;
    addAffirmation: jest.Mock;
    removeAffirmation: jest.Mock;
    updateAffirmationText: jest.Mock;
    addTrigger: jest.Mock;
    removeTrigger: jest.Mock;
    updateTriggerText: jest.Mock;
    updateSproutAppearance: jest.Mock;
}

type MockSproutServiceType = jest.Mocked<MockSproutServiceMethods>;

const mockSproutService: MockSproutServiceType = {
    getUserSproutSummaries: jest.fn(),
    getSprout: jest.fn(),
    createSprout: jest.fn(),
    deleteSprout: jest.fn(),
    addAffirmation: jest.fn(),
    removeAffirmation: jest.fn(),
    updateAffirmationText: jest.fn(),
    addTrigger: jest.fn(),
    removeTrigger: jest.fn(),
    updateTriggerText: jest.fn(),
    updateSproutAppearance: jest.fn(),
};

jest.spyOn(appContainer, 'sproutService', 'get').mockReturnValue(mockSproutService as any);

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

const getStore = () => useAppStore.getState();
const initialState = getStore();

const TEST_USER_ID = 'u-123';
const TEST_SPROUT_ID = 's-456';
const mockSummary = { id: TEST_SPROUT_ID, userId: TEST_USER_ID, color: 'green' } as SproutSummary;

const mockSprout = {
    id: TEST_SPROUT_ID,
    addAffirmation: jest.fn(),
    removeAffirmation: jest.fn(),
    updateAffirmationText: jest.fn(),
    addTrigger: jest.fn(),
    removeTrigger: jest.fn(),
    updateTriggerText: jest.fn(),
    setColor: jest.fn(),
    setShapeId: jest.fn(),
    setHatId: jest.fn(),
} as unknown as Sprout;

beforeEach(() => {
    act(() => useAppStore.setState(initialState, false)); 
    jest.clearAllMocks();
    mockSproutService.getSprout.mockResolvedValue(mockSprout);
    mockSproutService.getUserSproutSummaries.mockResolvedValue([]);
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
});

describe('useAppStore - Auth/Basic State', () => {
    it('login should update isAuthenticated and userId', () => {
        act(() => getStore().login(TEST_USER_ID));
        const state = getStore();
        expect(state.isAuthenticated).toBe(true);
        expect(state.userId).toBe(TEST_USER_ID);
    });

    it('logout should reset auth and sprout state', () => {
        act(() => getStore().login(TEST_USER_ID));
        act(() => useAppStore.setState({ sprouts: [mockSummary], selectedSprout: mockSprout }));

        act(() => getStore().logout());

        const state = getStore();
        expect(state.isAuthenticated).toBe(false);
        expect(state.userId).toBeNull();
        expect(state.sprouts).toEqual([]);
        expect(state.selectedSprout).toBeNull();
    });
});

describe('useAppStore - Sprout Management', () => {
    beforeEach(() => {
        act(() => getStore().login(TEST_USER_ID));
    });

    it('loadSprouts should fetch summaries and update state', async () => {
        mockSproutService.getUserSproutSummaries.mockResolvedValue([mockSummary] as any);

        await act(() => getStore().loadSprouts());

        const state = getStore();
        expect(state.isLoading).toBe(false);
        expect(state.sprouts).toEqual([mockSummary]);
        expect(mockSproutService.getUserSproutSummaries).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('loadSprouts should guard and return if userId is null', async () => {
        act(() => useAppStore.setState({ isAuthenticated: false, userId: null }));

        expect(getStore().userId).toBeNull();

        await act(() => getStore().loadSprouts());

        expect(mockSproutService.getUserSproutSummaries).not.toHaveBeenCalled();
    });

    it('loadSprouts should handle errors gracefully without throwing', async () => {
        const error = new Error('Load failure');
        mockSproutService.getUserSproutSummaries.mockRejectedValue(error);

        await act(() => getStore().loadSprouts());

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load sprouts:', error);
        expect(getStore().isLoading).toBe(false);
    });

    it('createSprout should call service and reload summaries', async () => {
        const initialSummary = { ...mockSummary, id: 's-123' };
        const newSummary = { ...mockSummary, id: 's-789' };

        mockSproutService.getUserSproutSummaries
            .mockResolvedValueOnce([initialSummary] as any)
            .mockResolvedValueOnce([initialSummary, newSummary] as any);

        await act(() => getStore().loadSprouts());

        await act(() => getStore().createSprout());

        expect(mockSproutService.createSprout).toHaveBeenCalledWith(TEST_USER_ID);
        expect(mockSproutService.getUserSproutSummaries).toHaveBeenCalledTimes(2);
        expect(getStore().sprouts).toHaveLength(2);
        expect(getStore().isLoading).toBe(false);
    });

    it('createSprout should guard and return if userId is null', async () => {
        act(() => useAppStore.setState({ ...initialState, isAuthenticated: false, userId: null }));

        await act(() => getStore().createSprout());

        expect(mockSproutService.createSprout).not.toHaveBeenCalled();
    });

    it('createSprout should handle errors and still reset isLoading', async () => {
        const error = new Error('Creation failure');
        mockSproutService.createSprout.mockRejectedValue(error);

        await expect(act(() => getStore().createSprout()))
            .rejects.toThrow('Creation failure');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create sprout:', error);
        expect(getStore().isLoading).toBe(false);
    });

    it('deleteSprout should remove sprout and clear selected if deleted', async () => {
        act(() => useAppStore.setState({ selectedSprout: mockSprout, sprouts: [mockSummary] }));

        mockSproutService.getUserSproutSummaries.mockResolvedValue([]);

        await act(() => getStore().deleteSprout(TEST_SPROUT_ID));

        expect(mockSproutService.deleteSprout).toHaveBeenCalledWith(TEST_SPROUT_ID);
        expect(getStore().selectedSprout).toBeNull();
        expect(getStore().sprouts).toHaveLength(0);
        expect(getStore().isLoading).toBe(false);
    });

    it('deleteSprout should preserve selectedSprout if different sprout deleted', async () => {
        const otherSummary = { ...mockSummary, id: 's-789' };
        act(() => useAppStore.setState({ selectedSprout: mockSprout, sprouts: [mockSummary, otherSummary] }));

        mockSproutService.getUserSproutSummaries.mockResolvedValue([mockSummary] as any);

        await act(() => getStore().deleteSprout('s-789'));

        expect(getStore().selectedSprout).toBe(mockSprout); 
    });

    it('deleteSprout should work when no sprout is selected', async () => {
        act(() => useAppStore.setState({ selectedSprout: null, sprouts: [mockSummary] }));

        mockSproutService.getUserSproutSummaries.mockResolvedValue([]);

        await act(() => getStore().deleteSprout(TEST_SPROUT_ID));

        expect(mockSproutService.deleteSprout).toHaveBeenCalledWith(TEST_SPROUT_ID);
        expect(getStore().selectedSprout).toBeNull();
        expect(getStore().isLoading).toBe(false);
    });

    it('deleteSprout should guard and return if userId is null', async () => {
        act(() => useAppStore.setState({ ...initialState, isAuthenticated: false, userId: null }));

        await act(() => getStore().deleteSprout(TEST_SPROUT_ID));

        expect(mockSproutService.deleteSprout).not.toHaveBeenCalled();
    });

    it('deleteSprout should handle errors and still reset isLoading', async () => {
        act(() => useAppStore.setState({ sprouts: [mockSummary] }));
        const error = new Error('Deletion failure');
        mockSproutService.deleteSprout.mockRejectedValue(error);

        await expect(act(() => getStore().deleteSprout(TEST_SPROUT_ID)))
            .rejects.toThrow('Deletion failure');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete sprout:', error);
        expect(getStore().isLoading).toBe(false);
    });

    it('selectSprout should fetch full aggregate and set state', async () => {
        await act(() => getStore().selectSprout(TEST_SPROUT_ID));

        expect(mockSproutService.getSprout).toHaveBeenCalledWith(TEST_SPROUT_ID);
        expect(getStore().selectedSprout).toBe(mockSprout);
        expect(getStore().isLoading).toBe(false);
    });

    it('selectSprout should handle errors and still reset isLoading', async () => {
        const error = new Error('Fetch failure');
        mockSproutService.getSprout.mockRejectedValue(error);

        await expect(act(() => getStore().selectSprout(TEST_SPROUT_ID)))
            .rejects.toThrow('Fetch failure');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to select sprout:', error);
        expect(getStore().isLoading).toBe(false);
    });

    it('clearSelectedSprout should set selectedSprout to null', () => {
        act(() => useAppStore.setState({ selectedSprout: mockSprout }));
        act(() => getStore().clearSelectedSprout());
        expect(getStore().selectedSprout).toBeNull();
    });
});

describe('useAppStore - Mutation Wrapper Logic', () => {
    beforeEach(() => {
        act(() => getStore().login(TEST_USER_ID));
        act(() => useAppStore.setState({ selectedSprout: mockSprout }));
    });
    
    afterEach(() => {
        mockSproutService.addAffirmation.mockResolvedValue(undefined);
    });

    it('should guard and return if selectedSprout is null', async () => {
        act(() => useAppStore.setState({ selectedSprout: null }));

        await act(() => getStore().addAffirmation('test'));

        expect(mockSproutService.addAffirmation).not.toHaveBeenCalled();
    });

    it('addAffirmation should call service and reload selected sprout state', async () => {
        const reloadedSprout = { ...mockSprout, id: TEST_SPROUT_ID, color: 'blue' } as Sprout;
        mockSproutService.getSprout.mockResolvedValue(reloadedSprout);

        await act(() => getStore().addAffirmation('New Text'));

        expect(mockSproutService.addAffirmation).toHaveBeenCalledWith(TEST_SPROUT_ID, 'New Text');
        expect(mockSproutService.getSprout).toHaveBeenCalledWith(TEST_SPROUT_ID);
        expect(getStore().selectedSprout).toBe(reloadedSprout);
    });

    it('should catch and throw errors during mutation', async () => {
        const error = new Error('DB failure');
        mockSproutService.addAffirmation.mockRejectedValue(error);

        mockSproutService.getSprout.mockResolvedValue(mockSprout);

        await expect(act(() => getStore().addAffirmation('fail')))
            .rejects.toThrow('DB failure');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add affirmation:', error);
    });
});

describe('useAppStore - Appearance/Affirmation/Trigger Slices', () => {
    beforeEach(() => {
        act(() => getStore().login(TEST_USER_ID));
        act(() => useAppStore.setState({ selectedSprout: mockSprout, sprouts: [mockSummary] }));
    });

    it('updateAppearance should call service and reload selected sprout AND summaries', async () => {
        const reloadedSprout = { ...mockSprout, color: 'orange' } as Sprout;

        mockSproutService.getSprout.mockResolvedValue(reloadedSprout);
        mockSproutService.getUserSproutSummaries.mockResolvedValue([
            { ...mockSummary, color: 'orange' }
        ] as any);

        await act(() => getStore().updateAppearance({ color: 'orange' }));

        expect(mockSproutService.updateSproutAppearance).toHaveBeenCalledWith(
            TEST_SPROUT_ID, { color: 'orange' }
        );
        expect(mockSproutService.getUserSproutSummaries).toHaveBeenCalledTimes(1);
        expect(getStore().selectedSprout).toBe(reloadedSprout);
        expect(getStore().sprouts).toHaveLength(1);
    });

    it('updateAppearance should guard and return if userId is null', async () => {
        act(() => useAppStore.setState({ selectedSprout: mockSprout, userId: null }));

        await act(() => getStore().updateAppearance({ color: 'blue' }));

        expect(mockSproutService.updateSproutAppearance).not.toHaveBeenCalled();
    });

    it('updateAppearance should guard and return if selectedSprout is null', async () => {
        act(() => useAppStore.setState({ selectedSprout: null, userId: TEST_USER_ID }));

        await act(() => getStore().updateAppearance({ color: 'blue' }));

        expect(mockSproutService.updateSproutAppearance).not.toHaveBeenCalled();
    });

    it('updateAppearance should handle errors and throw', async () => {
        const error = new Error('Appearance update failed');

        mockSproutService.updateSproutAppearance.mockRejectedValue(error);

        await expect(act(() => getStore().updateAppearance({ color: 'red' })))
            .rejects.toThrow('Appearance update failed');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update appearance:', error);
    });

    it.each([
        ['addAffirmation', getStore().addAffirmation, mockSproutService.addAffirmation, ['test text']],
        ['removeAffirmation', getStore().removeAffirmation, mockSproutService.removeAffirmation, ['a-123']],
        ['updateAffirmation', getStore().updateAffirmation, mockSproutService.updateAffirmationText, ['a-123', 'new text']],
        ['addTrigger', getStore().addTrigger, mockSproutService.addTrigger, ['trigger text']],
        ['removeTrigger', getStore().removeTrigger, mockSproutService.removeTrigger, ['t-123']],
        ['updateTrigger', getStore().updateTrigger, mockSproutService.updateTriggerText, ['t-123', 'new text']],
    ] as [string, (...args: any[]) => any, jest.Mock, any[]][])('%s should execute wrapped mutation correctly', async (_, action, serviceMock, args) => {
        await act(() => (action as (...a: any[]) => any)(...args));
        expect(serviceMock).toHaveBeenCalledWith(TEST_SPROUT_ID, ...args);
    });
});

describe('useAppStore - Property-Based Robustness', () => {
    beforeEach(() => {
        act(() => getStore().login(TEST_USER_ID));
        act(() => useAppStore.setState({ selectedSprout: mockSprout }));
    });

    it('should allow arbitrary strings for addAffirmation text', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string({ minLength: 1 }), async (randomText) => {
                mockSproutService.addAffirmation.mockClear();

                mockSproutService.addAffirmation.mockResolvedValue(undefined);
                mockSproutService.getSprout.mockResolvedValue(mockSprout);

                await act(() => getStore().addAffirmation(randomText));

                expect(mockSproutService.addAffirmation).toHaveBeenCalledWith(TEST_SPROUT_ID, randomText);
            })
        );
    });
});