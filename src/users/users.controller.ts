import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser, Roles } from './decorator';
import { Role } from './entities';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(Role.ADMIN)
    @Get()
    async getAllUsers(): Promise<object[]> {
        return await this.usersService.getAllUsers();
    }

    @Get('me')
    async getMe(@GetUser() user: any): Promise<object> {
        return user;
    }

    @Roles(Role.USER)
    @Get('hidden')
    async getHiddenUsers(@GetUser('sub') userId: string): Promise<object[]> {
        return await this.usersService.getHiddenUsers(userId);
    }

    @Roles(Role.ADMIN)
    @Get(':user_id')
    async getUserById(@Param('user_id') user_id: string): Promise<object> {
        return await this.usersService.getUserById(user_id);
    }

    @Roles(Role.USER)
    @Put('update/me')
    @HttpCode(HttpStatus.OK)
    async updateMe(
        @GetUser('sub') user_id: any,
        @Body() data: any
    ): Promise<object> {
        return await this.usersService.updateUser(user_id, data);
    }

    @Roles(Role.ADMIN)
    @Put('update/:user_id')
    @HttpCode(HttpStatus.OK)
    async updateUser(
        @Param('user_id') user_id: string,
        @Body() data: any
    ): Promise<object> {
        return await this.usersService.updateUser(user_id, data);
    }

    @Roles(Role.USER)
    @Patch('update/password/me')
    @HttpCode(HttpStatus.OK)
    async updateMyPassword(
        @GetUser('sub') user_id: string,
        @Body('oldPassword') oldPassword: string,
        @Body('newPassword') newPassword: string
    ): Promise<object> {
        return await this.usersService.updateMyPassword(user_id, oldPassword, newPassword);
    }

    @Roles(Role.ADMIN)
    @Delete(':user_id')
    async deleteUser(@Param('user_id') user_id: string): Promise<string> {
        return await this.usersService.deleteUser(user_id);
    }

    @Roles(Role.USER)
    @Delete('delete/me')
    async deleteMyAccount(@GetUser('sub') user_id: string): Promise<string> {
        return await this.usersService.deleteUser(user_id);
    }

    @Roles(Role.USER)
    @Put('hide/:userId')
    async hideUser(
        @GetUser('sub') userId: string,
        @Param('userId') userToHide: string
    ): Promise<object> {
        return await this.usersService.hideUser(userId, userToHide);
    }

    @Roles(Role.USER)
    @Put('show/:userId')
    async showUser(
        @GetUser('sub') userId: string,
        @Param('userId') userToShow: string
    ): Promise<object> {
        return await this.usersService.showUser(userId, userToShow);
    }


}
