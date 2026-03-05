const path = require('path');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const resolvedApiBase = process.env.API_BASE || '/api';

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/main.tsx',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/[name].[contenthash:8].js',
      chunkFilename: 'assets/[name].[contenthash:8].chunk.js',
      publicPath: isProd ? '/emendas/' : '/',
      clean: true,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    module: {
      rules: [
        // TypeScript + JSX via Babel
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: '> 0.5%, last 2 versions, not dead' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                ['@babel/preset-typescript'],
              ],
            },
          },
        },
        // CSS + PostCSS (Tailwind)
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['tailwindcss', 'autoprefixer'],
                },
              },
            },
          ],
        },
        // Images / SVGs / fonts
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|eot|ttf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash:8][ext]',
          },
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        favicon: './public/favicon.ico',
      }),
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: 'assets/[name].[contenthash:8].css',
            }),
          ]
        : []),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            noErrorOnMissing: true,
            // skip favicon — HtmlWebpackPlugin handles it
            globOptions: { ignore: ['**/favicon.ico'] },
          },
        ],
      }),
      new webpack.DefinePlugin({
        __API_BASE__: JSON.stringify(resolvedApiBase),
        'process.env.API_BASE': JSON.stringify(resolvedApiBase),
      }),
    ],

    // Source maps for debugging
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',

    // Dev server: proxy /api to backend so relative API calls work locally
    ...(!isProd && {
      devServer: {
        host: '0.0.0.0',
        port: 3000,
        historyApiFallback: true,
        proxy: {
          '/api': {
            target: 'http://localhost:8085',
            changeOrigin: true,
          },
        },
      },
    }),

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};
