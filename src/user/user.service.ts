import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('User-service');

  constructor() {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Database initialized');
  }

  async findUserById(userId: string) {
    try {
      const user = await this.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'User not existed',
        });
      }

      return user;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findUserById(updateUserDto.userId);

      const updatedUser = await this.user.update({
        where: {
          id: updateUserDto.userId,
        },
        data: {
          email: updateUserDto.email || user.email,
          name: updateUserDto.name || user.name,
          password:
            bcrypt.hashSync(updateUserDto.password, 10) || user.password,
        },
      });

      const { password: _, ...userRes } = updatedUser;

      return {
        message: 'User was updated',
        data: userRes,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async deleteUser(userId: string) {
    try {
      const existingUser = await this.findUserById(userId);

      const deleteUser = await this.user.delete({
        where: {
          id: existingUser.id,
        },
      });

      return {
        message: 'User was deleted',
        data: deleteUser,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
