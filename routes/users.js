var express = require('express');
var router = express.Router();
var userEntity = require('../models/user').userEntity;
var restResult = require('../restResult');
//注册路由

//出题
router.post('/quiz',function(req, res, next){
	var user = {
		uid: req.body.uid,
		avatar: req.body.avatar,
		quiz_id: (new Date()).getTime(),
		quiz: req.body.quiz,
		wxShared: false,
		redPocket: false
	};
	console.log('create user: ', user);
	var ret = {};
	userEntity.create(user, function(err,userInfo){
      if (err) {
      	console.log('出题异常!');
        ret.code = restResult.SERVER_ERROR;
        ret.msg = "db op error!";
        res.send(ret);
        return;
      }
      if (userInfo) {
  		console.log('出题成功!');
    	ret.code = restResult.CREATED;
    	ret.data = userInfo;
    	ret.msg = 'quiz success!'
    	console.log(ret);
    	res.send(ret);    	
    	return;
      }
    });
});

//查询出题人和题目,答题页
router.get('/info', function(req, res, next) {
	var condition = {
		uid: req.query.uid,
		quiz_id: req.query.quiz_id
	};
	var ret = {}
    userEntity.findOne(condition, function(err, userInfo) {
        if (err) {
            ret.code = restResult.SERVER_ERROR;
            ret.msg = "db op error!";
            res.send(ret);
        }
        if (userInfo) {
        	for(var i = 0; (i< userInfo.ans.length)&&userInfo.ans.length; i++){			
				if (userInfo.ans[i].complete && (userInfo.ans[i].ans_uid == req.query.ans_uid)) {		
				    userInfo.complete = true;	
					break;
				}else{
					userInfo.complete = false;	
				}
			}
        	ret.code = restResult.SUCCESS;
			ret.data = userInfo;
			ret.msg = 'success msg!';
			console.log(ret);
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
    var condition = {
    	uid: req.query.uid,
    	quiz_id: req.query.quiz_id
    };
    var ret = {};
    userEntity.findOne(condition, function(err, userInfo) {
        if (err) {
            ret.code = restResult.NOT_FOUND;
            ret.msg = "db op error!";
            res.send(ret);
        }
        if (userInfo) {
        	console.log(condition)
        	userEntity.update(condition, {$set: {wxShared:true}}, function(err){
        		if (err) {
        			ret.code = restResult.NOT_FOUND;
		            ret.msg = "db op error!";
		            res.send(ret);
        		}
        	});
            //冒泡排序 稳定性考虑
            var ans = userInfo.ans;
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
            console.log(ret);
            res.send(ret);
        }else{
        	ret.code = restResult.NOT_FOUND;
            ret.data = null;
            ret.msg = "目标不存在！";
            res.send(ret);
        }
        return;
    })

});
//保存答题结果并计算分数
router.post('/ans', function(req, res, next){
	var condition = {
		uid: req.body.uid,
		quiz_id: req.body.quiz_id
	}
	var ret = {};
	//查出来算分
	userEntity.findOne(condition, function(err, userInfo){
		if (err) {
            ret.code = SERVER_ERROR;
            ret.msg = "db op error!";
            res.send(ret);
        }
        if (userInfo) {
        	var tmp = userInfo.ans;
        	for(var i = 0; i <tmp.length; i++){
        		if (tmp[i].ans_uid==req.body.ans_uid && tmp[i].complete) {
        			ret.code = 204;
        			ret.data= null;
		            ret.msg = "目标已存在！";
		            res.send(ret);
        			return;
        		}
        	}
        	var newer = req.body;
	            newer.score = 0;
	            newer.complete = true;
	        var addNewer = {
	        	$push: {
	        		ans: newer
	        	}
	        };
	        for(var i=0; i<5; i++){	//算分
	    		if(JSON.parse(userInfo.quiz)[i].toString()===JSON.parse(newer.ans_choose)[i].toString()){    			
	    			newer.score += 20;
	    		}
			}	
			userEntity.update(condition, addNewer, function(err,count){
				if (err) {
		            ret.code = restResult.NOT_FOUND;
		            ret.msg = "db op error!";
		            res.send(ret);
		        }
		        if (count) {
					ret.code = restResult.SUCCESS;
		            ret.msg = 'success msg!';
		            console.log(ret);
		            res.send(ret);
				}
			});
		}else{
			ret.code = restResult.NOT_FOUND;
            ret.data = null;
            ret.msg = "目标不存在！";
            res.send(ret);
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
            ret.msg = "db op error!";
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
	return;
});

router.post('/redpocket', function(req, res, next){
	var condition = {
		uid: req.body.uid,
		quiz_id: req.body.quiz_id,
	};
	var ret = {};
	userEntity.update(condition, {$set: {redPocket: true}},function(err, count){
		if (err) {
			ret.code = SERVER_ERROR;
            ret.msg = "db op error!";
		}
		if (count) {
			ret.code = restResult.SUCCESS;
			ret.msg = 'redPocket success!'
		}
        res.send(ret);
	})
	return;
});

module.exports = router;
