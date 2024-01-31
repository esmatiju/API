const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

function saveBase64Image(base64Image, filePath) {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, dataBuffer);
}

const plantController = {
    async getAll(req, res) {
        try {
            const plants = await prisma.plant.findMany({
                include: {
                    TagsPlant: {
                        include: {
                            Tags: true,
                        },
                    },
                    Photo_comu: {
                        include: {
                            Photos: true,
                        },
                    },
                },
            });
            const plantsWithTagsAndPhotos = plants.map(plant => ({
                ...plant,
                tags: plant.TagsPlant.map(tp => tp.Tags),
                photos: plant.Photo_comu.map(pc => pc.Photos),
            }));

            plantsWithTagsAndPhotos.forEach(plant => {
                delete plant.TagsPlant;
                delete plant.Photo_comu;
            });

            res.json(plantsWithTagsAndPhotos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const plant = await prisma.plant.findUnique({
                where: { id },
                include: {
                    TagsPlant: {
                        include: {
                            Tags: true,
                        },
                    },
                    Photo_comu: {
                        include: {
                            Photos: true,
                        },
                    },
                },
            });
            if (plant) {
                const plantWithTagsAndPhotos = {
                    ...plant,
                    tags: plant.TagsPlant.map(tp => tp.Tags),
                    photos: plant.Photo_comu.map(pc => pc.Photos),
                };

                delete plantWithTagsAndPhotos.TagsPlant;
                delete plantWithTagsAndPhotos.Photo_comu;

                res.json(plantWithTagsAndPhotos);
            } else {
                res.status(404).json({ error: 'Plant not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        const { name, description, hint, fullname, picture_url, tags, photos } = req.body;

        try {
            let plantPicturePath;
            if (picture_url) {
                const plantPictureFilename = `plant_${Date.now()}.jpg`;
                const plantPictureFilePath = path.join(__dirname, 'uploads', plantPictureFilename);
                saveBase64Image(picture_url, plantPictureFilePath);
                plantPicturePath = plantPictureFilePath;
            }

            const createdPlant = await prisma.plant.create({
                data: {
                    name,
                    description,
                    hint,
                    fullname,
                    picture_url: plantPicturePath,
                },
            });

            if (tags && tags.length) {
                await Promise.all(tags.map(tagId =>
                    prisma.tagsPlant.create({
                        data: {
                            id_plant: createdPlant.id,
                            id_tags: tagId,
                        },
                    })
                ));
            }

            if (photos && photos.length) {
                await Promise.all(photos.map(async (base64Image, index) => {
                    const photoFilename = `plant_${createdPlant.id}_${Date.now()}_${index}.jpg`;
                    const photoPath = path.join(__dirname, 'uploads', photoFilename);

                    saveBase64Image(base64Image, photoPath);

                    const createdPhoto = await prisma.photos.create({
                        data: {
                            picture_url: photoPath,
                        },
                    });

                    return prisma.photo_comu.create({
                        data: {
                            id_photos: createdPhoto.id,
                            plant_id: createdPlant.id,
                        },
                    });
                }));
            }

            res.status(201).json(createdPlant);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message, details: error });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const plant = await prisma.plant.update({
                where: { id },
                data: req.body
            });
            res.json(plant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.plant.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = plantController;
