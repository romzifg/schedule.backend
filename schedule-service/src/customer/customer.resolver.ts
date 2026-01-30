import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { CustomerService } from './customer.service';
import { Customer } from 'src/model/customer.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateCustomerInput } from './dto/create-customer-input.dto';
import { UpdateCustomerInput } from './dto/update-customer-input.dto';

@UseGuards(AuthGuard)
@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private readonly service: CustomerService) {}

  @Mutation(() => Customer)
  createCustomer(
    @Args('input') input: CreateCustomerInput,
  ) {
    return this.service.create(input);
  }

  @Mutation(() => Customer)
  updateCustomer(
    @Args('input') input: UpdateCustomerInput,
  ) {
    return this.service.update(input);
  }

  @Query(() => [Customer])
  customers() {
    return this.service.findAll();
  }

  @Query(() => Customer)
  customer(@Args('id') id: string) {
    return this.service.findOne(id);
  }

  @Mutation(() => Customer)
  deleteCustomer(@Args('id') id: string) {
    return this.service.delete(id);
  }
}
