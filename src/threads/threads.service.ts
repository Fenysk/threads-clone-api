import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ThreadsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getMyFollowingFeed(userId: string) {

        const threads = await this.prismaService.thread.findMany({
            where: { User: { Followings: { some: { followerId: userId } } } },
            orderBy: { createdAt: 'desc' },
            include: {
                User: { include: { Profile: true } },
                Poll: { include: { Options: true } },
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
            include: { Poll: { include: { Options: true } }, },
        });

        if (!threads.length)
            throw new NotFoundException('No threads found');

        return threads;
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

    async deleteAllMyThreads(userId: string) {
        await this.prismaService.thread.deleteMany({
            where: { userId },
        });

        return { success: true };
    }

}
