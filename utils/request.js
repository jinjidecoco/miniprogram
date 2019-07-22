const URLPrefix = 'https://api.it120.cc/' 
const CONFIG = require('../config.js')
console.log(URLPrefix);

function fetchRequest(url,data,method = 'GET', header = {}){
    return new Promise((resolve,reject)=> {
        let _url = URLPrefix + CONFIG.subDomain + url;
        wx.request({
            url: _url,
            data: data,
            header: {'Content-Type': 'application/x-www-form-urlencoded'},
            method: method.toUpperCase(),
            success: function (res) {
                resolve(res);
            },
            fail: function(error){
                reject(error);
            }
        })
    })
}

// export {fetchRequest}
module.exports={
    fetch: fetchRequest
}