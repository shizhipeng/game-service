var mongodb = require('../config/config');//引入config中的mongodb对象
var mongoose = mongodb.mongoose;//获取mongoose
var Schema = mongoose.Schema;//获取Schema,以便快捷使用

exports.mongodb = mongodb;//导出mongodb
exports.mongoose = mongoose; //导出mongoose
exports.Schema = Schema;//导出Schema