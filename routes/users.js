var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var userEntity = require('../models/user').userEntity;
//var userModel =  new require('../models/user').userModel;
var restResult = require('../restResult');
//注册路由
//出题
router.post('/quiz',function(req,res,next){
	var user = {}, ret = {};
	user.uid = req.body.uid;
	user.avatar = req.body.avatar;
	user.quiz = req.body.quiz;
	user.quiz_id = (new Date()).getTime();
	userEntity.create(user, function(err,userInfo){
      if (err) {
      	console.log('出题异常!');
        ret.code = restResult.SERVER_ERROR;
        ret.msg = "db error!";
        res.send(ret);
        return;
      }else{
  		console.log('出题成功!');
    	ret.code = restResult.SUCCESS;
    	ret.data = userInfo;
    	ret.msg = 'quiz success!'
    	res.send(ret);    	
    	return;
      }
    });
});
//查询出题人和题目,答题页
router.get('/info', function(req, res, next) {
    var uid = req.query.uid; 
    var quiz_id = req.query.quiz_id;
    userEntity.findOne({ uid: uid, quiz_id: quiz_id }, function(err, userInfo) {
        var ret = {};
        if (err) {
            ret.code = restResult.SERVER_ERROR;
            ret.msg = "服务器异常!";
            res.send(ret);
        }
        if (userInfo) {
        	ret.code = restResult.SUCCESS;
			ret.data = userInfo;
			ret.msg = 'success msg!'
			for(var i = 0; (i< userInfo.ans.length)&&userInfo.ans.length; i++){			
				if (userInfo.ans[i].complete && (userInfo.ans[i].ans_uid == req.query.ans_uid)) {		
				    ret.data.complete = true;	
					break;
				}else{
					ret.data.complete = false;	
				}
			}
            res.send(ret);
        } else {
            ret.code = restResult.NOT_FOUND;
            ret.data = null;
            ret.msg = "目标不存在！";
            res.send(ret);
        }
        return;
    });
});


//查询排名
router.get('/scores', function(req, res, next) {
    var uid = req.query.uid, quiz_id = req.query.quiz_id;
    console.log(req.query)
    var ret = {};
    userEntity.findOne({uid: uid, quiz_id: quiz_id }, function(err, userInfo) {
        if (err) {
            ret.code = restResult.NOT_FOUND;
            ret.msg = "目标不存在!";
            res.send(ret);
        }
        if (userInfo._id) {
            //冒泡排序 稳定性考虑
            var ans = userInfo.ans;
            console.log(ans)
            var tmp = {},
                i = ans.length,
                j = 0;
            while (i > 0) {
                for (j = 0; j < i - 1; j++) {
                    if (parseInt(ans[j].score) > parseInt(ans[j + 1].score)) {
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
//保存答题结果并计算分数
router.post('/ans', function(req, res, next){
	var ret = {};
	//查出来算分
	userEntity.findOne({uid:req.body.uid, quiz_id:req.body.quiz_id},function(err, userInfo){
		if (err) {
            ret.code = SERVER_ERROR;
            ret.msg = "SERVER_ERROR";
            res.send(ret);
        }
        var newer = req.body;
            newer.score = 0;
            newer.complete = true;
        for(var i=0; i<5; i++){	
    		if(JSON.parse(userInfo.quiz)[i].toString()===JSON.parse(newer.ans_choose)[i].toString()){    			
    			newer.score += 20;
    		}
    	}
    	console.log(newer.score)
        if (userInfo._id) {
			userEntity.update({uid: userInfo.uid, quiz_id:userInfo.quiz_id}, {$push: {ans: newer}},function(err){
				if (err) {
		            ret.code = restResult.NOT_FOUND;
		            ret.msg = "目标不存在!";
		            console.log(ret)
		            res.send(ret);
		        }else{
					ret.code = restResult.SUCCESS;
		            ret.msg = 'success msg!';
		            console.log(ret)
		            res.send(ret);
				}
			});
		}
	});
	return;
});
//判断是否做过题
router.get('/complete', function(req, res, next){
	var ret = {};
	var condition = {
		uid: req.query.uid,
		quiz_id: req.query.quiz_id,
	};
	userEntity.findOne(condition, function(err, userInfo){
		if (err) {
            ret.code = SERVER_ERROR;
            ret.msg = "SERVER_ERROR";
            res.send(ret);
        }
		var ans = userInfo.ans;
		for(var i = 0; i< ans.length; i++){
			if (ans[i].complete==true && ans[i].ans_uid == req.query.ans_uid) {
				ret.code = 200;
				ret.data = true
				ret.msg = 'completed!'
			}else{
				ret.code = 200;
				ret.data = false;
				ret.msg = 'incompleted!'
			}
		}
		res.send(ret);
	});
})




















module.exports = router;
