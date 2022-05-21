const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('hello.name', '/:name', (ctx) => {
  ctx.body = { message: `Hello ${ctx.params.name}!` };
});

module.exports = router;
