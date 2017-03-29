'use strict';

if (process.env.TRACE) {
  require('./libs/trace');
}

const mongoose = require('./db/mongoose');
const Koa = require('koa');
const User = require('./models/user');

const { ObjectId } = mongoose.Schema;
const app = new Koa();

const config = require('config');

// keys for in-koa KeyGrip cookie signing (used in session, maybe other modules)
app.keys = [config.secret];

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();

handlers.forEach(handler => require('./handlers/' + handler).init(app));

// ---------------------------------------

const Router = require('koa-router');

const router = new Router();

router.get('/users', async (ctx) => {
  const users = await User.find();

  ctx.body = users;
});

function createErrorJson(e) {
  return {
    errors: { [e.name || 'error']: e.message || 'unknown error' }
  };
}

router.get('/users/:id', async (ctx) => {
  // как правильно обрабатывать неправильный тип id? просто 404?
  try {
    const user = await User.findById(ctx.params.id);
    if (!user) ctx.throw(404);
    ctx.body = user;
  } catch (e) {
    ctx.response.body = createErrorJson(e);
    ctx.response.status = e.status || 400;
  }
});

router.post('/users', async (ctx) => {
  try {
    const { body } = ctx.request;
    delete body._id; // ну такое...

    ctx.body = await User.create(body);
  } catch (e) {
    if (e.errors) {
      const errors = Object.keys(e.errors).reduce((res, key) => {
        res[key] = e.errors[key].message;
        return res;
      }, {});

      ctx.response.body = errors;
      ctx.response.status = 400;
    } else {
      ctx.response.body = createErrorJson(e);
      ctx.response.status = e.status || 400;
    }
  }
});

router.patch('/users/:id', async (ctx) => {
  try {
    const { body } = ctx.request;
    delete body._id;

    const { nModified } = await User.update({ _id: ObjectId(ctx.params.id) }, { $set: body });
    !nModified && ctx.throw(404);
    ctx.response.status = 200;
  } catch (e) {
    ctx.response.body = createErrorJson(e);
    ctx.response.status = e.status || 400;
  }
});

router.delete('/users/:id', async (ctx) => {
  try {
    const { result } = await User.remove({ _id: ObjectId(ctx.params.id) });
    !result.n && ctx.throw(404);
    ctx.response.status = 200;
  } catch (e) {
    ctx.response.body = createErrorJson(e);
    ctx.response.status = e.status || 400;
  }
});

router.delete('/users', async (ctx) => {
  try {
    const { result } = await User.remove();
    !result.n && ctx.throw(404);
    ctx.response.status = 200;
  } catch (e) {
    ctx.response.body = createErrorJson(e);
    ctx.response.status = e.status || 400;
  }
});

app.use(router.routes());

app.listen(config.get('appPort'));
