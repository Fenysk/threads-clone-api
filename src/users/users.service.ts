import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InputUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from "argon2";

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async getAllUsers(): Promise<object[]> {
        const users = await this.prismaService.user.findMany();

        if (!users.length) {
            throw new NotFoundException('No users found');
        }

        users.forEach(user => delete user.password);

        return users;
    }

    async getUserById(id: string): Promise<any> {
        const user = await this.prismaService.user.findUniqueOrThrow({
            where: { id },
            include: { Profile: true }
        });

        const { password, ...publicUser } = user;

        return publicUser;
    }

    async getUserByEmail(email: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({
            where: { email }
        });

        return user;
    }

    async getUserByConfirmationId(confirmationId: string): Promise<any> {
        const user = await this.prismaService.user.findFirst({
            where: { confirmationId },
            include: { Profile: true }
        });

        return user;
    }

    async createUser(data: InputUserDto): Promise<object> {
        const newUser = await this.prismaService.user.create({
            data: {
                id: uuidv4().replace(/-/g, ''),
                email: data.email,
                password: data.hashedPassword,

                Profile: {
                    create: {
                        pseudo: data.email,
                        displayName: data.email,
                    }
                }
            }
        });

        return newUser;
    }

    async updateUser(id: string, data: any): Promise<object> {

        const profileFields = ['pseudo', 'displayName', 'biography', 'avatarUrl', 'link'];

        const profileData = profileFields.reduce((object, field) => {
            if (data[field]) {
                object[field] = data[field];
                delete data[field];
            }
            return object;
        }, {});

        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: {
                ...data,
                Profile: {
                    update: profileData
                }
            },
            include: { Profile: true }
        });
        return updatedUser;
    }

    async updateMyPassword(id: string, oldPassword: string, newPassword: string): Promise<object> {
        const user = await this.prismaService.user.findUnique({
            where: { id }
        });

        const isPasswordValid = await argon2.verify(user.password, oldPassword);

        if (!isPasswordValid)
            throw new ForbiddenException('Error updating password');

        const hashedPassword = await argon2.hash(newPassword);

        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: { password: hashedPassword },
            include: { Profile: true }
        });

        return updatedUser;
    }

    async deleteUser(id: string): Promise<string> {
        try {
            const deletedUser = await this.prismaService.user.delete({
                where: { id }
            });

            return `${deletedUser.email} deleted`;
        } catch (error) {
            console.log(error);
        }

    }

}
