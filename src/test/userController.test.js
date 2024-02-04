const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const app = require('../app');

const prisma = new PrismaClient();

// Mock Prisma client methods
jest.mock('@prisma/client', () => {
    const originalModule = jest.requireActual('@prisma/client');

    return {
        __esModule: true,
        ...originalModule,
        PrismaClient: jest.fn().mockImplementation(() => ({
            user: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        })),
    };
});

describe('User Controller', () => {
    describe('GET /users', () => {
        it('returns all users', async () => {
            const mockUsers = [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
            ];
            prisma.user.findMany.mockResolvedValue(mockUsers);

            const response = await request(app).get('/api/users');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockUsers);
            expect(prisma.user.findMany).toHaveBeenCalled();
        });
    });

    describe('GET /users/:id', () => {
        it('returns a user by id', async () => {
            const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
            prisma.user.findUnique.mockResolvedValue(mockUser);

            const response = await request(app).get('/api/users/1');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe('POST /users', () => {
        it('creates a new user', async () => {
            const newUser = { name: 'New User', email: 'newuser@example.com', password: 'password' };
            const mockUser = { ...newUser, id: 3 };
            prisma.user.create.mockResolvedValue(mockUser);

            const response = await request(app).post('/api/users').send(newUser);

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(mockUser);
            expect(prisma.user.create).toHaveBeenCalledWith({ data: newUser });
        });
    });

    describe('PUT /users/:id', () => {
        it('updates a user', async () => {
            const updatedUser = { name: 'Updated User', email: 'updated@example.com' };
            const mockUser = { ...updatedUser, id: 1 };
            prisma.user.update.mockResolvedValue(mockUser);

            const response = await request(app).put('/api/users/1').send(updatedUser);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updatedUser,
            });
        });
    });

    describe('DELETE /users/:id', () => {
        it('deletes a user', async () => {
            prisma.user.delete.mockResolvedValue({ id: 1 });

            const response = await request(app).delete('/api/users/1');

            expect(response.statusCode).toBe(204);
            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe('POST /login', () => {
        it('authenticates a user and returns user info without password', async () => {
            const mockUser = { id: 1, email: 'john@example.com', password: await bcrypt.hash('password123', 10) };
            prisma.user.findUnique.mockResolvedValue(mockUser);

            const response = await request(app).post('/api/users/login').send({
                email: 'john@example.com',
                password: 'password123',
            });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ id: mockUser.id, email: mockUser.email }); // Assurez-vous que le mot de passe n'est pas inclus
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
            // Vous pouvez également vouloir vérifier si bcrypt.compare a été appelé avec le bon mot de passe
        });

        it('returns 401 for invalid credentials', async () => {
            prisma.user.findUnique.mockResolvedValue(null); // Simuler un utilisateur non trouvé

            const response = await request(app).post('/api/users/login').send({
                email: 'unknown@example.com',
                password: 'password123',
            });

            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual({ error: 'Invalid email or password' });
        });
    });
});
