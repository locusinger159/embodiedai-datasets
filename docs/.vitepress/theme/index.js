import DefaultTheme from 'vitepress/theme'
import DatasetCard from './components/DatasetCard.vue'
import DatasetList from './components/DatasetList.vue'
import DatasetCategory from './components/DatasetCategory.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DatasetCard', DatasetCard)
    app.component('DatasetList', DatasetList)
    app.component('DatasetCategory', DatasetCategory)
  }
}
