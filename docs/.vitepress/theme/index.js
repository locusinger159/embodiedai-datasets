import DefaultTheme from 'vitepress/theme'
import DatasetTable from './components/DatasetTable.vue'
import SubmitPage from './components/SubmitPage.vue'
import PartnersSection from './components/PartnersSection.vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DatasetTable', DatasetTable)
    app.component('SubmitPage', SubmitPage)
    app.component('PartnersSection', PartnersSection)
  }
}
