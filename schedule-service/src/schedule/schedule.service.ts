import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleInput } from './dto/create-schedule-input.dto';

@Injectable()
export class ScheduleService {
    constructor(private prisma: PrismaService) { }

    async create(input: CreateScheduleInput) {
        const { objective, customerId, doctorId, scheduledAt } = input;

        // 1. validate customer
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new BadRequestException('Invalid customer');
        }

        // 2. validate doctor
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new BadRequestException('Invalid doctor');
        }

        // 3. check conflict
        const conflict = await this.prisma.schedule.findFirst({
            where: {
                doctorId,
                scheduledAt,
            },
        });
        if (conflict) {
            throw new BadRequestException('Schedule conflict');
        }

        // 4. create schedule
        return this.prisma.schedule.create({
            data: {
                objective,
                customerId,
                doctorId,
                scheduledAt,
            },
        });
    }

    findAll() {
        return this.prisma.schedule.findMany({
            include: {
                customer: true,
                doctor: true,
            },
        });
    }

    findOne(id: string) {
        return this.prisma.schedule.findUnique({
            where: { id },
            include: {
                customer: true,
                doctor: true,
            },
        });
    }

    delete(id: string) {
        return this.prisma.schedule.delete({
            where: { id },
        });
    }
}
