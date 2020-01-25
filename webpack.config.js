const webpack = require('webpack');
require('dotenv').config();
const dotenv = require('dotenv');
const path = require('path');
const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');


const SRC_DIR = path.join(__dirname, '/client/src');
const DIST_DIR = path.join(__dirname, '/client/dist');
const CompressionPlugin = require('compression-webpack-plugin');
const CSSModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: true,
    sourceMap: true,
    localIdentName: '-[name]-[local]-[hash:base64]',
    // minimize: true,
  },
};

const CSSLoader = {
  loader: 'css-loader',
  options: {
    modules: false,
    sourceMap: true,
    // minimize: true,
  },
};

const postCSSLoader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcssrc',
    sourceMap: true,
    plugins: () => [
      autoprefixer({
        browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
      }),
    ],
  },
};

module.exports = (env) => {
  const currentPath = path.join(__dirname);
  const localDevEnv = currentPath + '/.env';

  // object for client ENV
  const productionEnv = {
    STRIPE: process.env.STRIPE,
    MAIL_GUN_DOMAIN: process.env.MAIL_GUN_DOMAIN,
    GEOCODE_KEY: process.env.GEOCODE_KEY,
    JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN,
    JWT_SECRET_GEN: process.env.JWT_SECRET_GEN,
    MAIL_GUN_RESET_LINK: 'https://www.lotuspetfoods.com/password-reset',
    MAIL_GUN_EMAIL_DOMAN: process.env.MAIL_GUN_EMAIL_DOMAIN,
  };
  const localEnvConfigs = dotenv.config({ path: localDevEnv }).parsed;

  // Check if production
  const fileEnv = env.ENVIRONMENT === 'production' ? productionEnv : localEnvConfigs;

  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  return {
    mode: 'development',
    entry: ['@babel/polyfill', path.resolve(__dirname, './client/src')],
    output: {
      path: path.resolve(__dirname, './client/dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          loader: 'babel-loader',
          test: /\.js[x]?/,
          exclude: /node_modules/,
          options: {
            presets: [['@babel/preset-env', { modules: false }], '@babel/react'],
            env: {
              test: {
                presets: [['@babel/preset-env'], '@babel/react'],
              },
            },
          },
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: ['style-loader', CSSLoader, postCSSLoader, 'sass-loader'],
        },
        {
          test: /\.module\.scss$/,
          use: ['style-loader', CSSModuleLoader, postCSSLoader, 'sass-loader'],
        },
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.HOSTNAME': JSON.stringify(process.env.USER),
        'process.env.SERVER_PORT': JSON.stringify(process.env.SERVER_PORT),
      }),
      new webpack.DefinePlugin(envKeys),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      new webpack.ProvidePlugin({
        Promise: 'es6-promise-promise',
      }),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 6,
            compress: true,
            output: {
              comments: false,
              beautify: false,
            },
          },
        }),
      ],
      concatenateModules: true,
    },
    resolve: {
      extensions: ['.jsx', '.js'],
    },
    ],
  };
};
