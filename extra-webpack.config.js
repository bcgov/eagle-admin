const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config) => {
  config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
    if (plugin instanceof TerserPlugin) {
      const newPlugin = new TerserPlugin({
        exclude: /scripts\..*\.js$/,
        terserOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            comments: false,
          },
        },
        extractComments: false,
      });
      return newPlugin;
    }
    return plugin;
  });

  return config;
};