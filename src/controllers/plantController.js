const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

function saveBase64Image(base64Image, filename, req) {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

async function deleteFileFromServer(url) {
    const filename = path.basename(url);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

async function processTagsAndPhotos(tags, photos, plantId, req) {
    if (tags && tags.length) {
        await prisma.tagsPlant.deleteMany({ where: { id_plant: plantId } });
        const tagLinks = tags.map(tagId => ({ id_plant: plantId, id_tags: tagId }));
        await prisma.tagsPlant.createMany({ data: tagLinks });
    }

    if (photos && photos.length) {
        const existingPhotos = await prisma.photo_comu.findMany({ where: { plant_id: plantId } });
        const photoDeletions = existingPhotos.map(p => prisma.photos.delete({ where: { id: p.id_photos } }));
        await Promise.all(photoDeletions);

        await prisma.photo_comu.deleteMany({ where: { plant_id: plantId } });

        const photoCreations = photos.map((photo, index) => {
            const filename = `photo_${plantId}_${Date.now()}_${index}.jpg`;
            const photoUrl = saveBase64Image(photo, filename, req);
            return prisma.photos.create({
                data: { picture_url: photoUrl, Photo_comu: { create: { plant_id: plantId } } },
            });
        });
        await Promise.all(photoCreations);
    }
}

const plantController = {
    /**
     * @swagger
     * /plants:
     *   get:
     *     summary: Récupérer la liste des plantes
     *     tags: [Plants]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: La liste des plantes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Plant'
     *       500:
     *         description: Erreur serveur
     */
    async getAll(req, res) {
        try {
            const plants = await prisma.plant.findMany({
                include: {
                    TagsPlant: { include: { Tags: true } },
                    Photo_comu: { include: { Photos: true } },
                },
            });

            res.json(plants.map(plant => ({
                ...plant,
                hint: plant.hint ? JSON.parse(plant.hint) : null,
                tags: plant.TagsPlant.map(tp => tp.Tags),
                photos: plant.Photo_comu.map(pc => pc.Photos),
            })));
        } catch (error) {
            res.status(500).send({ error: 'Server error occurred while fetching plants.' });
        }
    },

    /**
     * @swagger
     * /plants/{id}:
     *   get:
     *     summary: Récupérer une plante par ID
     *     tags: [Plants]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la plante
     *     responses:
     *       200:
     *         description: Détails de la plante
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Plant'
     *       404:
     *         description: Plante non trouvée
     *       500:
     *         description: Erreur serveur
     */
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const plant = await prisma.plant.findUnique({
                where: { id },
                include: {
                    TagsPlant: { include: { Tags: true } },
                    Photo_comu: { include: { Photos: true } },
                },
            });

            if (!plant) {
                return res.status(404).send({ error: 'Plant not found.' });
            }

            res.json({
                ...plant,
                hint: plant.hint ? JSON.parse(plant.hint) : null,
                tags: plant.TagsPlant.map(tp => tp.Tags),
                photos: plant.Photo_comu.map(pc => pc.Photos),
            });
        } catch (error) {
            res.status(500).send({ error: error });
        }
    },

    /**
     * @swagger
     * /plants:
     *   post:
     *     summary: Créer une nouvelle plante
     *     tags: [Plants]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Plant'
     *     responses:
     *       201:
     *         description: Plante créée
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Plant'
     *       500:
     *         description: Erreur serveur
     */
    async create(req, res) {
        const { name, description, hint, fullname, picture_url, tags, photos } = req.body;

        try {
            const plantPictureUrl = picture_url ? saveBase64Image(picture_url, `plant_${Date.now()}.jpg`, req) : null;
            const plantData = { name, description, hint: hint ? JSON.stringify(hint) : null, fullname, picture_url: plantPictureUrl };
            const createdPlant = await prisma.plant.create({ data: plantData });

            await processTagsAndPhotos(tags, photos, createdPlant.id, req);

            res.status(201).json(createdPlant);
        } catch (error) {
            res.status(500).send({ error: error });
        }
    },

    /**
     * @swagger
     * /plants/{id}:
     *   put:
     *     summary: Mettre à jour une plante
     *     tags: [Plants]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la plante
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Plant'
     *     responses:
     *       200:
     *         description: Plante mise à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Plant'
     *       500:
     *         description: Erreur serveur
     */
    async update(req, res) {
        const { name, description, hint, fullname, picture_url, tags, photos } = req.body;
        const plantId = parseInt(req.params.id);

        try {
            const updatedPlantPictureUrl = picture_url ? saveBase64Image(picture_url, `plant_${plantId}_${Date.now()}.jpg`, req) : null;
            const updateData = { name, description, hint: hint ? JSON.stringify(hint) : null, fullname, ...(updatedPlantPictureUrl && { picture_url: updatedPlantPictureUrl }) };
            const updatedPlant = await prisma.plant.update({ where: { id: plantId }, data: updateData });

            await processTagsAndPhotos(tags, photos, plantId, req);

            res.json(updatedPlant);
        } catch (error) {
            res.status(500).send({ error: 'Server error occurred while updating the plant.' });
        }
    },

    /**
     * @swagger
     * /plants/{id}:
     *   delete:
     *     summary: Supprimer une plante
     *     tags: [Plants]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la plante
     *     responses:
     *       204:
     *         description: Plante supprimée
     *       500:
     *         description: Erreur serveur
     */
    async delete(req, res) {
        const plantId = req.params.id;

        try {
            const plant = await prisma.plant.findUnique({
                where: { id: plantId},
                include: {
                    Photo_comu: { include: { Photos: true } },
                },
            });
            const photos = plant.Photo_comu.map(pc => pc.Photos);
            photos.forEach(p => {
                const picture_url = p.picture_url;
                if (picture_url) {
                    deleteFileFromServer(picture_url);
                }
                prisma.photos.delete({ where: { id: p.id } });
            });
            const picture_url = plant.picture_url;
            if (picture_url) {
                await deleteFileFromServer(picture_url);
            }
            await prisma.photo_comu.deleteMany({ where: { plant_id: plantId } });
            await prisma.tagsPlant.deleteMany({ where: { id_plant: plantId } });
            await prisma.plant.delete({ where: { id: plantId } });

            res.status(204).send();
        } catch (error) {
            res.status(500).send({ error: error });
        }
    },
};

module.exports = plantController;
