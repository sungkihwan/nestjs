import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    @Get('me')
    getMe(@GetUser() user: User) {
        return user
    }

    // @Get('me2')
    // getMe2(@GetUser('email') email: string) {
    //     return email
    // }

    @Patch()
    editUser() {

    }
}
