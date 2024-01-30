const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userController = {
    async getAll(req, res) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({ where: { id } });
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const user = await prisma.user.create({ data: req.body });
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma.user.update({
                where: { id },
                data: req.body
            });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.user.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = userController;
