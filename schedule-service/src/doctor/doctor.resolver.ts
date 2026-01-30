import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { Doctor } from 'src/model/doctor.model';
import { AuthGuard } from '../auth/auth.guard';
import { CreateDoctorInput } from './dto/create-doctor-input';
import { UpdateDoctorInput } from './dto/update-doctor-input';

@UseGuards(AuthGuard)
@Resolver(() => Doctor)
export class DoctorResolver {
    constructor(private readonly service: DoctorService) { }

    @Mutation(() => Doctor)
    createDoctor(
        @Args('input') input: CreateDoctorInput,
    ) {
        return this.service.create(input);
    }

    @Mutation(() => Doctor)
    updateDoctor(
        @Args('input') input: UpdateDoctorInput,
    ) {
        return this.service.update(input);
    }

    @Query(() => [Doctor])
    doctors() {
        return this.service.findAll();
    }

    @Query(() => Doctor)
    doctor(@Args('id') id: string) {
        return this.service.findOne(id);
    }

    @Mutation(() => Doctor)
    deleteDoctor(@Args('id') id: string) {
        return this.service.delete(id);
    }
}
