import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  PRODUCTS_MICRO_SERVICE_HOST: string;
  PRODUCTS_MICRO_SERVICE_PORT: number;
  NATS_SERVERS: string[];
}

const envVarsSchema = joi
  .object({
    PORT: joi.number().required(),
    PRODUCTS_MICRO_SERVICE_HOST: joi.string().required(),
    PRODUCTS_MICRO_SERVICE_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const validationResult = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS
    ? process.env.NATS_SERVERS.split(',')
    : [],
});
const error = validationResult.error;
const value = validationResult.value as EnvVars;

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  productsMicroServiceHost: envVars.PRODUCTS_MICRO_SERVICE_HOST,
  productsMicroServicePort: envVars.PRODUCTS_MICRO_SERVICE_PORT,
  natsServers: envVars.NATS_SERVERS,
};
