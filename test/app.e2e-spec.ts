import { PrismaService } from '../src/prisma/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthDto } from '@App/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(3433);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));

    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://127.0.0.1:3433');
  })

  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'singahu76@gmail.com',
      password: '1234',
    }

    describe('Signup', () => {
      it('이메일이 비어있는 회원가입', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(500)
      })

      it('비밀번호가 비어있는 회원가입', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(500)
      })

      it('회원가입 테스트', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    });

    describe('Signin', () => {
      it('비밀번호가 비어있는 로그인', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
            password: '',
          })
          .expectStatus(403)
      })

      it('로그인 테스트', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      })
    })
  });
  
  describe('User', () => {
    describe('Get me', () => {
      it('로그인이 필요한 페이지 토큰 검사', () => {
        return pactum
          .spec()
          .withHeaders({
            Authorization: "Bearer $S{userAt}"
          })
          .get('/users/me')
          .expectStatus(200)
      })
    })

    describe('Edit user', () => {
      
    })
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => {
      
    })

    describe('Get bookmarks', () => {
      
    })

    describe('Get bookmark by id', () => {
      
    })

    describe('Edit bookmark', () => {
      
    })

    describe('Delete bookmark', () => {
      
    })
  })
})