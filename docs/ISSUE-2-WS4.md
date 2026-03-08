# Issue #2 (WS4) — UI forms for dual provisioning

Issue: https://github.com/sneederco/ui-driver-ovh/issues/2

## Scope covered in this repo
- Rancher form definitions for OVH provider flow
- Required field validation and fallback option behavior
- Build/validation command path for reproducible UI artifacts

## Source of truth files
- `rancher/ovh-ui-config.json`
- `rancher/ovh-create-node-schema.json`
- `samples/field-definitions.sample.json`
- `samples/validation-messages.sample.json`

## Command consistency proof
Executed from repo root:

```bash
npm run check
```

Observed result:
- lint parsed JSON files successfully
- build wrote artifacts to `dist/`
- validate confirmed required validation + fallback options

## Open items
- Add screenshot evidence from Rancher create-cluster flow (hosted vs node path)
- Link backend path docs once WS2/WS3 execution environment is reproducible on this host
