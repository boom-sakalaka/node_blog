const {
    getList,
    getDetail,
    newBlog,
    updataBlog,
    delBlog
} = require('../controller/blog')
const {
    SuccessModel,
    ErrorModel
} = require('../model/resmodel')
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/list', function(req, res, next) {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''

    const result = getList(author, keyword);
    return result.then(listData => {
        res.json(new SuccessModel(listData)) 
    })
});

module.exports = router;
