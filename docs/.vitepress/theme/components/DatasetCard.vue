<script setup>
const props = defineProps({
  dataset: {
    type: Object,
    required: true
  }
})

const typeLabel = {
  open: '🟢 开源',
  partial: '🟡 部分开源',
  apply: '🟠 可申请',
  closed: '🔴 闭源'
}

const typeClass = {
  open: 'type-open',
  partial: 'type-partial',
  apply: 'type-apply',
  closed: 'type-closed'
}
</script>

<template>
  <div class="dataset-card">
    <div class="card-header">
      <h3>{{ dataset.name }}</h3>
      <span :class="['type-badge', typeClass[dataset.type]]">
        {{ typeLabel[dataset.type] }}
      </span>
    </div>
    <table class="card-table">
      <tbody>
        <tr v-if="dataset.institution">
          <td class="label">机构</td>
          <td>{{ dataset.institution }}</td>
        </tr>
        <tr v-if="dataset.scale">
          <td class="label">规模</td>
          <td>{{ dataset.scale }}</td>
        </tr>
        <tr v-if="dataset.robotType?.length">
          <td class="label">机器人类型</td>
          <td>
            <span v-for="rt in dataset.robotType" :key="rt" class="tag">{{ rt }}</span>
          </td>
        </tr>
        <tr v-if="dataset.task?.length">
          <td class="label">任务</td>
          <td>
            <span v-for="t in dataset.task" :key="t" class="tag">{{ t }}</span>
          </td>
        </tr>
        <tr v-if="dataset.modality?.length">
          <td class="label">数据模态</td>
          <td>{{ dataset.modality.join('、') }}</td>
        </tr>
        <tr v-if="dataset.links?.official || dataset.links?.paper">
          <td class="label">链接</td>
          <td>
            <a v-if="dataset.links?.official" :href="dataset.links.official" target="_blank" rel="noopener">官方链接</a>
            <template v-if="dataset.links?.official && dataset.links?.paper"> | </template>
            <a v-if="dataset.links?.paper" :href="dataset.links.paper" target="_blank" rel="noopener">论文</a>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="dataset.notes" class="card-notes">
      {{ dataset.notes }}
    </div>
  </div>
</template>

<style scoped>
.dataset-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1rem 0;
  background: var(--vp-c-bg-soft);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.type-badge {
  font-size: 0.8rem;
  padding: 2px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.type-open {
  background: #e6f7e6;
  color: #2d8a2d;
}

.type-partial {
  background: #fff8e1;
  color: #b8860b;
}

.type-apply {
  background: #fff3e0;
  color: #e65100;
}

.type-closed {
  background: #fce4e4;
  color: #c62828;
}

.card-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.card-table td {
  padding: 0.35rem 0.5rem;
  border: none;
  vertical-align: top;
}

.card-table td.label {
  font-weight: 600;
  white-space: nowrap;
  width: 90px;
  color: var(--vp-c-text-2);
}

.tag {
  display: inline-block;
  background: var(--vp-c-bg-alt);
  padding: 1px 8px;
  border-radius: 4px;
  margin: 0 4px 4px 0;
  font-size: 0.8rem;
}

.card-notes {
  margin-top: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: var(--vp-c-bg-alt);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 0 4px 4px 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.card-table a {
  font-size: 0.85rem;
}
</style>
