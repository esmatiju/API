const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const botanistController = {
    /**
     * @swagger
     * /botanists:
     *   get:
     *     summary: Récupérer la liste des botanistes
     *     tags: [Botanists]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: La liste des botanistes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Botanist'
     *       500:
     *         description: Erreur serveur
     */
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

    /**
     * @swagger
     * /botanists/{id}:
     *   get:
     *     summary: Récupérer un botaniste par ID
     *     tags: [Botanists]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du botaniste
     *     responses:
     *       200:
     *         description: Détails du botaniste
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Botanist'
     *       404:
     *         description: Botanist non trouvé
     *       500:
     *         description: Erreur serveur
     */
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

    /**
     * @swagger
     * /botanists:
     *   post:
     *     summary: Créer un nouveau botaniste
     *     tags: [Botanists]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Botanist'
     *     responses:
     *       201:
     *         description: Botanist créé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Botanist'
     *       500:
     *         description: Erreur serveur
     */
    async create(req, res) {
        try {
            const botanist = await prisma.botanist.create({ data: req.body });
            res.status(201).json(botanist);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /botanists/{id}:
     *   put:
     *     summary: Mettre à jour un botaniste
     *     tags: [Botanists]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du botaniste
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Botanist'
     *     responses:
     *       200:
     *         description: Botanist mis à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Botanist'
     *       500:
     *         description: Erreur serveur
     */
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

    /**
     * @swagger
     * /botanists/{id}:
     *   delete:
     *     summary: Supprimer un botaniste
     *     tags: [Botanists]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du botaniste
     *     responses:
     *       204:
     *         description: Botanist supprimé
     *       500:
     *         description: Erreur serveur
     */
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
