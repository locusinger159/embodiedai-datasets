<script setup>
import { computed } from 'vue'
import datasets from '../../../data/datasets.json'

const props = defineProps({
  groupBy: {
    type: String,
    required: true,
    validator: (v) => ['robotType', 'task'].includes(v)
  }
})

const groups = computed(() => {
  const map = new Map()
  for (const ds of datasets) {
    const keys = ds[props.groupBy] || []
    for (const key of keys) {
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(ds)
    }
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})
</script>

<template>
  <div class="dataset-category">
    <div class="category-toc">
      <span class="toc-label">快速跳转：</span>
      <a
        v-for="[key] in groups"
        :key="key"
        :href="'#' + encodeURIComponent(key)"
        class="toc-link"
      >
        {{ key }}
      </a>
    </div>

    <section
      v-for="[key, dsList] in groups"
      :key="key"
      :id="key"
      class="category-section"
    >
      <h2>{{ key }}</h2>
      <p class="section-count">{{ dsList.length }} 个数据集</p>
      <DatasetCard
        v-for="ds in dsList"
        :key="ds.id"
        :dataset="ds"
      />
    </section>
  </div>
</template>

<style scoped>
.category-toc {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.toc-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.toc-link {
  padding: 4px 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.15s;
}

.toc-link:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

.category-section {
  margin-bottom: 2rem;
}

.category-section h2 {
  margin-bottom: 0.25rem;
}

.section-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.75rem;
}
</style>
