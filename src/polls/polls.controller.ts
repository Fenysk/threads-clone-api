import { Body, Controller, Post } from '@nestjs/common';
import { PollsService } from './polls.service';
import { GetUser, Roles } from 'src/users/decorator';
import { Role } from 'src/users/entities';

@Controller('polls')
export class PollsController {
    constructor(private readonly pollsService: PollsService) { }

    @Roles(Role.USER)
    @Post('vote')
    async emmitThreadVote(
        @GetUser('sub') userId: string,
        @Body('pollId') pollId: string,
        @Body('optionId') optionId: string,
    ) {
        return this.pollsService.emmitThreadVote(userId, pollId, optionId);
    }

}
