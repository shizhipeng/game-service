var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/gameservice');//连接数据库
//mongoose.createConnection('localhost','gameservice'); 
var db = mongoose.connection;
db.on('error',console.error.bind(console,'连接错误:'));
db.once('open',function(){
	console.log('connecting......');
    console.log('connect mongodb successfully!')
});
exports.mongoose = mongoose;