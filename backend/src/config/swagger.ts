import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ODC Platform API',
      version: '1.0.0',
      description:
        'API de la plateforme Orange Digital Center : gestion des formations, inscriptions, attestations et réseautage.',
      contact: {
        name: 'ODC',
        email: 'contact@odc.mg',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Développement',
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
          properties: {
            id: { type: 'string', format: 'uuid' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telephone: { type: 'string' },
            actif: { type: 'boolean' },
            role: { type: 'object' },
          },
        },
        Formation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            titre: { type: 'string' },
            description: { type: 'string' },
            domaine: { type: 'string' },
            dureeHeures: { type: 'integer' },
            niveau: { type: 'string', enum: ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'] },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);