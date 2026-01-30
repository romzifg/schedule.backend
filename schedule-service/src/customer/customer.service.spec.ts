import { Test } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CustomerService', () => {
    let service: CustomerService;

    const prismaMock = {
        customer: {
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
                CustomerService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = module.get(CustomerService);
    });

    it('should create customer', async () => {
        prismaMock.customer.create.mockResolvedValue({
            id: '1',
            name: 'John',
            email: 'john@mail.com',
        });

        const result = await service.create({
            name: 'John',
            email: 'john@mail.com',
        });

        expect(result).toBeDefined();
        expect(prismaMock.customer.create).toBeCalled();
    });

    it('should return all customers', async () => {
        prismaMock.customer.findMany.mockResolvedValue([]);

        const result = await service.findAll();

        expect(result).toEqual([]);
    });
});
