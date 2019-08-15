// eslint-disable-next-line import/no-unresolved
const Post = require('models/post');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');

exports.checkLogin = (ctx, next) => {
  if (ctx.sessiion.logged === false) {
    ctx.status = 401; // unAthorized
    return null;
  }
  return next();
};

exports.checkObjId = (ctx, next) => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) { // id 검증 실패 =  올바른 Id가 아니다 = 클라이언트 요청이 잘 못 됨
    ctx.status = 400; // 400 Bad Request
    return null;
  }
  return next();
};

exports.write = async (ctx) => {
  // joi 사용 객체가 가진 값 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(), // required를 이용 필수항목 표시
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required() // 문자열 배열
  });

  const result = Joi.validate(ctx.request.body, schema); // 객체와 schema를 검증

  if (result.error) { // 오류 발생 = 검증실패
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;

  const post = new Post({
    title, body, tags
  });

  try {
    await post.save(); // 데이터베이스 등록
    ctx.body = post; // 화면에 반환
  } catch (e) {
    ctx.throw(e, 500);
  }
};

/*
  GET /api/posts
*/
exports.list = async (ctx) => {
  const page = parseInt(ctx.query.page || 1, 10); // page 가 없으면 1 (10진법)
  const { tag } = ctx.query;
  const query = tag ? { tags: tag } : {};

  // 잘못된 페이지면 오류
  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try { // exec() = 쿼리 요청, sort({key:-1}) key 기준 내림차순, 10개 표시
    const posts = await Post.find(query) // 선택한 태그 검색
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean() // lean을 이용해서 json형식으로 조회 = mongoose 내장 함수가 데이터도 들어가는 것을 방지
      .exec();

    const postCount = await Post.countDocuments(query).exec(); // post 숫자 세기

    const limitBodyLength = post => ({ // parameter가 1개일때는 () 생략
      ...post,
      body: post.body.length < 350 ? post.body : `${post.body.slice(0, 350)}...` // 200자 이상이면 말줄임표..
    });

    ctx.body = posts.map(limitBodyLength); // posts 의 post 하나하나 마다 limitBodyLength 함수를 mapping

    ctx.set('LPG', Math.ceil(postCount / 10)); // 커스텀 헤더로 마지막 페이지 알려주기
  } catch (e) {
    ctx.throw(e, 500);
  }
};

/*
  GET /api/posts/:id
*/
exports.read = async (ctx) => {
  const { id } = ctx.params;

  try {
    const post = await Post.findById(id).exec();
    ctx.body = post;
  } catch (e) {
    ctx.throw(e, 500);
  }
};

/*
  DELETE /api/posts/:id
*/
exports.remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(e, 500);
  }
};

/*
  PATCH /api/posts/:id
  { title, body, tags }
*/
exports.update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true // true 설정해야 update 한 객체를 반환
    }).exec();
    if (!post) { // 찾는 post 없을 경우
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(e, 500);
  }
};
