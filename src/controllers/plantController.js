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

async function processTagsAndPhotos(tags, photos, plantId, req) {
    if (tags && tags.length) {
        await prisma.tagsPlant.deleteMany({ where: { id_plant: plantId } });
        await Promise.all(tags.map(tagId => prisma.tagsPlant.create({
            data: { id_plant: plantId, id_tags: tagId },
        })));
    }

    if (photos && photos.length) {
        const existingPhotos = await prisma.photo_comu.findMany({ where: { plant_id: plantId } });
        await Promise.all(existingPhotos.map(p => prisma.photos.delete({ where: { id: p.id_photos } })));
        await prisma.photo_comu.deleteMany({ where: { plant_id: plantId } });

        await Promise.all(photos.map((photo, index) => {
            const filename = `photo_${plantId}_${Date.now()}_${index}.jpg`;
            const photoUrl = saveBase64Image(photo, filename);
            return prisma.photos.create({
                data: { picture_url: photoUrl, Photo_comu: { create: { plant_id: plantId } } },
            });
        }));
    }
}

const plantController = {
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
                tags: plant.TagsPlant.map(tp => tp.Tags),
                photos: plant.Photo_comu.map(pc => pc.Photos),
            })));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getOne(req, res) {
        try {
            const plant = await prisma.plant.findUnique({
                where: { id: req.params.id },
                include: { TagsPlant: { include: { Tags: true } }, Photo_comu: { include: { Photos: true } } },
            });
            if (!plant) return res.status(404).json({ error: 'Plant not found' });
            res.json({
                ...plant,
                tags: plant.TagsPlant.map(tp => tp.Tags),
                photos: plant.Photo_comu.map(pc => pc.Photos),
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async create(req, res) {
        const { name, description, hint, fullname, picture_url, tags, photos } = req.body;
        try {
            const plantPictureUrl = picture_url ? saveBase64Image(picture_url, `plant_${Date.now()}.jpg`, req) : null;
            const createdPlant = await prisma.plant.create({
                data: { name, description, hint, fullname, picture_url: plantPictureUrl },
            });

            await processTagsAndPhotos(tags, photos, createdPlant.id, req);
            res.status(201).json(createdPlant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        const { id } = req.params;
        const { name, description, hint, fullname, picture_url, tags, photos } = req.body;
        try {
            const updatedPlantPictureUrl = picture_url ? saveBase64Image(picture_url, `plant_${id}_${Date.now()}.jpg`, req) : undefined;
            const data = { name, description, hint, fullname, ...(updatedPlantPictureUrl && { picture_url: updatedPlantPictureUrl }) };

            const updatedPlant = await prisma.plant.update({ where: { id }, data });
            await processTagsAndPhotos(tags, photos, id, req);
            res.json(updatedPlant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        const { id } = req.params;
        try {
            await prisma.photo_comu.deleteMany({ where: { plant_id: id } });
            await prisma.tagsPlant.deleteMany({ where: { id_plant: id } });
            await prisma.plant.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = plantController;
