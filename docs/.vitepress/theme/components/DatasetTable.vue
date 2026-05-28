<script setup>
import { ref, computed, watch } from 'vue'
import datasets from '../../../data/datasets.json'

const searchQuery = ref('')
const selectedRobotTypes = ref(new Set())
const selectedTasks = ref(new Set())
const selectedTypes = ref(new Set())
const currentPage = ref(1)
const pageSize = 15
const sortKey = ref('')
const sortDir = ref('asc')
const viewMode = ref('table')

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

function countForType(value) {
  return datasets.filter(d => d.type === value).length
}

function countForField(field, value) {
  return datasets.filter(d => (d[field] || []).includes(value)).length
}

const filteredDatasets = computed(() => {
  let result = datasets.filter(d => {
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

  if (sortKey.value) {
    result.sort((a, b) => {
      let va = a[sortKey.value] || '', vb = b[sortKey.value] || ''
      if (Array.isArray(va)) va = va.join(',')
      if (Array.isArray(vb)) vb = vb.join(',')
      const cmp = String(va).localeCompare(String(vb), 'zh')
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredDatasets.value.length / pageSize))
const pagedDatasets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDatasets.value.slice(start, start + pageSize)
})

const activeFilters = computed(() => {
  const f = []
  for (const v of selectedRobotTypes.value) f.push({ category: 'robotType', value: v, label: v })
  for (const v of selectedTasks.value) f.push({ category: 'task', value: v, label: v })
  for (const v of selectedTypes.value) f.push({ category: 'type', value: v, label: typeLabel[v] || v })
  return f
})

function toggleFilter(set, value) {
  if (set.has(value)) set.delete(value)
  else set.add(value)
  currentPage.value = 1
}

function removeFilter(cat, value) {
  if (cat === 'robotType') selectedRobotTypes.value.delete(value)
  if (cat === 'task') selectedTasks.value.delete(value)
  if (cat === 'type') selectedTypes.value.delete(value)
  currentPage.value = 1
}

function resetFilters() {
  searchQuery.value = ''
  selectedRobotTypes.value.clear()
  selectedTasks.value.clear()
  selectedTypes.value.clear()
  currentPage.value = 1
}

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function sortIndicator(key) {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? ' ↑' : ' ↓'
}

function goPage(p) {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch(searchQuery, () => { currentPage.value = 1 })
</script>

<template>
  <div class="dataset-table-container">
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="搜索数据集名称、机构..." class="search-input" />
    </div>

    <div class="filter-section">
      <div v-if="activeFilters.length" class="active-filters">
        <span class="filter-label">已选：</span>
        <span v-for="f in activeFilters" :key="f.category + f.value" class="filter-chip">
          {{ f.label }}
          <span class="chip-remove" @click="removeFilter(f.category, f.value)">×</span>
        </span>
        <button class="clear-all-btn" @click="resetFilters">清除全部</button>
      </div>

      <div class="filter-row">
        <span class="filter-label">机器人类型：</span>
        <button v-for="rt in allRobotTypes" :key="rt"
          :class="['filter-tag', { active: selectedRobotTypes.has(rt) }]"
          @click="toggleFilter(selectedRobotTypes, rt)">
          {{ rt }} <span class="count">{{ countForField('robotType', rt) }}</span>
        </button>
      </div>
      <div class="filter-row">
        <span class="filter-label">任务类型：</span>
        <button v-for="t in allTasks" :key="t"
          :class="['filter-tag', { active: selectedTasks.has(t) }]"
          @click="toggleFilter(selectedTasks, t)">
          {{ t }} <span class="count">{{ countForField('task', t) }}</span>
        </button>
      </div>
      <div class="filter-row">
        <span class="filter-label">开放类型：</span>
        <button v-for="tp in allTypes" :key="tp"
          :class="['filter-tag', { active: selectedTypes.has(tp) }]"
          @click="toggleFilter(selectedTypes, tp)">
          {{ typeLabel[tp] }} <span class="count">{{ countForType(tp) }}</span>
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="results-count">
        显示 <strong>{{ pagedDatasets.length }}</strong> / 共 <strong>{{ filteredDatasets.length }}</strong> 个数据集
      </div>
      <div class="toolbar-actions">
        <div class="view-toggle">
          <button :class="['view-btn', { active: viewMode === 'table' }]" @click="viewMode = 'table'">表格</button>
          <button :class="['view-btn', { active: viewMode === 'card' }]" @click="viewMode = 'card'">卡片</button>
        </div>
      </div>
    </div>

    <div v-show="viewMode === 'table'" class="table-wrapper">
      <table class="dataset-table">
        <thead>
          <tr>
            <th @click="setSort('name')" :class="{ sorted: sortKey === 'name' }">名称{{ sortIndicator('name') }}</th>
            <th @click="setSort('institution')" :class="{ sorted: sortKey === 'institution' }">机构{{ sortIndicator('institution') }}</th>
            <th @click="setSort('scale')" :class="{ sorted: sortKey === 'scale' }">规模{{ sortIndicator('scale') }}</th>
            <th>机器人类型</th>
            <th>任务</th>
            <th>模态</th>
            <th @click="setSort('type')" :class="{ sorted: sortKey === 'type' }">类型{{ sortIndicator('type') }}</th>
            <th>链接</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ds in pagedDatasets" :key="ds.id">
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
            <td><span :class="['type-badge', typeClass[ds.type]]">{{ typeLabel[ds.type] }}</span></td>
            <td class="links-cell">
              <a v-if="ds.links?.official" :href="ds.links.official" target="_blank" rel="noopener">官网</a>
              <a v-if="ds.links?.paper" :href="ds.links.paper" target="_blank" rel="noopener">论文</a>
              <span v-if="!ds.links?.official && !ds.links?.paper">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-show="viewMode === 'card'" class="cards-grid">
      <div v-for="ds in pagedDatasets" :key="ds.id" class="dataset-card">
        <div class="card-header">
          <strong class="card-name">{{ ds.name }}</strong>
          <span :class="['type-badge', typeClass[ds.type]]">{{ typeLabel[ds.type] }}</span>
        </div>
        <div class="card-meta">
          <div class="card-row"><span class="card-label">机构</span>{{ ds.institution || '-' }}</div>
          <div class="card-row"><span class="card-label">规模</span>{{ ds.scale || '-' }}</div>
          <div class="card-row"><span class="card-label">模态</span>{{ ds.modality?.length ? ds.modality.join('、') : '-' }}</div>
        </div>
        <div class="card-tags">
          <span v-for="rt in ds.robotType" :key="rt" class="tag">{{ rt }}</span>
          <span v-for="t in ds.task" :key="t" class="tag">{{ t }}</span>
        </div>
        <div v-if="ds.notes" class="card-notes">{{ ds.notes }}</div>
        <div class="card-links">
          <a v-if="ds.links?.official" :href="ds.links.official" target="_blank" rel="noopener">官网</a>
          <a v-if="ds.links?.paper" :href="ds.links.paper" target="_blank" rel="noopener">论文</a>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">←</button>
      <button v-for="p in visiblePages" :key="p" :class="['page-btn', { active: p === currentPage }]" @click="goPage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">→</button>
    </div>

    <div v-if="filteredDatasets.length === 0" class="empty-state">
      <p class="empty-title">没有匹配的数据集</p>
      <p class="empty-desc">试试调整筛选条件</p>
      <button class="empty-btn" @click="resetFilters">清除全部筛选</button>
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

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 500;
}
.chip-remove {
  cursor: pointer;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
}
.chip-remove:hover { background: rgba(255,255,255,0.5); }

.clear-all-btn {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 50px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  cursor: pointer;
}
.clear-all-btn:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

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
.filter-tag .count {
  padding: 1px 5px;
  border-radius: 50px;
  font-size: 0.7rem;
  background: rgba(0,0,0,0.08);
  margin-left: 2px;
}
.filter-tag.active .count { background: rgba(255,255,255,0.25); }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 8px;
}
.results-count { font-size: 0.85rem; color: var(--vp-c-text-2); }
.toolbar-actions { display: flex; align-items: center; gap: 12px; }
.view-toggle { display: flex; background: var(--vp-c-bg-soft); border-radius: 8px; padding: 3px; }
.view-btn {
  padding: 5px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  transition: all 0.15s;
}
.view-btn:hover { color: var(--vp-c-text-1); }
.view-btn.active { background: var(--vp-c-bg); color: var(--vp-c-brand-1); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

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
  user-select: none;
}
.dataset-table th:nth-child(1) { width: 23%; }
.dataset-table th:nth-child(2) { width: 11%; }
.dataset-table th:nth-child(3) { width: 13%; }
.dataset-table th:nth-child(4) { width: 13%; }
.dataset-table th:nth-child(5) { width: 10%; }
.dataset-table th:nth-child(6) { width: 12%; }
.dataset-table th:nth-child(7) { width: 8%; }
.dataset-table th:nth-child(8) { width: 10%; }
.dataset-table th.sorted { color: var(--vp-c-brand-1); cursor: pointer; }
.dataset-table td {
  padding: 0.45rem 0.4rem;
  border-bottom: 1px solid var(--vp-c-divider-light, var(--vp-c-divider));
  vertical-align: top;
  overflow-wrap: break-word;
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.dataset-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}
.dataset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: var(--vp-c-brand-1);
}
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.card-name { font-size: 1rem; }
.card-meta { margin-bottom: 10px; }
.card-row { font-size: 0.82rem; color: var(--vp-c-text-2); margin-bottom: 2px; }
.card-label { font-weight: 600; margin-right: 6px; color: var(--vp-c-text-1); }
.card-tags { margin-bottom: 10px; }
.card-notes {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  padding: 8px;
  background: var(--vp-c-bg);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 0 4px 4px 0;
  margin-bottom: 10px;
}
.card-links { display: flex; gap: 8px; }
.card-links a { font-size: 0.82rem; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
}
.page-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.page-btn.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.empty-state { text-align: center; padding: 3rem 1rem; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 4px; }
.empty-desc { font-size: 0.9rem; color: var(--vp-c-text-3); margin-bottom: 16px; }
.empty-btn {
  display: inline-flex;
  padding: 8px 20px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}
.empty-btn:hover { opacity: 0.9; }
</style>
