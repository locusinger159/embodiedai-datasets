<script setup>
import { ref, computed } from 'vue'
import datasets from '../../../data/datasets.json'

const searchQuery = ref('')
const selectedRobotTypes = ref(new Set())
const selectedTasks = ref(new Set())
const selectedTypes = ref(new Set())

// Extract unique values for tag buttons
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
  open: '🟢 开源',
  partial: '🟡 部分开源',
  apply: '🟠 可申请',
  closed: '🔴 闭源'
}

const filteredDatasets = computed(() => {
  return datasets.filter(d => {
    // Text search across name, institution, notes
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const haystack = [d.name, d.institution, d.notes || ''].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    // Robot type filter (multi-select: dataset matches if it has ANY selected type)
    if (selectedRobotTypes.value.size > 0) {
      if (!d.robotType?.some(rt => selectedRobotTypes.value.has(rt))) return false
    }
    // Task filter
    if (selectedTasks.value.size > 0) {
      if (!d.task?.some(t => selectedTasks.value.has(t))) return false
    }
    // Type filter
    if (selectedTypes.value.size > 0) {
      if (!selectedTypes.value.has(d.type)) return false
    }
    return true
  })
})

// In template, refs are auto-unwrapped, so this receives the reactive Set directly.
// Vue 3.4+ tracks Set .add()/.delete() mutations for reactivity.
function toggleFilter(set, value) {
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
}
</script>

<template>
  <div class="dataset-list">
    <!-- Search -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索数据集名称、机构..."
        class="search-input"
      />
    </div>

    <!-- Tag filters -->
    <div class="filter-section">
      <div class="filter-row">
        <span class="filter-label">机器人类型：</span>
        <button
          v-for="rt in allRobotTypes"
          :key="rt"
          :class="['filter-tag', { active: selectedRobotTypes.has(rt) }]"
          @click="toggleFilter(selectedRobotTypes, rt)"
        >
          {{ rt }}
        </button>
      </div>
      <div class="filter-row">
        <span class="filter-label">任务类型：</span>
        <button
          v-for="t in allTasks"
          :key="t"
          :class="['filter-tag', { active: selectedTasks.has(t) }]"
          @click="toggleFilter(selectedTasks, t)"
        >
          {{ t }}
        </button>
      </div>
      <div class="filter-row">
        <span class="filter-label">开放类型：</span>
        <button
          v-for="tp in allTypes"
          :key="tp"
          :class="['filter-tag', { active: selectedTypes.has(tp) }]"
          @click="toggleFilter(selectedTypes, tp)"
        >
          {{ typeLabel[tp] }}
        </button>
      </div>
    </div>

    <!-- Result count -->
    <div class="result-count">
      共 {{ filteredDatasets.length }} 个数据集
    </div>

    <!-- Dataset cards -->
    <DatasetCard
      v-for="ds in filteredDatasets"
      :key="ds.id"
      :dataset="ds"
    />

    <!-- Empty state -->
    <div v-if="filteredDatasets.length === 0" class="empty-state">
      没有匹配的数据集，试试调整筛选条件。
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--vp-c-brand-1);
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-right: 4px;
  white-space: nowrap;
}

.filter-tag {
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tag:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-tag.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.result-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-3);
  font-size: 1rem;
}
</style>
