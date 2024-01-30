const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const messageController = {
    async getAll(req, res) {
        try {
            const messages = await prisma.message.findMany();
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const message = await prisma.message.findUnique({ where: { id } });
            if (message) {
                res.json(message);
            } else {
                res.status(404).json({ error: 'Message not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const message = await prisma.message.create({ data: req.body });
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const message = await prisma.message.update({
                where: { id },
                data: req.body
            });
            res.json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.message.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = messageController;
