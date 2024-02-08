const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tagsController = {
    async getAll(req, res) {
        try {
            const tags = await prisma.tags.findMany();
            res.status(200).json(tags);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des tags.' });
        }
    },

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const tag = await prisma.tags.findUnique({ where: { id } });
            if (tag) {
                res.status(200).json(tag);
            } else {
                res.status(404).json({ error: 'Tag non trouvé.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du tag.' });
        }
    },

    async create(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Le champ "name" est obligatoire.' });
            }

            const tag = await prisma.tags.create({ data: { name } });
            res.status(201).json(tag);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la création du tag.' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Le champ "name" est obligatoire.' });
            }

            const tag = await prisma.tags.update({
                where: { id },
                data: { name }
            });

            res.status(200).json(tag);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Tag non trouvé.' });
            }
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du tag.' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedTag = await prisma.tags.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Tag non trouvé.' });
            }
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression du tag.' });
        }
    }
};

module.exports = tagsController;
