## Source
```bash
#main
$ cd main

#service
$ cd service
```

## Installation
```bash
$ yarn install / npm install
```

## Running migration
```bash
#generate
$ npx prisma generate

#push database
$ npx prisma db push --force-reset

# seeding
$ npx prisma db seed
```

## Running RabbitMQ
```bash
#locale
$ run locale rabbit mq on amqp://localhost:5672

#docker
$ run on docker "docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management"
```

## Running the app

```bash
# development
$ npm/yarn run start

# watch mode
$ npm/yarn run start:dev

# production mode
$ npm/yarn run start:prod
```

## Test

```bash
# unit tests
$ npm/yarn run test

# e2e tests
$ npm/yarn run test:e2e

# test coverage
$ npm/yarn run test:cov
```

