import { IPlugin } from '@shell/core/types';

// Init the package
export default function($plugin: IPlugin) {
  // Provide plugin metadata
  $plugin.metadata = require('./package.json');

  // Register OVH machine-config component (lazy load)
  $plugin.register('machine-config', 'ovh', () => import('./machine-config/ovh.vue'));
}
