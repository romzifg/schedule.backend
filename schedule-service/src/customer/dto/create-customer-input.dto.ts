import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCustomerInput {
    @Field()
    @IsNotEmpty()
    name: string;

    @Field()
    @IsEmail()
    email: string;
}
