const supertest = require('supertest');
// const { format } = require('date-fns');
const app = require('../app');
// const { apiSetCurrentUser } = require('../../middlewares/auth');

const request = supertest(app.callback());

describe('procedure API routes', () => {
  let auth;
  let auth2;
  let auth3;
  let tramiter;
  let tramiter2;
  app.context.state = {};

  const userFields = {
    firstName: 'charles',
    lastName: 'aranguiz',
    phone: '972672772',
    admin: 0,
    email: 'charlesaranguiz@gmail.com',
    password: 'Hola123',
  };
  const tramiterFields = {
    firstName: 'diego',
    lastName: 'valencia',
    phone: '952072393',
    approved: 1,
    email: 'diegovalencia@gmail.com',
    password: 'Hola123',
    city: 'Santiago',
    commune: 'Viña del mar',
    rating: 4.0,
  };
  const tramiterFields2 = {
    firstName: 'fernando',
    lastName: 'zampedri',
    phone: '952174393',
    approved: 1,
    email: 'fernandozampedri@gmail.com',
    password: 'Hola123',
    city: 'Santiago',
    commune: 'Las Condes',
    rating: 5.0,
  };

  const procedureFields = {
    userId: 1,
    status: 0,
    type: 0,
    comments: 'revision tecninca',
    price: 2000,
    rating: 5.0,
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    const user = await app.context.orm.user.create(userFields);
    tramiter = await app.context.orm.tramiter.create(tramiterFields);
    tramiter2 = await app.context.orm.tramiter.create(tramiterFields2);
    await app.context.orm.procedure.create(procedureFields);

    app.context.state.currentuser = user;
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
    const authResponse3 = await request
      .post('/auth/login/tramiter')
      .set('Content-type', 'application/json')
      .send({ email: tramiterFields2.email, password: tramiterFields2.password });
    auth3 = authResponse3.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /procedures', () => {
    let response;

    const authorizedGetProcedures = () => request
      .get('/procedures')
      .auth(auth.access_token, { type: 'bearer' });

    const unauthorizedGetProcedures = () => request
      .get('/procedures');

    const authorizedDeleteProcedures = (id) => request
      .delete(`/procedures/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    describe('when user is loged in', () => {
      beforeAll(async () => {
        response = await authorizedGetProcedures();
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
        response = await unauthorizedGetProcedures();
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });

    describe('when there are no procedures', () => {
      beforeAll(async () => {
        response = await authorizedDeleteProcedures(1);
        response = await authorizedGetProcedures();
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('GET /procedures/:id', () => {
    let procedure;
    let response;
    const procedureData = {
      userId: 1,
      procedureId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca camion',
      price: 10000,
      rating: 4.0,
    };

    const authorizedGetProcedure = (id) => request
      .get(`/procedures/${id}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetProcedure = (id) => request
      .get(`/procedures/${id}`);

    beforeAll(async () => {
      procedure = await app.context.orm.procedure.create(procedureData);
    });

    describe('when passed id corresponds to an existing tramiter', () => {
      beforeAll(async () => {
        response = await authorizedGetProcedure(procedure.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when passed id does not corresponds to an existing procedure', () => {
      beforeAll(async () => {
        response = await authorizedGetProcedure(procedure.id * -1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetProcedure(procedure.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /procedures/user/:uid', () => {
    let response;

    const authorizedGetProcedure = (uid) => request
      .get(`/procedures/user/${uid}`)
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetProcedure = (uid) => request
      .get(`/procedures/user/${uid}`);

    beforeAll(async () => {
      // procedure = await app.context.orm.procedure.create(procedureData2);
    });

    describe('when passed id corresponds to an existing tramiter', () => {
      beforeAll(async () => {
        response = await authorizedGetProcedure(app.context.state.currentuser.id);
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
        response = await authorizedGetProcedure(app.context.state.currentuser.id * -1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(200);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetProcedure(app.context.state.currentuser.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /procedures/tramiter/null', () => {
    let response;

    const authorizedGetProcedure = () => request
      .get('/procedures/tramiter/null')
      .auth(auth.access_token, { type: 'bearer' });
    const unauthorizedGetProcedure = () => request
      .get('/procedures/tramiter/null');

    beforeAll(async () => {
      // procedure = await app.context.orm.procedure.create(procedureData2);
    });

    describe('when passed id corresponds to an existing tramiter', () => {
      beforeAll(async () => {
        response = await authorizedGetProcedure();
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a json body type', () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      beforeAll(async () => {
        response = await unauthorizedGetProcedure(app.context.state.currentuser.id);
      });

      test('responds with 401 (unauthorized) status code', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /procedures', () => {
    let response;
    const procedureData2 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca moto',
      price: 20000,
      rating: 4.0,
    };
    const procedureInvalidData2 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca bus',
      price: 'precio',
      rating: 'rating',
    };

    const authorizedPostProcedure = (body) => request
      .post('/procedures')
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPostProcedure = (body) => request
      .post('/procedures')
      .set('Content-type', 'application/json')
      .send(body);

    describe('procedure data is valid', () => {
      beforeAll(async () => {
        response = await authorizedPostProcedure(procedureData2);
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
        const { comments } = procedureData2;
        const procedurePosted = await app.context.orm.procedure.findOne({ where: { comments } });
        expect(procedurePosted.price).toEqual(procedureData2.price);
        expect(procedurePosted.rating).toEqual(procedureData2.rating);
      });
    });

    describe('procedure data is invalid', () => {
      beforeAll(async () => {
        response = await authorizedPostProcedure(procedureInvalidData2);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a text plain body type', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns Internal Server Error', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });

    describe('author data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        response = await unauthorizedPostProcedure(procedureData2);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /procedures', () => {
    let response;
    const procedureData3 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca minivan',
      price: 20000,
      rating: 4.0,
    };
    const newProcedureData3 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca bus',
      price: 40000,
      rating: 5.0,
    };
    const newProcedureInvalidData3 = {
      price: 'precio',
      rating: 'rating',
    };

    const authorizedPatchProcedure = (id, body) => request
      .patch(`/procedures/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchProcedure = (id, body) => request
      .patch(`/procedures/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('procedure data is valid', () => {
      beforeAll(async () => {
        const procedure3 = await app.context.orm.procedure.create(procedureData3);
        response = await authorizedPatchProcedure(procedure3.id, newProcedureData3);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response text returns created', () => {
        expect(response.body).toEqual({ success: true });
      });

      test('patch request actually updates the given procedure', async () => {
        const { comments } = newProcedureData3;
        const procedurePatched = await app.context.orm.procedure.findOne({ where: { comments } });
        expect(procedurePatched.price).toEqual(newProcedureData3.price);
        expect(procedurePatched.rating).toEqual(newProcedureData3.rating);
        expect(procedurePatched.comments).toEqual(newProcedureData3.comments);
      });
    });

    describe('procedure data is invalid', () => {
      beforeAll(async () => {
        const procedure3 = await app.context.orm.procedure.create(procedureData3);
        response = await authorizedPatchProcedure(procedure3.id, newProcedureInvalidData3);
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
        const procedure3 = await app.context.orm.procedure.create(procedureData3);
        response = await unauthorizedPatchProcedure(procedure3.id, newProcedureData3);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /procedures', () => {
    let response;
    const procedureData4 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca delivery',
      price: 6000,
      rating: 3.0,
    };

    const authorizedDeleteProcedure = (id) => request
      .delete(`/procedures/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const unauthorizedDeleteProcedure = (id) => request
      .delete(`/procedures/${id}`)
      .set('Content-type', 'application/json');

    describe('procedure data is valid', () => {
      beforeAll(async () => {
        const procedure4 = await app.context.orm.procedure.create(procedureData4);
        response = await authorizedDeleteProcedure(procedure4.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response text returns created', () => {
        expect(response.body).toEqual({ success: true });
      });

      test('delete request actually deletes the given procedure', async () => {
        const { comments } = procedureData4;
        const procedurePatched = await app.context.orm.procedure.findOne({ where: { comments } });
        expect(procedurePatched).toEqual(null);
      });
    });

    describe('procedure data is invalid', () => {
      beforeAll(async () => {
        response = await authorizedDeleteProcedure(-1);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a text body type, esta malo', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns none', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });

    describe('procedure data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const procedure4 = await app.context.orm.procedure.create(procedureData4);
        response = await unauthorizedDeleteProcedure(procedure4.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /procedures/accept/:id', () => {
    let response;
    let response2;
    const procedureData4 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca por tramiter diego',
      price: 20000,
      rating: 4.0,
    };

    const authorizedPatchProcedure = (id) => request
      .patch(`/procedures/accept/${id}`)
      .auth(auth2.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const unauthorizedPatchProcedure = (id) => request
      .patch(`/procedures/accept/${id}`)
      .set('Content-type', 'application/json');
    const unauthorizedPatchProcedure2 = (id) => request
      .patch(`/procedures/accept/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');

    describe('procedure data is valid', () => {
      beforeAll(async () => {
        const procedure4 = await app.context.orm.procedure.create(procedureData4);
        response = await authorizedPatchProcedure(procedure4.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response text returns created', () => {
        expect(response.body).toEqual({ success: true });
      });

      test('patch request actually updates the given procedure', async () => {
        const { comments } = procedureData4;
        const procedurePatched = await app.context.orm.procedure.findOne({ where: { comments } });
        expect(procedurePatched.tramiterId).toEqual(app.context.state.currentTramiter.id);
        expect(procedurePatched.status).toEqual(1);
      });
    });

    describe('procedure already has a tramiter', () => {
      beforeAll(async () => {
        const procedure4 = await app.context.orm.procedure.create(procedureData4);
        response = await authorizedPatchProcedure(procedure4.id);
        response2 = await authorizedPatchProcedure(procedure4.id);
      });

      test('responds with 403 (ok) status code', () => {
        expect(response2.status).toBe(403);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response2.type).toEqual('application/json');
      });

      test('response body returns Forbidden', () => {
        expect(response2.body.message).toEqual('Forbidden');
        expect(response2.body.success).toEqual(false);
      });
    });

    describe('procedure data is invalid', () => {
      beforeAll(async () => {
        await app.context.orm.procedure.create(procedureData4);
        response = await authorizedPatchProcedure(-1);
      });

      test('responds with 404 (not found) status code', () => {
        expect(response.status).toBe(404);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response text returns created', () => {
        expect(response.body.message).toEqual('Not Found');
        expect(response.body.success).toEqual(false);
      });
    });

    describe('procedure data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const procedure4 = await app.context.orm.procedure.create(procedureData4);
        response = await unauthorizedPatchProcedure(procedure4.id);
        expect(response.status).toBe(401);
      });
    });

    describe('procedure data is valid but there is no current tramiter', () => {
      beforeAll(async () => {
        app.context.state.currentTramiter = null;
        const procedure = await app.context.orm.procedure.create(procedureData4);
        response = await unauthorizedPatchProcedure2(procedure.id);
      });

      test('responds with 401 status code', async () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('PATCH /procedures/close/:id', () => {
    let response;

    const procedureData5 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca terminada',
      price: 20000,
      rating: 4.0,
    };

    const authorizedPatchAcceptProcedure = (id) => request
      .patch(`/procedures/accept/${id}`)
      .auth(auth2.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const authorizedPatchProcedure = (id) => request
      .patch(`/procedures/close/${id}`)
      .auth(auth2.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const unauthorizedPatchProcedure = (id) => request
      .patch(`/procedures/close/${id}`)
      .set('Content-type', 'application/json');
    const unauthorizedPatchProcedure2 = (id) => request
      .patch(`/procedures/close/${id}`)
      .auth(auth3.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');

    describe('procedure data is valid', () => {
      beforeAll(async () => {
        const procedure5 = await app.context.orm.procedure.create(procedureData5);
        await authorizedPatchAcceptProcedure(procedure5.id);
        response = await authorizedPatchProcedure(procedure5.id);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a JSON body type, esta malo', () => {
        expect(response.type).toEqual('application/json');
      });

      test('response text returns created', () => {
        expect(response.body).toEqual({ success: true });
      });

      test('patch request actually updates the given procedure', async () => {
        const { comments } = procedureData5;
        const procedurePatched = await app.context.orm.procedure.findOne({ where: { comments } });
        expect(procedurePatched.status).toEqual(2);
      });
    });

    describe('procedure data is invalid', () => {
      beforeAll(async () => {
        const procedure5 = await app.context.orm.procedure.create(procedureData5);
        await authorizedPatchAcceptProcedure(procedure5.id);
        response = await authorizedPatchProcedure(-1);
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

    describe('procedure data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const procedure5 = await app.context.orm.procedure.create(procedureData5);
        response = await unauthorizedPatchProcedure(procedure5.id);
        expect(response.status).toBe(401);
      });
    });

    describe('procedure data is valid but there is no current tramiter', () => {
      let procedure5;

      beforeAll(async () => {
        procedure5 = await app.context.orm.procedure.create(procedureData5);
        await authorizedPatchAcceptProcedure(procedure5.id);
        app.context.state.currentTramiter = tramiter2;
      });

      test('responds with 401 status code', async () => {
        response = await unauthorizedPatchProcedure2(procedure5.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /procedures/rating/:id', () => {
    let response;

    const procedureData6 = {
      userId: 1,
      status: 0,
      type: 0,
      comments: 'revision tecninca terminada',
      price: 20000,
      rating: 4.0,
    };
    const newProcedureData6 = {
      rating: 5.0,
    };
    const newProcedureInvalidData6 = {
      rating: 'rating',
    };

    const authorizedPatchAcceptProcedure = (id) => request
      .patch(`/procedures/accept/${id}`)
      .auth(auth2.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json');
    const authorizedPatchProcedure = (id, body) => request
      .patch(`/procedures/rating/${id}`)
      .auth(auth2.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(body);
    const unauthorizedPatchProcedure = (id, body) => request
      .patch(`/procedures/rating/${id}`)
      .set('Content-type', 'application/json')
      .send(body);

    describe('procedure data is valid', () => {
      let procedure6;

      beforeAll(async () => {
        procedure6 = await app.context.orm.procedure.create(procedureData6);
        await authorizedPatchAcceptProcedure(procedure6.id);
        response = await authorizedPatchProcedure(procedure6.id, newProcedureData6);
      });

      test('responds with 200 (ok) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a text plain body type, esta malo', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns created', () => {
        expect(response.text).toEqual('OK');
      });

      test('patch request actually updates the given procedure', async () => {
        const { id } = procedure6;
        const procedurePatched = await app.context.orm.procedure.findOne({ where: { id } });
        expect(procedurePatched.rating).toEqual(newProcedureData6.rating);
      });
    });

    describe('procedure data is invalid', () => {
      let procedure6;

      beforeAll(async () => {
        procedure6 = await app.context.orm.procedure.create(procedureData6);
        await authorizedPatchAcceptProcedure(procedure6.id);
        response = await authorizedPatchProcedure(procedure6.id, newProcedureInvalidData6);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(200);
      });

      test('responds with a text plain body type, esta malo', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns created', () => {
        expect(response.text).toEqual('OK');
      });
    });

    describe('procedure id is invalid', () => {
      let procedure6;

      beforeAll(async () => {
        procedure6 = await app.context.orm.procedure.create(procedureData6);
        await authorizedPatchAcceptProcedure(procedure6.id);
        response = await authorizedPatchProcedure(-1, newProcedureInvalidData6);
      });

      test('responds with 500 (internal error) status code', () => {
        expect(response.status).toBe(500);
      });

      test('responds with a text plain body type, esta malo', () => {
        expect(response.type).toEqual('text/plain');
      });

      test('response text returns created', () => {
        expect(response.text).toEqual('Internal Server Error');
      });
    });

    describe('procedure data is valid but request is unauthorized', () => {
      test('responds with 401 status code', async () => {
        const procedure6 = await app.context.orm.procedure.create(procedureData6);
        response = await unauthorizedPatchProcedure(procedure6.id, newProcedureData6);
        expect(response.status).toBe(401);
      });
    });
  });
});
