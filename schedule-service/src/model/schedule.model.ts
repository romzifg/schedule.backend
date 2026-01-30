import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Schedule {
    @Field(() => ID)
    id: string;

    @Field()
    objective: string;

    @Field()
    customerId: string;

    @Field()
    doctorId: string;

    @Field()
    scheduledAt: Date;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
