import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  PRODUCTS_MICRO_SERVICE_HOST: string;
  PRODUCTS_MICRO_SERVICE_PORT: number;
}

const envVarsSchema = joi
  .object({
    PORT: joi.number().required(),
    PRODUCTS_MICRO_SERVICE_HOST: joi.string().required(),
    PRODUCTS_MICRO_SERVICE_PORT: joi.number().required(),
  })
  .unknown(true);

const validationResult = envVarsSchema.validate(process.env);
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
};
