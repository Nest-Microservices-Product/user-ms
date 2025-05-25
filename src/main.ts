import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config/getEnvs';

async function bootstrap() {
  const logger = new Logger('Main-user');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: envs.natsServer
    }
  });
  await app.listen();
  logger.log('User microservice started ');
}
bootstrap();
