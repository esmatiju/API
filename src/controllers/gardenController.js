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

    async create(req, res) {
        const { latitude, longitude, address, ville, cp, owner_id, status, botanist_id, photos } = req.body;

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

    async update(req, res) {
        const { id } = req.params;
        const { latitude, longitude, address, ville, cp, owner_id, status, botanist_id, photos } = req.body;

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
