const URLPrefix = 'https://api.it120.cc/' 
const CONFIG = require('../config.js')
console.log(URLPrefix);

function fetch(url,data,method = 'GET', header = {}){
    return new Promise((resolve,reject)=> {
        let _url = URLPrefix + CONFIG.subDomain + url;
        // console.log(_url);
        // console.log(1222);

        wx.request({
            url: _url,
            data: data,
            header:{'Content-Type':'application/x-www-form-urlencoded'},
            method: method.toUpperCase(),
            success: function (res) {
                resolve(res.data);
            },
            fail: function(error){
                reject(error);
            }
        })
    })
}

module.exports = fetch
