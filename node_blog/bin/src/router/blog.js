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

const loginCheck = (req) => {
    if (!req.session.username) {
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method
    const id = req.query.id || ''
    const blogData = req.body;
    //获取博客列表
    if (method === 'GET' && req.path === '/api/blog/list') {
        let author = req.query.author || ''
        const keyword = req.query.keyword || ''

        //管理员页面
        if (req.query.isadmin) {
            //是否登录
            const loginResult = loginCheck(req)
            if (loginResult) {
                return loginResult
            }
            //强制查询自己的博客
            author = req.session.username
        }
        //   const listData = getList(author,keyword)
        //   return new SuccessModel(listData)
        const result = getList(author, keyword);
        return result.then(listData => {
            return new SuccessModel(listData)
        })
    }
    //获取博客详情
    if (method === 'GET' && req.path === '/api/blog/detail') {
        // const detailData = getDetail(id)
        // return new SuccessModel(detailData);
        const detailResult = getDetail(id);
        return detailResult.then(detailData => {
            return new SuccessModel(detailData)
        })
    }
    //新建一篇博客
    if (method === 'POST' && req.path === '/api/blog/new') {
        const loginResult = loginCheck(req)
        if (loginResult) {
            return loginResult
        }
        // const data = newBlog(blogData)
        // return new SuccessModel(data)
        req.body.author = req.session.username
        const dataResult = newBlog(req.body)
        return dataResult.then(data => {
            return new SuccessModel(data)
        })
    }
    //更新一篇博客
    if (method === 'POST' && req.path === '/api/blog/update') {
        const loginResult = loginCheck(req)
        if (loginResult) {
            return loginResult
        }
        const dataResult = updataBlog(id, blogData)
        return dataResult.then(data => {
            if (data) {
                return new SuccessModel()
            } else {
                return new ErrorModel('更新博客失败!')
            }
        })
    }
    //删除一篇博客
    if (method === 'POST' && req.path === '/api/blog/del') {
        const loginResult = loginCheck(req)
        if (loginResult) {
            return loginResult
        }
        const author = req.session.username
        const dataResult = delBlog(id, author);
        return dataResult.then(data => {
            if (data) {
                return new SuccessModel()
            } else {
                return new ErrorModel('删除博客失败!')
            }
        })
    }
}

module.exports = handleBlogRouter