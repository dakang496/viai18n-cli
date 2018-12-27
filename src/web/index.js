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
window.parseDuplicate = PARSE_DUPLICATE;
let curOrigin = {};
if(!window.parseDuplicate) {
    window.rootKey = "To be translated";

    for(let field in originLocales) {
        curOrigin[field] = {};
        curOrigin[field][window.rootKey] = originLocales[field]
    }
} else {
    curOrigin = originLocales;
}

const langs = Object.keys(curOrigin);
window.langs = langs;
window.originLocales = JSON.parse(JSON.stringify(curOrigin));
window.langBase = LANG_BASE;
window.langTarget = LANG_TARGET;


