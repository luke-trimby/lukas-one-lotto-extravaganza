const path = require('path');
var webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const isDebug =
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging';
const gameName = process.env.npm_package_name;
const version = process.env.npm_package_version;
const tsConfigPath = 'tsconfig.json';

const ifDefConfig = {
  __DEBUG__: isDebug,
  __NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  __VERSION__: JSON.stringify(version),
  'ifdef-verbose': true,
  'ifdef-triple-slash': true,
};

const tsLoaders = [{ loader: 'ts-loader' }];
if (!isDebug) {
  tsLoaders.push({ loader: 'ifdef-loader', options: ifDefConfig });
}

const config = {
  mode: isDebug ? 'development' : 'production',
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname, `build/${gameName}`),
    filename: 'src/game.js',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: tsLoaders,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
      __GAMENAME__: JSON.stringify(gameName),
      __VERSION__: JSON.stringify(version),
      __DEBUG__: JSON.stringify(isDebug),
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/index.html' },
        { from: 'assets/css/**/*', noErrorOnMissing: true },
        { from: 'assets/atlas/**/*', noErrorOnMissing: true },
        { from: 'assets/favi/**/*', noErrorOnMissing: true },
        { from: 'assets/font/**/*', noErrorOnMissing: true },
        { from: 'assets/static/**/*', noErrorOnMissing: true },
        { from: 'assets/audio/**/*', noErrorOnMissing: true },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    symlinks: false,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
        extensions: ['.ts', '.js', '.json'],
      }),
    ],
  },
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 8556,
    hot: true,
  },
  optimization: {
    minimize: !isDebug,
  },
};

module.exports = config;
