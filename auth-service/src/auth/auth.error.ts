import {
    UnauthorizedException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';

export const AuthErrors = {
    INVALID_CREDENTIALS: () =>
        new UnauthorizedException('Email atau password salah'),

    EMAIL_ALREADY_EXISTS: () =>
        new BadRequestException('Email sudah terdaftar'),

    INVALID_TOKEN: () =>
        new UnauthorizedException('Token tidak valid atau sudah expired'),

    TOKEN_SERVICE_UNAVAILABLE: () =>
        new InternalServerErrorException('Auth service tidak tersedia'),

    INTERNAL_ERROR: () =>
        new InternalServerErrorException('Terjadi kesalahan sistem'),
};
