const { exec } = require('../db/mysql')
const  xss  = require('xss')
const getList = (author, keyword) => {
    let sql = `select * from blogs where 1 = 1 `
    if(author){
        sql += `and author='${author}' `
    }
    if(keyword){
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc`
    return exec(sql)
}

const getDetail = (id) => {
    const sql = `select * from blogs where  id = '${id}'`
    return exec(sql)
}
const newBlog = (blogData = {}) => {
    const title = xss(blogData.title)
    const content = xss(blogData.content)
    console.log(title)
    const createtime = Date.now()
    const author = blogData.author
    const sql = `insert into blogs (title,content,createtime,author) values ('${title}','${content}','${createtime}','${author}');`
    return exec(sql).then(insertdata => {
        //console.log('insertdata is', insertdata);
        return {
            id: insertdata.insertId
        }
    })
}
const updataBlog = (id,blogData = {}) => {
    // id 就是要更新博客的ID
    //blogData 包含博客的内容标题等
    const {title,content} = blogData
    const sql = `
    update blogs set title='${title}',content='${content}' where id = ${id};
    `
    return exec(sql).then(updateResult => {
        //console.log(updateResult)
        if(updateResult.affectedRows > 0){
            return true
        }
        return false
    })
    
}
const delBlog = (id,author) => {
    const sql =`delete from blogs where id=${id} and author='${author}'`
    return exec(sql).then(delDate => {
        if(delDate.affectedRows >0){
            return true
        } 
        return false
    })
}
module.exports = {
    getList,
    getDetail,
    newBlog,
    updataBlog,
    delBlog
}