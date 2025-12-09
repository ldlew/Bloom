import { Sprout } from '../../../src/domain/models/Sprout'; 
import { DEFAULT_COLOR, MAX_AFFIRMATIONS, MAX_TRIGGERS } from '../../../src/domain/constants/sprout.constants';

// Needed for Jest to generate IDs
jest.mock('expo-crypto', () => ({
    randomUUID: jest.fn(() => Math.random().toString()),
}));

jest.mock('../../../src/domain/models/BaseModel', () => {
    return {
        BaseModel: class MockBaseModel {
            protected props: any;
            public modified: boolean = false; //tacks modification

            constructor(props: any) { 
                this.props = props; 
            }
            
            public markModified() { 
                this.modified = true; 
            }

            public resetModified() {
                this.modified = false;
            }
        },
    };
});

describe('Sprout Domain Entity', () => {
    //connects sprouts to certain users
    const TEST_USER_ID = 'user-123';
    let sprout: Sprout;

    //creates sprouts with default values before test
    beforeEach(() => {
        jest.clearAllMocks();
        sprout = Sprout.createNewSprout(TEST_USER_ID);
    });

    //tests Sprout Creations
    describe('Instantiation', () => {
        it('should create a new sprout with default values', () => {
            expect(sprout.userId).toBe(TEST_USER_ID);
            expect(sprout.color).toBe(DEFAULT_COLOR);
            expect(sprout.shapeId).toBe('rounded');
            expect(sprout.hatId).toBe('leaves');
            expect(sprout.affirmations).toEqual([]);
            expect(sprout.triggers).toEqual([]);
        });

        it('should rehydrate from persistence correctly', () => {
            const props: any = {
                id: 'existing-id',
                userId: 'user-999',
                color: '#FF0000',
                shapeId: 'star',
                hatId: 'cowboy',
                syncStatus: 'synced',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            
            const existingAffirmations = [
                { id: '1', text: 'Existing Aff', position: 0 },
            ];
            const existingTriggers = [
                { id: 't1', text: 'Existing Trig', position: 0 },
            ];

            const loadedSprout = Sprout.createFromPersistence(props, existingAffirmations as any, existingTriggers as any);

            expect(loadedSprout.userId).toBe('user-999');
            expect(loadedSprout.color).toBe('#FF0000');
            expect(loadedSprout.affirmations[0].text).toBe('Existing Aff');
            expect(loadedSprout.triggers[0].text).toBe('Existing Trig');
        });
    });

    //Property Modications, test changing colors, shape, and hat
    describe('Properties Modification', () => {
        it('should update color and mark modified', () => {
            sprout.setColor('#00FF00');
            expect(sprout.color).toBe('#00FF00');
            expect((sprout as any).modified).toBe(true);
        });

        it('should update shapeId and mark modified', () => {
            sprout.setShapeId('circle');
            expect(sprout.shapeId).toBe('circle');
            expect((sprout as any).modified).toBe(true);
        });

        it('should update hatId and mark modified', () => {
            sprout.setHatId('wizard');
            expect(sprout.hatId).toBe('wizard');
            expect((sprout as any).modified).toBe(true);
        });
    });

    //Affirmation Management, test CRUD operations 
    describe('Affirmation Management', () => {
        it('should add an affirmation', () => {
            sprout.addAffirmation('I am capable');
            
            expect(sprout.affirmations[0].text).toBe('I am capable');
            expect(sprout.affirmations[0].position).toBe(0);
            expect(sprout.affirmations[0].id).toBeDefined();
            expect((sprout as any).modified).toBe(true);
        });

        it('should trim whitespace when adding affirmations', () => {
            sprout.addAffirmation('   Trim me   ');
            expect(sprout.affirmations[0].text).toBe('Trim me');
        });

        //throws an error if two many affirmations are added
        it('should throw error when exceeding MAX_AFFIRMATIONS', () => {
            for (let i = 0; i < MAX_AFFIRMATIONS; i++) {
                sprout.addAffirmation(`Affirmation ${i}`);
            }

            expect(() => {
                sprout.addAffirmation('One too many');
            }).toThrow('Maximum # of affirmations reached');
        });

        //test that affirmation removal is being done correctly 
        it('should remove an affirmation and reindex', () => {
            sprout.addAffirmation('First');
            sprout.addAffirmation('Second');
            sprout.addAffirmation('Third');

            const secondId = sprout.affirmations[1].id;
            
            sprout.removeAffirmation(secondId);

            expect(sprout.affirmations[0].text).toBe('First');
            expect(sprout.affirmations[1].text).toBe('Third');
            
            expect(sprout.affirmations[0].position).toBe(0);
            expect(sprout.affirmations[1].position).toBe(1);
            expect((sprout as any).modified).toBe(true);
        });

        it('should throw error when removing non-existent affirmation', () => {
            expect(() => {
                sprout.removeAffirmation('fake-id');
            }).toThrow('Affirmation not found');
        });

        //test that updating an affirmation is done correctly 
        it('should update affirmation text', () => {
            sprout.addAffirmation('Original Text');
            const id = sprout.affirmations[0].id;

            sprout.updateAffirmationText(id, 'Updated Text');

            expect(sprout.affirmations[0].text).toBe('Updated Text');
            expect((sprout as any).modified).toBe(true);
        });

        it('should throw error when updating non-existent affirmation', () => {
            expect(() => {
                sprout.updateAffirmationText('fake-id', 'New Text');
            }).toThrow('Affirmation not found');
        });
    });

    //Reordering Logic 
    describe('Reordering Logic', () => {
        //creats example affirmations
        beforeEach(() => {
            sprout.addAffirmation('A');
            sprout.addAffirmation('B');
            sprout.addAffirmation('C');
            (sprout as any).modified = false;
        });

        //reorder affirmations should be (B, C, A)
        it('should move an item down the list (0 -> 2)', () => {
            const idToMove = sprout.affirmations[0].id;

            sprout.reorderAffirmation(idToMove, 2);

            const texts = sprout.affirmations.map(a => a.text);
            expect(texts).toEqual(['B', 'C', 'A']);
            
            expect(sprout.affirmations[0].position).toBe(0);
            expect(sprout.affirmations[2].position).toBe(2);
            expect((sprout as any).modified).toBe(true);
        });

        //reorder affirmations should be (C, A, B)
        it('should move an item up the list (2 -> 0)', () => {
            const idToMove = sprout.affirmations[2].id;

            sprout.reorderAffirmation(idToMove, 0);

            const texts = sprout.affirmations.map(a => a.text);
            expect(texts).toEqual(['C', 'A', 'B']);
            expect((sprout as any).modified).toBe(true);
        });

        it('should throw error for invalid indices', () => {
            const id = sprout.affirmations[0].id;
            expect(() => sprout.reorderAffirmation(id, -1)).toThrow('Invalid position');
            expect(() => sprout.reorderAffirmation(id, 99)).toThrow('Invalid position');
        });

        it('should throw error if affirmation ID not found during reorder', () => {
            expect(() => sprout.reorderAffirmation('fake-id', 1)).toThrow('Affirmation not found');
        });
    });

    //Trigger Management, test CRUD operations
    describe('Trigger Management', () => {
        it('should add a trigger', () => {
            sprout.addTrigger('I feel anxious');
            
            expect(sprout.triggers[0].text).toBe('I feel anxious');
            expect(sprout.triggers[0].position).toBe(0);
            expect(sprout.triggers[0].id).toBeDefined();
            expect((sprout as any).modified).toBe(true);
        });

        it('should trim whitespace when adding triggers', () => {
            sprout.addTrigger('   Panic   ');
            expect(sprout.triggers[0].text).toBe('Panic');
        });

        //throws an error if two many triggers are added
        it('should throw error when exceeding MAX_TRIGGERS', () => {
            for (let i = 0; i < MAX_TRIGGERS; i++) {
                sprout.addTrigger(`Trigger ${i}`);
            }

            expect(() => {
                sprout.addTrigger('One too many');
            }).toThrow('Maximum # of triggers reached');
        });

        //test that trigger removal is being done correctly
        it('should remove a trigger and reindex', () => {
            sprout.addTrigger('T1');
            sprout.addTrigger('T2');
            sprout.addTrigger('T3');

            const secondId = sprout.triggers[1].id;
            
            sprout.removeTrigger(secondId);

            expect(sprout.triggers[0].text).toBe('T1');
            expect(sprout.triggers[1].text).toBe('T3');
            
            expect(sprout.triggers[0].position).toBe(0);
            expect(sprout.triggers[1].position).toBe(1);
            expect((sprout as any).modified).toBe(true);
        });

        it('should throw error when removing non-existent trigger', () => {
            expect(() => {
                sprout.removeTrigger('fake-id');
            }).toThrow('Trigger not found');
        });

        //test that updating a trigger is done correctly
        it('should update trigger text', () => {
            sprout.addTrigger('Original');
            const id = sprout.triggers[0].id;

            sprout.updateTriggerText(id, 'Updated');

            expect(sprout.triggers[0].text).toBe('Updated');
            expect((sprout as any).modified).toBe(true);
        });

        it('should throw error when updating non-existent trigger', () => {
            expect(() => {
                sprout.updateTriggerText('fake-id', 'New Text');
            }).toThrow('Trigger not found');
        });

        //Reordering Logic for Triggers
        describe('Reordering Logic', () => {
            //creats example triggers
            beforeEach(() => {
                sprout.addTrigger('T_A');
                sprout.addTrigger('T_B');
                sprout.addTrigger('T_C');
                (sprout as any).modified = false;
            });

            //reorder triggers should be (T_B, T_C, T_A)
            it('should move an item down the list (0 -> 2)', () => {
                const idToMove = sprout.triggers[0].id;
                sprout.reorderTrigger(idToMove, 2);
                
                const texts = sprout.triggers.map(t => t.text);
                expect(texts).toEqual(['T_B', 'T_C', 'T_A']);
                
                expect(sprout.triggers[0].position).toBe(0);
                expect((sprout as any).modified).toBe(true);
            });

            //reorder triggers should be (T_C, T_A, T_B)
            it('should move an item up the list (2 -> 0)', () => {
                const idToMove = sprout.triggers[2].id;
                sprout.reorderTrigger(idToMove, 0);
                
                const texts = sprout.triggers.map(t => t.text);
                expect(texts).toEqual(['T_C', 'T_A', 'T_B']);
            });

            it('should throw error for invalid indices', () => {
                const id = sprout.triggers[0].id;
                expect(() => sprout.reorderTrigger(id, -1)).toThrow('Invalid position');
                expect(() => sprout.reorderTrigger(id, 99)).toThrow('Invalid position');
            });

            it('should throw error if trigger ID not found during reorder', () => {
                expect(() => sprout.reorderTrigger('fake-id', 1)).toThrow('Trigger not found');
            });
        });
    });
});