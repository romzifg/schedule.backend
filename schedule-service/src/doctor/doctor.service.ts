import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorInput } from './dto/create-doctor-input';
import { UpdateDoctorInput } from './dto/update-doctor-input';

@Injectable()
export class DoctorService {
    constructor(private prisma: PrismaService) { }

    create(input: CreateDoctorInput) {
        return this.prisma.doctor.create({
            data: {
                name: input.name,
            },
        });
    }

    update(input: UpdateDoctorInput) {
        const { id, ...data } = input;

        return this.prisma.doctor.update({
            where: { id },
            data,
        });
    }

    findAll() {
        return this.prisma.doctor.findMany();
    }

    findOne(id: string) {
        return this.prisma.doctor.findUnique({
            where: { id },
        });
    }

    delete(id: string) {
        return this.prisma.doctor.delete({
            where: { id },
        });
    }
}
