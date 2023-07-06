# Fudy Challenge

This project presents a streamlined service designed for user creation and authentication. It employs the NestJS framework for backend operations and PostgreSQL for managing the database. We adhere to a standard coding and testing procedure, ensuring our service's effectiveness and reliability.

## Table of Contents

- [Challenge Details](#challenge-details)
- [Technology Stack](#technology-stack)
- [Acceptance Criteria](#acceptance-criteria)
- [Additional Features](#additional-features)
- [Running the Project](#running-the-project)
  - [Setting up the Database](#setting-up-the-database)
  - [Launching the Project](#launching-the-project)
  - [Interacting with the Database](#interacting-with-the-database)
  - [Executing End-to-End Tests](#executing-end-to-end-tests)
  - [Performing Unit Tests](#performing-unit-tests)
- [API Documentation](#api-documentation)

## Challenge Details

The challenge was to build a service that incorporates the following endpoints:

1. `POST /user` - Facilitates the creation of a new user in the database, with `email` and `password` as payload fields.
2. `POST /auth/login` - Validates user credentials and, upon successful verification, returns a JWT token. Payload fields include `email` and `password`.
3. `GET /auth/me` - Provides information about the current user.

## Technology Stack

- **Backend**: NestJS
- **Database**: PostgreSQL

## Acceptance Criteria

- Implementation of Swagger with accurate models for all endpoints.
- Effective validation mechanisms.
- Configuration via `.env` file and environment variables.
- Comprehensive error handling strategies.

## Additional Features

- Comprehensive suite of unit and e2e tests.

# Running the Project

This project capitalizes on Prisma ORM for efficient database communication.

## Setting up the Database

<hr/>
Note: This step requires env vars to be correctly defined, otherwise the container will be created with wrong credentials and the application will fail to connect to the database. To solve this, go to docker desktop and remove the database container, then run the following command again.
<hr/>

This project relies on Docker for the seamless operation of the database. You can start the database with the following command:

```bash
npm install
npm run db
```

## Launching the Project

### Note: This step requires the [Setting up the Database](#setting-up-the-database) step to be completed.

<hr/>

To get the project running, follow these steps sequentially:

1. Apply the required migrations:

```bash
npm run prisma:apply
```

2. Generate the Prisma client:

```bash
npm run prisma:generate
```

3. Start the application in the development mode:

```bash
npm run start
```

This will launch the application at the following endpoint:

```bash
http://localhost:8002/v1
```

## Interacting with the Database

For direct interaction with the database, use the following command:

```bash
npm run prisma:studio
```

## Executing End-to-End Tests

To execute the end-to-end tests, use the following command:

```bash
npm run test:e2e
```

## Performing Unit Tests

To perform the unit tests, use the following command:

```bash
npm run test
```

<hr/>

# API Documentation

The API documentation is available at the following endpoint:

### Note: Please ensure that you authenticate yourself with a valid token before executing protected endpoints such as /v1/auth/me.

```bash
http://localhost:8002/v1/docs
```

Please don't forget to update the .env file with your specific environment variables before running the application. Enjoy your development journey!
