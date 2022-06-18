const KoaRouter = require('koa-router');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

router.get('procedures.show.gain', '/gain/:id', async (ctx) => {
  try {
    const gain = await ctx.orm.gain.findOne({ where: { procedureId: ctx.params.id } });
    if (!gain) {
      ctx.throw(404);
    } else {
      ctx.body = gain;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('procedures.show.debt', '/debt/:id', async (ctx) => {
  try {
    const debt = await ctx.orm.debt.findOne({ where: { procedureId: ctx.params.id } });
    if (!debt) {
      ctx.throw(404);
    } else {
      ctx.body = debt;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('users.show.user.procedure', '/user/:uid', async (ctx) => {
  try {
    const procedures = await ctx.orm.procedure.findAll({
      where: { userId: ctx.params.uid },
    });
    if (!procedures) {
      ctx.throw(404);
    } else {
      ctx.body = procedures;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('users.show.tramiter.procedure', '/tramiter/:uid', async (ctx) => {
  try {
    const procedures = await ctx.orm.procedure.findAll({
      where: { tramiterId: ctx.params.uid },
    });
    if (!procedures) {
      ctx.throw(404);
    } else {
      ctx.body = procedures;
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.get('users.show.no.user.procedure', '/null/tramiter', async (ctx) => {
  try {
    const procedures = await ctx.orm.procedure.findAll({
      where: { tramiterId: null },
    });
    if (!procedures) {
      ctx.throw(404);
    } else {
      ctx.body = procedures;
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
      userId, tramiterId, status, address, plate, comments, price, rating,
    } = ctx.request.body;
    await ctx.orm.procedure.create({
      userId, tramiterId, status, comments, price, rating, address, plate,
    });
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('accept.procedure', '/accept/:id', async (ctx) => {
  try {
    const procedure = await ctx.orm.procedure.findByPk(Number(ctx.params.id));
    if (!procedure) {
      ctx.throw(404);
    }
    if (procedure.tramiterId !== null) {
      ctx.throw(403);
    }
    if (ctx.state.currentTramiter) {
      await procedure.update({ tramiterId: ctx.state.currentTramiter.id });
      await procedure.update({ status: 1 });
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com ',
        service: 'gmail',
        auth: {
          user: process.env.MAIL,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const user = await ctx.orm.user.findByPk(procedure.userId);
      const mailOptions = {
        from: process.env.MAIL,
        to: user.email,
        subject: 'Mail de tramite aceptado',
        text: `Su tramite ha sido aceptado y esta siendo realizado por ${ctx.state.currentTramiter.firstName}.`,
      };
      transporter.sendMail(mailOptions);
      ctx.body = { success: true };
      ctx.status = 200;
    } else {
      ctx.throw(401);
    }
  } catch (ValidationError) {
    ctx.body = {
      success: false,
      message: ValidationError.message,
    };
    ctx.status = ValidationError.status;
  }
});

router.patch('close.procedure', '/close/:id', async (ctx) => {
  try {
    const procedure = await ctx.orm.procedure.findByPk(Number(ctx.params.id));
    const tramiter = await ctx.orm.tramiter.findByPk(procedure.tramiterId);
    if (!procedure) {
      ctx.throw(404);
    }
    if (tramiter.id === ctx.state.currentTramiter.id) {
      await procedure.update({ status: 2 });
      await ctx.orm.gain.create({
        procedureId: procedure.id,
        date: new Date(),
        price: procedure.price,
        status: 0,
      });
      await ctx.orm.debt.create({
        procedureId: procedure.id,
        date: new Date(),
        price: procedure.price * 0.9,
        status: 0,
      });
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com ',
        service: 'gmail',
        auth: {
          user: process.env.MAIL,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const user = await ctx.orm.user.findByPk(procedure.userId);
      const mailOptions = {
        from: process.env.MAIL,
        to: user.email,
        subject: 'Mail de tramite terminado',
        text: `Su tramite que estaba siendo realizado por ${tramiter.firstName} ha sido terminado, por favor proceda a pagar.`,
      };
      transporter.sendMail(mailOptions);
      ctx.body = { success: true };
      ctx.status = 200;
    } else {
      ctx.throw(401);
    }
  } catch (ValidationError) {
    ctx.body = {
      success: false,
      message: ValidationError.message,
    };
    ctx.status = ValidationError.status;
  }
});

router.patch('procedures.rating', '/rating/:id', async (ctx) => {
  try {
    const {
      rating,
    } = ctx.request.body;
    const procedure = await ctx.orm.procedure.findByPk(ctx.params.id);
    await procedure.update({
      rating,
    });
    const tramiter = await ctx.orm.tramiter.findByPk(Number(procedure.tramiterId), {
      include:
      {
        association: ctx.orm.tramiter.procedures,
        as: 'procedures',
      },
    });
    let count = 0;
    let total = 0;
    tramiter.procedures.forEach((e) => {
      count += 1;
      total += e.rating;
    });
    await tramiter.update({ rating: (total / count) });
    ctx.status = 200;
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

router.patch('procedures.patch.advance', '/advance/:id', async (ctx) => {
  try {
    const procedure = await ctx.orm.procedure.findByPk(Number(ctx.params.id));
    if (procedure) {
      if (procedure.status < 2) {
        await procedure.update({ status: procedure.status + 1 });
        ctx.status = 200;
      } else {
        ctx.throw(400);
      }
    } else {
      ctx.throw(404);
    }
  } catch (ValidationError) {
    ctx.status = ValidationError.status;
  }
});

module.exports = router;
