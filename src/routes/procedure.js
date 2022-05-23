const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('procedures.show.all', '/', async (ctx) => {
  try {
    const procedures = await ctx.orm.procedure.findAll();
    if (!procedures) {
      ctx.throw(404);
    } else {
      ctx.body = procedures;
    }
    ctx.body = procedures;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('procedures.show.one', '/:id', async (ctx) => {
  try {
    const procedure = await ctx.orm.procedure.findByPk(Number(ctx.params.id));
    if (!procedure) {
      ctx.throw(404);
    } else {
      ctx.body = procedure;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('procedures.patch', '/:id', async (ctx) => {
  const newInfo = ctx.request.body;
  try {
    const procedure = await ctx.orm.procedure.findByPk(Number(ctx.params.id));
    await procedure.update(newInfo);
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

router.delete('procedure.delete', '/:id', async (ctx) => {
  try {
    const procedure = await ctx.orm.procedure.findByPk(ctx.params.id);
    await procedure.destroy();
    ctx.body = { success: true };
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
    ctx.body = { success: false };
  }
});

router.post('procedures.post', '/', async (ctx) => {
  try {
    const {
      userId, tramiterId, status, type, comments, price, rating,
    } = ctx.request.body;
    await ctx.orm.procedure.create({
      userId, tramiterId, status, type, comments, price, rating,
    });
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

module.exports = router;
