const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // 访问内置的插件
const path = require('path') // 使用path是为了
module.exports = {
	entry: {
		main: path.resolve(__dirname, 'lib/SDBridge.ts'),
	},
	output: {
		filename: 'SDBridge.js',
		path: path.resolve(__dirname, 'dist')
	},
	module:{
		rules: [
			{
				test: /\.js$/, // 提供正则来匹配.js结尾的文件
				use: ['babel-loader'] // 匹配到这一类文件后，将其交给哪些loader去处理，这里我们先配置为最简单的模式
			},
			{
				test: /\.ts$/, // 提供正则来匹配.ts结尾的文件
				use: 'ts-loader'
			}
		]
	},
	plugins: [
		new webpack.ProgressPlugin(),
		new HtmlWebpackPlugin({ template: './dist/index.html' }),
		new webpack.ProvidePlugin({
			Buffer: ["buffer", "Buffer"]
		}),
	],
}
