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

## Validation Commands
```bash
npm run check
```
This runs lint/build/validation in sequence and emits deployable files under `dist/`.
