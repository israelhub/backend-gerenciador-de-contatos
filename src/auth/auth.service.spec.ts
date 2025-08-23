import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Mock argon2
jest.mock('argon2');
const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'João Silva',
    email: 'joao@teste.com',
    senha: 'hashedPassword',
    contacts: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default mock returns
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'jwt.accessTokenExpiration':
          return '15m';
        case 'jwt.refreshTokenExpiration':
          return '7d';
        default:
          return undefined;
      }
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'senha123',
      };

      userRepository.findOne.mockResolvedValue(null); // User doesn't exist
      mockedArgon2.hash.mockResolvedValue('hashedPassword');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);
      jwtService.sign.mockReturnValue('accessToken');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('senha');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockedArgon2.hash).toHaveBeenCalledWith(registerDto.senha);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'senha123',
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginDto: LoginDto = {
        email: 'joao@teste.com',
        senha: 'senha123',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(true);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);
      jwtService.sign.mockReturnValue('accessToken');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('senha');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'joao@teste.com',
        senha: 'senha123',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'joao@teste.com',
        senha: 'senhaErrada',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
