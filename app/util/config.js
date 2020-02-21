module.exports = {
  username: 'wangtongxi',
  oauth_uri: 'https://github.com/login/oauth/authorize',
  access_token_url: 'https://github.com/login/oauth/access_token',
  // 获取 github 用户信息 url // eg: https://api.github.com/user?access_token=****&scope=&token_type=bearer
  user_url: 'https://api.github.com/user',

  // 请把生产环境的 redirect_url，client_id 和 client_secret 中的 "****", 换成自己创建的 OAuth App 的具体参数即可。
  // 生产环境
  // redirect_uri: 'http://wangtongxi.cn/login',
  // client_id: '008817c8d4abf09edd76',
  // client_secret: '3024249996cb5d2fdda0327d5001d4596c7af03c'

  // 开发环境
  redirect_url: 'http://localhost:3002/login',
  client_id: '1fd86be092e5d0a45ef4',
  client_secret: 'a036a3a967f101682fa0b894a473d726b0bff0db',
};
