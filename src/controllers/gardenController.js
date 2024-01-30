const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const gardenController = {
    async getAll(req, res) {
        try {
            const gardens = await prisma.garden.findMany();
            res.json(gardens);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const garden = await prisma.garden.findUnique({ where: { id } });
            if (garden) {
                res.json(garden);
            } else {
                res.status(404).json({ error: 'Garden not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const garden = await prisma.garden.create({ data: req.body });
            res.status(201).json(garden);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const garden = await prisma.garden.update({
                where: { id },
                data: req.body
            });
            res.json(garden);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.garden.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = gardenController;
