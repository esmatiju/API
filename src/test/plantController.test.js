const request = require('supertest');
const app = require('../app');

jest.mock('@prisma/client', () => ({
    PrismaClient: class {
        constructor() {
            this.plant = {
                create: jest.fn().mockImplementation((data) => Promise.resolve({ id: '123', ...data.data })),
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: '123',
                        name: 'Test Plant',
                        description: 'A test plant for the plant controller',
                        hint: '{"astucec 1": "astuce 1", "astuce 2": "astuce 2"}',
                        fullname: 'Test Plantus',
                        picture_url: 'https://example.com/plant-image.jpg',
                        TagsPlant: [{
                            Tags: { id: 'tag1', name: 'Sunny' }
                        }],
                        Photo_comu: [{
                            Photos: { id: 'photo1', picture_url: 'https://example.com/photo1.jpg' }
                        }]
                    }
                ]),
                findUnique: jest.fn().mockImplementation((opts) => {
                    if (opts.where.id === '123') {
                        return Promise.resolve({
                            id: '123',
                            name: 'Test Plant',
                            description: 'A test plant for the plant controller',
                            hint: '{"astucec 1": "astuce 1", "astuce 2": "astuce 2"}',
                            fullname: 'Test Plantus',
                            picture_url: 'https://example.com/plant-image.jpg',
                            TagsPlant: [{
                                Tags: { id: 'tag1', name: 'Sunny' }
                            }],
                            Photo_comu: [{
                                Photos: { id: 'photo1', picture_url: 'https://example.com/photo1.jpg' }
                            }]
                        });
                    }
                    return Promise.resolve(null);
                }),
                update: jest.fn().mockImplementation((params) => Promise.resolve({ ...params.data })),
                delete: jest.fn().mockResolvedValue({}),
            };

            this.tagsPlant = {
                deleteMany: jest.fn().mockResolvedValue({}),
            };

            this.photo_comu = {
                deleteMany: jest.fn().mockResolvedValue({}),
            };
            this.photos = {
                delete: jest.fn().mockResolvedValue({}),
                deleteMany: jest.fn().mockResolvedValue({}),
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

describe('Plant Controller', () => {
    const testPlantId = '123'; // Utiliser un ID mocké pour les tests

    describe('GET /api/plants', () => {
        test('should fetch all plants', async () => {
            const response = await request(app).get('/api/plants');
            // wrong code ->
            expect(response.statusCode).toBe(400);
            // good code ->
            // expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('GET /api/plants/:id', () => {
        test('should fetch a single plant', async () => {
            const response = await request(app).get(`/api/plants/${testPlantId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('id', testPlantId);
        });
    });

    describe('POST /api/plants', () => {
        test('should create a new plant and delete it', async () => {
            const newPlant = {
                name: 'New Test Plant',
                description: 'A new test plant for testing',
                hint: 'Water daily',
                fullname: 'New Testus Plantus',
                picture_url: 'data:image/png;base64,...',
            };

            const response = await request(app).post('/api/plants').send(newPlant);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('PUT /api/plants/:id', () => {
        test('should update plant details', async () => {
            const updatedData = { name: 'Updated Test Plant' };
            const response = await request(app).put(`/api/plants/${testPlantId}`).send(updatedData);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('name', 'Updated Test Plant');
        });
    });

    describe('DELETE /api/plants/:id', () => {
        test('should delete a plant', async () => {
            const response = await request(app).delete(`/api/plants/${testPlantId}`);
            expect(response.statusCode).toBe(204);
        });
    });
});

afterAll(() => {
    jest.clearAllMocks();
});
