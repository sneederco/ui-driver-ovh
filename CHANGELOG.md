# Changelog

## [1.1.0] - 2026-03-09 - UI Modernization (Sneederco)

### Added
- **Project ID field**: Required 32-character hexadecimal project ID with pattern validation
- **SSH Key dropdown**: Dynamic dropdown for selecting SSH keys registered in OVH project
  - Falls back to static message if no keys available
  - Depends on projectId and region
  - Endpoint: `/v1/ovh/ssh-keys?projectId={{projectId}}&region={{region}}`
- **Billing Period selector**: Choose between hourly (pay-as-you-go) or monthly (~30% savings)
  - Includes helpful descriptions and cost implications
  - Default: hourly
  - Warning message for monthly commitment
- **Additional Disk Size**: Optional field for additional block storage (0-10000 GB)
- **Instance Name**: Optional custom name field with pattern validation (alphanumeric + hyphens)
- **Sneederco Branding**:
  - Updated display name to "OVHcloud (Sneederco)"
  - Added brand colors (#123F6D primary, #0078D7 secondary)
  - Enhanced package.json with Sneederco authorship
  - Added branding section with logo and support URLs

### Enhanced
- **Field Tooltips**: Added comprehensive help text for all fields explaining:
  - What the field does
  - When to use specific options
  - Where to find values (e.g., Project ID location)
  - Performance/cost implications
- **Validation Messages**: Improved error messages with specific guidance
  - Project ID format validation
  - Pattern validation for all fields
  - Clear required field indicators
- **Region Options**: Expanded from 3 to 8 regions with full names:
  - GRA, SBG, BHS, UK1, DE1, WAW, SGP, SYD
- **Flavor Options**: Expanded with CPU/RAM specs and categories:
  - General Purpose (b2-series)
  - Compute Optimized (c2-series)
  - Memory Optimized (r2-series)
- **Image Options**: Expanded to include Ubuntu 24.04, AlmaLinux, and more
- **UI Sections**: Organized fields into logical sections:
  - Project Configuration (projectId, region)
  - Instance Specification (flavor, image, sshKey)
  - Billing & Options (billingPeriod, diskSize, name)

### Updated
- **dual-path.html prototype**:
  - Full redesign with Sneederco branding
  - Enhanced styling with modern UI/UX
  - Dynamic billing warning for monthly selection
  - Comprehensive field validation
  - Visual feedback for invalid fields
  - Improved help text and tooltips
- **JSON Schema**: Updated to v1.1.0 with all new fields and validation rules
- **package.json**: Added Sneederco attribution and keywords

### Technical Details
- All dynamic dropdowns include `fallbackOptions` for offline/initial state
- Dropdowns with dependencies (`dependsOn`) will refresh when parent fields change
- Backend driver endpoints (v1 API) are placeholders - actual implementation needed
- Maintains backward compatibility with existing credential schema
- Build validates successfully with new required fields

### Testing
```bash
# Validate all changes
npm run check

# View prototype
open dist/dual-path.html

# Or generate fresh proof
npm run render:proof
```

### API Endpoints (Backend TODO)
The following endpoints need to be implemented in the docker-machine-driver-ovh backend:
- `GET /v1/ovh/regions` - List available regions
- `GET /v1/ovh/flavors?region={region}` - List flavors for region
- `GET /v1/ovh/images?region={region}` - List images for region
- `GET /v1/ovh/ssh-keys?projectId={id}&region={region}` - List SSH keys

### Migration Notes
Existing configs will continue to work. New fields have sensible defaults:
- `billingPeriod`: defaults to "hourly"
- `diskSize`: optional, no default
- `name`: optional, auto-generated if not provided
- `projectId`: required for new configs
- `sshKey`: required for new configs

## [0.1.0] - Initial Release
- Basic UI config with region, flavor, image
- Dual-path prototype for MKS vs self-managed
- JSON schema validation
