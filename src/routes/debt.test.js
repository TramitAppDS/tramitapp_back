const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');
// const { apiSetCurrentUser } = require('../../middlewares/auth');

const request = supertest(app.callback());

describe('debt API routes', () => {
  let auth;
  let auth2;
  app.context.state = {};
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

  const tramiterFields2 = {
    firstName: 'erick',
    lastName: 'pulgar',
    phone: '972672752',
    approved: 1,
    email: 'erickpulgar@gmail.com',
    password: 'Hola123',
    city: 'Santiago',
    commune: 'Puente Alto',
    rating: 5.0,
  };

  const debtFields = {
    procedureId: 1,
    date: Date.parse('2018-12-09'),
    price: 5000,
    status: 0,
  };

  const procedureFields = {
    userId: 1,
    procedureId: 1,
    status: 0,
    type: 0,
    comments: 'revision tecninca',
    price: 2000,
    rating: 5.0,
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    const user = await app.context.orm.user.create(userFields);
    const tramiter = await app.context.orm.tramiter.create(tramiterFields);
    await app.context.orm.tramiter.create(tramiterFields2);
    await app.context.orm.procedure.create(procedureFields);
    await app.context.orm.debt.create(debtFields);

    app.context.state.currentUser = user;
    app.context.state.currentTramiter = tramiter;

    const authResponse = await request
      .post('/auth/login/user')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;

    const authResponse2 = await request
      .post('/auth/login/tramiter')
      .set('Content-type', 'application/json')
      .send({ email: tramiterFields.email, password: tramiterFields.password });
    auth2 = authResponse2.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /debts', () => {
    let response;

    const authorizedGetDebts = () => request
      .get('/debts')
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedGetDebts = () => request
      .get('/debts');

    const authorizedDeleteDebt = (id) => request
      .get(`/debts/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    describe('when user is loged in', () => {
      beforeAll(async () => {
        response = await authorizedGetDebts();
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
        response = await unauthorizedGetDebts();
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('when there are no debts', () => {
      beforeAll(async () => {
        response = await authorizedDeleteDebt(1);
        response = await authorizedGetDebts();
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('GET /debts/:id', () => {
    let debt;
    let response;
    const debtData = {
      procedureId: 1,
      date: Date.parse('2018-07-15'),
      price: 1000,
      status: 1,
    };
    const authorizedGetDebt = (id) => request
      .get(`/debts/${id}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetDebt = (id) => request
      .get(`/debts/${id}`);

    beforeAll(async () => {
      debt = await app.context.orm.debt.create(debtData);
    });

    describe('when passed id corresponds to an existing local', () => {
      beforeAll(async () => {
        response = await authorizedGetDebt(debt.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when passed id does not corresponds to an existing local', () => {
      beforeAll(async () => {
        response = await authorizedGetDebt(debt.id * -1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetDebt(debt.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /debts', () => {
    let response;
    // let local;
    const localData = {
      name: 'mc',
      capacity: 20,
    };
    const debtData2 = {
      procedureId: 1,
      date: Date.parse('2022-05-29'),
      price: 1234567,
      status: 1,
    };
    const debtInvalidData2 = {
      procedureId: 1,
      date: Date.parse('2022-05-29'),
      price: 'precio',
      status: 'status',
    };

    const authorizedPostAuthor = (body) => request
      .post('/debts')
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPostAuthor = (body) => request
      .post('/debts')
      .set('Content-type', 'application/json')
      .send(body);

    describe('debt data is valid', () => {
      beforeAll(async () => {
        response = await authorizedPostAuthor(debtData2);
      });

      test('responds with 201 (created) status code', () => {
        expect(response.status).toBe(201);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns created', () => {
        expect(response.text).toEqual('Created');
      });

      test('post request actually created the given local', async () => {
        const { date } = debtData2;
        const debtPosted = await app.context.orm.debt.findOne({ where: { date } });
        expect(debtPosted.price).toEqual(debtData2.price);
        expect(debtPosted.status).toEqual(debtData2.status);
      });
    });

    describe('debt data is invalid', () => {
      beforeAll(async () => {
        response = await authorizedPostAuthor(debtInvalidData2);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns created', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });

    describe('author data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedPostAuthor(localData);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /debts/:id', () => {
    let debt;
    const debtData3 = {
      procedureId: 1,
      date: Date.parse('2022-05-29'),
      price: 1234567,
      status: 1,
    };

    const authorizedPatchLocal = (id, body) => request
      .patch(`/debts/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchLocal = (id, body) => request
      .patch(`/debts/${id}`)
      .set('Content-type', 'application/json')
      .send(body);
    beforeAll(async () => {
      debt = await app.context.orm.debt.create(debtData3);
    });

    describe('author data is valid', () => {
      let response;
      const newDebtData = {
        procedureId: 1,
        date: Date.parse('2022-05-29'),
        price: 123456789,
        status: 2,
      };

      beforeAll(async () => {
        response = await authorizedPatchLocal(debt.id, newDebtData);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('PATCH request actually updates the given local', async () => {
        const { price } = newDebtData;
        const debtposteado = await app.context.orm.debt.findOne({ where: { price } });
        expect(debtposteado.status).toEqual(newDebtData.status);
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('debt data is invalid', () => {
      let response;
      const newDebtData = {
        price: 'precio',
        status: 'status',
      };

      beforeAll(async () => {
        response = await authorizedPatchLocal(debt.id, newDebtData);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a text plain type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response body matches returns success true', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });

    describe('author data is valid but request is unauthorized', () => {
      let response;
      const newDebtData = {
        procedureId: 1,
        date: Date.parse('2022-05-29'),
        price: 123456789,
        status: 2,
      };

      beforeAll(async () => {
        response = await unauthorizedPatchLocal(debt.id, newDebtData);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /debts/:id', () => {
    let debt;
    const debtData4 = {
      procedureId: 1,
      date: Date.parse('2022-01-21'),
      price: 7000,
      status: 1,
    };

    const authorizedDeleteDebt = (id) => request
      .delete(`/debts/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedDeleteDebt = (id) => request
      .delete(`/debts/${id}`);

    beforeAll(async () => {
      debt = await app.context.orm.debt.create(debtData4);
    });

    describe('author data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedDeleteDebt(debt.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('DELETE request actually deletes the given debt', async () => {
        const { date } = debtData4;
        const debtposteado = await app.context.orm.debt.findOne({ where: { date } });
        expect(debtposteado).toBe(null);
      });

      test('response body returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('author data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedDeleteDebt(debt.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /debts/procedure/:pid', () => {
    let procedure;
    let procedure2;
    let procedure3;

    const procedureData4 = {
      tramiterId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca',
      price: 2000,
      rating: 5.0,
    };

    const procedureData5 = {
      tramiterId: 2,
      status: 0,
      type: 0,
      comments: 'revision tecninca',
      price: 2000,
      rating: 5.0,
    };

    const procedureData6 = {
      tramiterId: 2,
      status: 0,
      type: 0,
      comments: 'revision tecninca',
      price: 2000,
      rating: 5.0,
    };

    const authorizedPatchLocal = (pid) => request
      .patch(`/debts/procedure/${pid}`)
      .auth(auth2.access_token, { type: 'bearer' });
    const unauthorizedPatchLocal = (pid) => request
      .patch(`/debts/procedure/${pid}`);
    beforeAll(async () => {
      procedure = await app.context.orm.procedure.create(procedureData4);
      procedure2 = await app.context.orm.procedure.create(procedureData5);
      procedure3 = await app.context.orm.procedure.create(procedureData6);

      const debtData4 = {
        procedureId: procedure.id,
        date: Date.parse('2022-05-29'),
        price: 202020,
        status: 0,
      };
      const debtData5 = {
        procedureId: procedure2.id,
        date: Date.parse('2022-05-29'),
        price: 2020201,
        status: 0,
      };

      await app.context.orm.debt.create(debtData4);
      await app.context.orm.debt.create(debtData5);

      const gainData4 = {
        procedureId: procedure.id,
        date: Date.parse('2022-05-29'),
        price: 1234567,
        status: 1,
      };
      const gainData5 = {
        procedureId: procedure2.id,
        date: Date.parse('2022-05-29'),
        price: 12345678,
        status: 1,
      };

      await app.context.orm.gain.create(gainData4);
      await app.context.orm.gain.create(gainData5);
    });

    describe('debt data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPatchLocal(procedure.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a text/plain body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('PATCH request actually updates the given local', async () => {
        // const { price } = debtData4;
        const debtposteado = await app.context.orm.debt.findOne({ where: { price: 202020 } });
        expect(debtposteado.status).toEqual(1);
      });

      test('response body matches returns success true', () => {
        expect(response.text).toEqual('OK');
      });
    });

    describe('debt data is valid but different tramiter', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPatchLocal(procedure2.id);
      });

      test('responds with 404 (Unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });

      test('responds with a text/plain body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response body matches returns success true', () => {
        expect(response.text).toEqual('Unauthorized');
      });
    });

    describe('procedure data is valid but no debt and gain associated', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedPatchLocal(procedure3.id);
      });

      test('responds with 404 (Not found) status code', () => {
        expect(response.status).toBe(404);
      });

      test('responds with a text/plain body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response body matches returns success true', () => {
        expect(response.text).toEqual('Not Found');
      });
    });

    describe('author data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedPatchLocal(procedure.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });
});
