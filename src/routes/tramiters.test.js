const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');
// const { apiSetCurrentUser } = require('../../middlewares/auth');

const request = supertest(app.callback());

describe('tramiter API routes', () => {
  let auth;
  let auth2;
  let auth3;
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

  const userFields = {
    firstName: 'erick',
    lastName: 'pulgar',
    phone: '972872772',
    admin: true,
    email: 'erickpulgar@gmail.com',
    password: 'Hola123',
  };

  const userFields2 = {
    firstName: 'humberto',
    lastName: 'suazo',
    phone: '974872772',
    admin: false,
    email: 'humbertosuazo@gmail.com',
    password: 'Hola123',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    const tramiter = await app.context.orm.tramiter.create(tramiterFields);
    const user = await app.context.orm.user.create(userFields);
    await app.context.orm.user.create(userFields2);

    app.context.state.currentTramiter = tramiter;
    app.context.state.currentUser = user;

    const authResponse = await request
      .post('/auth/login/tramiter')
      .set('Content-type', 'application/json')
      .send({ email: tramiterFields.email, password: tramiterFields.password });
    auth = authResponse.body;

    const authResponse2 = await request
      .post('/auth/login/user')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth2 = authResponse2.body;

    const authResponse3 = await request
      .post('/auth/login/user')
      .set('Content-type', 'application/json')
      .send({ email: userFields2.email, password: userFields2.password });
    auth3 = authResponse3.body;
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

  describe('PATCH /tramiter/admin/approve/:tid', () => {
    const authorizedPatchTramiter = (tid) => request
      .patch(`/tramiters/admin/approve/${tid}`)
      .auth(auth2.access_token, { type: 'bearer' });
    const unauthorizedPatchTramiter = (tid) => request
      .patch(`/tramiters/admin/approve/${tid}`);
    const unauthorizedPatchTramiter2 = (tid) => request
      .patch(`/tramiters/admin/approve/${tid}`)
      .auth(auth3.access_token, { type: 'bearer' });

    describe('tramiter data is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPatchTramiter(-1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: false });
      });
    });

    describe('tramiter data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPatchTramiter(
          app.context.state.currentTramiter.id,
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
        expect(tramiterposteado.approved).toEqual(true);
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('tramiter data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedPatchTramiter(
          app.context.state.currentTramiter.id,
        );
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('tramiter is not being approved by admin', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedPatchTramiter2(
          app.context.state.currentTramiter.id,
        );
      });

      test('responds with 403 (forbidden) status code', () => {
        expect(response.status).toBe(403);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches returns success true', () => {
        expect(response.body.success).toEqual(false);
      });
    });
  });

  describe('PATCH /tramiter/transfer_data/:id', () => {
    const authorizedPatchTramiter = (id, body) => request
      .patch(`/tramiters/transfer_data/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchTramiter = (id, body) => request
      .patch(`/tramiters/transfer_data/${id}`)
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchTramiter2 = (id, body) => request
      .patch(`/tramiters/transfer_data/${id}`)
      .auth(auth3.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);

    const newTramiterData = {
      bank: 'santander',
      accountType: 'vista',
      accountNumber: '000222444666',
      rut: 0,
    };

    describe('tramiter data is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPatchTramiter(-1, newTramiterData);
      });

      test('responds with 500 (internal server error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('text/plain');
      });
    });

    describe('tramiter data is valid', () => {
      let response;

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
        expect(tramiterposteado.bank).toEqual('santander');
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('tramiter data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedPatchTramiter(
          app.context.state.currentTramiter.id, newTramiterData,
        );
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('tramiter is not being approved by admin', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedPatchTramiter2(
          app.context.state.currentTramiter.id, newTramiterData,
        );
      });

      test('responds with 403 (forbidden) status code', () => {
        expect(response.status).toBe(403);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body matches returns success true', () => {
        expect(response.body.success).toEqual(false);
      });
    });
  });

  describe('DELETE /tramiters/:id', () => {
    let tramiter;

    const authorizedDeleteTramiter = (id) => request
      .delete(`/tramiters/${id}`)
      .auth(auth2.access_token, { type: 'bearer' });

    const unauthorizedDeleteTramiter = (id) => request
      .delete(`/tramiters/${id}`);

    const unauthorizedDeleteTramiter2 = (id) => request
      .delete(`/tramiters/${id}`)
      .auth(auth3.access_token, { type: 'bearer' });

    beforeAll(async () => {
      const { id } = app.context.state.currentTramiter;
      tramiter = await app.context.orm.tramiter.findOne({ where: { id } });
    });

    describe('trying to delete tramiter not being the admin', () => {
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
        response = await unauthorizedDeleteTramiter2(tramiter2.id);
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

    describe('tramiter data is invalid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedDeleteTramiter(-1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response body returns success false', () => {
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
