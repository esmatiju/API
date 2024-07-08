const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

function saveBase64Image(base64Image, filename, req) {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, dataBuffer);
    return `${req.protocol}://${req.get('host')}${filePath.substring(filePath.indexOf('/uploads'))}`;
}

async function handlePhotos(photos, gardenId, req) {
    for (const { plant_id, photo } of photos) {
        const filename = `garden_${gardenId}_${Date.now()}.jpg`;
        const photoUrl = saveBase64Image(photo, filename, req);
        const photoRecord = await prisma.photos.create({ data: { picture_url: photoUrl } });

        let plantIdToUse = plant_id;
        if (plant_id === "Unknown") {
            const defaultPlant = await prisma.plant.findFirst({ where: { name: "Unknown" } });
            if (!defaultPlant) {
                console.error('Default plant "Unknown" not found');
                continue;
            }
            plantIdToUse = defaultPlant.id;
        }

        await prisma.plantGardenPhoto.create({
            data: {
                id_plant: plantIdToUse,
                id_garden: gardenId,
                id_photo: photoRecord.id
            },
        });
    }
}

const gardenController = {
    /**
     * @swagger
     * /gardens:
     *   get:
     *     summary: Récupérer la liste des jardins
     *     tags: [Gardens]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: La liste des jardins
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Garden'
     *       500:
     *         description: Erreur serveur
     */
    async getAll(req, res) {
        try {
            const gardens = await prisma.garden.findMany({
                include: {
                    PlantGardenPhoto: {
                        include: {
                            Photos: true,
                            Plant: true
                        }
                    }
                }
            });
            res.json(gardens);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /gardens/{id}:
     *   get:
     *     summary: Récupérer un jardin par ID
     *     tags: [Gardens]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du jardin
     *     responses:
     *       200:
     *         description: Détails du jardin
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Garden'
     *       404:
     *         description: Jardin non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const garden = await prisma.garden.findUnique({
                where: { id },
                include: {
                    PlantGardenPhoto: {
                        include: {
                            Photos: true,
                            Plant: true
                        }
                    }
                }
            });
            garden ? res.json(garden) : res.status(404).json({ error: 'Garden not found' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /gardens:
     *   post:
     *     summary: Créer un nouveau jardin
     *     tags: [Gardens]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Garden'
     *     responses:
     *       201:
     *         description: Jardin créé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Garden'
     *       500:
     *         description: Erreur serveur
     */
    async create(req, res) {
        const { latitude, longitude, address, ville, cp, owner_id, status, botanist_id, photos } = req.body;

        if (status !== 'search' && status !== 'guard') {
            return res.status(400).json({ error: 'Invalid status. Status must be either "search" or "guard".' });
        }

        try {
            const garden = await prisma.garden.create({
                data: { latitude, longitude, address, ville, cp, owner_id, status, botanist_id }
            });

            await handlePhotos(photos, garden.id, req);

            res.status(201).json(garden);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /gardens/{id}:
     *   put:
     *     summary: Mettre à jour un jardin
     *     tags: [Gardens]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du jardin
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Garden'
     *     responses:
     *       200:
     *         description: Jardin mis à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Garden'
     *       500:
     *         description: Erreur serveur
     */
    async update(req, res) {
        const { id } = req.params;
        const { latitude, longitude, address, ville, cp, owner_id, status, botanist_id, photos } = req.body;

        if (status !== 'search' && status !== 'guard') {
            return res.status(400).json({ error: 'Invalid status. Status must be either "search" or "guard".' });
        }

        try {
            const garden = await prisma.garden.update({
                where: { id },
                data: { latitude, longitude, address, ville, cp, owner_id, status, botanist_id }
            });

            await prisma.plantGardenPhoto.deleteMany({ where: { id_garden: id } });

            await handlePhotos(photos, garden.id, req);

            res.json(garden);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /gardens/{id}:
     *   delete:
     *     summary: Supprimer un jardin
     *     tags: [Gardens]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du jardin
     *     responses:
     *       204:
     *         description: Jardin supprimé
     *       500:
     *         description: Erreur serveur
     */
    async delete(req, res) {
        const { id } = req.params;

        try {
            await prisma.plantGardenPhoto.deleteMany({ where: { id_garden: id } });
            await prisma.garden.delete({ where: { id } });

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = gardenController;
