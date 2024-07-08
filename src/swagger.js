const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de l\'API Express.js',
    },
    servers: [
      {
        url: 'http://localhost:6969/api',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['lastname', 'firstname', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'ID de l\'utilisateur',
            },
            lastname: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur',
            },
            firstname: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
            },
            email: {
              type: 'string',
              description: 'Email de l\'utilisateur',
            },
            password: {
              type: 'string',
              description: 'Mot de passe de l\'utilisateur',
            },
            picture_url: {
              type: 'string',
              description: 'URL de la photo de profil de l\'utilisateur',
            },
            isPubliable: {
              type: 'boolean',
              description: 'Indicateur si l\'utilisateur est publiable',
            },
          },
          example: {
            id: 'u123456',
            lastname: 'Doe',
            firstname: 'John',
            email: 'johndoe@example.com',
            password: 'password123',
            picture_url: 'http://example.com/uploads/profile_picture_123456.jpg',
            isPubliable: true,
          },
        },
        Tag: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'ID du tag',
            },
            name: {
              type: 'string',
              description: 'Nom du tag',
            },
          },
          example: {
            id: 't123456',
            name: 'Tag Name',
          },
        },
        Plant: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            id: {
              type: 'string',
              description: 'ID de la plante',
            },
            name: {
              type: 'string',
              description: 'Nom de la plante',
            },
            description: {
              type: 'string',
              description: 'Description de la plante',
            },
            hint: {
              type: 'string',
              description: 'Indices sur la plante',
            },
            fullname: {
              type: 'string',
              description: 'Nom complet de la plante',
            },
            picture_url: {
              type: 'string',
              description: 'URL de l\'image de la plante',
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag',
              },
            },
            photos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Photo',
              },
            },
          },
          example: {
            id: 'p123456',
            name: 'Plant Name',
            description: 'Plant description',
            hint: 'Hint about the plant',
            fullname: 'Full Plant Name',
            picture_url: 'http://example.com/uploads/plant_123456.jpg',
            tags: [
              {
                id: 't123456',
                name: 'Tag Name',
              },
            ],
            photos: [
              {
                id: 'ph123456',
                picture_url: 'http://example.com/uploads/photo_123456.jpg',
              },
            ],
          },
        },
        Photo: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID de la photo',
            },
            picture_url: {
              type: 'string',
              description: 'URL de la photo',
            },
          },
          example: {
            id: 'ph123456',
            picture_url: 'http://example.com/uploads/photo_123456.jpg',
          },
        },
        Botanist: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'ID du botaniste',
            },
            name: {
              type: 'string',
              description: 'Nom du botaniste',
            },
            userId: {
              type: 'string',
              description: 'ID de l\'utilisateur associé',
            },
          },
          example: {
            id: 'b123456',
            name: 'Jane Doe',
            userId: 'u123456',
          },
        },
        Garden: {
          type: 'object',
          required: ['latitude', 'longitude', 'address', 'ville', 'cp', 'owner_id', 'status', 'botanist_id'],
          properties: {
            id: {
              type: 'string',
              description: 'ID du jardin',
            },
            latitude: {
              type: 'number',
              description: 'Latitude du jardin',
            },
            longitude: {
              type: 'number',
              description: 'Longitude du jardin',
            },
            address: {
              type: 'string',
              description: 'Adresse du jardin',
            },
            ville: {
              type: 'string',
              description: 'Ville du jardin',
            },
            cp: {
              type: 'string',
              description: 'Code postal du jardin',
            },
            owner_id: {
              type: 'string',
              description: 'ID du propriétaire',
            },
            status: {
              type: 'string',
              enum: ['search', 'guard'],
              description: 'Statut du jardin',
            },
            botanist_id: {
              type: 'string',
              description: 'ID du botaniste associé',
            },
            photos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Photo',
              },
            },
          },
          example: {
            id: 'g123456',
            latitude: 48.8566,
            longitude: 2.3522,
            address: '123 Rue Example',
            ville: 'Paris',
            cp: '75000',
            owner_id: 'u123456',
            status: 'search',
            botanist_id: 'b123456',
            photos: [
              {
                id: 'ph123456',
                picture_url: 'http://example.com/uploads/photo_123456.jpg',
              },
            ],
          },
        },
        Message: {
          type: 'object',
          required: ['user_id', 'garden_id', 'message'],
          properties: {
            id: {
              type: 'string',
              description: 'ID du message',
            },
            user_id: {
              type: 'string',
              description: 'ID de l\'utilisateur',
            },
            garden_id: {
              type: 'string',
              description: 'ID du jardin',
            },
            message: {
              type: 'string',
              description: 'Contenu du message',
            },
          },
          example: {
            id: 'm123456',
            user_id: 'u123456',
            garden_id: 'g123456',
            message: 'Ceci est un message.',
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
