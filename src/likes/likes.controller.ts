import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LikesService } from './likes.service';
import { GetUser } from 'src/users/decorator';

@Controller('likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Get('mine')
    async getMyLikedThreads(
        @GetUser('sub') userId: string,
    ) {
        return this.likesService.getMyLikedThreads(userId);
    }

    @Post(':threadId')
    async likeThread(
        @GetUser('sub') userId: string,
        @Param('threadId') threadId: string
    ) {
        return this.likesService.likeThread(userId, threadId);
    }

    @Delete(':threadId')
    async unlikeThread(
        @GetUser('sub') userId: string,
        @Param('threadId') threadId: string
    ) {
        return this.likesService.unlikeThread(userId, threadId);
    }
}
