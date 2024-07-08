const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require("path");
const axios = require('axios');

const uploadDir = path.join(__dirname, '..', 'uploads');
const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:6666/api/auth/verify';

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
    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Récupérer la liste des utilisateurs
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: La liste des utilisateurs
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *       500:
     *         description: Erreur serveur
     */
    async getAll(req, res) {
        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Récupérer un utilisateur par ID
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'utilisateur
     *     responses:
     *       200:
     *         description: Détails de l'utilisateur
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: Utilisateur non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({ where: { id } });
            user ? res.json(user) : res.status(404).json({ error: 'User not found' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Créer un nouvel utilisateur
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       201:
     *         description: Utilisateur créé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: L'email existe déjà
     *       500:
     *         description: Erreur serveur
     */
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

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Mettre à jour un utilisateur
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'utilisateur
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: Utilisateur mis à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       500:
     *         description: Erreur serveur
     */
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

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Supprimer un utilisateur
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'utilisateur
     *     responses:
     *       204:
     *         description: Utilisateur supprimé
     *       500:
     *         description: Erreur serveur
     */
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

    /**
     * @swagger
     * /users/login:
     *   post:
     *     summary: Authentifier un utilisateur
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 description: Email de l'utilisateur
     *                 example: user@example.com
     *               password:
     *                 type: string
     *                 description: Mot de passe de l'utilisateur
     *                 example: password123
     *     responses:
     *       200:
     *         description: Utilisateur authentifié
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *                 token:
     *                   type: string
     *                   description: Jeton d'authentification
     *       401:
     *         description: Authentification échouée
     *       500:
     *         description: Erreur serveur
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const response = await axios.post(`${AUTH_API_URL}`, { email, password });

            if (response.status === 200) {
                const user = await prisma.user.findUnique({where: {email}});
                res.json({ user: user, token: response.data });
            } else {
                res.status(response.status).json({ error: response.data.error });
            }
        } catch (error) {
            if (error.response) {
                res.status(error.response.status).json({ error: error.response.data.error });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    },

};

module.exports = userController;
