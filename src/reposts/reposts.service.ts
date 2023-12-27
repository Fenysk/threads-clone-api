import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepostsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getMyReposts(userId: string) {
        const repostedThreads = await this.prismaService.repost.findMany({
            where: { userId },
            include: {
                Thread: {
                    include: {
                        User: { include: { Profile: true } },
                        Poll: { include: { Options: true } },
                    }
                }
            }
        });

        if (!repostedThreads.length)
            throw new NotFoundException('No reposts found');

        return repostedThreads;
    }

    async repostThread(userId: string, threadId: string) {
        return this.prismaService.repost.create({
            data: {
                User: { connect: { id: userId } },
                Thread: { connect: { id: threadId } }
            },
            include: { Thread: { include: { Poll: { include: { Options: true } } } } }
        });
    }

    async unrepostThread(userId: string, threadId: string) {
        return this.prismaService.repost.delete({
            where: {
                userId_threadId: {
                    userId,
                    threadId
                }
            },
            include: { Thread: { include: { Poll: { include: { Options: true } } } } }
        });
    }

}
