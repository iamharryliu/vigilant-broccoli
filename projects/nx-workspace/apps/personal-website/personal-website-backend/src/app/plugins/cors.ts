import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';

const ALLOWED_ORIGINS = ['http://localhost:4200', 'https://harryliu.dev'];

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(cors, {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
});
