<script>
const REGIONS = [
  { label: 'US East Virginia 1', value: 'US-EAST-VA-1' },
  { label: 'US West Oregon 1', value: 'US-WEST-OR-1' },
  { label: 'Germany (GRA7)', value: 'GRA7' },
  { label: 'France (SBG5)', value: 'SBG5' },
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
    const pool = this.cluster?.spec?.rkeConfig?.machinePools?.[this.poolIndex] || {};
    const ann = pool.machineDeploymentAnnotations || {};
    return {
      regions: REGIONS,
      region: this.value?.region || 'US-EAST-VA-1',
      flavorName: this.value?.flavorName || 'b3-8',
      imageName: this.value?.imageName || 'Ubuntu 24.04',
      billingPeriod: this.value?.billingPeriod || 'hourly',
      enableAutoscaler: !!ann['cluster.provisioning.cattle.io/autoscaler-min-size'],
      autoscalerMin: parseInt(ann['cluster.provisioning.cattle.io/autoscaler-min-size']) || 1,
      autoscalerMax: parseInt(ann['cluster.provisioning.cattle.io/autoscaler-max-size']) || 10,
    };
  },
  watch: {
    region(v) { this.value.region = v; },
    flavorName(v) { this.value.flavorName = v; },
    imageName(v) { this.value.imageName = v; },
    billingPeriod(v) { this.value.billingPeriod = v; },
    enableAutoscaler() { this.syncAutoscaler(); },
    autoscalerMin() { this.syncAutoscaler(); },
    autoscalerMax() { this.syncAutoscaler(); },
  },
  methods: {
    syncAutoscaler() {
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
    test() {
      this.value.region = this.region;
      this.value.flavorName = this.flavorName;
      this.value.imageName = this.imageName;
      this.value.billingPeriod = this.billingPeriod;
      this.syncAutoscaler();
    }
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
        <input v-model="flavorName" :disabled="disabled || busy" style="width:100%" />
      </label>
      <label>Image
        <input v-model="imageName" :disabled="disabled || busy" style="width:100%" />
      </label>
      <label>Billing
        <select v-model="billingPeriod" :disabled="disabled || busy" style="width:100%">
          <option value="hourly">Hourly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
    </div>
    <h3 style="margin-top:16px;">Cluster Autoscaler</h3>
    <label><input type="checkbox" v-model="enableAutoscaler" :disabled="disabled || busy" /> Enable Autoscaler</label>
    <div v-if="enableAutoscaler" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
      <label>Min Nodes <input type="number" min="1" v-model.number="autoscalerMin" :disabled="disabled || busy" style="width:100%" /></label>
      <label>Max Nodes <input type="number" min="1" v-model.number="autoscalerMax" :disabled="disabled || busy" style="width:100%" /></label>
    </div>
  </div>
</template>
