var base = require('./base');
var ObjectId = base.ObjectId;
var subScheme = new base.Schema({
	ans_uid: String,
	ans_nick:String,
    ans_avatar: String,
    ans_choose: String,
    score:String,
	complete: Boolean 
});
var userSchema =new base.Schema({
	uid: String,//出题人ID
    avatar: String,//头像
    quiz_id:String,
    quiz: String,//我出的题目
    ans: [subScheme],//小伙伴们的答案
    complete: Boolean,
    create: { type: Date, default: Date.now },
});
//subScheme.index({ans_uid:1},{"background" : true});//设置索引
userSchema.index({uid:1},{"background" : true});//设置索引
//var userModel = base.mongoose.model('userSchema',userSchema,'user');

var userEntity = base.mongoose.model('userEntity',userSchema,'user');//指定在数据库中的collection名称为user
exports.userEntity  = userEntity;//导出实体
//exports.userModel = userModel;