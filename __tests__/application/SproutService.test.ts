import { SproutService } from '../../src/application';
import { Sprout, ISproutRepository  } from '../../src/domain';
import fc from 'fast-check';

jest.mock('expo-crypto', () => ({
    randomUUID: jest.fn(() => 'mock-uuid'),
}));

jest.mock('../../src/domain/models/BaseModel', () => {
    return {
        BaseModel: class MockBaseModel {
            protected props: any;
            public modified: boolean = false;
            constructor(props: any) { this.props = props; }
            markModified() { this.modified = true; }
            get id() { return this.props.id; }
        },
    };
});

describe('SproutService', () => {
    let service: SproutService;
    let mockRepo: jest.Mocked<ISproutRepository>;
    const TEST_USER_ID = 'user-123';
    const TEST_SPROUT_ID = 'sprout-abc';

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = {
            create: jest.fn(),
            findAllSummariesByUserId: jest.fn(),
            find: jest.fn(),
            findSummary: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        };
        service = new SproutService(mockRepo);
    });

    describe('Basic CRUD', () => {
        it('createSprout should create entity and persist it', async () => {
            await service.createSprout(TEST_USER_ID);

            expect(mockRepo.create).toHaveBeenCalledTimes(1);
            const created = mockRepo.create.mock.calls[0][0];
            expect(created).toBeInstanceOf(Sprout);
            expect(created.userId).toBe(TEST_USER_ID);
        });

        it('getUserSproutSummaries should delegate to repository', async () => {
            const summaries = [{ id: '1', userId: 'u1' }];
            mockRepo.findAllSummariesByUserId.mockResolvedValue(summaries as any);

            const result = await service.getUserSproutSummaries(TEST_USER_ID);
            
            expect(mockRepo.findAllSummariesByUserId).toHaveBeenCalledWith(TEST_USER_ID);
            expect(result).toBe(summaries);
        });

        it('getSprout should delegate to repository', async () => {
            const sprout = Sprout.createNewSprout(TEST_USER_ID);
            mockRepo.find.mockResolvedValue(sprout);

            const result = await service.getSprout(TEST_SPROUT_ID);

            expect(mockRepo.find).toHaveBeenCalledWith(TEST_SPROUT_ID);
            expect(result).toBe(sprout);
        });

        it('deleteSprout should delegate to repository', async () => {
            await service.deleteSprout(TEST_SPROUT_ID);
            expect(mockRepo.delete).toHaveBeenCalledWith(TEST_SPROUT_ID);
        });
    });

    describe('Affirmation Operations', () => {
        let existingSprout: Sprout;

        beforeEach(() => {
            existingSprout = Sprout.createNewSprout(TEST_USER_ID);
            mockRepo.find.mockResolvedValue(existingSprout);
        });

        it('addAffirmation should load sprout, add item, and update', async () => {
            await service.addAffirmation(TEST_SPROUT_ID, 'New Aff');

            expect(mockRepo.find).toHaveBeenCalledWith(TEST_SPROUT_ID);
            expect(existingSprout.affirmations[0].text).toBe('New Aff');
            expect(mockRepo.update).toHaveBeenCalledWith(existingSprout);
        });

        it('removeAffirmation should load sprout, remove item, and update', async () => {
            existingSprout.addAffirmation('To Delete');
            const affId = existingSprout.affirmations[0].id;

            await service.removeAffirmation(TEST_SPROUT_ID, affId);

            expect(existingSprout.affirmations).toHaveLength(0);
            expect(mockRepo.update).toHaveBeenCalledWith(existingSprout);
        });

        it('updateAffirmationText should update text and persist', async () => {
            existingSprout.addAffirmation('Old Text');
            const affId = existingSprout.affirmations[0].id;

            await service.updateAffirmationText(TEST_SPROUT_ID, affId, 'New Text');

            expect(existingSprout.affirmations[0].text).toBe('New Text');
            expect(mockRepo.update).toHaveBeenCalledWith(existingSprout);
        });
    });

    describe('Trigger Operations', () => {
        let existingSprout: Sprout;

        beforeEach(() => {
            existingSprout = Sprout.createNewSprout(TEST_USER_ID);
            mockRepo.find.mockResolvedValue(existingSprout);
        });

        it('addTrigger should load sprout, add item, and update', async () => {
            await service.addTrigger(TEST_SPROUT_ID, 'New Trig');

            expect(existingSprout.triggers[0].text).toBe('New Trig');
            expect(mockRepo.update).toHaveBeenCalledWith(existingSprout);
        });

        it('removeTrigger should remove item and update', async () => {
            existingSprout.addTrigger('To Delete');
            const trigId = existingSprout.triggers[0].id;

            await service.removeTrigger(TEST_SPROUT_ID, trigId);

            expect(existingSprout.triggers).toHaveLength(0);
            expect(mockRepo.update).toHaveBeenCalledWith(existingSprout);
        });

        it('updateTriggerText should update text and persist', async () => {
            existingSprout.addTrigger('Old Trig');
            const trigId = existingSprout.triggers[0].id;

            await service.updateTriggerText(TEST_SPROUT_ID, trigId, 'New Trig');

            expect(existingSprout.triggers[0].text).toBe('New Trig');
            expect(mockRepo.update).toHaveBeenCalledWith(existingSprout);
        });
    });

    describe('Appearance', () => {
        // Covers TRUE branches (Line 110 hit)
        it('updateSproutAppearance should apply all updates if provided', async () => {
            const sprout = Sprout.createNewSprout(TEST_USER_ID);
            mockRepo.find.mockResolvedValue(sprout);

            await service.updateSproutAppearance(TEST_SPROUT_ID, { 
                color: 'blue', 
                shapeId: 'sq',
                hatId: 'beanie' 
            });

            expect(sprout.color).toBe('blue');
            expect(sprout.shapeId).toBe('sq');
            expect(sprout.hatId).toBe('beanie'); 
            expect(mockRepo.update).toHaveBeenCalledWith(sprout);
        });

        // Covers FALSE branches (Fixes 62.5% -> 100% Branch Coverage)
        it('updateSproutAppearance should ignore undefined fields', async () => {
            const sprout = Sprout.createNewSprout(TEST_USER_ID);
            const originalColor = sprout.color;
            const originalShape = sprout.shapeId;
            const originalHat = sprout.hatId;
            
            mockRepo.find.mockResolvedValue(sprout);

            // Passing empty object forces all 'if' checks to be false
            await service.updateSproutAppearance(TEST_SPROUT_ID, {});

            expect(sprout.color).toBe(originalColor);
            expect(sprout.shapeId).toBe(originalShape);
            expect(sprout.hatId).toBe(originalHat);
            expect(mockRepo.update).toHaveBeenCalledWith(sprout);
        });
    });

    describe('Error Handling', () => {
        it('should throw if sprout not found for modifications', async () => {
            mockRepo.find.mockResolvedValue(null);

            await expect(service.addAffirmation('missing', 'text'))
                .rejects.toThrow('Sprout not found');
            
            expect(mockRepo.update).not.toHaveBeenCalled();
        });
    });

    describe('Property-Based Robustness', () => {
        it('should accept any valid string for affirmations', async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), async (text) => {
                    const sprout = Sprout.createNewSprout(TEST_USER_ID);
                    mockRepo.find.mockResolvedValue(sprout);
                    mockRepo.update.mockClear();

                    await service.addAffirmation(TEST_SPROUT_ID, text);

                    expect(sprout.affirmations[0].text).toBe(text.trim());
                    expect(mockRepo.update).toHaveBeenCalledTimes(1);
                })
            );
        });
    });
});