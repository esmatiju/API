const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const messageController = {
    /**
     * @swagger
     * /messages:
     *   get:
     *     summary: Récupérer la liste des messages
     *     tags: [Messages]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: La liste des messages
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Message'
     *       500:
     *         description: Une erreur s'est produite lors de la récupération des messages
     */
    async getAll(req, res) {
        try {
            const messages = await prisma.message.findMany();
            res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des messages.' });
        }
    },

    /**
     * @swagger
     * /messages/{id}:
     *   get:
     *     summary: Récupérer un message par ID
     *     tags: [Messages]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du message
     *     responses:
     *       200:
     *         description: Détails du message
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Message'
     *       404:
     *         description: Message non trouvé
     *       500:
     *         description: Une erreur s'est produite lors de la récupération du message
     */
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

    /**
     * @swagger
     * /messages:
     *   post:
     *     summary: Créer un nouveau message
     *     tags: [Messages]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Message'
     *     responses:
     *       201:
     *         description: Message créé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Message'
     *       400:
     *         description: Les champs "user_id", "garden_id" et "message" sont obligatoires
     *       500:
     *         description: Une erreur s'est produite lors de la création du message
     */
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

    /**
     * @swagger
     * /messages/{id}:
     *   put:
     *     summary: Mettre à jour un message
     *     tags: [Messages]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du message
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Message'
     *     responses:
     *       200:
     *         description: Message mis à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Message'
     *       400:
     *         description: Le champ "message" est obligatoire
     *       404:
     *         description: Message non trouvé
     *       500:
     *         description: Une erreur s'est produite lors de la mise à jour du message
     */
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

    /**
     * @swagger
     * /messages/{id}:
     *   delete:
     *     summary: Supprimer un message
     *     tags: [Messages]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du message
     *     responses:
     *       204:
     *         description: Message supprimé
     *       404:
     *         description: Message non trouvé
     *       500:
     *         description: Une erreur s'est produite lors de la suppression du message
     */
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
