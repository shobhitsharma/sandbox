const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PORT = 9000;
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  entry: [
    './src/js/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sandbox.js'
  },
  mode: isProduction ? 'production' : 'development',
  watch: !isProduction,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: isProduction,
    port: PORT
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        "style-loader",
        "css-loader",
        "sass-loader"
      ]
    }, {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.html",
      inject: false
    })
  ]
};