# OVHcloud Rancher UI Extension

This Rancher UI Extension adds Cluster Autoscaler support to the OVH node driver.

## Features

- **Autoscaler Toggle**: Enable/disable cluster autoscaler with a checkbox
- **Min/Max Nodes**: Configure scaling boundaries
- **Auto-Deploy**: Works with the autoscaler-controller for zero-touch deployment

## Building

Requires Node.js 20.x:

```bash
cd rancher-extension
yarn install
yarn build-pkg ovh-autoscaler
```

Built extension will be in `dist-pkg/ovh-autoscaler-1.0.0/`

## Installation

1. Build the extension or download from releases
2. In Rancher UI, go to Extensions
3. Click three-dot menu → Developer Load
4. Enter the extension URL

## Development

```bash
API=https://your-rancher.com yarn dev
```
