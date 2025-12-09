import { BaseModel, BaseModelProps } from '../../../src/domain';
import fc from 'fast-check';

jest.mock('expo-crypto', () => ({
    randomUUID: jest.fn(() => 'mock-uuid'),
}));

// pass initial properties to the basemodel
class TestImplementation extends BaseModel {
    // Constructor removed (it is automatic in derived classes)

    public exposeMarkModified(): void {
        this.markModified();
    }

    public exposeMarkSynced(serverTimestamp: Date): void {
        this.markSynced(serverTimestamp);
    }
}

describe('BaseModel', () => {
    let instance: TestImplementation;
    // a set timestamp for reference during test 
    const today = new Date('2025-11-29T12:00:00Z');
    
    const props: BaseModelProps = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        createdAt: today,
        updatedAt: today,
        syncStatus: 'synced',
    };

    // set the system clocks and get a new instance before each test 
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(today);
        instance = new TestImplementation(props);
    });

    // restore new timers after each test 
    afterEach(() => {
        jest.useRealTimers();
    });

    // ensures basemodel assigned its inital properties correctly 
    it('initializes properties correctly', () => {
        expect(instance.id).toBe(props.id);
        expect(instance.createdAt).toEqual(props.createdAt);
        expect(instance.updatedAt).toEqual(props.updatedAt);
        expect(instance.syncStatus).toBe('synced');
    });

    it('updates timestamp and status on modification', () => {
        const laterToday = new Date('2025-11-29T12:30:00Z');
        jest.setSystemTime(laterToday);

        instance.exposeMarkModified();

        expect(instance.updatedAt).toEqual(laterToday);
        expect(instance.syncStatus).toBe('pending');
    });

    // simulates a tiemstamp that would be return after syncing 
    it('updates timestamp and status on sync', () => {
        const serverTime = new Date('2025-11-29T12:35:00Z');
        
        instance.exposeMarkSynced(serverTime);

        expect(instance.updatedAt).toEqual(serverTime);
        expect(instance.syncStatus).toBe('synced');
    });

    describe('Property-Based', () => {
        it('should always transition to PENDING on modification', () => {
            fc.assert(
                fc.property(
                    // FIX: Filter out Invalid Dates (NaN) to prevent equality errors
                    fc.date({ min: new Date('2020-01-01'), max: new Date('2100-01-01') })
                      .filter(d => !isNaN(d.getTime())), 
                    fc.constantFrom('synced', 'pending', 'unsynced'),
                    (randomDate, initialStatus) => {
                        const subject = new TestImplementation({
                            id: 'prop-test-id',
                            createdAt: randomDate,
                            updatedAt: randomDate,
                            syncStatus: initialStatus as any,
                        });

                        const futureTime = new Date(randomDate.getTime() + 1000);
                        jest.setSystemTime(futureTime);

                        subject.exposeMarkModified();

                        expect(subject.syncStatus).toBe('pending');
                        expect(subject.updatedAt).toEqual(futureTime);
                    },
                ),
            );
        });

        it('should always transition to SYNCED on sync confirmation', () => {
            fc.assert(
                fc.property(
                    // FIX: Filter out Invalid Dates here as well
                    fc.date().filter(d => !isNaN(d.getTime())),
                    (serverDate) => {
                        const subject = new TestImplementation(props);

                        subject.exposeMarkSynced(serverDate);

                        expect(subject.syncStatus).toBe('synced');
                        expect(subject.updatedAt).toEqual(serverDate);
                    },
                ),
            );
        });
    });
});