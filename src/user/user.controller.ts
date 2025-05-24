import { Controller } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @MessagePattern({ cmd: 'find-user'})
    findUserById(@Payload() id: string) {
        return this.userService.findUserById(id);
    }

    @MessagePattern({ cmd: 'update-user'})
    updateUser(@Payload() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(updateUserDto);
    }

    @MessagePattern({ cmd: 'delete-user'})
    deleteUser(@Payload() id: string) {
        return this.userService.deleteUser(id);
    }
    
}