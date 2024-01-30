const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plantController = {
    async getAll(req, res) {
        try {
            const plants = await prisma.plant.findMany();
            res.json(plants);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const plant = await prisma.plant.findUnique({ where: { id } });
            if (plant) {
                res.json(plant);
            } else {
                res.status(404).json({ error: 'Plant not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const plant = await prisma.plant.create({ data: req.body });
            res.status(201).json(plant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const plant = await prisma.plant.update({
                where: { id },
                data: req.body
            });
            res.json(plant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.plant.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = plantController;
