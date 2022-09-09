const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  output: {
    path: path.join(__dirname, '/build'), // the bundle output path
    filename: 'bundle.js' // the name of the bundle
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: false
    }),
    new NodePolyfillPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    })
  ],
  devServer: {
    port: 3000,
    client: {
      overlay: {
        warnings: false
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // .js and .jsx files
        exclude: [
          /node_modules\/(?!@cwi\/react)/,
          /src\/routes/,
          /src\/controllers/,
          /src\/templates/,
          /src\/tests/,
          /public/
        ], // excluding the node_modules folder
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/, // styles files
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: 'url-loader',
        options: { limit: false },
        exclude: /node_modules/ // excluding the node_modules folder
      }
      // {
      //   test: /\.js$/,
      //   enforce: 'pre',
      //   exclude: /node_modules/, // This MAY still work with/without SOME node_modules
      //   use: ['source-map-loader']
      // }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modules: ['src', 'node_modules'],
    fallback: {
      fs: false
    }
  }
}
