module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: '3.0'
            }
        ],
        [
            // 处理.jsx文件必要的配置项；
            '@babel/preset-react',
            {
                // 自动注入 React，无需 import React from 'react'
                runtime: 'automatic'
            }
        ]
    ]
}