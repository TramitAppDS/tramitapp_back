const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('debt.show.all', '/', async (ctx) => {
  try {
    const debt = await ctx.orm.debt.findAll();
    if (!debt) {
      ctx.throw(404);
    } else {
      ctx.body = debt;
    }
    ctx.body = debt;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('debt.show.one', '/:id', async (ctx) => {
  try {
    const debt = await ctx.orm.debt.findByPk(Number(ctx.params.id));
    if (!debt) {
      ctx.throw(404);
    } else {
      ctx.body = debt;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('debt.patch', '/:id', async (ctx) => {
  const newInfo = ctx.request.body;
  try {
    const debt = await ctx.orm.debt.findByPk(Number(ctx.params.id));
    await debt.update(newInfo);
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

router.delete('debt.delete', '/:id', async (ctx) => {
  try {
    const debt = await ctx.orm.debt.findByPk(ctx.params.id);
    await debt.destroy();
    ctx.body = { success: true };
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
    ctx.body = { success: false };
  }
});

router.post('debt.post', '/', async (ctx) => {
  try {
    const {
      procedureId, date, price, status,
    } = ctx.request.body;
    await ctx.orm.debt.create({
      procedureId, date, price, status,
    });
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

module.exports = router;
