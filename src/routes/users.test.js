const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');
// const { apiSetCurrentUser } = require('../../middlewares/auth');

const request = supertest(app.callback());

describe('user API routes', () => {
  let auth;
  app.context.state = {};

  const userFields = {
    firstName: 'charles',
    lastName: 'aranguiz',
    phone: '972672772',
    admin: 0,
    email: 'charlesaranguiz@gmail.com',
    password: 'Hola123',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    const user = await app.context.orm.user.create(userFields);

    app.context.state.currentuser = user;
    const authResponse = await request
      .post('/auth/login/user')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /users', () => {
    let response;

    const authorizedGetusers = () => request
      .get('/users')
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedGetusers = () => request
      .get('/users');

    const authorizedDeleteusers = (id) => request
      .get(`/users/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    describe('when user is loged in', () => {
      beforeAll(async () => {
        response = await authorizedGetusers();
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when user is not loged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetusers();
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('when there are no debts', () => {
      beforeAll(async () => {
        response = await authorizedDeleteusers(1);
        response = await authorizedGetusers();
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('GET /users/:id', () => {
    let user;
    let response;
    const userData = {
      firstName: 'mauricio',
      lastName: 'isla',
      phone: '972672782',
      admin: 0,
      email: 'mauricioisla@gmail.com',
      password: 'Hola123',
    };
    const authorizedGetuser = (id) => request
      .get(`/users/${id}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetDebt = (id) => request
      .get(`/users/${id}`);

    beforeAll(async () => {
      user = await app.context.orm.debt.create(userData);
    });

    describe('when passed id corresponds to an existing user', () => {
      beforeAll(async () => {
        response = await authorizedGetuser(user.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when passed id does not corresponds to an existing user', () => {
      beforeAll(async () => {
        response = await authorizedGetuser(user.id * -1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetDebt(user.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /user/:id', () => {
    const authorizedPatchuser = (id, body) => request
      .patch(`/users/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchuser = (id, body) => request
      .patch(`/users/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('user data is valid', () => {
      let response;
      const newuserData = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672774',
        admin: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: 'Hola123',
      };

      beforeAll(async () => {
        response = await authorizedPatchuser(
          app.context.state.currentuser.id, newuserData,
        );
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('PATCH request actually updates the given user', async () => {
        const { id } = app.context.state.currentuser;
        const userposteado = await app.context.orm.user.findOne({ where: { id } });
        expect(userposteado.phone).toEqual(newuserData.phone);
        expect(userposteado.email).toEqual(newuserData.email);
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('user data is valid but request is unauthorized', () => {
      let response;
      const newuserData = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672772',
        admin: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: 'Hola123',
      };

      beforeAll(async () => {
        response = await unauthorizedPatchuser(
          app.context.state.currentuser.id, newuserData,
        );
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('user data is invalid', () => {
      let response;
      const newuserData2 = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672774',
        admin: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: '',
      };

      beforeAll(async () => {
        response = await authorizedPatchuser(
          app.context.state.currentuser.id, newuserData2,
        );
      });

      test('responds with 400 (error) status code', () => {
        expect(response.status).toBe(400);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches returns success true', () => {
        expect(response.body.message).toEqual('Contraseña incorrecta');
        expect(response.body.success).toEqual(false);
      });
    });

    describe('trying to patch another user', () => {
      let response;
      const newuserData4 = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672774',
        admin: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: 'Hola123',
      };
      const userFields2 = {
        firstName: 'erick',
        lastName: 'pulgar',
        phone: '972652552',
        admin: 0,
        email: 'erickpulgar@gmail.com',
        password: 'Hola123',
      };

      beforeAll(async () => {
        const user = await app.context.orm.user.create(userFields2);
        response = await authorizedPatchuser(user.id, newuserData4);
      });

      test('responds with 400 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches returns success true', () => {
        expect(response.body.message).toEqual('No es el usuario loggeado');
        expect(response.body.success).toEqual(false);
      });
    });
  });

  describe('DELETE /users/:id', () => {
    let user;

    const authorizedDeleteuser = (id) => request
      .delete(`/users/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedDeleteuser = (id) => request
      .delete(`/users/${id}`);

    beforeAll(async () => {
      const { id } = app.context.state.currentuser;
      user = await app.context.orm.user.findOne({ where: { id } });
    });

    describe('user to delete is not current user', () => {
      let response;
      const userFields3 = {
        firstName: 'paulo',
        lastName: 'diaz',
        phone: '954652852',
        admin: 0,
        email: 'paulodiaz@gmail.com',
        password: 'Hola123',
      };

      beforeAll(async () => {
        const user2 = await app.context.orm.user.create(userFields3);
        response = await authorizedDeleteuser(user2.id);
      });

      test('responds with 403 (error) status code', () => {
        expect(response.status).toBe(403);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body returns success true', () => {
        expect(response.body).toEqual({ success: false });
      });
    });

    describe('user data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedDeleteuser(user.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('DELETE request actually deletes the given user', async () => {
        const { id } = app.context.state.currentuser;
        const debtposteado = await app.context.orm.user.findOne({ where: { id } });
        expect(debtposteado).toBe(null);
      });

      test('response body returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('user data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedDeleteuser(user.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });
});
