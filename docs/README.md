# Rancher OVH Driver Install & Adoption (Split Repos)

This guide documents the **split-repo** strategy:

- Backend driver binary repo: `sneederco/docker-machine-driver-ovh` (default branch: `master`)
- Rancher UI companion repo: `sneederco/ui-driver-ovh` (default branch: `main`)

Use this when installing or adopting the OVH node driver in Rancher with a separate backend/UI registration flow.

---

## 0) Prerequisites

- Rancher admin API token with node driver write access.
- A public HTTPS artifact host for backend binary and UI bundle.
- Local tooling:
  - `git`
  - `curl`
  - `jq`
  - `sha256sum` (Linux) or `shasum -a 256` (macOS)
- Rancher URL + token exported:

```bash
export RANCHER_URL="https://rancher.example.com"
export RANCHER_TOKEN="token-xxxx:yyyy"
```

Optional but recommended:

```bash
set -euo pipefail
```

---

## 1) Pull repos from correct branches

> Verified branch defaults at time of writing:
> - `docker-machine-driver-ovh`: `master`
> - `ui-driver-ovh`: `main`

```bash
# backend (machine driver)
git clone --branch master https://github.com/sneederco/docker-machine-driver-ovh.git

# ui companion
git clone --branch main https://github.com/sneederco/ui-driver-ovh.git
```

---

## 2) Build backend artifact (machine driver)

From `docker-machine-driver-ovh`:

```bash
cd docker-machine-driver-ovh
GOOS=linux GOARCH=amd64 go build -o dist/docker-machine-driver-ovh .
```

Publish artifact to HTTPS (example path shown):

```bash
# pick a version tag or date-based version
export VERSION="v0.1.0"
export DRIVER_FILE="docker-machine-driver-ovh-linux-amd64-${VERSION}"
cp dist/docker-machine-driver-ovh "/tmp/${DRIVER_FILE}"

# upload (replace with your artifact host/path)
# scp "/tmp/${DRIVER_FILE}" ops@downloads.example.net:/var/www/html/ovh/
```

Compute checksum (sha256):

```bash
# macOS
DRIVER_SHA256=$(shasum -a 256 "/tmp/${DRIVER_FILE}" | awk '{print $1}')
# linux equivalent:
# DRIVER_SHA256=$(sha256sum "/tmp/${DRIVER_FILE}" | awk '{print $1}')

echo "$DRIVER_SHA256"
```

Set published URL:

```bash
export DRIVER_URL="https://downloads.example.net/ovh/${DRIVER_FILE}"
```

---

## 3) Build/publish UI artifact

From `ui-driver-ovh`:

```bash
cd ../ui-driver-ovh
```

If your UI build outputs a JS bundle (example `component.js`), publish it to HTTPS:

```bash
export UI_VERSION="v0.1.0"
export UI_FILE="ovh-ui-${UI_VERSION}.js"

# Example only: replace source bundle path with your actual output file
# cp dist/component.js "/tmp/${UI_FILE}"

# upload (replace with your artifact host/path)
# scp "/tmp/${UI_FILE}" ops@downloads.example.net:/var/www/html/ovh/
```

Set UI URL:

```bash
export UI_URL="https://downloads.example.net/ovh/${UI_FILE}"
```

> Rancher `uiUrl` does not require checksum, but keep artifact versioned and immutable.

---

## 4) Artifact URL + checksum verification workflow

Validate backend URL availability + checksum before Rancher API calls:

```bash
curl -fL "$DRIVER_URL" -o /tmp/ovh-driver-verify

# macOS
VERIFY_SHA=$(shasum -a 256 /tmp/ovh-driver-verify | awk '{print $1}')
# linux:
# VERIFY_SHA=$(sha256sum /tmp/ovh-driver-verify | awk '{print $1}')

test "$VERIFY_SHA" = "$DRIVER_SHA256"
echo "Backend checksum OK"
```

Validate UI URL:

```bash
curl -fI "$UI_URL"
```

Extract allowed domains for Rancher:

```bash
export DRIVER_HOST=$(echo "$DRIVER_URL" | awk -F/ '{print $3}')
export UI_HOST=$(echo "$UI_URL" | awk -F/ '{print $3}')
```

---

## 5) Rancher registration (separate backend then UI)

### Step 5A: Register backend driver first

```bash
curl -sk -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${RANCHER_URL}/v3/nodeDrivers" \
  --data-binary @- <<JSON
{
  "name": "ovh",
  "url": "${DRIVER_URL}",
  "checksum": "${DRIVER_SHA256}",
  "uiUrl": "",
  "whitelistDomains": ["${DRIVER_HOST}", "${UI_HOST}"],
  "active": true
}
JSON
```

If already present, fetch ID and update:

```bash
export DRIVER_ID=$(curl -sk -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  "${RANCHER_URL}/v3/nodeDrivers?name=ovh" | jq -r '.data[0].id')

# Update backend URL/checksum/domain allowlist
curl -sk -X PUT -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${RANCHER_URL}/v3/nodeDrivers/${DRIVER_ID}" \
  --data-binary @- <<JSON
{
  "url": "${DRIVER_URL}",
  "checksum": "${DRIVER_SHA256}",
  "whitelistDomains": ["${DRIVER_HOST}", "${UI_HOST}"],
  "active": true
}
JSON
```

### Step 5B: Register UI URL after backend is healthy

```bash
# ensure DRIVER_ID is set as above
curl -sk -X PUT -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${RANCHER_URL}/v3/nodeDrivers/${DRIVER_ID}" \
  --data-binary @- <<JSON
{
  "uiUrl": "${UI_URL}",
  "whitelistDomains": ["${DRIVER_HOST}", "${UI_HOST}"],
  "active": true
}
JSON
```

### Step 5C: Verify Rancher state

```bash
curl -sk -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  "${RANCHER_URL}/v3/nodeDrivers?name=ovh" \
  | jq '.data[] | {id,name,active,url,uiUrl,checksum,whitelistDomains}'
```

UI check:

- Rancher UI → Cluster Management → Drivers → Node Drivers
- Confirm `ovh` is Active
- Confirm backend URL/checksum and UI URL are the expected versioned artifacts

---

## 6) Adoption path (existing monolithic setup -> split repos)

If you already run `ovh` with only backend URL:

1. Keep existing backend URL/checksum pinned.
2. Publish UI artifact from `ui-driver-ovh`.
3. Add UI host to `whitelistDomains`.
4. Update `uiUrl` only (Step 5B).
5. Validate node template/create flow in Rancher UI.

No immediate backend binary replacement required for UI adoption.

---

## 7) Rollback notes

### Roll back UI only

```bash
curl -sk -X PUT -H "Authorization: Bearer ${RANCHER_TOKEN}" \
  -H 'Content-Type: application/json' \
  "${RANCHER_URL}/v3/nodeDrivers/${DRIVER_ID}" \
  --data-binary '{"uiUrl":"","active":true}'
```

### Roll back backend artifact

- Re-point `url` + `checksum` to last known-good backend binary.
- Keep domain allowlist inclusive of active artifact hosts.

### Hard reset (last resort)

If Rancher object is wedged and updates fail:

1. Set `active=false` on current `ovh` driver.
2. Delete/recreate `ovh` nodeDriver.
3. Re-apply Step 5A then 5B.

---

## Hosted MKS SOP reference (Issue #4)

For hosted lifecycle operations and teardown controls, use:

- `docs/ISSUE-4-HOSTED-MKS-FLOW.md` (this repo, operator-facing)
- `docker-machine-driver-ovh/docs/ISSUE-4-HOSTED-MKS-SOP.md` (backend/API runbook)

## 8) Consistency checks against current repos

- Backend repo clone URL: `https://github.com/sneederco/docker-machine-driver-ovh.git`
- Backend default branch: `master`
- Backend binary name used in repo/docs: `docker-machine-driver-ovh`
- UI repo clone URL: `https://github.com/sneederco/ui-driver-ovh.git`
- UI default branch: `main`

Quick verify commands:

```bash
git ls-remote --heads https://github.com/sneederco/docker-machine-driver-ovh.git
git ls-remote --heads https://github.com/sneederco/ui-driver-ovh.git
```
