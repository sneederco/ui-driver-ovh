// Init the package
export default function($plugin: any) {
  // Provide plugin metadata
  $plugin.metadata = require('./package.json');

  // Register OVH machine-config component
  $plugin.register('machine-config', 'ovh', () => import('./machine-config/ovh.vue'));
}
