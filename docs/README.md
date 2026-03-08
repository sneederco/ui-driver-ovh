# OVHcloud Node Driver Docs

## Quickstart

### 1) Prep local env

```bash
cd /Users/ryanfleming/clawd/projects/shared/ovh-driver
mkdir -p dist
```

### 2) Build driver binary (from your OVH driver repo)

```bash
# run from the OVH node driver source repo root
GOOS=linux GOARCH=amd64 go build -o dist/docker-machine-driver-ovh ./cmd/docker-machine-driver-ovh
```

### 3) Publish binary for Rancher

```bash
# example publish target (replace host/path)
scp dist/docker-machine-driver-ovh ops@downloads.example.net:/var/www/html/ovh-driver/docker-machine-driver-ovh-linux-amd64
shasum -a 256 dist/docker-machine-driver-ovh
```

### 4) Validate artifact URL and checksum

```bash
# replace URL with published artifact
curl -fL https://downloads.example.net/ovh-driver/docker-machine-driver-ovh-linux-amd64 -o /tmp/docker-machine-driver-ovh
shasum -a 256 /tmp/docker-machine-driver-ovh
```

---

## Rancher Registration

> Requires Rancher API token with nodeDrivers write access.

### 1) Export vars

```bash
export RANCHER_URL="https://rancher.rkfleming.com"
export RANCHER_TOKEN="token-xxxx:yyyy"
export DRIVER_URL="https://downloads.example.net/ovh-driver/docker-machine-driver-ovh-linux-amd64"
export DRIVER_CHECKSUM="<sha256-from-build>"
```

### 2) Create/refresh node driver

```bash
curl -sk -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${RANCHER_URL}/v3/nodeDrivers" \
  --data-binary @- <<'JSON'
{
  "name": "ovh",
  "url": "'"${DRIVER_URL}"'",
  "checksum": "'"${DRIVER_CHECKSUM}"'",
  "uiUrl": "",
  "whitelistDomains": ["downloads.example.net"],
  "active": true
}
JSON
```

### 3) Verify driver activation

```bash
curl -sk -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  "${RANCHER_URL}/v3/nodeDrivers?name=ovh" | jq '.data[] | {id,name,active,builtin,url}'
```

### 4) Confirm in Rancher UI

- Cluster Management → Drivers → Node Drivers
- Confirm `ovh` is Active and URL/checksum match published artifact

---

## Known Limits (Current Sprint Scope)

1. **Linux-only target for Week 1**
   - Binary published as `linux/amd64` only.
   - arm64 and windows artifacts are out-of-scope for first ship.

2. **Single-region assumptions in examples**
   - Command snippets assume one OVH project/region per cluster build.
   - Multi-region orchestration should be handled by separate node templates.

3. **No automated binary signing in this doc flow**
   - Integrity is checksum-based only in Week 1.
   - Add signed release artifacts in next hardening pass.

4. **Rancher API object update behavior**
   - Some Rancher versions require delete/recreate of a custom nodeDriver when URL changes.
   - If PATCH fails, deactivate + recreate driver with same name.

5. **Domain allowlist requirement**
   - Rancher may block download hosts not in allowlist.
   - Keep `whitelistDomains` aligned with artifact host.

### Known-limits verification snippets

```bash
# check active driver list
curl -sk -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  "${RANCHER_URL}/v3/nodeDrivers" | jq -r '.data[] | [.name,.active,.url] | @tsv'

# check artifact host resolves from Rancher node
dig +short downloads.example.net
```
