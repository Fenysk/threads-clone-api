import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RepostsService } from './reposts.service';
import { GetUser, Roles } from 'src/users/decorator';
import { Role } from 'src/users/entities';

@Controller('reposts')
export class RepostsController {
    constructor(private readonly repostsService: RepostsService) { }

    @Roles(Role.USER)
    @Get('mine')
    async getMyReposts(
        @GetUser('sub') userId: string
    ) {
        return this.repostsService.getMyReposts(userId);
    }

    @Roles(Role.USER)
    @Post(':threadId')
    async repostThread(
        @GetUser('sub') userId: string,
        @Param('threadId') threadId: string
    ) {
        return this.repostsService.repostThread(userId, threadId);
    }

    @Roles(Role.USER)
    @Delete(':threadId')
    async unrepostThread(
        @GetUser('sub') userId: string,
        @Param('threadId') threadId: string
    ) {
        return this.repostsService.unrepostThread(userId, threadId);
    }

}
