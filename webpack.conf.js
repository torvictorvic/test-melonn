module.exports = {
    entry: './src/app/index.js',
    output: {
      path: __dirname + '/src/public',
      filename: 'bundle.js'
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
          {
              use: 'babel-loader',
              test: /\.js$/,
              exclude: /node_modules/
          }
        ]
    }
};
/*
var config = Encore.getWebpackConfig();
config.node = { fs: 'empty' };
module.exports = config;
*/