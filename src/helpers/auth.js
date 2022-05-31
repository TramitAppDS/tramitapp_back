const jwtgenerator = require('jsonwebtoken');

async function valPassUser(newInf, ctx) {
  const newInfo = newInf;
  if (await ctx.state.currentUser.checkPassword(newInfo.password)) {
    if (newInfo.newPassword !== '') {
      newInfo.password = newInfo.newPassword;
    }
    delete newInfo.newPassword;
    return true;
  }
  return false;
}

async function valPassTramiter(newInf, ctx) {
  const newInfo = newInf;
  if (await ctx.state.currentTramiter.checkPassword(newInfo.password)) {
    if (newInfo.newPassword !== '') {
      newInfo.password = newInfo.newPassword;
    }
    delete newInfo.newPassword;
    return true;
  }
  return false;
}

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}

module.exports = {
  valPassUser,
  valPassTramiter,
  generateToken,
};
