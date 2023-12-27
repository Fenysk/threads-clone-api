import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LikesService } from './likes.service';
import { GetUser, Roles } from 'src/users/decorator';
import { Role } from 'src/users/entities';

@Controller('likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Roles(Role.USER)
    @Get('mine')
    async getMyLikedThreads(
        @GetUser('sub') userId: string,
    ) {
        return this.likesService.getMyLikedThreads(userId);
    }

    @Roles(Role.USER)
    @Post(':threadId')
    async likeThread(
        @GetUser('sub') userId: string,
        @Param('threadId') threadId: string
    ) {
        return this.likesService.likeThread(userId, threadId);
    }

    @Roles(Role.USER)
    @Delete(':threadId')
    async unlikeThread(
        @GetUser('sub') userId: string,
        @Param('threadId') threadId: string
    ) {
        return this.likesService.unlikeThread(userId, threadId);
    }
}
