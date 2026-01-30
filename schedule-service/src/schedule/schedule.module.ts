import { Module } from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { ScheduleResolver } from './schedule.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [
        ScheduleService,
        ScheduleResolver,
    ],
})
export class ScheduleModule { }