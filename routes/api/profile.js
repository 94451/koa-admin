const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');

//引入模板实例
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//引入验证
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

/**
 *  @router GET api/profile/test
 *  @desc 测试接口地址
 *  @access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = {
        msg: 'profile works ...'
    };
});

/**
 *  @router GET api/profile
 *  @desc 个人信息接口地址
 *  @access 接口是私有的
 */
router.get('/',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        // console.log(ctx.state.user);
        //跨表联查
        const profile = await Profile.find({ user: ctx.state.user.id }).populate(
            'user', ['name', 'avatar']
        );

        // console.log(profile);
        if (profile.length > 0) {
            ctx.status = 200;
            ctx.body = profile;
        } else {
            ctx.status = 404;
            ctx.body = {
                noprofile: "该用户没有任何相关的个人信息"
            };
            return;
        }
    }
);

/**
 *  @router POST api/profile
 *  @desc 添加和编辑个人信息接口地址
 *  @access 接口是私有的
 */
router.post('/',
    passport.authenticate('jwt', { session: false }),
    async ctx => {

        const { errors, isValid } = validateProfileInput(ctx.request.body);

        // 判断是否验证通过
        if (!isValid) {
            ctx.status = 400;
            ctx.body = errors;
            return;
        }

        const profileFileds = {};

        profileFileds.user = ctx.state.user.id;

        if (ctx.request.body.handle) profileFileds.handle = ctx.request.body.handle;
        if (ctx.request.body.company) profileFileds.company = ctx.request.body.company;
        if (ctx.request.body.website) profileFileds.website = ctx.request.body.website;
        if (ctx.request.body.location) profileFileds.location = ctx.request.body.location;
        if (ctx.request.body.status) profileFileds.status = ctx.request.body.status;

        // skills 数据转化 将字符串分割开
        if (ctx.request.body.skills !== "undefined") {
            profileFileds.skills = ctx.request.body.skills.split(',');
        }

        if (ctx.request.body.bio) profileFileds.bio = ctx.request.body.bio;
        if (ctx.request.body.githubusername) profileFileds.githubusername = ctx.request.body.githubusername;

        profileFileds.social = {};

        if (ctx.request.body.wechat) profileFileds.social.wechat = ctx.request.body.wechat;
        if (ctx.request.body.QQ) profileFileds.social.QQ = ctx.request.body.QQ;
        if (ctx.request.body.tengxunkt) profileFileds.social.tengxunkt = ctx.request.body.tengxunkt;
        if (ctx.request.body.wangyikt) profileFileds.social.wangyikt = ctx.request.body.wangyikt;

        //查询数据库
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile.length > 0) {
            //编辑更新
            const profileUpdate = await Profile.findOneAndUpdate({ user: ctx.state.user.id }, { $set: profileFileds }, { new: true });
            ctx.body = profileUpdate;
        } else {
            await new Profile(profileFileds).save().then(profile => {
                ctx.status = 200;
                ctx.body = profile;
            });
        }
    }
);

/**
 *  @router GET api/profile/handle?handle=test
 *  @desc 通过handle获取个人信息接口地址
 *  @access 接口是公开的
 */
router.get('/handle', async ctx => {
    const errors = {};
    const handle = ctx.query.handle;

    // console.log(handle);
    const profile = await Profile.find({ handle: handle }).populate('user', ['name', 'avatar']);
    // console.log(profile);

    if (profile.length < 1) {
        errors.noprofile = '未找到该用户信息';
        ctx.status = 404;
        ctx.body = errors;
    } else {
        ctx.body = profile[0];
    }
});

/**
 *  @router GET api/profile/user?user_id=老长一串
 *  @desc 通过user_id获取个人信息接口地址
 *  @access 接口是公开的
 */
router.get('/user', async ctx => {
    const errors = {};
    const user_id = ctx.query.user_id;

    // console.log(handle);
    const profile = await Profile.find({ user: user_id }).populate('user', ['name', 'avatar']);
    // console.log(profile);

    if (profile.length < 1) {
        errors.noprofile = '未找到该用户信息';
        ctx.status = 404;
        ctx.body = errors;
    } else {
        ctx.body = profile[0];
    }
});

/**
 *  @router GET api/profile/all
 *  @desc 获取所有人信息接口地址
 *  @access 接口是公开的
 */
router.get('/all', async ctx => {
    const errors = {};
    // console.log(handle);
    const profiles = await Profile.find({}).populate('user', ['name', 'avatar']);
    // console.log(profile);

    if (profiles.length < 1) {
        errors.noprofile = '没有任何用户信息';
        ctx.status = 404;
        ctx.body = errors;
    } else {
        ctx.body = profiles;
    }
});

/**
 *  @router GET api/profile/experience
 *  @desc 工作经验接口地址
 *  @access 接口是私有的
 */
router.post('/experience',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const { errors, isValid } = validateExperienceInput(ctx.request.body);

        // 判断是否验证通过
        if (!isValid) {
            ctx.status = 400;
            ctx.body = errors;
            return;
        }

        const profileFileds = {};
        profileFileds.experience = [];

        const profile = await Profile.find({ user: ctx.state.user.id });

        if (profile.length > 0) {
            const newExp = {
                title: ctx.request.body.title,
                current: ctx.request.body.current,
                company: ctx.request.body.company,
                location: ctx.request.body.location,
                from: ctx.request.body.from,
                to: ctx.request.body.to,
                descripttion: ctx.request.body.descripttion
            }

            profileFileds.experience.unshift(newExp);
            // console.log(profileFileds);
            // 更新数据
            const profileUpdate = await Profile.update({ user: ctx.state.user.id }, { $push: { experience: profileFileds.experience } }, { $sort: 1 });

            // ctx.body = profileUpdate;
            if (profileUpdate.ok == 1) {
                const profile = await Profile.find({
                    user: ctx.state.usre.id
                }).populate('user', ['name', 'avatar']);

                if (profile) {
                    ctx.status = 200;
                    ctx.body = profile;
                }
            }
        } else {
            errors.noprofile = "没有该用户的信息"
            ctx.status = 400;
            ctx.body = errors;
        }
    }
);

/**
 *  @router GET api/profile/education
 *  @desc 教育经历接口地址
 *  @access 接口是私有的
 */
router.post('/education',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const { errors, isValid } = validateEducationInput(ctx.request.body);

        // 判断是否验证通过
        if (!isValid) {
            ctx.status = 400;
            ctx.body = errors;
            return;
        }
        const profileFileds = {};
        profileFileds.education = [];

        const profile = await Profile.find({ user: ctx.state.user.id });

        if (profile.length > 0) {
            const newEdu = {
                school: ctx.request.body.school,
                current: ctx.request.body.current,
                degree: ctx.request.body.degree,
                filedofstudy: ctx.request.body.filedofstudy,
                from: ctx.request.body.from,
                to: ctx.request.body.to,
                descripttion: ctx.request.body.descripttion
            }

            profileFileds.education.unshift(newEdu);
            // console.log(profileFileds);
            // 更新数据
            const profileUpdate = await Profile.update({ user: ctx.state.user.id }, { $push: { education: profileFileds.education } }, { $sort: 1 });

            // ctx.body = profileUpdate;
            if (profileUpdate.ok == 1) {
                const profile = await Profile.find({
                    user: ctx.state.usre.id
                }).populate('user', ['name', 'avatar']);

                if (profile) {
                    ctx.status = 200;
                    ctx.body = profile;
                }
            }
        } else {
            errors.noprofile = "没有该用户的信息"
            ctx.status = 400;
            ctx.body = errors;
        }
    }
);

/**
 *  @router DELETE api/profile/experience?exp_id= bababa
 *  @desc 删除工作经验接口地址
 *  @access 接口是私有的
 */
router.delete('/experience',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        // 拿到id
        const exp_id = ctx.query.exp_id;
        // console.log(exp_id)
        //查询
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile[0].experience.length > 0) {
            //找元素下标
            const removeIndex = profile[0].experience.map(item => item.id).indexOf(exp_id);
            //删除
            profile[0].experience.splice(removeIndex, 1);
            //更新数据库
            const profileUpdate = await Profile.findOneAndUpdate({ user: ctx.state.user.id }, { $set: profile[0] }, { new: true });

            ctx.body = profileUpdate;
        } else {
            ctx.status = 404;
            ctx.body = { errors: "没有任何数据" }
        }
    }
);

/**
 *  @router DELETE api/profile/education?edu_id= bababa
 *  @desc 删除教育经历接口地址
 *  @access 接口是私有的
 */
router.delete('/education',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        // 拿到id
        const edu_id = ctx.query.edu_id;
        // console.log(exp_id)
        //查询
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile[0].education.length > 0) {
            //找元素下标
            const removeIndex = profile[0].education.map(item => item.id).indexOf(edu_id);
            //删除
            profile[0].education.splice(removeIndex, 1);
            //更新数据库
            const profileUpdate = await Profile.findOneAndUpdate({ user: ctx.state.user.id }, { $set: profile[0] }, { new: true });

            ctx.body = profileUpdate;
        } else {
            ctx.status = 404;
            ctx.body = { errors: "没有任何数据" }
        }
    }
);


/**
 *  @router DELETE api/profile
 *  @desc 删除整个用户接口地址
 *  @access 接口是私有的
 */
router.delete('/',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const profile = await Profile.deleteOne({ user: ctx.state.user.id });
        if (profile.ok == 1) {
            const user = await User.deleteOne({
                _id: ctx.state.user.id
            });
            if (user.ok == 1) {
                ctx.status = 200;
                ctx.body = { success: true }
            }
        } else {
            tx.status = 400;
            ctx.body = { errors: 'profile不存在' }
        }
    }
);
module.exports = router.routes();