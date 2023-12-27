import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { FollowsModule } from './follows/follows.module';
import { ThreadsModule } from './threads/threads.module';
import { LikesModule } from './likes/likes.module';
import { PollsModule } from './polls/polls.module';
import { RepostsModule } from './reposts/reposts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmailModule,
    FollowsModule,
    ThreadsModule,
    LikesModule,
    PollsModule,
    RepostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
