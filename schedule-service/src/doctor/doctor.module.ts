import { Module } from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { DoctorResolver } from './doctor.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        DoctorService,
        DoctorResolver,
    ],
})
export class DoctorModule { }
