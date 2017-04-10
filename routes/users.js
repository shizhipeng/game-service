var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var userEntity = require('../models/user').userEntity;

var restResult = require('../restResult');
//注册路由
//出题
router.post('/quiz',function(req,res,next){
	var user = {}, ret = {};
	user.uid = req.body.uid;
	user.avatar = req.body.avatar;
	user.quiz = req.body.quiz;
	user.update = new Date();
	userEntity.update({uid: req.body.uid}, {$set: user}, {upsert: true}, function(err,count){
      if (err) {
      	console.log('出题异常!');
        ret.code = restResult.SERVER_ERROR;
        ret.msg = "db error!";
        res.send(ret);
        return;
      }else{
  		console.log('出题成功!');
    	ret.code = restResult.SUCCESS;
    	ret.msg = 'quiz success!'
    	res.send(ret);    	
    	return;
      }
    });
});
//查询出题人
router.get('/info', function(req, res, next){
	var uid = req.query.uid;
	userEntity.findOne({uid:uid},function(err, userInfo){
		console.log(err, userInfo)
		var ret = {};
		if (err) {
			ret.code = restResult.SERVER_ERROR;
			ret.msg = "服务器异常!";
	        res.send(ret);
		}
		if(userInfo){
			var base64Str = userInfo.avatar;
			res.send("<html><head></head><body><img src='"+base64Str+"'/></body></html>");		
		}else{
			ret.code = restResult.NOT_FOUND;
			ret.data = null;
			ret.msg = "目标不存在！";
	        res.send(ret);
		}
		return;
	});
});

//查询排名
router.get('/scores', function(req,  res, next){
	var uid = req.query.uid;
	var ret = {};
	userEntity.findOne({uid:uid},function(err, userInfo){
		if (err) {
			ret.code = restResult.NOT_FOUND;
			ret.msg = "目标不存在!";
	        res.send(ret);
		}
		if(userInfo._id){
			//冒泡排序 稳定性考虑
			var ans = JSON.parse(userInfo.ans);
			console.log(ans)
			var tmp = {},i = ans.length, j = 0;
			while (i > 0) {
		        for (j = 0; j < i - 1; j++) {
		            if (parseInt(ans[j].score)>parseInt(ans[j+1].score)) {
		                tmp = ans[j];
		                ans[j] = ans[j + 1];
		                ans[j + 1] = tmp;
		            }
		        }
		        i--;
    		}
    		ans = ans.reverse();
    		ret.code = restResult.SUCCESS;
    		ret.data = ans;
    		ret.msg = 'success msg!';
			res.send(ret);
		}
		return;
	})
	
});






















module.exports = router;
