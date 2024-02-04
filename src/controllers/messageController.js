const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const messageController = {
    async getAll(req, res) {
        try {
            const messages = await prisma.message.findMany();
            res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des messages.' });
        }
    },

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const message = await prisma.message.findUnique({ where: { id } });
            if (message) {
                res.status(200).json(message);
            } else {
                res.status(404).json({ error: 'Message non trouvé.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du message.' });
        }
    },

    async create(req, res) {
        try {
            const { user_id, garden_id, message } = req.body;

            if (!user_id || !garden_id || !message) {
                return res.status(400).json({ error: 'Les champs "user_id", "garden_id" et "message" sont obligatoires.' });
            }

            const createdMessage = await prisma.message.create({ data: { user_id, garden_id, message } });
            res.status(201).json(createdMessage);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la création du message.' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Le champ "message" est obligatoire.' });
            }

            const updatedMessage = await prisma.message.update({
                where: { id },
                data: { message }
            });

            if (updatedMessage) {
                res.status(200).json(updatedMessage);
            } else {
                res.status(404).json({ error: 'Message non trouvé.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du message.' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedMessage = await prisma.message.delete({ where: { id } });
            if (deletedMessage) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Message non trouvé.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression du message.' });
        }
    },
};

module.exports = messageController;
