<template>
  <div id="app">
    <div class="text-left">
      <span>参考语言：</span>
      <b-form-radio-group
        class="baselang-box"
        id="radios2"
        v-model="baseLang"
        name="radioSubComponent"
      >
        <b-form-radio
          :value="item"
          v-for="(item,index) in langs"
          :key="index"
        >{{item}}</b-form-radio>
      </b-form-radio-group>
    </div>

    <b-tabs v-model="seletedTab">
      <b-tab
        :title="lang"
        v-for="(lang,index) in langs"
        :key="index"
      >
      </b-tab>
    </b-tabs>

    <div class="panel-content">
      <div
        class="file"
        v-for="(item,file) in seletedLocale"
        :key="file"
      >
        <p class="title">{{file}}</p>
        <div
          class="d-flex"
          v-for="(value,key) in item"
          :key="key"
        >
          <span class="item-label">{{key}}</span>
          <div class="item-text">
            <p class="tip">{{originLocales[baseLang][file][key]}}</p>
            <input
              class="w-100"
              v-model="editLocales[selectLang][file][key]"
            >
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import originLocales from './locale'
const langs = Object.keys(originLocales);
export default {
  name: 'App',
  data(){
    return {
      originLocales:originLocales,
      editLocales:JSON.parse(JSON.stringify(originLocales)),
      langs:langs,
      baseLang:langs[0],
      seletedTab:0,
    }
  },
  computed:{
    selectLang(){
      return this.langs[this.seletedTab]
    },
    seletedLocale(){
      return this.editLocales[this.selectLang]
    }
  },

  mounted() {
  },
}
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .baselang-box {
    display: inline-block;
  }
  .panel-content {
    padding: 10px;
    .file{
      padding-bottom: 10px;
      border-bottom: 1px solid gray;
      text-align: left;
    }
    .title {
      font-size: 16px;
      font-weight: 500;
    }
    .item-label {
      padding-top: 24px;
      min-width: 100px;
    }
    .item-text {
      .tip {
        padding: 0;
        margin: 0;
        height: 24px;
      }
    }
  }
}
</style>
