# 提交数据集

::: tip 欢迎提交
欢迎提交数据集信息，我们审核后收录到导航站。
:::

## 提交须知

### 收录标准

1. **真实性**: 必须是真实存在的数据集
2. **可用性**: 有官方链接或申请入口
3. **完整性**: 提供基础字段信息

### 数据集字段

| 字段 | 必填 | 说明 |
|------|------|------|
| 数据集名称 | ✅ | 官方名称 |
| 机构 | ✅ | 发布机构/公司 |
| 规模 | ⭕ | 轨迹数/小时/场景数等 |
| 机器人类型 | ⭕ | 人形/机械臂/移动/四足/仿真 |
| 任务类型 | ⭕ | 抓取/操作/导航/装配等 |
| 数据模态 | ⭕ | 视觉/力控/点云/触觉等 |
| 类型 | ✅ | 开源/闭源/可申请/可采购 |
| 官方链接 | ✅ | 官网或 GitHub |
| 论文链接 | ⭕ | 有则提供 |
| 备注 | ⭕ | 一句话点评 |

### 类型说明

| 类型 | 说明 |
|------|------|
| 🟢 开源 | 可自由下载使用 |
| 🟡 可申请 | 需要申请或注册 |
| 🔴 闭源 | 不公开获取 |

---

## 提交表单

### 方式一：邮件提交

发送邮件至：**submit@embodiedai-data.com**

邮件格式：

```
主题：【数据集提交】数据集名称

数据集名称：
机构：
规模：
机器人类型：
任务类型：
数据模态：
类型：
官方链接：
论文链接：
备注：
```

### 方式二：GitHub Issues

在 [GitHub 仓库](https://github.com/embodiedai-datasets/embodiedai-datasets) 提交 Issue。

### 方式三：表单提交

<form>
<div class="form-group">
  <label for="name">数据集名称 *</label>
  <input type="text" id="name" placeholder="例如：Open X-Embodiment">
</div>

<div class="form-group">
  <label for="org">机构 *</label>
  <input type="text" id="org" placeholder="例如：Google DeepMind">
</div>

<div class="form-group">
  <label for="scale">规模</label>
  <input type="text" id="scale" placeholder="例如：100W+ 轨迹">
</div>

<div class="form-group">
  <label for="robot">机器人类型</label>
  <select id="robot">
    <option value="">请选择</option>
    <option value="humanoid">人形机器人</option>
    <option value="manipulator">机械臂</option>
    <option value="mobile">移动机器人</option>
    <option value="quadruped">四足机器人</option>
    <option value="simulation">仿真</option>
    <option value="tactile">触觉传感</option>
    <option value="other">其他</option>
  </select>
</div>

<div class="form-group">
  <label for="task">任务类型</label>
  <select id="task">
    <option value="">请选择</option>
    <option value="grasp">抓取</option>
    <option value="manipulation">操作</option>
    <option value="navigation">导航</option>
    <option value="assembly">装配</option>
    <option value="interaction">交互</option>
    <option value="household">家居</option>
    <option value="other">其他</option>
  </select>
</div>

<div class="form-group">
  <label for="type">数据类型 *</label>
  <select id="type">
    <option value="">请选择</option>
    <option value="open">开源</option>
    <option value="partial">部分开源</option>
    <option value="apply">可申请</option>
    <option value="closed">闭源</option>
  </select>
</div>

<div class="form-group">
  <label for="link">官方链接 *</label>
  <input type="url" id="link" placeholder="https://...">
</div>

<div class="form-group">
  <label for="paper">论文链接</label>
  <input type="url" id="paper" placeholder="https://arxiv.org/...">
</div>

<div class="form-group">
  <label for="note">备注</label>
  <textarea id="note" rows="3" placeholder="一句话点评，适合什么场景..."></textarea>
</div>

<div class="form-group">
  <label for="contact">联系邮箱 *</label>
  <input type="email" id="contact" placeholder="用于后续联系">
</div>

<button type="submit">提交</button>
</form>

---

## 常见问题

### Q: 提交后多久审核？
A: 我们会在 3-5 个工作日内审核并回复。

### Q: 可以提交闭源数据集吗？
A: 可以，只要数据集真实存在且有获取渠道。

### Q: 可以提交商业数据集吗？
A: 可以，只要不侵犯商业机密，我们可以收录公开信息。

### Q: 如何更新已有数据集信息？
A: 通过同样方式联系我们，我们会及时更新。

---

::: info 免责声明
- 本网站仅做信息导航，不提供任何数据集下载
- 数据集版权归原机构/作者所有
- 如有版权问题，请联系删除
:::

<style>
form {
  max-width: 600px;
  margin: 2rem 0;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 1rem;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
button {
  padding: 0.75rem 2rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background: var(--vp-c-brand-2);
}
</style>
