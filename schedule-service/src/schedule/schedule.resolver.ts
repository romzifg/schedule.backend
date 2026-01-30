import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { Schedule } from '../model/schedule.model';
import { AuthGuard } from '../auth/auth.guard';
import { CreateScheduleInput } from './dto/create-schedule-input.dto';

@UseGuards(AuthGuard)
@Resolver(() => Schedule)
export class ScheduleResolver {
    constructor(private readonly service: ScheduleService) { }

    @Mutation(() => Schedule)
    createSchedule(
        @Args('input') input: CreateScheduleInput,
    ) {
        return this.service.create(input);
    }

    @Query(() => [Schedule])
    schedules() {
        return this.service.findAll();
    }

    @Query(() => Schedule)
    schedule(@Args('id') id: string) {
        return this.service.findOne(id);
    }

    @Mutation(() => Schedule)
    deleteSchedule(@Args('id') id: string) {
        return this.service.delete(id);
    }
}
