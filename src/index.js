require('dotenv').config();

const mongoose = require('mongoose');

const {
  PORT: port = 4000, // 값이 존재하지 않으면 4000을 기본 값으로
  MONGO_URI: mongoURI,
  COOKIE_SIGN_KEY: signKey
} = process.env;

mongoose.Promise = global.Promise; // node의 Promise 사용
mongoose.connect(mongoURI, { useNewUrlParser: true }).then(() => {
  console.log('connected to mongodb');
}).catch((e) => {
  console.error(e);
});

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

const app = new Koa();
const router = new Router();

const api = require('./api');

router.use('/api', api.routes());// api 라우터 사용 = /api/...

app.use(bodyParser());// bodyParser 적용 - 먼저해야 함

const sessionConfig = {
  maxAge: 86400000,
};

app.use(session(sessionConfig, app));
app.keys = [signKey];

app.use(router.routes()).use(router.allowedMethods());
// app 인스턴스에 라우터 적용 - app.use(bodyParser()); 먼저 해야 적용됨 + session 뒤에 사용

app.listen(port, () => {
  console.log('listening to port', port);
});
