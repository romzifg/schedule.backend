import { Module } from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { DoctorResolver } from './doctor.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [
        DoctorService,
        DoctorResolver,
    ],
})
export class DoctorModule { }