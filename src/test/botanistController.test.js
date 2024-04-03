const request = require('supertest');
const app = require('../app'); // Assurez-vous que votre app express est correctement exportée pour les tests

jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());
jest.mock('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            this.user = {
                create: jest.fn().mockResolvedValue({ id: 'user123', lastname: 'TestLastName', firstname: 'TestFirstName', email: 'test@example.com', password: 'testpassword', isPubliable: true, picture_url: 'http://example.com/test.jpg' }),
                deleteMany: jest.fn().mockResolvedValue({}),
            };
            this.botanist = {
                create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'newBotanistId', ...data.data })),
                findMany: jest.fn().mockResolvedValue([{ id: 'botanist123', user_id: 'user123', siret: '12345678901234' }]),
                findUnique: jest.fn().mockImplementation((opts) => {
                    if (opts.where.id === 'botanist123') {
                        return Promise.resolve({ id: 'botanist123', user_id: 'user123', siret: '12345678901234' });
                    }
                    return Promise.resolve(null);
                }),
                update: jest.fn().mockImplementation((params) => Promise.resolve({ ...params.data })),
                delete: jest.fn().mockResolvedValue({}),
                deleteMany: jest.fn().mockResolvedValue({}),
            };
        }
    },
}));

describe('Botanist Controller Tests', () => {
    const testBotanistId = 'botanist123';

    test('GET /api/botanists should return all botanists', async () => {
        const response = await request(app).get('/api/botanists');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/botanists/:id should return a single botanist', async () => {
        const response = await request(app).get(`/api/botanists/${testBotanistId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(testBotanistId);
    });

    test('POST /api/botanists should create a new botanist', async () => {
        const newBotanistData = {
            user_id: 'user123',
            siret: '98765432109876',
        };

        const response = await request(app).post('/api/botanists').send(newBotanistData);
        expect(response.statusCode).toBe(201);
        expect(response.body.siret).toBe(newBotanistData.siret);
    });

    test('PUT /api/botanists/:id should update botanist details', async () => {
        const updatedData = { siret: 'newSiret12345678' };
        const response = await request(app).put(`/api/botanists/${testBotanistId}`).send(updatedData);
        expect(response.statusCode).toBe(200);
        expect(response.body.siret).toBe(updatedData.siret);
    });

    test('DELETE /api/botanists/:id should delete a botanist', async () => {
        const response = await request(app).delete(`/api/botanists/${testBotanistId}`);
        expect(response.statusCode).toBe(204);
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
