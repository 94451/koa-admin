const Koa = require('koa');
const Router = require('koa-router');
const json = require('koa-json');
const mongoose = require('mongoose');
var bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');

// 实例化Koa
const app = new Koa();
const router = new Router();

app.use(json());
app.use(bodyParser());

// 引入users.js
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
// 路由
router.get('/', async ctx => {
    ctx.body = { msg: 'Hello Koa Interfaces' };
})

// config
const db = require('./config/keys').mongoURI;

// 连接数据库
mongoose.connect(
    db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    console.log('MongoDB connected ...')
}).catch(err => {
    console.log(err);
});

app.use(passport.initialize());
app.use(passport.session());

// 回调到config文件中 passport.js
require('./config/passport')(passport);

// 配置路由地址,当访问localhost:5000/api/users时跳转到./routes/api/users.js文件
router.use('/api/users', users);
router.use('/api/profile', profile);
router.use('/api/posts', posts);

// 配置路由
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 5000; //设置端口号

app.listen(port, () => {
    console.log(`server started on ${port}!`);
});