const request = require('supertest');
const app = require('../app'); // Assurez-vous que votre app express est correctement exportée pour les tests

jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());
jest.mock('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            this.tags = {
                create: jest.fn().mockImplementation((data) => Promise.resolve({ id: '123', ...data.data })),
                findMany: jest.fn().mockResolvedValue([]),
                findUnique: jest.fn().mockImplementation((opts) => {
                    if (opts.where.id === '123') {
                        return Promise.resolve({ id: '123', name: `test-tag` });
                    }
                    return Promise.resolve(null);
                }),
                update: jest.fn().mockImplementation((params) => Promise.resolve({ ...params.data })),
                delete: jest.fn().mockResolvedValue({}),
            };
        }
    },
}));

describe('Tags Controller', () => {
    const testTagId = '123';

    describe('GET /api/tags', () => {
        test('should fetch all tags', async () => {
            const response = await request(app).get('/api/tags');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/tags/:id', () => {
        test('should fetch a single tag', async () => {
            const response = await request(app).get(`/api/tags/${testTagId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('id', testTagId);
        });
    });

    describe('POST /api/tags', () => {
        test('should create a new tag and delete it', async () => {
            const newTagName = `new-tag`;
            const response = await request(app)
                .post('/api/tags')
                .send({ name: newTagName });
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('name', newTagName);
        });

        test('should return 400 for missing name', async () => {
            const response = await request(app)
                .post('/api/tags')
                .send({});
            expect(response.statusCode).toBe(400);
        });
    });

    describe('PUT /api/tags/:id', () => {
        test('should update tag details', async () => {
            const updatedTagName = `updated-tag`;
            const response = await request(app)
                .put(`/api/tags/${testTagId}`)
                .send({ name: updatedTagName });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('name', updatedTagName);
        });
    });

    describe('DELETE /api/tags/:id', () => {
        test('should delete a tag', async () => {
            const response = await request(app).delete(`/api/tags/${testTagId}`);
            expect(response.statusCode).toBe(204);
        });
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
