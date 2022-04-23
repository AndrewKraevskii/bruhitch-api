import { Environment } from '../types/env';

const getEnv = (envName: Environment | string): string => {
  const value = process.env[envName];

  if (!value) {
    throw new Error(`Missing: process.env['${envName}'].`);
  }

  return value;
};

export default getEnv;
