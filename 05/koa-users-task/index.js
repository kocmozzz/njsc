'use strict';

if (process.env.TRACE) {
  require('./libs/trace');
}

const mongoose = require('./db/mongoose');
const Koa = require('koa');
const User = require('./models/user');
const pick = require('lodash/pick');
const config = require('config');

const app = new Koa();

// keys for in-koa KeyGrip cookie signing (used in session, maybe other modules)
app.keys = [config.secret];

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();

handlers.forEach(handler => require('./handlers/' + handler).init(app));

// ---------------------------------------

const Router = require('koa-router');

const router = new Router({
  prefix: '/users'
});

router.param('userById', async (id, ctx, next) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.throw(404);
  }

  ctx.userById = await User.findById(id);

  !ctx.userById && ctx.throw(404);

  await next();
})
  .get('/', async (ctx) => {
    const users = await User.find();

    ctx.body = users.map(user => pick(user.toObject(), User.publicFields));
  })
  .get('/:userById', async (ctx) => {
    ctx.body = pick(ctx.userById.toObject(), User.publicFields);
  })
  .post('/', async (ctx) => {
    try {
      const user = await User.create(pick(ctx.request.body, User.publicFields));

      ctx.body = user.toObject();
    } catch (e) {
      if (e.errors) {
        const errors = Object.keys(e.errors).reduce((res, key) => {
          res[key] = e.errors[key].message;
          return res;
        }, {});

        ctx.response.body = errors;
        ctx.response.status = 400;
      }
    }
  })
  .patch('/:userById', async (ctx) => {
    Object.assign(ctx.userById, pick(ctx.request.body, User.publicFields));
    await ctx.userById.save();

    ctx.body = ctx.userById.toObject();
  })
  .delete('/:userById', async (ctx) => {
    await ctx.userById.remove();
    ctx.body = 'ok';
  })
  .delete('/', async (ctx) => {
    await User.remove();
    ctx.body = 'ok';
  });

app.use(router.routes());

app.listen(config.get('appPort'));
