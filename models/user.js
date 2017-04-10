var base = require('./base');
var ObjectId = base.ObjectId;
var userSchema =new base.Schema({
	uid: String,//出题人ID
    avatar: String,//头像
    quiz: String,//我出的题目
    ans: String,//小伙伴们的答案
    create: { type: Date, default: Date.now },
    update: Date
});

userSchema.index({uid:1},{"background" : true});//设置索引
var userEntity = base.mongoose.model('userEntity',userSchema,'user');//指定在数据库中的collection名称为user
exports.userEntity  = userEntity;//导出实体