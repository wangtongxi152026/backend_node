module.exports = authToken = () => {
  return async (ctx, next) => {
    const secret = ctx.app.config.jwtSecret;
    const Token = ctx.request.header.authorization;

    if (!Token) {
      ctx.responseClient(200, 1, 'No Token,请重新登录!');
      return;
    }

    try {
      await ctx.app.jwt.verify(Token, secret);

      await next();
    } catch (error) {
      console.log(error);
      ctx.responseClient(200, 1, '登录状态已过期,请重新登录', { error });
      return;
    }
  };
};
