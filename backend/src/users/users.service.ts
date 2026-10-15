import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserResponseDto.fromEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto, passwordHash: string): Promise<UserResponseDto> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const user = this.usersRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);
    return UserResponseDto.fromEntity(saved);
  }
}
