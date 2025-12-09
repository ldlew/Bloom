import { SqliteBaseRepository } from '../../../src/infrastructure/database/repositories/BaseRepository';
import { BaseModel, ISqliteAdapter, SqlValue } from '../../../src/domain';
import fc from 'fast-check';

class TestEntity extends BaseModel {
    public name: string;
    
    constructor(id: string, name: string) {
        super({ id, createdAt: new Date(), updatedAt: new Date(), syncStatus: 'synced' });
        this.name = name;
    }
}

class TestRepository extends SqliteBaseRepository<TestEntity> {
    protected tableName = 'test_table';

    protected mapRowToEntity(row: Record<string, SqlValue>): TestEntity {
        return new TestEntity(row.id as string, row.name as string);
    }

    protected mapEntityToRow(entity: TestEntity): Record<string, SqlValue> {
        return {
            id: entity.id,
            name: entity.name,
        };
    }
}

describe('SqliteBaseRepository (Abstract)', () => {
    let mockDb: jest.Mocked<ISqliteAdapter>;
    let repo: TestRepository;

    beforeEach(() => {
        mockDb = {
            runAsync: jest.fn(),
            getFirstAsync: jest.fn(),
            getAllAsync: jest.fn(),
            execAsync: jest.fn(),
            withExclusiveTransactionAsync: jest.fn(),
        } as unknown as jest.Mocked<ISqliteAdapter>;

        repo = new TestRepository(mockDb);
    });

    describe('Generic CRUD', () => {
        it('create() should map entity to row and execute INSERT', async () => {
            const entity = new TestEntity('123', 'Test Name');

            await repo.create(entity);

            expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
            const [sql, values] = mockDb.runAsync.mock.calls[0];

            expect(sql).toContain('INSERT INTO test_table');
            expect(sql).toContain('(id, name)'); 
            expect(values).toContain('123');
            expect(values).toContain('Test Name');
        });

        it('find() should select by ID and map result back to entity', async () => {
            mockDb.getFirstAsync.mockResolvedValue({ id: '123', name: 'Found It' });

            const result = await repo.find('123');

            expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
                'SELECT * FROM test_table WHERE id = ?', 
                ['123']
            );
            expect(result).toBeInstanceOf(TestEntity);
            expect(result?.name).toBe('Found It');
        });

        it('find() should return null if no row found', async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);
            
            const result = await repo.find('missing');
            
            expect(result).toBeNull();
        });

        it('findAll() should select all rows and map them', async () => {
            mockDb.getAllAsync.mockResolvedValue([
                { id: '1', name: 'A' },
                { id: '2', name: 'B' }
            ]);

            const results = await repo.findAll();

            expect(mockDb.getAllAsync).toHaveBeenCalledWith(
                'SELECT * FROM test_table', 
                []
            );
            expect(results).toHaveLength(2);
            expect(results[0]).toBeInstanceOf(TestEntity);
            expect(results[1].name).toBe('B');
        });

        it('update() should map entity and execute UPDATE by ID', async () => {
            const entity = new TestEntity('123', 'Updated Name');

            await repo.update(entity);

            expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
            const [sql, values] = mockDb.runAsync.mock.calls[0];

            expect(sql).toContain('UPDATE test_table SET');
            expect(sql).toContain('name = ?');
            expect(sql).toContain('WHERE id = ?');
            
            // ID must be the last parameter
            expect(values![values!.length - 1]).toBe('123');
            expect(values).toContain('Updated Name');
        });

        it('delete() should execute DELETE by ID', async () => {
            await repo.delete('123');

            expect(mockDb.runAsync).toHaveBeenCalledWith(
                'DELETE FROM test_table WHERE id = ?', 
                ['123']
            );
        });
    });

    describe('Property-Based Robustness', () => {
        it('should handle any string inputs for ID and Name', async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), fc.string(), async (id, name) => {
                    mockDb.runAsync.mockClear();
                    
                    const entity = new TestEntity(id, name);
                    await repo.create(entity);

                    const values = mockDb.runAsync.mock.calls[0][1];
                    expect(values).toContain(id);
                    expect(values).toContain(name);
                })
            );
        });
    });
});