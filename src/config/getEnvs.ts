import 'dotenv/config';
import { EnvVars } from "./entities/EnvVars.entity";
import { envSchema } from "./validators/EnvVarSchema.validator"

const getEnvVars = () => {
    const { error, value } = envSchema.validate({
        ...process.env,
        NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
    });

    if(error) {
        throw new Error(
            `There was an error with the config validation ${error.message}`
        );
    }

    const envVars: EnvVars = value;


    return {
        port: envVars.PORT,
        natsServer: envVars.NATS_SERVERS,
        databaseUrl: envVars.DATABASE_URL
    };

};

export const envs = getEnvVars();