const request = require('supertest');
const app = require('../app'); // Assurez-vous que votre app express est correctement exportée pour les tests

jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());
jest.mock('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            this.user = {
                create: jest.fn().mockResolvedValue({ id: 'user123' }),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.botanist = {
                create: jest.fn().mockResolvedValue({ id: 'botanist123', user_id: 'user123' }),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.garden = {
                create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'garden123', ...data.data })),
                findMany: jest.fn().mockResolvedValue([]),
                findUnique: jest.fn().mockImplementation((opts) => {
                    if (opts.where.id === 'garden123') {
                        return Promise.resolve({ id: 'garden123', latitude: 1.234, longitude: 2.345, address: '123 Test St', ville: 'Testville', cp: '12345', owner_id: 'user123', status: 'search', botanist_id: 'botanist123' });
                    }
                    return Promise.resolve(null);
                }),
                update: jest.fn().mockImplementation((params) => Promise.resolve({ ...params.data })),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.plant = {
                create: jest.fn().mockResolvedValue({ id: 'plant123' }),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.plantGardenPhoto = {
                deleteMany: jest.fn().mockResolvedValue({}),
            };
        }
    },
}));

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    writeFileSync: jest.fn().mockImplementation(() => console.log('Mock writeFileSync called')),
}));

describe('Garden Controller', () => {
    describe('GET /api/gardens', () => {
        test('should fetch all gardens', async () => {
            const response = await request(app).get('/api/gardens');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('GET /api/gardens/:id', () => {
        test('should fetch a single garden by id', async () => {
            const gardenId = 'garden123'; // Use the mocked garden ID
            const response = await request(app).get(`/api/gardens/${gardenId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('id', gardenId);
        });
    });

    describe('POST /api/gardens', () => {
        test('should create a new garden and delete it', async () => {
            const newGardenData = {
                latitude: 4.321,
                longitude: 5.432,
                address: '456 New Street',
                ville: 'Newville',
                cp: '54321',
                owner_id: 'user123', // Use the mocked user ID
                status: 'search',
                botanist_id: 'botanist123', // Use the mocked botanist ID
                photos: [],
            };

            const response = await request(app).post('/api/gardens').send(newGardenData);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('PUT /api/gardens/:id', () => {
        test('should update garden details', async () => {
            const gardenId = 'garden123'; // Use the mocked garden ID
            const updatedData = {latitude: 1.234, longitude: 2.345, address: '123 Test St', ville: 'Updatedville', cp: '12345', owner_id: 'user123', status: 'search', botanist_id: 'botanist123', photos: [] };
            const response = await request(app).put(`/api/gardens/${gardenId}`).send(updatedData);
            expect(response.statusCode).toBe(200);
            expect(response.body.ville).toEqual('Updatedville');
        });
    });

    describe('DELETE /api/gardens/:id', () => {
        test('should delete a garden', async () => {
            const gardenId = 'garden123'; // Use the mocked garden ID
            const response = await request(app).delete(`/api/gardens/${gardenId}`);
            expect(response.statusCode).toBe(204);
        });
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
