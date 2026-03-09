const config = require('@rancher/shell/vue.config');

const baseConfig = config(__dirname, {
  excludes: [],
});

// Set explicit public path for GitHub Pages
baseConfig.publicPath = 'https://sneederco.github.io/ui-driver-ovh/extensions/ovh-autoscaler/1.0.0/';

module.exports = baseConfig;
