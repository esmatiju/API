const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tagsController = {
    async getAll(req, res) {
        try {
            const tags = await prisma.tags.findMany();
            res.json(tags);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const tag = await prisma.tags.findUnique({ where: { id } });
            if (tag) {
                res.json(tag);
            } else {
                res.status(404).json({ error: 'Tag not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const tag = await prisma.tags.create({ data: req.body });
            res.status(201).json(tag);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const tag = await prisma.tags.update({
                where: { id },
                data: req.body
            });
            res.json(tag);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.tags.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = tagsController;
