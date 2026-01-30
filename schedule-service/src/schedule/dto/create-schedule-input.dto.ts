import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateScheduleInput {
    @Field()
    @IsNotEmpty()
    objective: string;

    @Field(() => ID)
    customerId: string;

    @Field(() => ID)
    doctorId: string;

    @Field()
    scheduledAt: Date;
}
