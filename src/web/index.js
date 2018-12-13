// import Vue from 'vue'
// import App from './App'
// import BootstrapVue from 'bootstrap-vue'

// Vue.config.productionTip = false

// Vue.use(BootstrapVue);
// /* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   components: { App },
//   template: '<App/>'
// })

import originLocales from "./locale";
const langs = Object.keys(originLocales);
window.langs = langs;
window.originLocales = JSON.parse(JSON.stringify(originLocales));
window.langBase = LANG_BASE;
window.parseDuplicate = PARSE_DUPLICATE;