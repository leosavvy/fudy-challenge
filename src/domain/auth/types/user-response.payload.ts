import { User } from '@prisma/client';

export type LoginResponse = Omit<User, 'password' | 'id'> & { access_token: string };
