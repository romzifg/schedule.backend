import { Test } from '@nestjs/testing';
import { DoctorService } from './doctor.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DoctorService', () => {
    let service: DoctorService;

    const prismaMock = {
        doctor: {
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                DoctorService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = module.get(DoctorService);
    });

    it('should create doctor', async () => {
        prismaMock.doctor.create.mockResolvedValue({
            id: '1',
            name: 'Dr. Strange',
        });

        const result = await service.create({
            name: 'Dr. Strange',
        });

        expect(result).toBeDefined();
        expect(prismaMock.doctor.create).toBeCalled();
    });

    it('should return doctors list', async () => {
        prismaMock.doctor.findMany.mockResolvedValue([]);

        const result = await service.findAll();

        expect(result).toEqual([]);
    });
});
