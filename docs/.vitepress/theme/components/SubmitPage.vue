<script setup>
import { ref } from 'vue'

const method = ref('email')
const copied = ref(false)
const templateCopied = ref(false)
const openFaq = ref(0)

function copyEmail() {
  navigator.clipboard.writeText('embodisets@163.com').then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function copyTemplate() {
  const tpl = `【数据集提交】

数据集名称：[请填写]
机构/作者：[请填写]
官方链接：[请填写]
数据规模：[选填]
机器人类型：[选填]
任务类型：[选填]
论文链接：[选填]
备注：[其他说明]`
  navigator.clipboard.writeText(tpl).then(() => {
    templateCopied.value = true
    setTimeout(() => { templateCopied.value = false }, 2000)
  })
}

function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? -1 : i
}
</script>

<template>
  <div class="submit-page">
    <div class="welcome-banner">
      <span class="welcome-icon">📬</span>
      <div>
        <h2>欢迎提交</h2>
        <p>感谢你为具身智能社区贡献数据集信息！我们会尽快审核并收录。</p>
      </div>
    </div>

    <div class="submit-section">
      <h2 class="section-title">提交方式</h2>

      <!-- Method tabs -->
      <div class="method-tabs">
        <button :class="['method-tab', { active: method === 'email' }]" @click="method = 'email'">
          <span class="method-tab-icon">📧</span>
          <span class="method-tab-title">邮件提交</span>
        </button>
        <button :class="['method-tab', { active: method === 'github' }]" @click="method = 'github'">
          <span class="method-tab-icon">🐙</span>
          <span class="method-tab-title">GitHub Issue</span>
        </button>
      </div>

      <!-- Email content -->
      <div v-show="method === 'email'" class="method-content">
        <div class="email-box">
          <span class="email-label">发送邮件至</span>
          <div class="email-row">
            <span class="email-text">embodisets@163.com</span>
            <button class="copy-btn" :class="{ copied }" @click="copyEmail">
              {{ copied ? '✓ 已复制' : '复制' }}
            </button>
          </div>
        </div>

        <p>请包含以下信息：</p>
        <table class="fields-table">
          <thead>
            <tr><th>字段</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>数据集名称</strong> <span class="badge-required">必填</span></td><td>官方名称</td></tr>
            <tr><td><strong>机构/作者</strong> <span class="badge-required">必填</span></td><td>发布机构或研究团队</td></tr>
            <tr><td><strong>官方链接</strong> <span class="badge-required">必填</span></td><td>官网或 GitHub</td></tr>
            <tr><td><strong>数据规模</strong> <span class="badge-optional">选填</span></td><td>轨迹数/场景数等</td></tr>
            <tr><td><strong>机器人类型</strong> <span class="badge-optional">选填</span></td><td>人形/机械臂/移动等</td></tr>
            <tr><td><strong>任务类型</strong> <span class="badge-optional">选填</span></td><td>抓取/导航/操作等</td></tr>
            <tr><td><strong>论文链接</strong> <span class="badge-optional">选填</span></td><td>相关论文链接</td></tr>
          </tbody>
        </table>

        <div class="template-box">
          <p class="template-title">一键复制邮件模板</p>
          <button class="template-btn" :class="{ copied: templateCopied }" @click="copyTemplate">
            {{ templateCopied ? '✓ 已复制到剪贴板' : '复制邮件模板' }}
          </button>
        </div>
      </div>

      <!-- GitHub content -->
      <div v-show="method === 'github'" class="method-content">
        <div class="github-info">
          <p>访问我们的 GitHub 仓库，创建新的 Issue 提交数据集信息</p>
          <a href="https://github.com/locusinger159/embodiedai-datasets/issues/new" target="_blank" class="github-btn">
            前往 GitHub 仓库
          </a>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="faq-section">
      <h2 class="section-title">常见问题</h2>

      <div v-for="(faq, i) in [
        { q: '提交后多久审核？', a: '我们会在 3-5 个工作日内审核并回复。审核通过后，数据集将立即收录到导航站。' },
        { q: '可以提交闭源数据集吗？', a: '可以，只要数据集真实存在且有获取渠道。我们会标注为闭源或可申请，并提供申请入口。' },
        { q: '如何更新已有数据集信息？', a: '通过同样的方式联系我们，说明需要更新的数据集名称和修改内容，我们会及时更新。' },
        { q: '我的数据集被收录了，如何删除？', a: '请通过邮件联系我们，说明删除原因，我们会在 24 小时内处理。' }
      ]" :key="i" class="faq-item">
        <button class="faq-question" @click="toggleFaq(i)">
          <span>{{ faq.q }}</span>
          <span class="faq-arrow" :class="{ open: openFaq === i }">▾</span>
        </button>
        <div v-show="openFaq === i" class="faq-answer">{{ faq.a }}</div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer">
      <p class="disclaimer-title">⚠️ 免责声明</p>
      <ul>
        <li>本网站仅做信息导航，不提供任何数据集下载</li>
        <li>数据集版权归原机构/作者所有</li>
        <li>如有版权问题，请联系删除</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.submit-page { max-width: 900px; }

.welcome-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(91,124,255,0.08) 0%, rgba(0,210,255,0.04) 100%);
  border: 1px solid rgba(91,124,255,0.15);
  border-radius: 12px;
  margin-bottom: 24px;
}
.welcome-icon { font-size: 2rem; }
.welcome-banner h2 { font-size: 1.1rem; margin-bottom: 4px; }
.welcome-banner p { font-size: 0.9rem; color: var(--vp-c-text-2); }

.submit-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 3px solid var(--vp-c-brand-1);
}

.method-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.method-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.2s;
}
.method-tab:hover { border-color: var(--vp-c-brand-1); }
.method-tab.active { border-color: var(--vp-c-brand-1); background: rgba(91,124,255,0.05); }
.method-tab-icon { font-size: 1.5rem; }
.method-tab-title { font-weight: 600; font-size: 0.95rem; }

.email-box {
  padding: 16px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  margin-bottom: 16px;
}
.email-label { font-size: 0.85rem; color: var(--vp-c-text-2); }
.email-row { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.email-text { font-size: 1.1rem; font-weight: 600; color: var(--vp-c-brand-1); }
.copy-btn {
  padding: 5px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.copy-btn:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.copy-btn.copied { background: #10B981; border-color: #10B981; color: #fff; }

.fields-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.fields-table th { text-align: left; padding: 8px 12px; font-size: 0.8rem; color: var(--vp-c-text-2); background: var(--vp-c-bg); border-bottom: 1px solid var(--vp-c-divider); }
.fields-table td { padding: 10px 12px; font-size: 0.88rem; border-bottom: 1px solid var(--vp-c-divider-light, var(--vp-c-divider)); }
.badge-required {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(239,68,68,0.1);
  color: #EF4444;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 6px;
}
.badge-optional {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(100,116,139,0.1);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 6px;
}

.template-box {
  text-align: center;
  padding: 20px;
  border: 1px dashed var(--vp-c-brand-1);
  border-radius: 10px;
  background: rgba(91,124,255,0.03);
}
.template-title { font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 10px; }
.template-btn {
  padding: 10px 22px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}
.template-btn:hover { opacity: 0.9; }
.template-btn.copied { background: #10B981; }

.github-info { text-align: center; padding: 30px 20px; }
.github-info p { font-size: 0.95rem; color: var(--vp-c-text-2); margin-bottom: 16px; }
.github-btn {
  display: inline-flex;
  padding: 10px 22px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.github-btn:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

.faq-section { margin-bottom: 24px; }
.faq-item { border-bottom: 1px solid var(--vp-c-divider-light, var(--vp-c-divider)); }
.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--vp-c-text-1);
}
.faq-arrow { transition: transform 0.2s; font-size: 0.8rem; color: var(--vp-c-text-3); }
.faq-arrow.open { transform: rotate(180deg); }
.faq-answer {
  padding: 0 0 16px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.disclaimer {
  padding: 16px 20px;
  background: rgba(245,158,11,0.05);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 10px;
}
.disclaimer-title { font-weight: 600; color: #F59E0B; margin-bottom: 8px; }
.disclaimer ul { padding-left: 16px; }
.disclaimer li { font-size: 0.85rem; color: var(--vp-c-text-2); margin-bottom: 4px; }
</style>
