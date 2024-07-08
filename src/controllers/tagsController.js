const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tagsController = {
    /**
     * @swagger
     * /tags:
     *   get:
     *     summary: Récupérer la liste des tags
     *     tags: [Tags]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: La liste des tags
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Tag'
     *       500:
     *         description: Une erreur s'est produite lors de la récupération des tags
     */
    async getAll(req, res) {
        try {
            const tags = await prisma.tags.findMany();
            res.status(200).json(tags);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des tags.' });
        }
    },

    /**
     * @swagger
     * /tags/{id}:
     *   get:
     *     summary: Récupérer un tag par ID
     *     tags: [Tags]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du tag
     *     responses:
     *       200:
     *         description: Détails du tag
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Tag'
     *       404:
     *         description: Tag non trouvé
     *       500:
     *         description: Une erreur s'est produite lors de la récupération du tag
     */
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

    /**
     * @swagger
     * /tags:
     *   post:
     *     summary: Créer un nouveau tag
     *     tags: [Tags]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Tag'
     *     responses:
     *       201:
     *         description: Tag créé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Tag'
     *       400:
     *         description: Le champ "name" est obligatoire
     *       500:
     *         description: Une erreur s'est produite lors de la création du tag
     */
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

    /**
     * @swagger
     * /tags/{id}:
     *   put:
     *     summary: Mettre à jour un tag
     *     tags: [Tags]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du tag
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Tag'
     *     responses:
     *       200:
     *         description: Tag mis à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Tag'
     *       400:
     *         description: Le champ "name" est obligatoire
     *       404:
     *         description: Tag non trouvé
     *       500:
     *         description: Une erreur s'est produite lors de la mise à jour du tag
     */
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

    /**
     * @swagger
     * /tags/{id}:
     *   delete:
     *     summary: Supprimer un tag
     *     tags: [Tags]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du tag
     *     responses:
     *       204:
     *         description: Tag supprimé
     *       404:
     *         description: Tag non trouvé
     *       500:
     *         description: Une erreur s'est produite lors de la suppression du tag
     */
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
