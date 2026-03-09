import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';

// Init the package
export default function($plugin: IPlugin) {
  // Auto-import from folders
  importTypes($plugin);

  // Provide plugin metadata
  $plugin.metadata = require('./package.json');
}
