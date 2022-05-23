const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');

const { apiSetCurrentUser, apiSetCurrentTramiter } = require('./middlewares/auth');

const hello = require('./routes/hello');
const index = require('./routes/index');
const auth = require('./routes/auth');
const users = require('./routes/users');
const tramiters = require('./routes/tramiters');
const procedures = require('./routes/procedures');

const router = new KoaRouter();

// unprotected routes
router.use('/', index.routes());
router.use('/auth', auth.routes());

// protected routes
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);
router.use(apiSetCurrentTramiter);

router.use('/hello', hello.routes());
router.use('/users', users.routes());
router.use('/tramiters', tramiters.routes());
router.use('/procedures', procedures.routes());

module.exports = router;
