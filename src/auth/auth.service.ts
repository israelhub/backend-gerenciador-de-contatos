import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { nome, email, senha } = registerDto;

    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await argon2.hash(senha);

    // Criar usuário
    const user = this.userRepository.create({
      nome,
      email,
      senha: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Gerar tokens
    const tokens = await this.generateTokens(savedUser);

    // Remover senha da resposta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, senha } = loginDto;

    // Buscar usuário
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await argon2.verify(user.senha, senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Remover senha da resposta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    // Buscar todos os refresh tokens não revogados
    const storedTokens = await this.refreshTokenRepository.find({
      where: { revokedAt: undefined },
      relations: ['user'],
    });

    // Verificar qual token corresponde ao recebido
    let validToken: RefreshToken | null = null;
    for (const token of storedTokens) {
      const isValid = await argon2.verify(token.tokenHash, refreshToken);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Verificar se não foi revogado
    if (validToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revogado');
    }

    // Verificar se não expirou
    if (validToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.remove(validToken);
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Revogar o token atual
    validToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(validToken);

    // Gerar novos tokens
    const tokens = await this.generateTokens(validToken.user);

    return tokens;
  }

  async logout(refreshToken: string) {
    // Buscar todos os refresh tokens
    const storedTokens = await this.refreshTokenRepository.find();

    // Encontrar o token correspondente
    for (const token of storedTokens) {
      const isValid = await argon2.verify(token.tokenHash, refreshToken);
      if (isValid) {
        token.revokedAt = new Date();
        await this.refreshTokenRepository.save(token);
        break;
      }
    }

    return { message: 'Logout realizado com sucesso' };
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };

    // Gerar access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.accessTokenExpiration'),
    });

    // Gerar refresh token
    const refreshTokenValue = uuidv4();
    const refreshTokenHash = await argon2.hash(refreshTokenValue);

    // Salvar refresh token no banco
    const refreshTokenEntity = this.refreshTokenRepository.create({
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() +
          this.parseExpiration(
            this.configService.get('jwt.refreshTokenExpiration') || '7d',
          ),
      ),
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private parseExpiration(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000; // 15 minutes default
    }
  }
}
