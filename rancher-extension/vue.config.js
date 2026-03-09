const config = require('@rancher/shell/vue.config');

const baseConfig = config(__dirname, {
  excludes: [],
});

// Override public path for plugin to work when loaded externally
if (baseConfig.configureWebpack) {
  const original = baseConfig.configureWebpack;
  baseConfig.configureWebpack = (cfg) => {
    original(cfg);
    cfg.output = cfg.output || {};
    cfg.output.publicPath = 'auto';
  };
}

module.exports = baseConfig;
