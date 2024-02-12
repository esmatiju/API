const { PrismaClient } = require('@prisma/client');
const faker = require('@faker-js/faker').faker;

const prisma = new PrismaClient();

const imageUrls = [
    'https://t4.ftcdn.net/jpg/02/68/17/95/240_F_268179518_JxhMIr78eZna4MNeI7XJGme4w8kneZon.jpg',
    'https://t3.ftcdn.net/jpg/02/09/09/64/240_F_209096426_tAiTia4Ouijepx4vXBZZThHdijkuaJ6K.jpg',
    'https://t3.ftcdn.net/jpg/00/10/09/04/240_F_10090400_GeUsfxOAt88U1d9cA3ZzUaW6XVT5oXou.jpg',
    'https://t4.ftcdn.net/jpg/02/95/55/45/240_F_295554551_lMRJcX15jGGoo31pr0YkA8VyNnP8SOe3.jpg',
    'https://t4.ftcdn.net/jpg/03/19/43/39/240_F_319433958_P0JtWdDnR5TWER001KkFXBlofHJ7lCT0.jpg'
]

async function main() {
    // Tags
    const tags = [];
    for (let i = 0; i < 10; i++) {
        const tag = await prisma.tags.create({
            data: { name: faker.commerce.productMaterial() },
        });
        tags.push(tag);
    }

    // Users
    const users = [];
    for (let i = 0; i < 20; i++) {
        const user = await prisma.user.create({
            data: {
                lastname: faker.person.lastName(),
                firstname: faker.person.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                picture_url: faker.image.avatar(),
                isPubliable: faker.datatype.boolean(),
            },
        });
        users.push(user);
    }

    //Botanists
    const botanists = [];
    for (let i = 0; i < 5; i++) {
        const botanist = await prisma.botanist.create({
            data: {
                user_id: faker.helpers.arrayElement(users).id,
                siret: faker.number.int({ min: 10000000000000, max: 99999999999999 }).toString(),
            },
        });
        botanists.push(botanist);
    }

    // Gardens
    const gardens = [];
    for (let i = 0; i < 10; i++) {
        const garden = await prisma.garden.create({
            data: {
                latitude: parseFloat(faker.location.latitude()),
                longitude: parseFloat(faker.location.longitude()),
                address: faker.location.streetAddress(),
                ville: faker.location.city(),
                cp: faker.location.zipCode(),
                owner_id: faker.helpers.arrayElement(users).id,
                status: faker.helpers.arrayElement(['Active', 'Inactive']),
                botanist_id: faker.helpers.arrayElement(botanists).id,
            },
        });
        gardens.push(garden);
    }

    // Plants
    const plants = [];
    for (let i = 0; i < 30; i++) {
        const plantHint = {
            light: faker.helpers.arrayElement(['Full sun', 'Partial shade', 'Full shade']),
            water: faker.helpers.arrayElement(['Daily', 'Weekly', 'Bi-weekly', 'Monthly']),
            temperature: faker.helpers.arrayElement(['Cold', 'Cool', 'Warm', 'Hot']),
            soil: faker.helpers.arrayElement(['Loamy', 'Sandy', 'Clay', 'Peaty']),
        };

        const plant = await prisma.plant.create({
            data: {
                picture_url: faker.helpers.arrayElement(imageUrls),
                name: faker.commerce.productName(),
                description: faker.lorem.sentences(2),
                hint: JSON.stringify(plantHint),
                fullname: faker.commerce.productName(),
            },
        });
        plants.push(plant);
    }

    // TagsPlant
    for (const plant of plants) {
        const shuffledTags = faker.helpers.shuffle(tags);
        const tagsForPlant = shuffledTags.slice(0, faker.number.int({ min: 1, max: 3 }));
        for (const tag of tagsForPlant) {
            await prisma.tagsPlant.create({
                data: {
                    id_plant: plant.id,
                    id_tags: tag.id,
                },
            });
        }
    }

    // Photos
    const photos = [];
    for (let i = 0; i < 50; i++) {
        const photo = await prisma.photos.create({
            data: {
                picture_url: faker.helpers.arrayElement(imageUrls),
            },
        });
        photos.push(photo);
    }

    // PlantGardenPhoto
    for (const plant of plants) {
        const garden = faker.helpers.arrayElement(gardens);
        const photo = faker.helpers.arrayElement(photos);
        await prisma.plantGardenPhoto.create({
            data: {
                id_plant: plant.id,
                id_garden: garden.id,
                id_photo: photo.id,
            },
        });
    }

    // Messages
    for (const garden of gardens) {
        const user = faker.helpers.arrayElement(users);
        await prisma.message.create({
            data: {
                user_id: user.id,
                garden_id: garden.id,
                message: faker.lorem.paragraph(),
            },
        });
    }

    // Photo_comu
    for (const photo of photos) {
        const plant = faker.helpers.arrayElement(plants);
        await prisma.photo_comu.create({
            data: {
                id_photos: photo.id,
                plant_id: plant.id,
            },
        });
    }

    console.log('La base de données a été remplie avec des données fictives.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
