const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const botanistController = {
    async getAll(req, res) {
        try {
            const botanists = await prisma.botanist.findMany({
                include: {
                    User: true,
                },
            });
            res.json(botanists);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const botanist = await prisma.botanist.findUnique({
                where: { id },
                include: {
                    User: true,
                },
            });
            if (botanist) {
                res.json(botanist);
            } else {
                res.status(404).json({ error: 'Botanist not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const botanist = await prisma.botanist.create({ data: req.body });
            res.status(201).json(botanist);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const botanist = await prisma.botanist.update({
                where: { id },
                data: req.body
            });
            res.json(botanist);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.botanist.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = botanistController;
