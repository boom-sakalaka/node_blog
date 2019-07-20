const querystring = require('querystring')
const { get,set } = require('./src/db/redis')
const { access } = require('./src/utils/log')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

//获取cookie过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24*60*60*1000))
    return d.toGMTString()
}

const getPostData = (req) => {
    const promise = new Promise((resolve,reject) => {
        if(req.method !== 'POST'){
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json'){
            resolve({})
            return
        }
        let postData = ''
        req.on('data',chunk => {
            postData += chunk.toString()
        })
        req.on('end',() => {
            if(!postData){
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}

const serverHandle = (req,res) =>{
    // 记录access log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)
    //设置返回格式
    res.setHeader('Content-type','application/json')
    const url = req.url
    req.path = url.split('?')[0]
    //解析cookie
    req.query = querystring.parse(url.split('?')[1])

    //解析cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || '' // k1=v1;k2=2;
    cookieStr && cookieStr.split(";").forEach(item => {
        const arr = item.split("=")
        const key = arr[0].trim()
        const val = arr[1].trim()
        req.cookie[key] = val
    })

    //解析session(使用redis)
    let needSetCookie = false
    let userId = req.cookie.userid
    if(!userId){
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`

        //初始化redis中的redis值
        set(userId,{})
    }
    //获取session
    req.sessionId = userId
    get(req.sessionId).then(sessionData =>{
        if(sessionData == null){
            //初始化redis中的redis值
            set(req.sessionId,{})
            //设置req.session
            req.session = {}
        }else{
            req.session =sessionData
        }
        //console.log('req.session',JSON.stringify(req.session))
        return  getPostData(req)
    })
   .then(postData => {
        //处理blog路由postData
        // const blogData = handleBlogRouter(req,res)  
        // if(blogData){
        //     res.end(
        //         JSON.stringify(blogData)
        //     )
        //     return
        // }
        req.body = postData
        const blogResult = handleBlogRouter(req,res)
        if(blogResult){
            if(needSetCookie){
                res.setHeader('Set-Cookie',`userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`)
            }
            blogResult.then(blogData => {
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }  
      
        //处理user路由
        // const userData =  handleUserRouter(req,res)
        // if(userData){
        //     res.end(
        //         JSON.stringify(userData)
        //     )
        //     return
        // }
        const userResult = handleUserRouter(req,res)
        if(userResult){
            if(needSetCookie){
                res.setHeader('Set-Cookie',`userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`)
            }
            userResult.then(userData => {
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }

        //未命中路由 返回404
        res.writeHead(404,{'Content-type':'text/plain'})
        res.write('404 Not Found')
        res.end()

    })
}

module.exports = serverHandle

//process.env.NODE_ENV