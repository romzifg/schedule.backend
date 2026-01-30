import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerInput } from './dto/create-customer-input.dto';
import { UpdateCustomerInput } from './dto/update-customer-input.dto';

@Injectable()
export class CustomerService {
    constructor(private prisma: PrismaService) { }

    create(input: CreateCustomerInput) {
        return this.prisma.customer.create({
            data: {
                name: input.name,
                email: input.email,
            },
        });
    }

    update(input: UpdateCustomerInput) {
        const { id, ...data } = input;

        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }

    findAll() {
        return this.prisma.customer.findMany();
    }

    findOne(id: string) {
        return this.prisma.customer.findUnique({
            where: { id },
        });
    }

    delete(id: string) {
        return this.prisma.customer.delete({
            where: { id },
        });
    }
}
