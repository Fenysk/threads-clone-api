import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PollsService {
    constructor(private readonly prismaService: PrismaService) { }

    async emmitThreadVote(userId: string, pollId: string, optionId: string) {
        const poll = await this.prismaService.poll.findUniqueOrThrow({
            where: { id: pollId },
            include: {
                Options: {
                    include: { Votes: true },
                }
            },
        });

        const userVote = poll.Options.some((option) => option.Votes.some((vote) => vote.userId === userId));
        if (userVote)
            throw new NotFoundException('User already voted in this poll');

        const option = poll.Options.find((option) => option.id === optionId);
        if (!option)
            throw new NotFoundException('Option not found');

        const newVote = this.prismaService.pollVote.create({
            data: {
                pollOptionId: option.id,
                userId,
            },
        });

        return newVote;
    }
}
