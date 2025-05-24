import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { NatsModule } from "./transports/nats.module";

@Module({
    imports: [NatsModule],
    controllers: [UserController],
    providers: [UserService]
})

export class UserModule {}