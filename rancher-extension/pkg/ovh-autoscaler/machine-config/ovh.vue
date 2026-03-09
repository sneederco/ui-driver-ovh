<script>
import CreateEditView from '@shell/mixins/create-edit-view';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import LabeledInput from '@shell/components/form/LabeledInput';
import Checkbox from '@shell/components/form/Checkbox';
import { _VIEW } from '@shell/config/query-params';

const US_REGIONS = [
  { label: 'US East Virginia 1', value: 'US-EAST-VA-1' },
  { label: 'US West Oregon 1', value: 'US-WEST-OR-1' },
];

const EU_REGIONS = [
  { label: 'Germany 1 (GRA1)', value: 'GRA1' },
  { label: 'Germany 7 (GRA7)', value: 'GRA7' },
  { label: 'France 5 (SBG5)', value: 'SBG5' },
  { label: 'UK 1 (UK1)', value: 'UK1' },
  { label: 'Poland 1 (WAW1)', value: 'WAW1' },
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
      region:        this.value?.region || 'US-EAST-VA-1',
      flavorName:    this.value?.flavorName || 'b3-8',
      imageName:     this.value?.imageName || 'Ubuntu 24.04',
      billingPeriod: this.value?.billingPeriod || 'hourly',
      enableAutoscaler: !!annotations['cluster.provisioning.cattle.io/autoscaler-min-size'],
      autoscalerMin:    parseInt(annotations['cluster.provisioning.cattle.io/autoscaler-min-size']) || 1,
      autoscalerMax:    parseInt(annotations['cluster.provisioning.cattle.io/autoscaler-max-size']) || 10,
    };
  },

  computed: {
    regionOptions() {
      return [...US_REGIONS, ...EU_REGIONS];
    },
    billingOptions() {
      return [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Monthly', value: 'monthly' }
      ];
    },
    isView() {
      return this.mode === _VIEW;
    }
  },

  watch: {
    region(val)        { this.value.region = val; },
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
            v-model="region"
            label="Region"
            :options="regionOptions"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
        <div class="col span-6">
          <LabeledInput
            v-model="flavorName"
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
            v-model="imageName"
            label="Image"
            placeholder="Ubuntu 24.04"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
        <div class="col span-6">
          <LabeledSelect
            v-model="billingPeriod"
            label="Billing Period"
            :options="billingOptions"
            :disabled="disabled || busy"
            :mode="mode"
          />
        </div>
      </div>

      <div class="autoscaler-section mt-30">
        <h3>Cluster Autoscaler</h3>
        <p class="text-muted">
          Enable automatic scaling based on pod resource requests.
        </p>
        <div class="row mt-20">
          <div class="col span-12">
            <Checkbox
              v-model="enableAutoscaler"
              label="Enable Cluster Autoscaler"
              :disabled="disabled || busy"
              :mode="mode"
            />
          </div>
        </div>
        <div v-if="enableAutoscaler" class="autoscaler-config mt-20">
          <div class="row">
            <div class="col span-6">
              <LabeledInput
                v-model.number="autoscalerMin"
                label="Minimum Nodes"
                type="number"
                :min="1"
                :disabled="disabled || busy"
                :mode="mode"
              />
            </div>
            <div class="col span-6">
              <LabeledInput
                v-model.number="autoscalerMax"
                label="Maximum Nodes"
                type="number"
                :min="1"
                :disabled="disabled || busy"
                :mode="mode"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ovh-config h3 {
  font-weight: 600;
  margin-bottom: 10px;
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
