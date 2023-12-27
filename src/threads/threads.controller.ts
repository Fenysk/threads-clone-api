import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { Role } from 'src/users/entities';
import { GetUser, Roles } from 'src/users/decorator';

@Controller('threads')
export class ThreadsController {
    constructor(private readonly threadsService: ThreadsService) { }

    @Roles(Role.USER)
    @Get('feed/following')
    async getMyFollowingFeed(
        @GetUser('sub') userId: string,
    ) {
        return this.threadsService.getMyFollowingFeed(userId);
    }

    @Roles(Role.USER)
    @Get('mine')
    async getMyThreads(
        @GetUser('sub') userId: string,
    ) {
        return this.threadsService.getMyThreads(userId);
    }

    @Roles(Role.USER)
    @Get(':threadId')
    async getThread(
        @Param('threadId') threadId: string,
    ) {
        return this.threadsService.getThreadWithDetails(threadId);
    }

    @Roles(Role.USER)
    @Post()
    async publishThreads(
        @GetUser('sub') userId: string,
        @Body() threads: any[],
    ) {
        return this.threadsService.publishThreads(userId, threads);
    }

    @Roles(Role.USER)
    @Delete('mine/:threadId')
    async deleteMyThread(
        @GetUser('sub') userId: string,
        @Body() threadId: string,
    ) {
        return this.threadsService.deleteMyThread(userId, threadId);
    }

    @Roles(Role.USER)
    @Delete('mine/all')
    async deleteAllMyThreads(
        @GetUser('sub') userId: string,
    ) {
        return this.threadsService.deleteAllMyThreads(userId);
    }

}
