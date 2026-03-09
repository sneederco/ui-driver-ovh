import { IPlugin } from '@shell/core/types';
import OvhMachineConfig from './machine-config/ovh.vue';

// Init the package
export default function($plugin: IPlugin) {
  // Provide plugin metadata
  $plugin.metadata = require('./package.json');

  // Register OVH machine-config component
  $plugin.register('machine-config', 'ovh', OvhMachineConfig);
}
