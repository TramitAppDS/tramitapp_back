const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');

const request = supertest(app.callback());

describe('auth API routes', () => {
  const userFields = {
    firstName: 'ben',
    lastName: 'brereton',
    phone: '991572682',
    admin: '0',
    email: 'benbrereton@gmail.com',
    password: 'Hola123',
  };
  const tramiterFields = {
    firstName: 'charles',
    lastName: 'aranguiz',
    phone: '972672772',
    approved: 1,
    email: 'charlesaranguiz@gmail.com',
    password: 'Hola123',
    city: 'Santiago',
    commune: 'Puente Alto',
    rating: 5.0,
  };
  const userRegisterFields = {
    firstName: 'julian',
    lastName: 'alvarez',
    phone: '978274691',
    email: 'julianalvarez@gmail.com',
    password: 'Hola123',
  };

  const tramiterRegisterFields = {
    firstName: 'milton',
    lastName: 'casco',
    phone: '991471583',
    email: 'miltoncasco@gmail.com',
    password: 'Hola123',
    city: 'Santiago',
    commune: 'Maria Pinto',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.user.create(userFields);
    await app.context.orm.tramiter.create(tramiterFields);
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /auth/login/user', () => {
    const userData = {
      email: 'benbrereton@gmail.com',
      password: 'Hola123',
    };
    const userData2 = {
      email: 'benbrereton@gmail.com',
      password: 'Hola1234',
    };
    const userData3 = {
      email: 'benbrereto@gmail.com',
      password: 'Hola123',
    };

    const postuser = (body) => request
      .post('/auth/login/user')
      .set('Content-type', 'application/json')
      .send(body);

    describe('user data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await postuser(userData);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response for POST user has a token (user has an access token)', () => {
        expect(response.body.access_token).toBeDefined();
      });
    });

    describe('user password is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await postuser(userData2);
      });

      test('responds with 401 (invalid password) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('user email is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await postuser(userData3);
      });

      test('responds with 404 (invalid email) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('missing user data', () => {
      let response;

      beforeAll(async () => {
        response = await postuser();
      });

      test('responds with 500 (error) status code', () => {
        expect(response.status).toBe(500);
      });
    });
  });

  describe('POST /auth/login/tramiter', () => {
    const tramiterData = {
      email: 'charlesaranguiz@gmail.com',
      password: 'Hola123',
    };
    const tramiterData2 = {
      email: 'charlesaranguiz@gmail.com',
      password: 'Hola1234',
    };
    const tramiterData3 = {
      email: 'charlesarangui@gmail.com',
      password: 'Hola123',
    };

    const posttramiter = (body) => request
      .post('/auth/login/tramiter')
      .set('Content-type', 'application/json')
      .send(body);

    describe('tramiter data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await posttramiter(tramiterData);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response for POST user has a token (user has an access token)', () => {
        expect(response.body.access_token).toBeDefined();
      });
    });

    describe('tramiter password is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await posttramiter(tramiterData2);
      });

      test('responds with 401 (invalid password) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('tramiter email is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await posttramiter(tramiterData3);
      });

      test('responds with 404 (invalid email) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('missing tramiter data', () => {
      let response;

      beforeAll(async () => {
        response = await posttramiter();
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });
    });
  });

  describe('POST /auth/register/user', () => {
    describe('user data is valid', () => {
      let response;

      const authorizedPostAuthor = (body) => request
        .post('/auth/register/user')
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        response = await authorizedPostAuthor(userRegisterFields);
      });

      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text sends created', () => {
        expect(response.text).toEqual('Created');
      });
    });

    describe('missing data in user', () => {
      let response;

      const authorizedPostAuthor = (body) => request
        .post('/auth/register/user')
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        response = await authorizedPostAuthor();
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text sends created', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });
  });

  describe('POST /auth/register/tramiter', () => {
    describe('tramiter data is valid', () => {
      let response;

      const authorizedPostAuthor = (body) => request
        .post('/auth/register/tramiter')
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        response = await authorizedPostAuthor(tramiterRegisterFields);
      });

      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text sends created', () => {
        expect(response.text).toEqual('Created');
      });
    });

    describe('missing data in tramiter', () => {
      let response;

      const authorizedPostAuthor = (body) => request
        .post('/auth/register/tramiter')
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        response = await authorizedPostAuthor();
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text sends created', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });
  });
});
