<script>
import CreateEditView from '@shell/mixins/create-edit-view';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@components/Form/LabeledInput';
import { Checkbox } from '@components/Form/Checkbox';
import { _VIEW } from '@shell/config/query-params';

const OVH_ENDPOINTS = [
  { label: 'OVH US (ovh-us)', value: 'ovh-us' },
  { label: 'OVH Europe (ovh-eu)', value: 'ovh-eu' },
  { label: 'OVH Canada (ovh-ca)', value: 'ovh-ca' },
  { label: 'Kimsufi EU (kimsufi-eu)', value: 'kimsufi-eu' },
  { label: 'Kimsufi CA (kimsufi-ca)', value: 'kimsufi-ca' },
  { label: 'SoYouStart EU (soyoustart-eu)', value: 'soyoustart-eu' },
  { label: 'SoYouStart CA (soyoustart-ca)', value: 'soyoustart-ca' },
];

const US_REGIONS = [
  { label: 'US East Virginia 1', value: 'US-EAST-VA-1' },
  { label: 'US West Oregon 1', value: 'US-WEST-OR-1' },
];

const EU_REGIONS = [
  { label: 'Germany 1 (GRA1)', value: 'GRA1' },
  { label: 'Germany 3 (GRA3)', value: 'GRA3' },
  { label: 'Germany 5 (GRA5)', value: 'GRA5' },
  { label: 'Germany 7 (GRA7)', value: 'GRA7' },
  { label: 'France 1 (SBG1)', value: 'SBG1' },
  { label: 'France 3 (SBG3)', value: 'SBG3' },
  { label: 'France 5 (SBG5)', value: 'SBG5' },
  { label: 'UK 1 (UK1)', value: 'UK1' },
  { label: 'Belgium 1 (BHS1)', value: 'BHS1' },
  { label: 'Poland 1 (WAW1)', value: 'WAW1' },
];

const BILLING_PERIODS = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Monthly', value: 'monthly' },
];

export default {
  components: {
    LabeledInput, LabeledSelect, Checkbox
  },

  mixins: [CreateEditView],

  props: {
    uuid: {
      type:     String,
      required: true,
    },
    cluster: {
      type:    Object,
      default: () => ({})
    },
    credentialId: {
      type:     String,
      required: true,
    },
    disabled: {
      type:    Boolean,
      default: false
    },
    busy: {
      type:    Boolean,
      default: false
    },
    provider: {
      type:     String,
      required: true,
    },
    poolIndex: {
      type:    Number,
      default: 0
    }
  },

  data() {
    const pool = this.cluster?.spec?.rkeConfig?.machinePools?.[this.poolIndex] || {};
    const annotations = pool.machineDeploymentAnnotations || {};
    
    return {
      // Machine config
      region:        this.value?.region || 'US-EAST-VA-1',
      flavorName:    this.value?.flavorName || 'b3-8',
      imageName:     this.value?.imageName || 'Ubuntu 24.04',
      billingPeriod: this.value?.billingPeriod || 'hourly',
      
      // Autoscaler config (from cluster annotations)
      enableAutoscaler: !!annotations['cluster.provisioning.cattle.io/autoscaler-min-size'],
      autoscalerMin:    parseInt(annotations['cluster.provisioning.cattle.io/autoscaler-min-size']) || 1,
      autoscalerMax:    parseInt(annotations['cluster.provisioning.cattle.io/autoscaler-max-size']) || 10,
    };
  },

  computed: {
    regionOptions() {
      // Determine regions based on endpoint from credential
      return [...US_REGIONS, ...EU_REGIONS];
    },
    
    isView() {
      return this.mode === _VIEW;
    }
  },

  watch: {
    region(val)        { this.value.region = val; this.syncAutoscaler(); },
    flavorName(val)    { this.value.flavorName = val; },
    imageName(val)     { this.value.imageName = val; },
    billingPeriod(val) { this.value.billingPeriod = val; },
    enableAutoscaler() { this.syncAutoscaler(); },
    autoscalerMin()    { this.syncAutoscaler(); },
    autoscalerMax()    { this.syncAutoscaler(); },
  },

  methods: {
    syncAutoscaler() {
      if (!this.cluster?.spec?.rkeConfig?.machinePools?.[this.poolIndex]) {
        return;
      }

      const pool = this.cluster.spec.rkeConfig.machinePools[this.poolIndex];
      
      if (!pool.machineDeploymentAnnotations) {
        pool.machineDeploymentAnnotations = {};
      }

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
      // Sync all values before validation
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
  <div>
    <div class="ovh-config">
      <h3>OVHcloud Instance Configuration</h3>
      
      <div class="row mt-20">
        <div class="col span-6">
          <LabeledSelect
            v-model:value="region"
            label="Region"
            :options="regionOptions"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
        <div class="col span-6">
          <LabeledInput
            v-model:value="flavorName"
            label="Flavor"
            placeholder="b3-8"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
      </div>

      <div class="row mt-20">
        <div class="col span-6">
          <LabeledInput
            v-model:value="imageName"
            label="Image"
            placeholder="Ubuntu 24.04"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
        <div class="col span-6">
          <LabeledSelect
            v-model:value="billingPeriod"
            label="Billing Period"
            :options="[
              { label: 'Hourly', value: 'hourly' },
              { label: 'Monthly', value: 'monthly' }
            ]"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
      </div>

      <!-- Autoscaler Section -->
      <div class="autoscaler-section mt-30">
        <h3>Cluster Autoscaler</h3>
        <p class="text-muted">
          Enable automatic scaling based on pod resource requests. 
          Nodes will be added when pods are pending and removed when underutilized.
        </p>

        <div class="row mt-20">
          <div class="col span-12">
            <Checkbox
              v-model:value="enableAutoscaler"
              label="Enable Cluster Autoscaler"
              :disabled="disabled || busy"
              :mode="mode"
            />
          </div>
        </div>

        <div
          v-if="enableAutoscaler"
          class="autoscaler-config mt-20"
        >
          <div class="row">
            <div class="col span-6">
              <LabeledInput
                v-model:value="autoscalerMin"
                label="Minimum Nodes"
                type="number"
                :min="1"
                :disabled="disabled || busy"
                :mode="mode"
              />
            </div>
            <div class="col span-6">
              <LabeledInput
                v-model:value="autoscalerMax"
                label="Maximum Nodes"
                type="number"
                :min="1"
                :disabled="disabled || busy"
                :mode="mode"
              />
            </div>
          </div>
          <p class="text-muted mt-10">
            <i class="icon icon-info" />
            The autoscaler controller will automatically deploy cluster-autoscaler when the cluster becomes ready.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ovh-config {
  h3 {
    font-weight: 600;
    margin-bottom: 10px;
  }
}

.autoscaler-section {
  border-top: 1px solid var(--border);
  padding-top: 20px;
}

.autoscaler-config {
  background: var(--body-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 15px;
}

.text-muted {
  color: var(--muted);
  font-size: 13px;
}
</style>
