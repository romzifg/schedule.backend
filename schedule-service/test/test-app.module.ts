import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CustomerModule } from '../src/customer/customer.module';
import { DoctorModule } from '../src/doctor/doctor.module';
import { ScheduleModule } from '../src/schedule/schedule.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AuthModule } from '../src/auth/auth.module';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: false,
            introspection: true,
            context: ({ req, res }) => ({ req, res }),
        }),
        PrismaModule,
        AuthModule,
        CustomerModule,
        DoctorModule,
        ScheduleModule,
    ],
})
export class TestAppModule { }