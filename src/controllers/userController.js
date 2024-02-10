const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, '..', 'uploads');

function saveBase64Image(base64Image, filename, req) {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(path.join(uploadDir, filename), dataBuffer);
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

function deleteImageFile(imageUrl) {
    if (!imageUrl) return;
    const filename = imageUrl.split('/uploads/')[1];
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

const userController = {
    async getAll(req, res) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({ where: { id } });
            user ? res.json(user) : res.status(404).json({ error: 'User not found' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async create(req, res) {
        try {
            const { lastname, firstname, email, password, picture_url, isPubliable } = req.body;
            if (await prisma.user.findUnique({ where: { email } })) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            let publicProfilePictureUrl = null;
            if (picture_url) {
                const filename = `profile_picture_${Date.now()}.jpg`;
                publicProfilePictureUrl = saveBase64Image(picture_url, filename, req);
            }

            const user = await prisma.user.create({
                data: {
                    lastname,
                    firstname,
                    email,
                    password: await hashPassword(password),
                    picture_url: publicProfilePictureUrl,
                    isPubliable,
                },
            });

            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { lastname, firstname, email, picture_url, isPubliable } = req.body;

            const updatedData = { lastname, firstname, email, isPubliable };
            if (picture_url) {
                updatedData.picture_url = saveBase64Image(picture_url, `user_${id}_${Date.now()}.jpg`, req);
            }

            const updatedUser = await prisma.user.update({ where: { id }, data: updatedData });
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({ where: { id } });
            if (user && user.picture_url) deleteImageFile(user.picture_url);

            await prisma.user.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const { password: _, ...userInfo } = user;
            res.json(userInfo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = userController;
