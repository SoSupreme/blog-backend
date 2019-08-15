const { ADMIN_PASS: adminPass } = process.env;

exports.login = (ctx) => {
  const { password } = ctx.request.body;

  if (adminPass === password) { // login 성공
    ctx.body = {
      success: true
    };
    ctx.session.logged = true; // session logged 값 true
  } else { // login 실패
    ctx.body = {
      success: false
    };
    ctx.status = 401; // Unauthorized
  }
};

exports.check = (ctx) => {
  ctx.body = {
    logged: !!ctx.session.logged // !!를 사용해서 해당 값이 없어도 false 리턴
  };
};

exports.logout = (ctx) => {
  ctx.session = null; // session 파기
  ctx.status = 204; // no content
};