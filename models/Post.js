const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 实列化数据模板
const PostSchema = new Schema({
    user: {
        // 关联数据表
        type: String,
        ref: 'users',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String,
    },
    likes: [{
        user: {
            // 关联数据表
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    comments: [{
        date: {
            type: Date,
            default: Date.now
        },
        text: {
            type: String,
            required: true
        },
        user: {
            // 关联数据表
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        name: {
            type: String
        },
        avatar: {
            type: String,
        }
    }],
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = Post = mongoose.model('post', PostSchema);