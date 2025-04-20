const autoprefixer = require("autoprefixer");
const cssnanoPlugin = require("cssnano");
const  postcssPxtorem= require("postcss-pxtorem");

module.exports = {
    plugins: [
        autoprefixer,
        cssnanoPlugin,
        postcssPxtorem({
            propList: ['*']
        })
    ]
}