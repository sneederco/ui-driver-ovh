# OVH Node Driver Architecture

## Overview

The OVH Node Driver provides a Rancher-native "click and provision" experience for OVHcloud Public Cloud. It uses the **Node Driver** approach rather than hosted/managed Kubernetes.

## Why Node Driver (Not MKS)?

| Approach | Control Plane | UX | Autoscaling |
|----------|---------------|-----|-------------|
| **Node Driver** ✅ | Rancher-managed RKE2 | Native Rancher UX | Cluster Autoscaler |
| MKS (deprecated) | OVH-managed | Import-only | OVH-managed |

**Node Driver wins because:**
- Full Rancher integration (not just "imported" cluster)
- Consistent multi-cloud experience
- Cluster autoscaler with Rancher provider
- Single pane of glass for all clusters

## Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Rancher Server                          │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Node Driver    │  │  Machine        │                   │
│  │  (ovh)          │  │  Controller     │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    OVH Public Cloud                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Compute Instances (VMs)                             │    │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                │    │
│  │  │Node1│  │Node2│  │Node3│  │NodeN│ ← Autoscaled   │    │
│  │  └─────┘  └─────┘  └─────┘  └─────┘                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Downstream Cluster (RKE2)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Cluster Autoscaler                                  │    │
│  │  - Monitors pod scheduling                           │    │
│  │  - Calls Rancher API to scale machineDeployments     │    │
│  │  - Respects min/max annotations                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Autoscaling Flow

1. User deploys workload with resource requests
2. Pods become `Pending` (not enough capacity)
3. Cluster Autoscaler detects unschedulable pods
4. Autoscaler calls Rancher API: "scale pool1 from 2 to 4"
5. Rancher updates machineDeployment replicas
6. Node Driver provisions new OVH VMs
7. New nodes join cluster, pods get scheduled

## Repositories

- **Backend**: `sneederco/docker-machine-driver-ovh` - Go driver binary
- **UI**: `sneederco/ui-driver-ovh` - Rancher UI extension

## Releases

| Component | Version | Download |
|-----------|---------|----------|
| Driver | v1.0.2 | [linux-amd64](https://github.com/sneederco/docker-machine-driver-ovh/releases/download/v1.0.2/docker-machine-driver-ovh-linux-amd64) |
| UI | v1.2.0 | [component.js](https://github.com/sneederco/ui-driver-ovh/releases/download/v1.2.0/component.js) |
