const Router = require('koa-router');

const posts = require('./posts');
const auth = require('./auth');

const api = new Router();

api.use('/posts', posts.routes()); // api/posts 라우터 사용 = /api/posts/...
api.use('/auth', auth.routes()); // api/auth

module.exports = api;