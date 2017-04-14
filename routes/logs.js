var express = require('express');
var router = express.Router();
var userEntity = require('../models/user').userEntity;
var restResult = require('../restResult');
//注册路由

//emoji
router.post('/emoji',function(req, res, next){
      var condition = {
        create: {"$get":req.body.start, "$lte": req.body.end},  
      };
      var field = 'quiz';
      var ret = {}; 
    	userEntity.find(condition, quiz,function(err, docs){
         if (err) {
            ret.code = restResult.SERVER_ERROR;
            ret.msg = 'db op error';
            res.send(ret);
         }
         if (docs) {
            console.log(docs);
            res.send(docs);
         }
      });
      return;
});


module.exports = router;