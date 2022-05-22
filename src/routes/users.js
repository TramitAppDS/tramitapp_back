const KoaRouter = require('koa-router');

const { valPassUser } = require('../helpers/auth');

const router = new KoaRouter();

router.get('users.show.all', '/', async (ctx) => {
  try {
    const users = await ctx.orm.user.findAll({
      attributes: {
        exclude: ['password'],
      },
    });
    if (!users) {
      ctx.throw(404);
    } else {
      ctx.body = users;
    }
    ctx.body = users;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('users.show.one', '/:id', async (ctx) => {
  try {
    const user = await ctx.orm.user.findByPk(
      ctx.params.id,
      { attributes: ['firstName', 'lastName', 'email', 'admin', 'phone'] },
    );
    if (!user) {
      ctx.throw(404);
    } else {
      ctx.body = user;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('users.patch', '/:id', async (ctx) => {
  const newInfo = ctx.request.body;
  try {
    if (ctx.state.currentUser.id === Number(ctx.params.id)) {
      const user = ctx.state.currentUser;
      if (await valPassUser(newInfo, ctx)) {
        await user.update(newInfo);
        ctx.body = { success: true };
        ctx.status = 200;
      } else {
        ctx.throw(400, 'Contraseña incorrecta');
      }
    } else {
      ctx.throw(401, 'No es el usuario loggeado');
    }
  } catch (ValidationError) {
    ctx.body = {
      success: false,
      message: ValidationError.message,
    };
    ctx.status = ValidationError.status;
  }
});

router.delete('api.user.delete', '/:id', async (ctx) => {
  try {
    const user = await ctx.orm.user.findByPk(ctx.params.id);
    if (Number(ctx.state.currentUser.id) === Number(ctx.params.id)) {
      if (user) {
        await user.destroy();
        ctx.body = { success: true };
      } else {
        ctx.throw(404);
      }
    } else {
      ctx.throw(403);
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
    ctx.body = { success: false };
  }
});

module.exports = router;
