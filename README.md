<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/) (for database)
- [Git](https://git-scm.com/) (optional, if cloning the repo)

## Roles & Permissions

- By default, `Admin` and `Default` roles are created on application startup if none exist.
- The first user created is always assigned the `Admin` role. All subsequent users are assigned the `Default` role.
- Role names are not changeable (`Admin` and `Default` only).
- Admin users receive all permissions at application startup. If more permissions are added later, Admins will automatically have them.
- You can create additional custom roles by sending requests to the `/role` endpoint. Please check _API Documentation section below_

Tip: Make sure to use the `/role` endpoint carefully when creating new roles to maintain proper access control.

## Clone the repository

```bash
git clone https://github.com/sammo-2000/NestJS-Auth auth
cd auth
```

## Environment Variables Setup

Before running the project, make sure to create your `.env` file. You can copy it from the provided example:

```bash
cp .env.example .env
```

Tip: After copying, open `.env` and update any values (like database credentials or ports) as needed for your environment.

## Database setup

**_Note:_** Make sure you have Docker installed and running before proceeding.

To start the database using Docker, run:

```bash
docker-compose up
```

Tips:

Use `docker-compose up -d` if you want to run it in detached mode (in the background).

To stop the containers, run:

```bash
docker-compose down
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

You can view all endpoints by visiting:

```bash
http://localhost:3000/docs
```

- Swagger is enabled for this project.
- Use the signup and login endpoints to obtain a JWT.
- Set the JWT in Swagger to access protected endpoints.
- All new endpoints are secure by default unless `@Public()` decorator is set.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Additional Notes

- For help with NestJS please view the offical documentation [NestJS](https://nestjs.com/)

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes.
4. Run tests to ensure nothing is broken: `npm run test`.
5. Submit a pull request.

Please follow the existing code style and add descriptive commit messages.

## License

This project is licensed under the MIT License

Copyright (c) 2026-present Ayman Sammo <https://sammodigital.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
