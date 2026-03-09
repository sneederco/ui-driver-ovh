// Init the package
export default function($plugin: any) {
  // Provide plugin metadata
  $plugin.metadata = require('./package.json');

  // Register OVH machine-config component with factory function
  $plugin.register('machine-config', 'ovh', () => import('./machine-config/ovh.vue'));
}
