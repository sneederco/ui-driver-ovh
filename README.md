# ui-driver-ovh

OVH node template UI companion for Rancher.

## Install / Adoption Guide

See `docs/README.md` for the split-repo install flow using:

- `sneederco/docker-machine-driver-ovh` (backend binary)
- `sneederco/ui-driver-ovh` (Rancher UI companion)

The guide includes:

- prerequisites
- artifact URL/checksum verification workflow
- Rancher API registration calls (backend first, UI second)
- adoption + rollback procedures
- branch/command consistency notes

## Included UI Assets

- `rancher/ovh-ui-config.json` - Rancher form field definitions, required flags, API option sources, and static fallback options.
- `rancher/ovh-create-node-schema.json` - JSON schema with required validation and field-level validation messages.
- `samples/field-definitions.sample.json` - Sample field definition payload for UI integration.
- `samples/validation-messages.sample.json` - Sample validation message mapping for form errors.

## Issue #2 Dual-Path Prototype

- `src/dual-path.html` + `dist/dual-path.html`
- Covers both:
  - Hosted OVH MKS
  - OVH Nodes + RKE2/K3s
- Includes required field validation and static fallback options for sprint evidence.

## Validation Commands

```bash
npm run check
npm run render:proof
```

`npm run check` runs lint/build/validation and emits deployable files under `dist/`.
