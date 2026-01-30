import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
    providers: [AuthService, AuthGuard],
    exports: [AuthGuard],
})
export class AuthModule { }
