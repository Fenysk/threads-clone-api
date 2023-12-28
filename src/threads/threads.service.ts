import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ThreadsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getMyFollowingFeed(userId: string) {

        const threads = await this.prismaService.thread.findMany({
            where: {
                OR: [
                    { userId },
                    { User: { Followings: { some: { followerId: userId } } } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                User: { include: { Profile: true } },
                Poll: { include: { Options: true } },
                Likes: true,
                Reposts: true,
                Children: true,
            },
        });

        if (!threads.length)
            throw new NotFoundException('No threads found');

        return threads;
    }

    async getMyThreads(userId: string) {
        const threads = await this.prismaService.thread.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                Poll: { include: { Options: true } },
                Likes: true,
                Reposts: true,
                Children: true,
            },
        });

        if (!threads.length)
            throw new NotFoundException('No threads found');

        return threads;
    }

    async getHiddenThreads(userId: string) {
        const threads = await this.prismaService.thread.findMany({
            where: { hiddenForAll: true },
            include: {
                User: { include: { Profile: true } },
                Poll: { include: { Options: true } },
                Likes: true,
                Reposts: true,
            },
        });

        console.log(threads);

        if (!threads.length)
            throw new NotFoundException('No threads found');

        return threads;
    }

    async getThreadWithDetails(threadId: string) {
        const thread = await this.prismaService.thread.findUnique({
            where: { id: threadId },
            include: {
                Poll: { include: { Options: true } },
                Likes: { include: { User: { include: { Profile: true } } } },
                Reposts: { include: { User: { include: { Profile: true } } } },
            },
        });

        if (!thread)
            throw new NotFoundException('Thread not found');

        return thread;
    }

    async publishThreads(userId: string, threads: any[]) {

        // Publish a single thread with poll
        if (threads.length === 1 && threads[0].Poll) {
            const thread = threads[0];
            delete thread.order;

            thread.id = uuidv4();
            thread.userId = userId;

            const poll = thread.Poll;
            poll.id = uuidv4();

            const options = poll.Options;
            options.map(option => {
                option.id = uuidv4();
            });

            delete thread.Poll;

            const newThread = await this.prismaService.thread.create({
                data: {
                    ...thread,
                    Poll: {
                        create: {
                            ...poll,
                            Options: {
                                create: options
                            }
                        }
                    }
                }
            });

            return { success: true, thread: newThread };

            // Publish multiple threads without poll
        } else {
            threads.map(thread => {
                if (thread.Poll)
                    delete thread.Poll;
            })

            threads.sort((a, b) => a.order - b.order);

            threads.map((thread, index) => {
                delete thread.order;
                thread.id = uuidv4();
                thread.userId = userId;
                if (index > 0)
                    thread.parentId = threads[index - 1].id;
            });

            const newThreads = await this.prismaService.thread.createMany({ data: threads });

            return { success: true, threads: newThreads };
        }
    }

    async deleteMyThread(userId: string, threadId: string) {
        await this.prismaService.thread.deleteMany({
            where: { id: threadId, userId },
        });

        return { success: true };
    }

    // DEVELOPMENT ONLY
    async deleteAllUserThreads(userId: string) {
        await this.prismaService.thread.deleteMany({
            where: { userId },
        });

        return { success: true };
    }

    async hideThreadForAll(userId: string, threadId: string) {

        const thread = await this.prismaService.thread.findUniqueOrThrow({
            where: { id: threadId }
        });

        if (thread.hiddenForAll)
            throw new ConflictException('Thread is already hidden');

        await this.prismaService.thread.update({
            where: {
                id: threadId,
                // userId: { not: userId }
            },
            data: {
                hiddenForAll: true,
                hiddenBy: userId
            },
        });

        return { success: true };
    }

    async showThreadForAll(userId: string, threadId: string) {

        const thread = await this.prismaService.thread.findUniqueOrThrow({ where: { id: threadId } });

        if (!thread.hiddenForAll)
            throw new ConflictException('Thread is already visible');

        await this.prismaService.thread.update({
            where: {
                id: threadId,
                // userId: { not: userId }
            },
            data: {
                hiddenForAll: false,
                hiddenBy: null
            },
        });

        return { success: true };
    }

}
