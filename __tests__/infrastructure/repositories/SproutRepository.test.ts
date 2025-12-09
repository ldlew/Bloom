import { SproutRepository } from '../../../src/infrastructure/database/repositories/SproutRepository';
import { Sprout } from '../../../src/domain/models/Sprout';
import { ISqliteAdapter } from '../../../src/domain/repositories/ISqliteAdapter';
import fc from 'fast-check';

jest.mock('expo-crypto', () => ({
    randomUUID: jest.fn(() => 'mock-uuid'),
}));

jest.mock('../../../src/domain/models/BaseModel', () => {
    return {
        BaseModel: class MockBaseModel {
            protected props: any;
            constructor(props: any) { this.props = props; }
            get id() { return this.props.id; }
            get createdAt() { return this.props.createdAt; }
            get updatedAt() { return this.props.updatedAt; }
            markModified() {} // dummy
        },
    };
});

describe('SproutRepository', () => {
    let mockDb: jest.Mocked<ISqliteAdapter>;
    let repo: SproutRepository;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            runAsync: jest.fn(),
            getFirstAsync: jest.fn(),
            getAllAsync: jest.fn(),
            execAsync: jest.fn(),
            // Mock transaction to execute callback immediately
            withExclusiveTransactionAsync: jest.fn(async (cb) => {
                await cb(mockDb);
            }),
        } as unknown as jest.Mocked<ISqliteAdapter>;

        repo = new SproutRepository(mockDb);
    });

    const createTestSprout = (id = 's1') => {
        const s = Sprout.createNewSprout('user1');
        (s as any).props.id = id;
        return s;
    };

    describe('CRUD Operations', () => {
        it('create() should insert sprout and all children in a transaction', async () => {
            const sprout = createTestSprout();
            sprout.addAffirmation('Aff 1');
            sprout.addTrigger('Trig 1');

            await repo.create(sprout);

            expect(mockDb.withExclusiveTransactionAsync).toHaveBeenCalled();
            
            // Insert Sprout
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO sprouts'),
                expect.arrayContaining(['user1'])
            );

            // Insert Affirmations
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO affirmations'),
                expect.arrayContaining(['Aff 1'])
            );

            // Insert Triggers
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO triggers'),
                expect.arrayContaining(['Trig 1'])
            );
        });

        // Test branch: loops skipped
        it('create() should handle sprout with no children', async () => {
            const sprout = createTestSprout();
            // No affirmations or triggers added

            await repo.create(sprout);

            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO sprouts'),
                expect.anything()
            );

            // Ensure no child inserts happened
            const calls = mockDb.runAsync.mock.calls;
            const childInserts = calls.filter(c => 
                (c[0] as string).includes('INTO affirmations') || 
                (c[0] as string).includes('INTO triggers')
            );
            expect(childInserts.length).toBe(0);
        });

        it('update() should update sprout and rewrite children', async () => {
            const sprout = createTestSprout();
            sprout.setColor('blue');
            sprout.addAffirmation('New Aff');
            sprout.addTrigger('New Trig');

            await repo.update(sprout);

            expect(mockDb.withExclusiveTransactionAsync).toHaveBeenCalled();

            // Update Parent
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE sprouts SET'),
                expect.arrayContaining(['blue', sprout.id])
            );

            // Delete old children
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM affirmations'),
                [sprout.id]
            );
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM triggers'),
                [sprout.id]
            );

            // Insert new children
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO affirmations'),
                expect.arrayContaining(['New Aff'])
            );
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO triggers'),
                expect.arrayContaining(['New Trig'])
            );
        });

        // Test branch: loops skipped in update
        it('update() should handle sprout with no children (clear list)', async () => {
            const sprout = createTestSprout();
            // sprout has empty affirmations/triggers

            await repo.update(sprout);

            // It should still DELETE old ones
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM affirmations'),
                [sprout.id]
            );

            // It should NOT INSERT new ones
            const calls = mockDb.runAsync.mock.calls;
            const childInserts = calls.filter(c => 
                (c[0] as string).includes('INSERT INTO affirmations')
            );
            expect(childInserts.length).toBe(0);
        });

        it('delete() should remove sprout by ID', async () => {
            await repo.delete('s1');
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                'DELETE FROM sprouts WHERE id = ?', 
                ['s1']
            );
        });
    });

    describe('Retrieval', () => {
        it('find() should return null if sprout not found', async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);
            const result = await repo.find('missing');
            expect(result).toBeNull();
        });

        it('find() should load sprout, affirmations, and triggers, then rehydrate', async () => {
            // Mock Sprout row
            mockDb.getFirstAsync.mockResolvedValue({
                id: 's1', user_id: 'u1', color: 'red', shape_id: 'circle', hat_id: 'none',
                sync_status: 'synced', created_at: 1000, updated_at: 1000
            });

            // getAllAsync called twice
            mockDb.getAllAsync
                .mockResolvedValueOnce([{ id: 'a1', text: 'Aff 1', position: 0 }]) // Affirmations
                .mockResolvedValueOnce([{ id: 't1', text: 'Trig 1', position: 0 }]); // Triggers

            const result = await repo.find('s1');

            expect(result).not.toBeNull();
            expect(result!.id).toBe('s1');
            expect(result!.color).toBe('red');
            expect(result!.affirmations[0].text).toBe('Aff 1');
            expect(result!.triggers[0].text).toBe('Trig 1');

            // Ensure queries were correct
            expect(mockDb.getAllAsync).toHaveBeenCalledWith(
                expect.stringContaining('FROM affirmations'), ['s1']
            );
            expect(mockDb.getAllAsync).toHaveBeenCalledWith(
                expect.stringContaining('FROM triggers'), ['s1']
            );
        });
    });

    describe('Summaries', () => {
        it('findSummary() should return null if not found', async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);
            const result = await repo.findSummary('missing');
            expect(result).toBeNull();
        });

        it('findSummary() should map row to summary object', async () => {
            mockDb.getFirstAsync.mockResolvedValue({
                id: 's1', user_id: 'u1', color: 'red', shape_id: 'sq', hat_id: 'hat',
                created_at: 1000, updated_at: 1000, first_affirmation_text: 'Top Aff'
            });

            const result = await repo.findSummary('s1');

            expect(result!.id).toBe('s1');
            expect(result!.firstAffirmationText).toBe('Top Aff');
        });

        // Test branch: row.first_affirmation_text is null
        it('findSummary() should handle null first affirmation text', async () => {
            mockDb.getFirstAsync.mockResolvedValue({
                id: 's1', user_id: 'u1', color: 'red', shape_id: 'sq', hat_id: 'hat',
                created_at: 1000, updated_at: 1000, first_affirmation_text: null
            });

            const result = await repo.findSummary('s1');

            expect(result!.id).toBe('s1');
            expect(result!.firstAffirmationText).toBeNull();
        });

        it('findAllSummariesByUserId() should map multiple rows', async () => {
            mockDb.getAllAsync.mockResolvedValue([
                { id: 's1', user_id: 'u1', created_at: 1000, updated_at: 1000 },
                { id: 's2', user_id: 'u1', created_at: 2000, updated_at: 2000 }
            ]);

            const results = await repo.findAllSummariesByUserId('u1');

            expect(results).toHaveLength(2);
            expect(results[0].id).toBe('s1');
            expect(results[1].id).toBe('s2');
        });
    });

    describe('Property-Based Robustness', () => {
        it('should handle arbitrary text in affirmations during creation', async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), async (randomText) => {
                    mockDb.runAsync.mockClear();
                    
                    const sprout = createTestSprout();
                    sprout.addAffirmation(randomText);

                    await repo.create(sprout);

                    const calls = mockDb.runAsync.mock.calls;
                    const affirmationInsert = calls.find(call => 
                        call[0].includes('INSERT INTO affirmations')
                    );
                    
                    expect(affirmationInsert).toBeDefined();
                    expect(affirmationInsert![1]).toContain(randomText.trim());
                })
            );
        });
    });
});