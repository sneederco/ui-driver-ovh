import OvhMachineConfig from './machine-config/ovh.vue';

// Init the package
export default function($plugin: any) {
  // Provide plugin metadata
  $plugin.metadata = require('./package.json');

  // Register OVH machine-config component (inline, no lazy load)
  $plugin.register('machine-config', 'ovh', OvhMachineConfig);
}
