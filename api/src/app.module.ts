import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './users/user.controller';
import { UserModule } from './users/user.module';
import { UserService } from './users/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { ScheduleModule } from '@nestjs/schedule';
dotenv.config();

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@ocean-hunter.fysay.mongodb.net/?retryWrites=true&w=majority&appName=Ocean-Hunter`,
    ),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
