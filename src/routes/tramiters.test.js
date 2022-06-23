const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');
// const { apiSetCurrentUser } = require('../../middlewares/auth');

const request = supertest(app.callback());

describe('tramiter API routes', () => {
  let auth;
  app.context.state = {};

  const tramiterFields = {
    firstName: 'charles',
    lastName: 'aranguiz',
    phone: '972672772',
    approved: 1,
    email: 'charlesaranguiz@gmail.com',
    password: 'Hola123',
    city: 'Santiago',
    commune: 'Puente Alto',
    rating: 4.0,
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    const tramiter = await app.context.orm.tramiter.create(tramiterFields);

    app.context.state.currentTramiter = tramiter;
    const authResponse = await request
      .post('/auth/login/tramiter')
      .set('Content-type', 'application/json')
      .send({ email: tramiterFields.email, password: tramiterFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /tramiters', () => {
    let response;

    const authorizedGetTramiters = () => request
      .get('/tramiters')
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedGetTramiters = () => request
      .get('/tramiters');

    const authorizedDeleteTramiters = (id) => request
      .get(`/tramiters/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    describe('when user is loged in', () => {
      beforeAll(async () => {
        response = await authorizedGetTramiters();
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
        response = await unauthorizedGetTramiters();
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('when there are no debts', () => {
      beforeAll(async () => {
        response = await authorizedDeleteTramiters(1);
        response = await authorizedGetTramiters();
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('GET /tramiters/:id', () => {
    let tramiter;
    let response;
    const tramiterData = {
      firstName: 'mauricio',
      lastName: 'isla',
      phone: '972672782',
      approved: 0,
      email: 'mauricioisla@gmail.com',
      password: 'Hola123',
      city: 'Santiago',
      commune: 'Buin',
      rating: 5.0,
    };
    const authorizedGetTramiter = (id) => request
      .get(`/tramiters/${id}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetDebt = (id) => request
      .get(`/tramiters/${id}`);

    beforeAll(async () => {
      tramiter = await app.context.orm.debt.create(tramiterData);
    });

    describe('when passed id corresponds to an existing tramiter', () => {
      beforeAll(async () => {
        response = await authorizedGetTramiter(tramiter.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when passed id does not corresponds to an existing tramiter', () => {
      beforeAll(async () => {
        response = await authorizedGetTramiter(tramiter.id * -1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetDebt(tramiter.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /tramiter/:id', () => {
    const authorizedPatchTramiter = (id, body) => request
      .patch(`/tramiters/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchTramiter = (id, body) => request
      .patch(`/tramiters/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('tramiter data is valid', () => {
      let response;
      const newTramiterData = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672774',
        approved: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: 'Hola123',
        city: 'Santiago',
        commune: 'Puente Alto',
        rating: 5.0,
      };

      beforeAll(async () => {
        response = await authorizedPatchTramiter(
          app.context.state.currentTramiter.id, newTramiterData,
        );
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('PATCH request actually updates the given tramiter', async () => {
        const { id } = app.context.state.currentTramiter;
        const tramiterposteado = await app.context.orm.tramiter.findOne({ where: { id } });
        expect(tramiterposteado.phone).toEqual(newTramiterData.phone);
        expect(tramiterposteado.rating).toEqual(newTramiterData.rating);
        expect(tramiterposteado.email).toEqual(newTramiterData.email);
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('tramiter data is valid but request is unauthorized', () => {
      let response;
      const newTramiterData = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672772',
        approved: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: 'Hola123',
        city: 'Santiago',
        commune: 'Puente Alto',
        rating: 5.0,
      };

      beforeAll(async () => {
        response = await unauthorizedPatchTramiter(
          app.context.state.currentTramiter.id, newTramiterData,
        );
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('tramiter data is invalid', () => {
      let response;
      const newTramiterData2 = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672774',
        approved: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: '',
        city: 'Santiago',
        commune: 'Puente Alto',
        rating: 5.0,
      };

      beforeAll(async () => {
        response = await authorizedPatchTramiter(
          app.context.state.currentTramiter.id, newTramiterData2,
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
      const newTramiterData4 = {
        firstName: 'charles',
        lastName: 'aranguiz',
        phone: '972672774',
        approved: 0,
        email: 'charlesaranguiz20@gmail.com',
        password: 'Hola123',
        city: 'Santiago',
        commune: 'Puente Alto',
        rating: 5.0,
      };
      const tramiterFields2 = {
        firstName: 'erick',
        lastName: 'pulgar',
        phone: '972652552',
        approved: 0,
        email: 'erickpulgar@gmail.com',
        password: 'Hola123',
        city: 'Antofagasta',
        commune: 'Antofagasta',
        rating: 4.0,
      };

      beforeAll(async () => {
        const tramiter = await app.context.orm.tramiter.create(tramiterFields2);
        response = await authorizedPatchTramiter(tramiter.id, newTramiterData4);
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

  describe('DELETE /tramiters/:id', () => {
    let tramiter;

    const authorizedDeleteTramiter = (id) => request
      .delete(`/tramiters/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedDeleteTramiter = (id) => request
      .delete(`/tramiters/${id}`);

    beforeAll(async () => {
      const { id } = app.context.state.currentTramiter;
      tramiter = await app.context.orm.tramiter.findOne({ where: { id } });
    });

    describe('tramiter to delete is not current user', () => {
      let response;
      const tramiterFields3 = {
        firstName: 'paulo',
        lastName: 'diaz',
        phone: '954652852',
        approved: 0,
        email: 'paulodiaz@gmail.com',
        password: 'Hola123',
        city: 'Santa Cruz',
        commune: 'Santa Cruz',
        rating: 4.0,
      };

      beforeAll(async () => {
        const tramiter2 = await app.context.orm.tramiter.create(tramiterFields3);
        response = await authorizedDeleteTramiter(tramiter2.id);
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

    describe('tramiter data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedDeleteTramiter(tramiter.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('DELETE request actually deletes the given tramiter', async () => {
        const { id } = app.context.state.currentTramiter;
        const debtposteado = await app.context.orm.tramiter.findOne({ where: { id } });
        expect(debtposteado).toBe(null);
      });

      test('response body returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('tramiter data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedDeleteTramiter(tramiter.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });
});
