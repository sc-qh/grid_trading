module.exports = {
    publicPath: '',
    indexPath: 'index.html',
    outputDir: 'dist',
    productionSourceMap: false,
    chainWebpack: config => {
      config.plugin('preload').tap(args => {
          args[0].fileBlacklist.push(/\.css/, /\.js/);
          return args;
      })
      config.plugin('inline-source')
          .use(require('html-webpack-inline-source-plugin'))
      config.plugin("html").tap(args => {
          args[0].chunksSortMode = "none";
          args[0].inlineSource = '(\.css|\.js$)';
          return args;
      });
    }
}