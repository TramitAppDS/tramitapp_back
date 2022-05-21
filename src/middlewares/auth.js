async function apiSetCurrentUser(ctx, next) {
  const { authData } = ctx.state;
  if (authData) {
    ctx.state.currentUser = await ctx.orm.user.findByPk(authData.sub);
  }
  return next();
}

async function apiSetCurrentTramiter(ctx, next) {
  const { authData } = ctx.state;
  if (authData) {
    ctx.state.currentUser = await ctx.orm.tramiter.findByPk(authData.sub);
  }
  return next();
}

module.exports = {
  apiSetCurrentUser,
  apiSetCurrentTramiter,
};
