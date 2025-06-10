const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/core/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
    clean: true,
  },
  devtool: 'source-map',
  devServer: {
    static: './dist',
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/core/index.html',
      filename: 'index.html',
    }),
    // Copy sample VRM models, animations, and skybox textures to the dist folder
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/models', to: 'models' },
        { from: 'assets/skybox', to: 'skybox' },
        { from: 'assets/animations', to: 'animations' }
      ],
    }),
    // Define environment variables for client-side code
    new webpack.DefinePlugin({
      // Define the entire process.env object to ensure it exists
      'process.env': JSON.stringify(process.env || {}),
      // Override specific variables with their values
      'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3000/api')
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
  }
};
