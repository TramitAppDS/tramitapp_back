require('dotenv').config();
const KoaRouter = require('koa-router');

const { generateToken } = require('../helpers/auth');

const router = new KoaRouter();

router.post('api.auth.login.tramiter', '/login/tramiter', async (ctx) => {
  const { email, password } = ctx.request.body;
  const tramiter = await ctx.orm.tramiter.findOne({ where: { email } });
  if (!tramiter) ctx.throw(404, `No hay tramiter con el mail: ${email}`);
  const authenticated = await tramiter.checkPassword(password);
  if (!authenticated) ctx.throw(401, 'Contraseña invalida');
  if (tramiter.approved === false) { ctx.throw(401, 'No estas aprobado'); }
  try {
    const token = await generateToken(tramiter);
    // follow OAuth RFC6749 response standart
    // https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
    const toSendTramiter = {
      firstName: tramiter.firstName,
      lastName: tramiter.lastName,
      id: tramiter.id,
      phone: tramiter.phone,
      email,
      aproved: tramiter.approved,
      rating: tramiter.rating,
      city: tramiter.city,
      commune: tramiter.commune,
      bank: tramiter.bank,
      accountType: tramiter.accountType,
      accountNumber: tramiter.accountNumber,
      rut: tramiter.rut,
    };
    ctx.body = {
      ...toSendTramiter,
      access_token: token,
      token_type: 'Bearer',
    };
  } catch (error) {
    ctx.throw(500);
  }
});

router.post('api.auth.login.user', '/login/user', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { email } });
  if (!user) ctx.throw(404, `No hay usuario para el mail: ${email}`);
  const authenticated = await user.checkPassword(password);
  if (!authenticated) ctx.throw(401, 'Contraseña invalida');
  try {
    const token = await generateToken(user);
    // follow OAuth RFC6749 response standart
    // https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
    const toSendUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      email,
      admin: user.admin,
      phone: user.phone,
    };
    ctx.body = {
      ...toSendUser,
      access_token: token,
      token_type: 'Bearer',
    };
  } catch (error) {
    ctx.throw(500);
  }
});

router.post('users.register.user', '/register/user', async (ctx) => {
  try {
    const {
      firstName, lastName, phone, email, password,
    } = ctx.request.body;
    const user = await ctx.orm.user.findOne({ where: { email } });
    if (user) {
      ctx.throw(401, 'Email ya esta siendo utilizado');
    } else {
      await ctx.orm.user.create({
        firstName, lastName, phone, email, password,
      });
      ctx.status = 201;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
    ctx.body = ValidationError.message;
  }
});

router.post('users.register.tramiter', '/register/tramiter', async (ctx) => {
  try {
    const {
      firstName, lastName, phone, email, password, city, commune,
    } = ctx.request.body;
    const tramiter = await ctx.orm.tramiter.findOne({ where: { email } });
    if (tramiter) {
      ctx.throw(401, 'Email ya esta siendo utilizado');
    } else {
      await ctx.orm.tramiter.create({
        firstName, lastName, phone, email, password, city, commune,
      });
      ctx.status = 201;
    }
  } catch (ValidationError) {
    ctx.body = ValidationError.message;
    ctx.status = ValidationError.status;
  }
});

module.exports = router;
