# Issue #4 support — Hosted MKS UI field mapping

Issue: https://github.com/sneederco/docker-machine-driver-ovh/issues/4

This doc maps the hosted MKS UI fields in this repo to expected backend intent for WS2/issue #4.

## Hosted MKS path (`provisioningMode=hosted-mks`)

- `mksClusterName`
  - UI purpose: cluster identifier entered by user
  - Backend intent: create-cluster name input
- `mksRegion`
  - UI purpose: OVH region for managed control plane
  - Backend intent: region selector for cluster and default node pool
- `mksVersion`
  - UI purpose: Kubernetes version dropdown
  - Backend intent: create-cluster version input
- `mksNodepoolFlavor`
  - UI purpose: default worker flavor
  - Backend intent: initial node pool flavor
- `mksNodepoolDesiredNodes`
  - UI purpose: initial node count
  - Backend intent: initial node pool desired size (and later scale baseline)

## Node path (`provisioningMode=node-rke2-k3s`)

- `region`, `flavor`, `image` remain required only for node provisioning.

## Validation behavior

- `provisioningMode` is always required.
- Hosted MKS fields are conditionally required when `provisioningMode=hosted-mks`.
- Node fields are conditionally required when `provisioningMode=node-rke2-k3s`.
- JSON Schema enforces conditional requirements via `if/then` blocks.

## Notes

- This repo provides UI schema + validation contracts.
- Backend implementation details (create/get/delete/scale logic) remain in `docker-machine-driver-ovh` WS2 scope.
