const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const dotenv = require('dotenv')
const { DefinePlugin } = require('webpack')

// development使用的值；
let mode = 'development'

// production使用的值；
if(process.env.NODE_ENV === 'production'){
    mode = 'production'
}

// 加载对应的 .env 文件
const envFile = `.env.${mode}`

/***
 * dotenv.config()会将指定的.env文件变成js对象，如
 * 注意！所有值都是字符串，不管写的是数字、布尔值，都会被当作字符串处理！
 *  {
      URL: 'http://localhost:8000',
      DEBUG: 'true'
*   }
 */
const envConfig = dotenv.config({ path: envFile }).parsed || {}

// 转换为 DefinePlugin 可识别的格式
const envKeys = Object.keys(envConfig).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(envConfig[key])
    return acc
}, {})


module.exports = {
    mode,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.[contenthash].js',
        // 如果是chunk，生成的js文件叫什么名字；
        chunkFilename: (pathData) => {
            // 如果生成的chunk的name是vendor，则不带hash，希望browser缓存；
            if (pathData.chunk.name === 'vendors') {
                return 'vendors.js'; // 不带 hash
            }
            // 如果生成的chunk的name不是vendor，说明是我们自己的代码，则带hash，不希望browser缓存；
            // 如生成的chunk文件就叫common.c123df.j；
            return '[name].[contenthash].js';
        },

        clean: true
    },
    devtool: 'eval',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'public')
        },
        open: true,
        hot: true,
        port: 8080,
        compress: true
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            title: 'Webpack App',
            inject: 'body',
            // favicon: './public/favicon.ico', // 添加网页图标，如果有的话；
            minify: {
                collapseWhitespace: true,
                removeComments: true,
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'main.[contenthash].css'
        }),
        // new BundleAnalyzerPlugin(),

        new DefinePlugin(envKeys)
    ],

    module: {
        rules: [
            {
                test: /\.(s[ac]|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
            },
            {
                test: /\.jsx?$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        // 当我们在代码中 import 一个模块时，如果没有写后缀，比如 import App from './App'，
        // Webpack 会按照这里的扩展名顺序自动尝试补全后缀去找文件；
        extensions: ['.js', '.jsx'], // 👈 告诉 Webpack 支持这两种扩展

        // alias会让我们的import变的简单，我们指定@代表的就是src；
        // 如，没有使用alias，import {Alert} from '../../alert'；
        // 用了alias：import {Alert} from '@/components/alert'；
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: {
        // 当我们build时，每个chunk文件里都有一些webpack加的runtime的代码，如__webpack_require__等，这些代码就叫webpack的runtime代码；
        // 它们是 Webpack 运行时必需的一段代码，会嵌入每个chunk文件中；
        // 通过设置 runtimeChunk: 'single'，我们可以将这些代码抽离成一个独立文件（如 runtime~main.js），
        // 这样就减小了其他chunk的大小，且利于browser缓存，因为webpack的runtime代码不会变动，可以缓存起来；
        runtimeChunk: 'single',
        splitChunks: {
            /**
             * 表示对同步和异步加载的模块 进行分割（例如通过 import() 动态引入的模块）。
             其他可选值：
             'initial'：只对入口文件做分割
             'async'：只对异步模块都进行分割
             'all'：对同步 + 异步模块都进行分割（推荐！）
             */
            chunks: 'all',
            // module大小必须 ≥ 20KB，Webpack 才会考虑把它拆出去，成为一个独立的chunk js文件；
            // 注意！module大小必须超过了20kb，webpack会不会将它拆出去，还要取决于其他条件，
            // 比如minChunks的值等等，如果不满足就不会拆，如果满足，才会拆；
            minSize: 20000,
            // 拆分后剩下的 chunk 大小必须 ≥ 0 才会保留，否则会删除，这个参数用于避免“拆得太碎”，通常保留为 0 或默认值即可；
            minRemainingSize: 0,
            // 模块至少被 2个 chunk 引用，才会被提取出来；
            // 默认值是 1，意思是只要被引用了1次，就可能被提取为独立的chunk；
            minChunks: 2,
            // 页面异步加载时，最多允许并发请求 30 个 chunk 文件；防止浏览器并发请求过多资源导致卡顿；
            // 按需调整数值；
            maxAsyncRequests: 30,
            // 页面初始加载时，最多允许并发请求 30 个 chunk 文件；
            // 按需调整数值；
            maxInitialRequests: 30,
            // "强制"分割的 chunk 的最小的size（单位：字节）；
            // 注意！enforceSizeThreshold的值是绝对的，只要超过这个数值的module就会被拆，
            // 而不会像上面的minSize还要看其他条件，如minChunks等，才决定拆不拆；
            // 它的优先级比上面的minSize要高；
            enforceSizeThreshold: 50000,
            // Webpack 会根据cacheGroups里的规则，把模块归类成一组，生成独立的chunk；
            // 也就是用来决定“哪些模块打包到同一个 chunk 文件里”的分组规则；
            cacheGroups: {
                // defaultVendors：用来处理第三方依赖node_modules；
                // 这个配置的目标就是：将所有第三方库抽离为一个独立的 chunk，即vendors.js；
                defaultVendors: {
                    // 匹配所有 node_modules 中的模块；
                    test: /[\\/]node_modules[\\/]/,
                    // 分组优先级：数值越大，优先级越高；最小值为-20，也是默认值；
                    // 所以同一个module如果符合两个 cache group，会优先按照defaultVendors组里的规则来执行；
                    // 相同的module命中多个 cache group时，会取优先级高的那个；
                    priority: -10,
                    // 如果该模块已经被打包过（比如在别的 chunk），就直接复用它，不再新建 chunk；
                    reuseExistingChunk: true,
                    // 打包生成的 chunk 文件名就是 vendors.js 或带 hash 的 vendors~xxx.js；
                    // 这里不加hash是因为node_Modules里的包比较稳定，我们希望browser对其进行cache；
                    // 不加 hash 是为了让 vendors.js 的名字保持稳定，便于浏览器长期缓存；
                    name: 'vendors',
                    // 对node_modules里的同步 + 异步module都生效；
                    chunks: 'all',
                },
                // default：用来提取项目内部被复用的module；
                default: {
                    // 只有被 2 次或以上引用 的模块，才会被提取为公共 chunk；
                    minChunks: 2,
                    // 优先级最低，只有在 defaultVendors 不匹配时才归到这里；
                    priority: -20,
                    // 如果该模块已经被打包过（比如在别的 chunk），就直接复用它，不再新建 chunk；
                    reuseExistingChunk: true,
                    // 生成的 chunk 的名字；
                    // 注意！这里写[contenthash]不起作用，因为[contenthash]只在上面output中才可以使用；
                    name: 'common'
                },
            },
        },
    },

}