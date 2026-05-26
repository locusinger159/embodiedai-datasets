<script setup>
import { ref, computed } from 'vue'
import datasets from '../../../data/datasets.json'

const searchQuery = ref('')
const selectedRobotTypes = ref(new Set())
const selectedTasks = ref(new Set())
const selectedTypes = ref(new Set())

const allRobotTypes = computed(() =>
  [...new Set(datasets.flatMap(d => d.robotType || []))].sort()
)
const allTasks = computed(() =>
  [...new Set(datasets.flatMap(d => d.task || []))].sort()
)
const allTypes = computed(() =>
  [...new Set(datasets.map(d => d.type))]
)

const typeLabel = {
  open: '开源',
  partial: '部分开源',
  apply: '可申请',
  closed: '闭源'
}

const typeClass = {
  open: 'type-open',
  partial: 'type-partial',
  apply: 'type-apply',
  closed: 'type-closed'
}

const filteredDatasets = computed(() => {
  return datasets.filter(d => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const haystack = [d.name, d.institution, d.notes || ''].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (selectedRobotTypes.value.size > 0) {
      if (!d.robotType?.some(rt => selectedRobotTypes.value.has(rt))) return false
    }
    if (selectedTasks.value.size > 0) {
      if (!d.task?.some(t => selectedTasks.value.has(t))) return false
    }
    if (selectedTypes.value.size > 0) {
      if (!selectedTypes.value.has(d.type)) return false
    }
    return true
  })
})

function toggleFilter(set, value) {
  if (set.has(value)) set.delete(value)
  else set.add(value)
}
</script>

<template>
  <div class="dataset-table-container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索数据集名称、机构..."
        class="search-input"
      />
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <span class="filter-label">机器人类型：</span>
        <button
          v-for="rt in allRobotTypes"
          :key="rt"
          :class="['filter-tag', { active: selectedRobotTypes.has(rt) }]"
          @click="toggleFilter(selectedRobotTypes, rt)"
        >{{ rt }}</button>
      </div>
      <div class="filter-row">
        <span class="filter-label">任务类型：</span>
        <button
          v-for="t in allTasks"
          :key="t"
          :class="['filter-tag', { active: selectedTasks.has(t) }]"
          @click="toggleFilter(selectedTasks, t)"
        >{{ t }}</button>
      </div>
      <div class="filter-row">
        <span class="filter-label">开放类型：</span>
        <button
          v-for="tp in allTypes"
          :key="tp"
          :class="['filter-tag', { active: selectedTypes.has(tp) }]"
          @click="toggleFilter(selectedTypes, tp)"
        >{{ typeLabel[tp] }}</button>
      </div>
    </div>

    <div class="result-count">共 {{ filteredDatasets.length }} 个数据集</div>

    <div class="table-wrapper">
      <table class="dataset-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>机构</th>
            <th>规模</th>
            <th>机器人类型</th>
            <th>任务</th>
            <th>模态</th>
            <th>类型</th>
            <th>链接</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ds in filteredDatasets" :key="ds.id">
            <td class="name-cell">
              <strong>{{ ds.name }}</strong>
              <div v-if="ds.notes" class="row-notes">{{ ds.notes }}</div>
            </td>
            <td>{{ ds.institution || '-' }}</td>
            <td class="scale-cell">{{ ds.scale || '-' }}</td>
            <td>
              <span v-for="rt in ds.robotType" :key="rt" class="tag">{{ rt }}</span>
              <span v-if="!ds.robotType?.length">-</span>
            </td>
            <td>
              <span v-for="t in ds.task" :key="t" class="tag">{{ t }}</span>
              <span v-if="!ds.task?.length">-</span>
            </td>
            <td>{{ ds.modality?.length ? ds.modality.join('、') : '-' }}</td>
            <td>
              <span :class="['type-badge', typeClass[ds.type]]">{{ typeLabel[ds.type] }}</span>
            </td>
            <td class="links-cell">
              <a v-if="ds.links?.official" :href="ds.links.official" target="_blank" rel="noopener">官网</a>
              <a v-if="ds.links?.paper" :href="ds.links.paper" target="_blank" rel="noopener">论文</a>
              <span v-if="!ds.links?.official && !ds.links?.paper">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredDatasets.length === 0" class="empty-state">
      没有匹配的数据集，试试调整筛选条件。
    </div>
  </div>
</template>

<style scoped>
.dataset-table-container { margin: 1.5rem 0; }
.search-bar { margin-bottom: 1rem; }

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--vp-c-brand-1); }
.filter-section { margin-bottom: 0.75rem; }

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
}

.filter-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-right: 4px;
  white-space: nowrap;
}

.filter-tag {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-tag:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.filter-tag.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }

.result-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
}

.table-wrapper { }

.dataset-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 0.82rem;
  line-height: 1.45;
}

.dataset-table th {
  text-align: left;
  padding: 0.5rem 0.4rem;
  border-bottom: 2px solid var(--vp-c-divider);
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}

.dataset-table th:nth-child(1) { width: 22%; }
.dataset-table th:nth-child(2) { width: 12%; }
.dataset-table th:nth-child(3) { width: 13%; }
.dataset-table th:nth-child(4) { width: 13%; }
.dataset-table th:nth-child(5) { width: 10%; }
.dataset-table th:nth-child(6) { width: 12%; }
.dataset-table th:nth-child(7) { width: 8%; }
.dataset-table th:nth-child(8) { width: 10%; }

.dataset-table td {
  padding: 0.45rem 0.4rem;
  border-bottom: 1px solid var(--vp-c-divider-light, var(--vp-c-divider));
  vertical-align: top;
  word-break: break-all;
}

.dataset-table tbody tr:hover { background: var(--vp-c-bg-soft); }
.name-cell strong { font-size: 0.9rem; }

.row-notes {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  line-height: 1.4;
}

.scale-cell { white-space: nowrap; }

.tag {
  display: inline-block;
  background: var(--vp-c-bg-alt);
  padding: 1px 7px;
  border-radius: 4px;
  margin: 0 3px 3px 0;
  font-size: 0.75rem;
  white-space: nowrap;
}

.type-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 500;
}

.type-open { background: #e6f7e6; color: #2d8a2d; }
.type-partial { background: #fff8e1; color: #b8860b; }
.type-apply { background: #fff3e0; color: #e65100; }
.type-closed { background: #fce4e4; color: #c62828; }

.links-cell a { font-size: 0.8rem; margin-right: 6px; white-space: nowrap; }
.empty-state { text-align: center; padding: 3rem 1rem; color: var(--vp-c-text-3); }
</style>
