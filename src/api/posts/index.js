const Router = require('koa-router');

const postsCtrl = require('./posts.ctrl.js');

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.get('/:id', postsCtrl.checkObjId, postsCtrl.read);
// 아래 api 라우트는 로그인 필요
posts.post('/', postsCtrl.checkLogin, postsCtrl.write);
posts.delete('/:id', postsCtrl.checkLogin, postsCtrl.checkObjId, postsCtrl.remove);
// posts.put('/:id', postsCtrl.replace);
posts.patch('/:id', postsCtrl.checkLogin, postsCtrl.checkObjId, postsCtrl.update);

module.exports = posts;