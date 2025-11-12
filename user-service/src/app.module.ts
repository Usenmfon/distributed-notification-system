import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { AppController } from './app.controller';

@Module({
  imports: [
    // ✅ Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env', // 👈 ensures .env file is read
    }),

    // ✅ Database connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // don't sync in prod
    }),

    // ✅ Optional cache setup
    // Uncomment this if Redis is actually running for your app
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: process.env.REDIS_HOST,
    //   port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    // }),

    // ✅ Simple fallback cache (in-memory)
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes
    }),

    // ✅ Your app modules
    UsersModule,
    AuthModule,
  ],

  controllers: [AppController],
})
export class AppModule {}
