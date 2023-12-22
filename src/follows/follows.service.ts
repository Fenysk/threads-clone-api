import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getMyFollowings(userId: string): Promise<object[]> {
        const followings = await this.prismaService.follow.findMany({
            where: { followerId: userId },
            include: { Following: { include: { Profile: true } } }
        });

        if (!followings.length)
            throw new NotFoundException('No followings found');

        return followings;
    }

    async getMyFollowers(userId: string): Promise<object[]> {
        const followers = await this.prismaService.follow.findMany({
            where: { followingId: userId },
            include: { Follower: { include: { Profile: true } } }
        });

        if (!followers.length)
            throw new NotFoundException('No followers found');

        return followers;
    }

    async acceptFollower(userId: string, pseudo: string): Promise<object> {
        const follower = await this.prismaService.profile.findUnique({
            where: { pseudo },
            include: { User: true }
        });

        if (!follower)
            throw new NotFoundException('User not found');

        const follow = await this.prismaService.follow.update({
            where: {
                followerId_followingId: {
                    followerId: follower.User.id,
                    followingId: userId
                }
            },
            data: { accepted: true }
        });

        return follow;
    }

    async followUser(userId: string, pseudo: string): Promise<object> {
        const userToFollow = await this.prismaService.profile.findUnique({
            where: { pseudo },
            include: { User: true }
        });

        if (!userToFollow)
            throw new NotFoundException('User not found');

        if (userToFollow.User.id === userId)
            throw new ConflictException('You cannot follow yourself');

        const isAccepted = userToFollow.User.isPrivate ? false : true

        const follow = await this.prismaService.follow.create({
            data: {
                followerId: userId,
                followingId: userToFollow.User.id,
                accepted: isAccepted
            }
        });

        return follow;
    }

    async unfollowUser(userId: string, pseudo: string): Promise<object> {
        const userToUnfollow = await this.prismaService.profile.findUnique({
            where: { pseudo },
            include: { User: true }
        });

        if (!userToUnfollow)
            throw new NotFoundException('User not found');

        const follow = await this.prismaService.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: userToUnfollow.User.id
                }
            }
        });

        return follow;
    }
}
