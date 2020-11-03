const dotenv = require('dotenv');
const strapi = require('strapi');
const envFilePostfix = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

dotenv.config({ path: `.env.${envFilePostfix}` });
strapi().start();