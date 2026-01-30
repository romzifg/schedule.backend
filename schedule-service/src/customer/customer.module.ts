import { Module } from '@nestjs/common';

import { CustomerService } from './customer.service';
import { CustomerResolver } from './customer.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [CustomerService, CustomerResolver],
})
export class CustomerModule { }