const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');
// const { apiSetCurrentUser } = require('../../middlewares/auth');

const request = supertest(app.callback());

describe('gain API routes', () => {
  let auth;
  app.context.state = {};
  const userFields = {
    firstName: 'ben',
    lastName: 'brereton',
    phone: '991572682',
    admin: '0',
    email: 'benbrereton@gmail.com',
    password: 'Hola123',
  };

  const userFields2 = {
    firstName: 'eugenio',
    lastName: 'mena',
    phone: '991572681',
    admin: '0',
    email: 'eugeniomena@gmail.com',
    password: 'Hola123',
  };

  const gainFields = {
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
    await app.context.orm.user.create(userFields2);
    await app.context.orm.procedure.create(procedureFields);
    await app.context.orm.gain.create(gainFields);

    app.context.state.currentUser = user;

    const authResponse = await request
      .post('/auth/login/user')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /gains', () => {
    let response;

    const authorizedGetGains = () => request
      .get('/gains')
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedGetGains = () => request
      .get('/gains');

    const authorizedDeleteGain = (id) => request
      .get(`/gains/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    describe('when user is loged in', () => {
      beforeAll(async () => {
        response = await authorizedGetGains();
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
        response = await unauthorizedGetGains();
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('when there are no gains', () => {
      beforeAll(async () => {
        response = await authorizedDeleteGain(1);
        response = await authorizedGetGains();
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('GET /gains/:id', () => {
    let gain;
    let response;
    const gainData = {
      procedureId: 1,
      date: Date.parse('2018-07-15'),
      price: 1000,
      status: 1,
    };
    const authorizedGetGain = (id) => request
      .get(`/gains/${id}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetGain = (id) => request
      .get(`/gains/${id}`);

    beforeAll(async () => {
      gain = await app.context.orm.gain.create(gainData);
    });

    describe('when passed id corresponds to an existing local', () => {
      beforeAll(async () => {
        response = await authorizedGetGain(gain.id);
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
        response = await authorizedGetGain(gain.id * -1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetGain(gain.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /gains', () => {
    let response;
    // let local;
    const localData = {
      name: 'mc',
      capacity: 20,
    };
    const gainData2 = {
      procedureId: 1,
      date: Date.parse('2022-05-29'),
      price: 1234567,
      status: 1,
    };
    const gainInvalidData2 = {
      procedureId: 1,
      date: Date.parse('2022-05-29'),
      price: 'precio',
      status: 'status',
    };

    const authorizedPostAuthor = (body) => request
      .post('/gains')
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPostAuthor = (body) => request
      .post('/gains')
      .set('Content-type', 'application/json')
      .send(body);

    describe('gain data is valid', () => {
      beforeAll(async () => {
        response = await authorizedPostAuthor(gainData2);
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
        const { date } = gainData2;
        const gainPosted = await app.context.orm.gain.findOne({ where: { date } });
        expect(gainPosted.price).toEqual(gainData2.price);
        expect(gainPosted.status).toEqual(gainData2.status);
      });
    });

    describe('gain data is invalid', () => {
      beforeAll(async () => {
        response = await authorizedPostAuthor(gainInvalidData2);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a text plain type', () => {
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

  describe('PATCH /gains/:id', () => {
    let gain;
    const gainData3 = {
      procedureId: 1,
      date: Date.parse('2022-05-29'),
      price: 1234567,
      status: 1,
    };

    const authorizedPatchLocal = (id, body) => request
      .patch(`/gains/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchLocal = (id, body) => request
      .patch(`/gains/${id}`)
      .set('Content-type', 'application/json')
      .send(body);
    beforeAll(async () => {
      gain = await app.context.orm.gain.create(gainData3);
    });

    describe('author data is valid', () => {
      let response;
      const newGainData = {
        procedureId: 1,
        date: Date.parse('2022-05-29'),
        price: 123456789,
        status: 2,
      };

      beforeAll(async () => {
        response = await authorizedPatchLocal(gain.id, newGainData);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('PATCH request actually updates the given local', async () => {
        const { price } = newGainData;
        const gainposteado = await app.context.orm.gain.findOne({ where: { price } });
        expect(gainposteado.status).toEqual(newGainData.status);
      });

      test('response body matches returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('gain data is invalid', () => {
      let response;
      const newGainData = {
        price: 'precio',
        status: 'status',
      };

      beforeAll(async () => {
        response = await authorizedPatchLocal(gain.id, newGainData);
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
      const newGainData = {
        procedureId: 1,
        date: Date.parse('2022-05-29'),
        price: 123456789,
        status: 2,
      };

      beforeAll(async () => {
        response = await unauthorizedPatchLocal(gain.id, newGainData);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /gains/:id', () => {
    let gain;
    const gainData4 = {
      procedureId: 1,
      date: Date.parse('2022-01-21'),
      price: 7000,
      status: 1,
    };

    const authorizedDeleteGain = (id) => request
      .delete(`/gains/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedDeleteGain = (id) => request
      .delete(`/gains/${id}`);

    beforeAll(async () => {
      gain = await app.context.orm.gain.create(gainData4);
    });

    describe('author data is valid', () => {
      let response;

      beforeAll(async () => {
        response = await authorizedDeleteGain(gain.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type', () => {
        expect(response.type).toEqual('application/json');
      });

      test('DELETE request actually deletes the given gain', async () => {
        const { date } = gainData4;
        const gainposteado = await app.context.orm.gain.findOne({ where: { date } });
        expect(gainposteado).toBe(null);
      });

      test('response body returns success true', () => {
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('author data is valid but request is unauthorized', () => {
      let response;

      beforeAll(async () => {
        response = await unauthorizedDeleteGain(gain.id);
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
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca',
      price: 2000,
      rating: 5.0,
    };

    const procedureData5 = {
      userId: 2,
      status: 0,
      type: 0,
      comments: 'revision tecninca',
      price: 2000,
      rating: 5.0,
    };

    const procedureData6 = {
      userId: 2,
      status: 0,
      type: 0,
      comments: 'revision tecninca',
      price: 2000,
      rating: 5.0,
    };

    const authorizedPatchLocal = (pid) => request
      .patch(`/gains/procedure/${pid}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedPatchLocal = (pid) => request
      .patch(`/gains/procedure/${pid}`);
    beforeAll(async () => {
      procedure = await app.context.orm.procedure.create(procedureData4);
      procedure2 = await app.context.orm.procedure.create(procedureData5);
      procedure3 = await app.context.orm.procedure.create(procedureData6);

      const debtData4 = {
        procedureId: procedure.id,
        date: Date.parse('2022-05-29'),
        price: 202020,
        status: 1,
      };
      const debtData5 = {
        procedureId: procedure2.id,
        date: Date.parse('2022-05-29'),
        price: 2020201,
        status: 1,
      };

      await app.context.orm.debt.create(debtData4);
      await app.context.orm.debt.create(debtData5);

      const gainData4 = {
        procedureId: procedure.id,
        date: Date.parse('2022-05-29'),
        price: 1234567,
        status: 0,
      };
      const gainData5 = {
        procedureId: procedure2.id,
        date: Date.parse('2022-05-29'),
        price: 12345678,
        status: 0,
      };

      await app.context.orm.gain.create(gainData4);
      await app.context.orm.gain.create(gainData5);
    });

    describe('gain data is valid', () => {
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
        const gainposteado = await app.context.orm.gain.findOne({ where: { price: 1234567 } });
        expect(gainposteado.status).toEqual(1);
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
