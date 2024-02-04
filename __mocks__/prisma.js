const { mockDeep } = require('jest-mock-extended');
const prismaMock = mockDeep();

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => prismaMock),
}));

module.exports = { prismaMock };
