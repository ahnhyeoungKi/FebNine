import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Hash } from '../utils/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userDto: UserDto) {
    try {
      const { username, password } = userDto;
      const encryptPassword = await Hash.encrypt(password);
      await this.userRepository.save({ username, password: encryptPassword });
    } catch (err) {
      console.log(err);
      throw new ConflictException('문재가 발생했습니다.');
    }
  }

  async login(userDto: UserDto) {
    try {
      const { username, password } = userDto;
      const user = await this.userRepository.findOne({ username });
      if (user) {
        const isValid = await Hash.validate(user.password, password);
        if (isValid) {
          return true;
        }
      }
      throw new UnauthorizedException('아이디와 비밀번호가 일치하지 않습니다.');
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('아이디와 비밀번호를 확인해주세요');
    }
  }
}