import DefaultTheme from 'vitepress/theme'
import DatasetTable from './components/DatasetTable.vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DatasetTable', DatasetTable)
  }
}
