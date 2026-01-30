import { Test } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ScheduleService', () => {
    let service: ScheduleService;

    const prismaMock = {
        customer: {
            findUnique: jest.fn(),
        },
        doctor: {
            findUnique: jest.fn(),
        },
        schedule: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ScheduleService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = module.get(ScheduleService);
    });

    it('should create schedule successfully', async () => {
        prismaMock.customer.findUnique.mockResolvedValue({ id: 'c1' });
        prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
        prismaMock.schedule.findFirst.mockResolvedValue(null);
        prismaMock.schedule.create.mockResolvedValue({
            id: 's1',
        });

        const result = await service.create({
            objective: 'Consultation',
            customerId: 'c1',
            doctorId: 'd1',
            scheduledAt: new Date(),
        });

        expect(result).toBeDefined();
        expect(prismaMock.schedule.create).toBeCalled();
    });

    it('should throw error if customer invalid', async () => {
        prismaMock.customer.findUnique.mockResolvedValue(null);

        await expect(
            service.create({
                objective: 'Consultation',
                customerId: 'invalid',
                doctorId: 'd1',
                scheduledAt: new Date(),
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if schedule conflict', async () => {
        prismaMock.customer.findUnique.mockResolvedValue({ id: 'c1' });
        prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
        prismaMock.schedule.findFirst.mockResolvedValue({ id: 'existing' });

        await expect(
            service.create({
                objective: 'Consultation',
                customerId: 'c1',
                doctorId: 'd1',
                scheduledAt: new Date(),
            }),
        ).rejects.toThrow(BadRequestException);
    });
});
