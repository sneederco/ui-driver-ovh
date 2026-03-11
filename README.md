# OVHcloud Node Driver for Rancher

Provision OVHcloud Public Cloud instances directly from Rancher Manager.

## Features

- **Native Rancher Integration**: Create OVHcloud instances through the Rancher UI
- **Security Group Support**: Attach OpenStack security groups to instances
- **Autoscaler Ready**: Built-in support for Rancher cluster autoscaling
- **Multiple Regions**: US (Virginia, Oregon), EU (Germany, France)
- **Pricing Display**: Hourly rates shown in flavor selection

## Installation

### 1. Install Node Driver

In Rancher:
1. Go to **☰ → Cluster Management → Drivers → Node Drivers**
2. Click **Add Node Driver**
3. Set URL: `https://github.com/sneederco/docker-machine-driver-ovh/releases/download/v1.0.7/docker-machine-driver-ovh-linux-amd64`
4. Click **Create**

### 2. Install UI Extension

In Rancher:
1. Go to **☰ → Extensions**
2. Click **... → Manage Extension Catalogs**
3. Add Repository:
   - Name: `ovh-autoscaler`
   - URL: `https://sneederco.github.io/ui-driver-ovh/`
   - Branch: `gh-pages`
4. Click **Load**
5. Find "OVHcloud" in available extensions and click **Install**

### 3. Create Cloud Credential

1. Go to **☰ → Cluster Management → Cloud Credentials**
2. Click **Create**
3. Select **OVHcloud**
4. Enter your OVH API credentials:
   - Application Key
   - Application Secret
   - Consumer Key
   - Project ID

## Configuration

### Security Groups (Required for RKE2/K3s)

OVHcloud instances need specific security group rules for Kubernetes:

```bash
# Create security group via OpenStack CLI
openstack security group create rancher-nodes

# Add rules
openstack security group rule create --protocol tcp --dst-port 22 rancher-nodes
openstack security group rule create --protocol tcp --dst-port 443 rancher-nodes
openstack security group rule create --protocol tcp --dst-port 6443 rancher-nodes
openstack security group rule create --protocol tcp --dst-port 9345 rancher-nodes
openstack security group rule create --protocol tcp --dst-port 10250 rancher-nodes
openstack security group rule create --protocol tcp --dst-port 2379:2380 rancher-nodes
openstack security group rule create --protocol udp --dst-port 8472 rancher-nodes
```

When creating clusters, specify `rancher-nodes` in the Security Group field and provide OpenStack credentials for attachment.

### Autoscaler Configuration

The UI extension sets up **Rancher-native autoscaler** annotations automatically:

1. Create cluster with machine pool
2. Check "Enable Autoscaler" in the OVH machine config
3. Set Min/Max nodes
4. Rancher handles autoscaling automatically

No separate cluster-autoscaler deployment needed!

## Architecture

This driver uses the **Node Driver** architecture (not CAPI):

- ✅ Familiar Rancher UX
- ✅ No CAPI knowledge required
- ✅ Native Rancher autoscaler support
- ✅ Simpler deployment model

## Pricing

OVHcloud pricing (April 2026):

| Flavor | vCPU | RAM | Hourly |
|--------|------|-----|--------|
| b3-8 | 2 | 8GB | $0.0605 |
| b3-16 | 4 | 16GB | $0.1208 |
| c3-4 | 2 | 4GB | $0.054 |
| c3-8 | 4 | 8GB | $0.1078 |
| r3-16 | 2 | 16GB | $0.0783 |

## Troubleshooting

### Security Group Not Attaching

Ensure you provide OpenStack credentials along with OVH credentials:
- OpenStack Auth URL (e.g., `https://auth.cloud.ovh.us/v3`)
- OpenStack Username
- OpenStack Password

### Driver Not Loading

Check Rancher logs for download errors:
```bash
kubectl logs -n cattle-system deployment/rancher | grep ovh
```

## License

MIT

## Contributing

Contributions welcome! See [docker-machine-driver-ovh](https://github.com/sneederco/docker-machine-driver-ovh) for driver issues.
