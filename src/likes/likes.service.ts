import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
    constructor(private readonly prismaService: PrismaService) { }

    async getMyLikedThreads(userId: string) {
        const likedThreads = await this.prismaService.like.findMany({
            where: { userId },
            include: {
                Thread: {
                    include: {
                        User: { include: { Profile: true } },
                        Poll: { include: { Options: true } },
                    }
                }
            },
        });

        if (!likedThreads.length)
            throw new NotFoundException('No liked threads found');

        return likedThreads;
    }

    async likeThread(userId: string, threadId: string) {
        return this.prismaService.like.create({
            data: {
                User: { connect: { id: userId } },
                Thread: { connect: { id: threadId } },
            },
            include: { Thread: { include: { Poll: { include: { Options: true } } } } },
        });
    }

    async unlikeThread(userId: string, threadId: string) {
        return this.prismaService.like.delete({
            where: {
                userId_threadId: {
                    userId,
                    threadId,
                },
            },
            include: { Thread: { include: { Poll: { include: { Options: true } } } } },
        });
    }

}
