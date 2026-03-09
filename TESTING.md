# Testing Guide - UI Modernization (v1.1.0)

## Overview
This guide covers testing the modernized OVH Rancher UI driver with dynamic dropdowns, enhanced validation, and Sneederco branding.

## Quick Start

### 1. Build & Validate
```bash
npm run check
```
This runs lint + build + validation. Should complete without errors.

### 2. View the Interactive Prototype
```bash
# Open in browser
open dist/dual-path.html

# Or generate fresh version
npm run render:proof
```

## What Changed

### New Fields Added
1. **Project ID** (required)
   - 32-character hexadecimal string
   - Validates format: `^[a-f0-9]{32}$`
   - Example: `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`

2. **SSH Key** (required)
   - Dynamic dropdown fetching from `/v1/ovh/ssh-keys?projectId={id}&region={region}`
   - Depends on projectId and region selections
   - Fallback message if no keys available

3. **Billing Period** (required)
   - Options: hourly (default) | monthly
   - Displays cost implications and warnings
   - Monthly shows commitment warning

4. **Additional Disk Size** (optional)
   - Number input, 0-10000 GB
   - Validates range

5. **Instance Name** (optional)
   - Text input with pattern validation
   - Alphanumeric + hyphens only
   - Auto-generated if not provided

### Enhanced Existing Fields

**Region**
- Expanded from 3 to 8 options
- Added full geographic names
- Options: GRA, SBG, BHS, UK1, DE1, WAW, SGP, SYD

**Flavor**
- Added CPU/RAM specifications
- Categorized: General Purpose (b2), Compute (c2), Memory (r2)
- Tooltips explain sizing guidance

**Image**
- Expanded to 7 options
- Added Ubuntu 24.04 LTS, AlmaLinux 9
- Better descriptions

## Testing the Prototype (dual-path.html)

### Test Case 1: Valid MKS Configuration
1. Open `dist/dual-path.html`
2. Select "Hosted OVH MKS"
3. Fill in:
   - Project ID: `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`
   - Region: `GRA (Gravelines, France)`
   - SSH Key: `my-laptop-key`
   - Kubernetes Version: `1.31 (Latest)`
   - Node Pool Flavor: `b2-15`
   - Billing Period: `Hourly`
4. Click "✓ Validate Configuration"
5. **Expected**: Green success message

### Test Case 2: Valid Self-Managed Configuration
1. Select "OVH Nodes + RKE2/K3s"
2. Fill in:
   - Project ID: `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`
   - Region: `BHS (Beauharnois, Canada)`
   - SSH Key: `production-key`
   - Distribution: `RKE2`
   - Node Flavor: `c2-30`
   - Image: `Ubuntu 22.04 LTS`
   - Billing Period: `Monthly`
   - Disk Size: `500`
   - Instance Name: `prod-node-1`
6. Click validate
7. **Expected**: Success with billing warning visible

### Test Case 3: Invalid Project ID
1. Enter Project ID: `invalid-id`
2. Click validate
3. **Expected**: Red error highlighting invalid project ID format

### Test Case 4: Missing Required Fields
1. Leave Project ID, Region, or SSH Key blank
2. Click validate
3. **Expected**: Multiple errors listed, fields highlighted in red

### Test Case 5: Invalid Instance Name
1. Enter name: `my node 1!` (spaces and special chars)
2. Click validate
3. **Expected**: Error about invalid characters

### Test Case 6: Billing Period Warning
1. Select "Monthly" billing
2. **Expected**: Blue warning box appears explaining commitment

## Testing in Rancher (Integration)

### Prerequisites
1. Rancher 2.7+ cluster running
2. docker-machine-driver-ovh backend installed and registered
3. Backend implements the new API endpoints (see below)

### Installation Steps
1. Download artifacts from `dist/`:
   - `ovh-ui-config.json`
   - `ovh-create-node-schema.json`
   - `ovh-ui-bundle.json`

2. Register UI driver in Rancher:
```bash
# Get Rancher API token
RANCHER_TOKEN=$(get-secret rancher-bearer-token)
RANCHER_URL=$(get-secret rancher-url)

# Register or update UI driver
curl -sk -X PUT \
  -H "Authorization: Bearer $RANCHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d @dist/ovh-ui-bundle.json \
  "$RANCHER_URL/v3/kontainerDrivers/ovh/ui-config"
```

3. Navigate to Rancher UI:
   - Cluster Management → Drivers → Node Drivers
   - Find "OVHcloud (Sneederco)"
   - Click to create node template

### Integration Test Cases

**Test 1: Dynamic Region Loading**
1. Open node template creation
2. **Expected**: Region dropdown populates from `/v1/ovh/regions` or shows fallback options

**Test 2: Dependent Dropdowns**
1. Select a region
2. **Expected**: Flavor and Image dropdowns refresh for that region

**Test 3: SSH Key Loading**
1. Enter valid Project ID
2. Select region
3. **Expected**: SSH key dropdown populates with user's keys

**Test 4: Form Validation**
1. Try to save with missing required fields
2. **Expected**: Validation errors prevent save

**Test 5: Billing Period Display**
1. Toggle between hourly/monthly
2. **Expected**: UI shows cost implications

## Backend API Endpoints (Required)

The UI expects these endpoints in the docker-machine-driver-ovh backend:

### GET /v1/ovh/regions
Returns list of available regions
```json
[
  { "id": "GRA", "name": "GRA (Gravelines, France)" },
  { "id": "SBG", "name": "SBG (Strasbourg, France)" }
]
```

### GET /v1/ovh/flavors?region={region}
Returns flavors available in specified region
```json
[
  { 
    "id": "b2-7", 
    "name": "b2-7 (2 vCPU, 7GB RAM) - General Purpose" 
  }
]
```

### GET /v1/ovh/images?region={region}
Returns OS images available in specified region
```json
[
  { "id": "ubuntu-22.04", "name": "Ubuntu 22.04 LTS" }
]
```

### GET /v1/ovh/ssh-keys?projectId={id}&region={region}
Returns SSH keys registered in OVH project
```json
[
  { "id": "key-abc123", "name": "my-laptop-key" },
  { "id": "key-def456", "name": "production-key" }
]
```

## Validation Commands

```bash
# Lint JSON files
npm run lint

# Build dist artifacts
npm run build

# Validate schema compliance
npm run validate

# All checks (recommended)
npm run check
```

## Visual Testing Checklist

- [ ] Project ID field has tooltip explaining where to find it
- [ ] All dropdowns show placeholder text when empty
- [ ] Required fields show red asterisk (*)
- [ ] Billing period shows warning for monthly
- [ ] Field sections are visually separated
- [ ] Error messages are clear and actionable
- [ ] Success validation shows green confirmation
- [ ] Invalid fields highlight in red
- [ ] Sneederco branding visible (colors, name)
- [ ] Help text appears below each field

## Backward Compatibility

### Existing Configs
Old node templates with only `region`, `flavor`, `image` will:
- Continue to work
- Get `billingPeriod: "hourly"` default
- Prompt for new required fields (projectId, sshKey) on edit

### Migration Path
1. Existing clusters: No changes needed
2. New node templates: All fields required
3. Editing old templates: Will prompt for projectId and sshKey

## Known Limitations

1. **Dynamic dropdowns**: Require backend API implementation
   - Currently fall back to static options
   - Backend endpoints are placeholders

2. **SSH key validation**: Cannot validate key exists in OVH until backend connects

3. **Billing period**: UI shows warning but actual billing handled by OVH

## Troubleshooting

### Build Fails
```bash
# Check Node version
node --version  # Should be 18+

# Clean and rebuild
rm -rf dist/
npm run build
```

### Validation Errors
- Check JSON syntax in `rancher/*.json`
- Verify required fields match between config and schema
- Run `npm run lint` for detailed errors

### Prototype Doesn't Load
- Check browser console for errors
- Try opening with `file://` or local server
- Ensure JavaScript is enabled

## Success Criteria

✅ All tests pass: `npm run check` exits 0  
✅ Prototype validates valid configs  
✅ Prototype rejects invalid configs  
✅ Fields show helpful tooltips  
✅ Sneederco branding visible  
✅ Backward compatible with existing configs  
✅ Build artifacts generated in dist/  

## Next Steps

1. **Backend Integration**: Implement API endpoints in docker-machine-driver-ovh
2. **Pull Request**: Create PR from `rewrite/ui-modern` → `main`
3. **Testing**: Test in live Rancher environment with backend
4. **Documentation**: Update main README with new features
5. **Release**: Tag v1.1.0 when backend is ready
