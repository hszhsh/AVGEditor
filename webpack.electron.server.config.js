const path = require('path');
const webpack = require("webpack");
const merge = require('webpack-merge').merge;
const exp = require('./webpack.electron.config');

module.exports = merge({
    entry: [
		"react-hot-loader/patch",

		'webpack-dev-server/client?http://localhost:3000',
		// bundle the client for webpack-dev-server
		// and connect to the provided endpoint
	
		'webpack/hot/only-dev-server',
		// bundle the client for hot reloading
		// only- means to only hot reload for successful updates
	],
    
    plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
	],
    
    // module: {
    //     rules: [
    //       {
    //         test: /\.js$/,
    //         loader: 'babel-loader'
    //       }
    //     ]
    // },
        
    devServer: {
        static: [path.join(__dirname, "dist")],
		host: 'localhost',
		port: 3000,
	
		historyApiFallback: true,
		// respond to 404s with index.html
	
		hot: true,
		// enable HMR on the server

		client: {
			overlay: false
		}
        
	}
}, exp[1]);
