const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('gain.show.all', '/', async (ctx) => {
  try {
    const gain = await ctx.orm.gain.findAll();
    if (!gain) {
      ctx.throw(404);
    } else {
      ctx.body = gain;
    }
    ctx.body = gain;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('gain.show.one', '/:id', async (ctx) => {
  try {
    const gain = await ctx.orm.gain.findByPk(Number(ctx.params.id));
    if (!gain) {
      ctx.throw(404);
    } else {
      ctx.body = gain;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('gain.patch', '/:id', async (ctx) => {
  const newInfo = ctx.request.body;
  try {
    const gain = await ctx.orm.gain.findByPk(Number(ctx.params.id));
    await gain.update(newInfo);
    ctx.body = { success: true };
    ctx.status = 200;
  } catch (ValidationError) {
    ctx.body = {
      success: false,
      message: ValidationError.message,
    };
    ctx.status = ValidationError.status;
  }
});

router.delete('gain.delete', '/:id', async (ctx) => {
  try {
    const gain = await ctx.orm.gain.findByPk(ctx.params.id);
    await gain.destroy();
    ctx.body = { success: true };
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
    ctx.body = { success: false };
  }
});

router.post('gain.post', '/', async (ctx) => {
  try {
    const {
      procedureId, date, price, status,
    } = ctx.request.body;
    await ctx.orm.gain.create({
      procedureId, date, price, status,
    });
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

module.exports = router;
