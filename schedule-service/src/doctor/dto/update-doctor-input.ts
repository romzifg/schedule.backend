import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class UpdateDoctorInput {
    @Field(() => ID)
    id: string;

    @Field({ nullable: true })
    @IsOptional()
    name?: string;
}
