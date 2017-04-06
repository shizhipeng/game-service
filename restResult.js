var restResult = function(){
    this.errorCode = restResult.NO_ERROR ;
    this.returnValue = {};
    this.errorReason = "";
};

restResult.SUCCESS = 200;//无错误
restResult.CREATED = 201;//创建成功
restResult.REQUEST_ERROR = 400;//请求错误
restResult.NOT_FOUND = 404;//目标不存在
restResult.SERVER_ERROR = 500;//服务器未知错误

module.exports = restResult;
