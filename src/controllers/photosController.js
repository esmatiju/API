const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const photosController = {
    async getAll(req, res) {
        try {
            const photos = await prisma.photos.findMany();
            res.json(photos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const photo = await prisma.photos.findUnique({ where: { id } });
            if (photo) {
                res.json(photo);
            } else {
                res.status(404).json({ error: 'Photo not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const photo = await prisma.photos.create({ data: req.body });
            res.status(201).json(photo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const photo = await prisma.photos.update({
                where: { id },
                data: req.body
            });
            res.json(photo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.photos.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = photosController;
