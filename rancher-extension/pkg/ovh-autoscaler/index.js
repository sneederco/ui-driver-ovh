import { importTypes } from '@rancher/auto-import';

// Init the package
export default function(plugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');
}
