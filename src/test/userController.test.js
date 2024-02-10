const request = require('supertest');
const app = require('../app'); // Assurez-vous que cela pointe vers votre fichier app.js Express correct

jest.mock('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            this.user = {
                create: jest.fn().mockImplementation((data) => Promise.resolve({ id: '123', ...data.data })),
                findMany: jest.fn().mockResolvedValue([]),
                findUnique: jest.fn().mockImplementation((opts) => {
                    if (opts.where.id === '123') {
                        return Promise.resolve({ id: '123', lastname: 'Doe', firstname: 'John', email: 'john.doe@example.com' });
                    }
                    return Promise.resolve(null);
                }),
                update: jest.fn().mockImplementation((params) => Promise.resolve({ ...params.data })),
                delete: jest.fn().mockResolvedValue({}),
            };
        }
    },
}));

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    writeFileSync: jest.fn().mockImplementation(() => console.log('Mock writeFileSync called')),
    unlinkSync: jest.fn(),
    existsSync: jest.fn(() => true),
}));

describe('User Controller Tests', () => {
    test('GET /api/users should fetch all users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('POST /api/users should create a new user', async () => {
        const newUser = {
            lastname: 'Doe',
            firstname: 'John',
            email: 'john.doe@example.com',
            password: 'password',
            isPubliable: true,
            picture_url: 'http://example.com/image.jpg',
        };

        const response = await request(app).post('/api/users').send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    test('GET /api/users/:id should fetch a single user', async () => {
        const userId = '123';
        const response = await request(app).get(`/api/users/${userId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', userId);
    });

    test('PUT /api/users/:id should update user details', async () => {
        const userId = '123';
        const updatedData = {
            firstname: 'Jane',
            lastname: 'Doe',
        };

        const response = await request(app).put(`/api/users/${userId}`).send(updatedData);
        expect(response.statusCode).toBe(200);
        expect(response.body.firstname).toBe(updatedData.firstname);
        expect(response.body.lastname).toBe(updatedData.lastname);
    });

    test('DELETE /api/users/:id should delete a user', async () => {
        const userId = '123';
        const response = await request(app).delete(`/api/users/${userId}`);
        expect(response.statusCode).toBe(204);
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
