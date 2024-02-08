const request = require('supertest');
const app = require('../app'); // Assurez-vous que votre app express est correctement exportée pour les tests

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            this.user = {
                create: jest.fn().mockResolvedValue({ id: 'user123', lastname: 'Test', firstname: 'User', email: 'testuser@example.com', password: 'hashedpassword', isPubliable: true, picture_url: 'https://example.com/user.jpg' }),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.botanist = {
                create: jest.fn().mockResolvedValue({ id: 'botanist123', user_id: 'user123', siret: '12345678901234' }),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.garden = {
                create: jest.fn().mockResolvedValue({ id: 'garden123', latitude: 1.234, longitude: 2.345, address: '123 Test St', ville: 'Testville', cp: '12345', owner_id: 'user123', status: 'Active', botanist_id: 'botanist123' }),
                delete: jest.fn().mockResolvedValue({}),
            };
            this.message = {
                create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'message123', ...data.data })),
                findMany: jest.fn().mockResolvedValue([]),
                findUnique: jest.fn().mockImplementation((opts) => {
                    if (opts.where.id === 'message123') {
                        return Promise.resolve({ id: 'message123', user_id: 'user123', garden_id: 'garden123', message: 'This is a test message' });
                    }
                    return Promise.resolve(null);
                }),
                update: jest.fn().mockImplementation((params) => Promise.resolve({ ...params.data })),
                delete: jest.fn().mockResolvedValue({}),
            };
        }
    },
}));

describe('Message Controller', () => {
    const testMessageId = 'message123'; // Utiliser un ID mocké pour les tests

    describe('GET /api/messages', () => {
        test('should fetch all messages', async () => {
            const response = await request(app).get('/api/messages');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('GET /api/messages/:id', () => {
        test('should fetch a single message by id', async () => {
            const response = await request(app).get(`/api/messages/${testMessageId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('id', testMessageId);
        });
    });

    describe('POST /api/messages', () => {
        test('should create a new message and delete it', async () => {
            const newMessage = {
                user_id: 'user123',
                garden_id: 'garden123',
                message: 'A new test message',
            };

            const response = await request(app).post('/api/messages').send(newMessage);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('PUT /api/messages/:id', () => {
        test('should update message details', async () => {
            const updatedData = { message: 'Updated test message' };
            const response = await request(app).put(`/api/messages/${testMessageId}`).send(updatedData);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', updatedData.message);
        });
    });

    describe('DELETE /api/messages/:id', () => {
        test('should delete a message', async () => {
            const response = await request(app).delete(`/api/messages/${testMessageId}`);
            expect(response.statusCode).toBe(204);
        });
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
