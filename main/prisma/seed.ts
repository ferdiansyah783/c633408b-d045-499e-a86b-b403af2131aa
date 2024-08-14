import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/hash_password';

const prisma = new PrismaClient();

async function main() {
  const users: Prisma.UserCreateInput[] = [
    {
      id: '66b9edf779bbb4893d1b5c1f',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password',
      salt: '25b14ce3-c506-42e3-a53b-a4cce190be32',
      profile: {
        create: {
          display_name: 'JohnD',
          gender: 'Male',
          birthday: '1990-01-01',
          horoscope: 'Capricorn',
          zodiac: 'Horse',
          height: 180,
          weight: 75,
        },
      },
    },
    {
      id: '66b9edf779bbb4893d1b5c20',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password',
      salt: '9234c19a-219c-41d4-bcc5-42747c90a058',
      profile: {
        create: {
          display_name: 'ChenaC',
          gender: 'Male',
          birthday: '1985-05-15',
          horoscope: 'Taurus',
          zodiac: 'Ox',
          height: 175,
          weight: 80,
        },
      },
    },
  ];

  const createdUsers = await Promise.all(
    users.map(async (user) => {
      let passwordHash = await hashPassword(user.password, user.salt);
      return await prisma.user.create({
        data: {
          ...user,
          password: passwordHash,
        },
      });
    }),
  );

  console.log(createdUsers);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
