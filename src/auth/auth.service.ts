import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

@Injectable({})
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) {}

    async signup(dto: AuthDto) {
        // 단방향 해쉬
        const hash = await argon.hash(dto.password);

        // db에 저장하기
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            })
    
            return this.signToken(user.id, user.email)
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('이미 존재하는 이메일입니다.')
                }
            }
            throw error
        }
    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
            },
        })

        if (!user) throw new ForbiddenException("해당 이메일이 없습니다.")
        
        const checkPassword = await argon.verify(
            user.hash,
            dto.password,
        )

        if (!checkPassword) throw new ForbiddenException("패스워드 오류")

        return this.signToken(user.id, user.email)
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        }

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '30m',
            secret: this.config.get("JWT_SECRET"),
        })

        return {
            access_token: token,
        };
    }
}
