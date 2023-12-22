import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { Role } from 'src/users/entities';
import { GetUser, Roles } from 'src/users/decorator';

@Controller('follows')
export class FollowsController {
    constructor(private readonly followsService: FollowsService) { }

    @Roles(Role.USER)
    @Get('mine/followings')
    async getMyFollowings(@GetUser('sub') user_id: string): Promise<object[]> {
        return await this.followsService.getMyFollowings(user_id);
    }

    @Roles(Role.USER)
    @Get('mine/followers')
    async getMyFollowers(@GetUser('sub') user_id: string): Promise<object[]> {
        return await this.followsService.getMyFollowers(user_id);
    }

    @Roles(Role.USER)
    @Put('accept/:pseudo')
    async acceptFollower(
        @GetUser('sub') user_id: string,
        @Param('pseudo') pseudo: string
    ): Promise<object> {
        return await this.followsService.acceptFollower(user_id, pseudo);
    }
    

    @Roles(Role.USER)
    @Post('follow/:pseudo')
    @HttpCode(HttpStatus.OK)
    async followUser(
        @GetUser('sub') user_id: string,
        @Param('pseudo') pseudo: string
    ): Promise<object> {
        return await this.followsService.followUser(user_id, pseudo);
    }

    @Roles(Role.USER)
    @Delete('unfollow/:pseudo')
    async unfollowUser(
        @GetUser('sub') user_id: string,
        @Param('pseudo') pseudo: string
    ): Promise<object> {
        return await this.followsService.unfollowUser(user_id, pseudo);
    }

}
