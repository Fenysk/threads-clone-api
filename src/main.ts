import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/filters/prisma/prisma-exception.filter';
import { JwtAccessTokenGuard } from './auth/guards';
import { RolesGuard } from './users/guards';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prisma
  app.useGlobalFilters(new PrismaClientExceptionFilter())

  // JWT et Roles
  app.useGlobalGuards(
      new JwtAccessTokenGuard(new Reflector()),
      new RolesGuard(new Reflector())
  )

  app.useGlobalPipes(new ValidationPipe({
      whitelist: true
  }))

  // CORS
  app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
  })

  await app.listen(3621);
}
bootstrap();
