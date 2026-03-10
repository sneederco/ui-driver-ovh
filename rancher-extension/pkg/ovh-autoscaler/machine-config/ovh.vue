<script>
const REGIONS = [
  { label: 'US East Virginia 1', value: 'US-EAST-VA-1' },
  { label: 'US West Oregon 1', value: 'US-WEST-OR-1' },
  { label: 'Germany (GRA7)', value: 'GRA7' },
  { label: 'France (SBG5)', value: 'SBG5' },
];

// OVH US Pricing from https://us.ovhcloud.com/public-cloud/prices/
const FLAVORS = [
  // General Purpose (b3)
  { label: 'b3-8 (2 vCPU, 8GB) - $0.0508/hr', value: 'b3-8' },
  { label: 'b3-16 (4 vCPU, 16GB) - $0.1016/hr', value: 'b3-16' },
  { label: 'b3-32 (8 vCPU, 32GB) - $0.2033/hr', value: 'b3-32' },
  { label: 'b3-64 (16 vCPU, 64GB) - $0.4065/hr', value: 'b3-64' },
  { label: 'b3-128 (32 vCPU, 128GB) - $0.8131/hr', value: 'b3-128' },
  { label: 'b3-256 (64 vCPU, 256GB) - $1.6262/hr', value: 'b3-256' },
  // Compute Optimized (c3)
  { label: 'c3-4 (2 vCPU, 4GB) - $0.0453/hr', value: 'c3-4' },
  { label: 'c3-8 (4 vCPU, 8GB) - $0.0907/hr', value: 'c3-8' },
  { label: 'c3-16 (8 vCPU, 16GB) - $0.1813/hr', value: 'c3-16' },
  { label: 'c3-32 (16 vCPU, 32GB) - $0.3627/hr', value: 'c3-32' },
  { label: 'c3-64 (32 vCPU, 64GB) - $0.7254/hr', value: 'c3-64' },
  { label: 'c3-128 (64 vCPU, 128GB) - $1.4508/hr', value: 'c3-128' },
  // Memory Optimized (r3)
  { label: 'r3-16 (2 vCPU, 16GB) - $0.0658/hr', value: 'r3-16' },
  { label: 'r3-32 (4 vCPU, 32GB) - $0.1315/hr', value: 'r3-32' },
  { label: 'r3-64 (8 vCPU, 64GB) - $0.2631/hr', value: 'r3-64' },
  { label: 'r3-128 (16 vCPU, 128GB) - $0.5261/hr', value: 'r3-128' },
  { label: 'r3-256 (32 vCPU, 256GB) - $1.0522/hr', value: 'r3-256' },
  { label: 'r3-512 (64 vCPU, 512GB) - $2.1045/hr', value: 'r3-512' },
];

const IMAGES = [
  { label: 'Ubuntu 24.04', value: 'Ubuntu 24.04' },
  { label: 'Ubuntu 22.04', value: 'Ubuntu 22.04' },
  { label: 'Ubuntu 20.04', value: 'Ubuntu 20.04' },
  { label: 'Debian 12', value: 'Debian 12' },
  { label: 'Debian 11', value: 'Debian 11' },
  { label: 'CentOS Stream 9', value: 'CentOS Stream 9' },
  { label: 'Rocky Linux 9', value: 'Rocky Linux 9' },
  { label: 'AlmaLinux 9', value: 'AlmaLinux 9' },
];

export default {
  name: 'OvhMachineConfig',
  props: {
    value: { type: Object, default: () => ({}) },
    mode: { type: String, default: 'edit' },
    cluster: { type: Object, default: () => ({}) },
    credentialId: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    poolIndex: { type: Number, default: 0 }
  },
  data() {
    // Read autoscaler state from cluster machine pool annotations
    const pool = this.cluster?.spec?.rkeConfig?.machinePools?.[this.poolIndex] || {};
    const ann = pool.machineDeploymentAnnotations || {};
    const autoscalerMin = ann['cluster.provisioning.cattle.io/autoscaler-min-size'];
    const autoscalerMax = ann['cluster.provisioning.cattle.io/autoscaler-max-size'];
    
    return {
      regions: REGIONS,
      flavors: FLAVORS,
      images: IMAGES,
      region: this.value?.region || 'US-EAST-VA-1',
      flavorName: this.value?.flavorName || 'b3-8',
      imageName: this.value?.imageName || 'Ubuntu 24.04',
      // Autoscaler state - read from annotations
      enableAutoscaler: !!autoscalerMin,
      autoscalerMin: parseInt(autoscalerMin) || 1,
      autoscalerMax: parseInt(autoscalerMax) || 10,
    };
  },
  watch: {
    region(v) { this.value.region = v; },
    flavorName(v) { this.value.flavorName = v; },
    imageName(v) { this.value.imageName = v; },
    enableAutoscaler(v) { 
      this.value.enableAutoscaler = v;
      this.syncAutoscaler(); 
    },
    autoscalerMin(v) { 
      this.value.autoscalerMin = v;
      this.syncAutoscaler(); 
    },
    autoscalerMax(v) { 
      this.value.autoscalerMax = v;
      this.syncAutoscaler(); 
    },
  },
  methods: {
    syncAutoscaler() {
      // Also write to machineDeploymentAnnotations for the controller to read
      const pool = this.cluster?.spec?.rkeConfig?.machinePools?.[this.poolIndex];
      if (!pool) return;
      if (!pool.machineDeploymentAnnotations) pool.machineDeploymentAnnotations = {};
      if (this.enableAutoscaler) {
        pool.machineDeploymentAnnotations['cluster.provisioning.cattle.io/autoscaler-min-size'] = String(this.autoscalerMin);
        pool.machineDeploymentAnnotations['cluster.provisioning.cattle.io/autoscaler-max-size'] = String(this.autoscalerMax);
      } else {
        delete pool.machineDeploymentAnnotations['cluster.provisioning.cattle.io/autoscaler-min-size'];
        delete pool.machineDeploymentAnnotations['cluster.provisioning.cattle.io/autoscaler-max-size'];
      }
      this.$emit('validationChanged', true);
    },
  }
};
</script>

<template>
  <div style="padding:12px;">
    <h3>OVHcloud Instance</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <label>Region
        <select v-model="region" :disabled="disabled || busy" style="width:100%">
          <option v-for="r in regions" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </label>
      <label>Flavor
        <select v-model="flavorName" :disabled="disabled || busy" style="width:100%">
          <option v-for="f in flavors" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </label>
      <label>Image
        <select v-model="imageName" :disabled="disabled || busy" style="width:100%">
          <option v-for="i in images" :key="i.value" :value="i.value">{{ i.label }}</option>
        </select>
      </label>
    </div>
    <h3 style="margin-top:16px;">Cluster Autoscaler</h3>
    <label><input type="checkbox" v-model="enableAutoscaler" :disabled="busy" /> Enable Autoscaler</label>
    <div v-if="enableAutoscaler" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
      <label>Min Nodes <input type="number" min="1" v-model.number="autoscalerMin" :disabled="busy" style="width:100%" /></label>
      <label>Max Nodes <input type="number" min="1" v-model.number="autoscalerMax" :disabled="busy" style="width:100%" /></label>
    </div>
  </div>
</template>
