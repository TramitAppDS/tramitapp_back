const KoaRouter = require('koa-router');

const { valPassTramiter } = require('../helpers/auth');

const router = new KoaRouter();

router.get('tramiters.show.all', '/', async (ctx) => {
  try {
    const tramiters = await ctx.orm.tramiter.findAll({
      attributes: {
        exclude: ['password'],
      },
    });
    if (!tramiters) {
      ctx.throw(404);
    } else {
      ctx.body = tramiters;
    }
    ctx.body = tramiters;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('tramiters.show.one', '/:id', async (ctx) => {
  try {
    const tramiter = await ctx.orm.tramiter.findByPk(
      ctx.params.id,
      { attributes: ['firstName', 'lastName', 'email', 'approved', 'phone', 'commune', 'city'] },
    );
    if (!tramiter) {
      ctx.throw(404);
    } else {
      ctx.body = tramiter;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('tramiters.patch', '/:id', async (ctx) => {
  const newInfo = ctx.request.body;
  try {
    if (ctx.state.currenttramiter.id === Number(ctx.params.id)) {
      const tramiter = ctx.state.currenttramiter;
      if (await valPassTramiter(newInfo, ctx)) {
        await tramiter.update(newInfo);
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

router.delete('api.tramiter.delete', '/:id', async (ctx) => {
  try {
    const tramiter = await ctx.orm.tramiter.findByPk(ctx.params.id);
    if (Number(ctx.state.currenttramiter.id) === Number(ctx.params.id)) {
      if (tramiter) {
        await tramiter.destroy();
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
