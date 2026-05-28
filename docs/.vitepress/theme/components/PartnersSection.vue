<script setup>
const partners = [
  'Google DeepMind', 'Stanford University', 'UC Berkeley', 'NVIDIA',
  'MIT', 'Carnegie Mellon', 'ETH Zurich', 'Tsinghua University',
  'Meta AI', 'Bosch Center for AI', 'Oxford University', '上海交通大学'
]
</script>

<template>
  <div class="partners-wrap">
    <h2 class="partners-title">数据来源机构</h2>
    <div class="partners-grid">
      <span v-for="p in partners" :key="p" class="partner-item">{{ p }}</span>
    </div>
  </div>
</template>

<style scoped>
.partners-wrap {
  text-align: center;
  padding: 3rem 16px;
}
.partners-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}
.partners-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
.partner-item {
  padding: 10px 22px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}
.partner-item:hover {
  background: var(--vp-c-bg);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transform: scale(1.03);
}
</style>
