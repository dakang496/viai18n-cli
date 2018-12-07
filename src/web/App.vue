<template>
  <div id="app">

    <div class="alert alert-warning" role="alert">After the translation is completed, please click the <b-button variant="success" @click="exportFile">Export</b-button> button and send the downloaded file to your colleagues</div>
    <!-- <div class="text-left header">
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
    </div> -->

    <b-tabs v-model="seletedTab">
      <b-tab
        :title="lang"
        v-for="(lang,index) in langs"
        :key="index"
      >
      </b-tab>
    </b-tabs>

    <div class="op-bar d-flex">
      <div class="d-flex lang-tip">
        <p>Translate</p>
        <b-form-select v-model="baseLang" :options="langs" class="mb-3" size="sm" />
        <p>into</p>
        <b-badge variant="primary">{{selectLang}}</b-badge>
      </div>

      <div class="flex"></div>
      <b-button variant="success" @click="exportFile">Export</b-button>
    </div>

    <div class="panel-content">
      <div
        class="file"
        v-for="(item,file) in seletedLocale"
        :key="file"
      >
        <div class="title d-flex" :class="getPending(file)===0?'finished':''" v-b-toggle="file">
          <div><span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>{{file}}</div>
          <div class="flex"></div>
          <div class="cal-tip" v-if=" getPending(file) > 0"><span>Pending </span><b-badge variant="warning">{{getPending(file)}}</b-badge></div>
          <div class="cal-tip" v-if=" getPending(file) < 0"><span>Pending </span><b-badge variant="warning">Unknow</b-badge></div>
        </div>
        <b-collapse :id="file" visible>
          <div
            class="d-flex trans-box"
            v-for="(value,key) in item"
            :key="key"
          >
            <span class="item-label">{{key}}</span>
            <div class="item-text">
              <p class="tip">{{originLocales[baseLang][file][key]}}</p>
              <b-form-textarea contenteditable
                size="sm"
                v-model="editLocales[selectLang][file][key]"
              />
            </div>

          </div>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import originLocales from "./locale";
const langs = Object.keys(originLocales);
export default {
  name: "App",
  data() {
    return {
      originLocales: originLocales,
      editLocales: JSON.parse(JSON.stringify(originLocales)),
      langs: langs,
      baseLang: langs[0],
      seletedTab: 0,
      lang: LANG_BASE
    };
  },
  computed: {
    selectLang() {
      return this.langs[this.seletedTab];
    },
    seletedLocale() {
      return this.editLocales[this.selectLang];
    }
  },

  mounted() {},

  methods: {
    funDownload(content, filename) {
      let eleLink = document.createElement("a");
      eleLink.download = filename;
      eleLink.style.display = "none";
      let blob = new Blob([content]);
      eleLink.href = URL.createObjectURL(blob);
      document.body.appendChild(eleLink);
      eleLink.click();
      document.body.removeChild(eleLink);
    },

    exportFile() {
      let content = JSON.stringify(this.editLocales[this.selectLang], null, 4);
      this.funDownload(content, `${this.selectLang}.json`)
    },

    getPending(page) {
      let total = 0;
      try {
        let pageData = this.editLocales[this.selectLang][page];
        let originPageData = this.originLocales[this.lang][page];

        for(let field in pageData) {
          if(this.selectLang === this.lang) {
            if(pageData[field] !== originPageData[field]) {
              total ++;
            }
          } else {
            if(pageData[field] === originPageData[field]) {
              total ++;
            }
          }
        }
      } catch (error) {
        console.log(error);
        total = -1;
      }

      return total;
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .flex {
    flex: 1;
  }
  p {
    margin: 0;
  }
  .header {
    padding: 20px;
  }
  .nav-tabs {
    padding: 0 20px;
  }
  .baselang-box {
    display: inline-block;
  }
  .op-bar {
    margin: 20px;
    padding-bottom: 0;
    border: 1px solid #ececec;
    border-radius: 6px;
    padding: 10px 0;
    margin-bottom: 0;
    background-color: #f3f3f3;

    .lang-tip {
      line-height: 30px;
      height: 30px;

      p {
        margin: 0 10px;
      }
      .badge-primary {
        color: #fff;
        background-color: #007bff;
        line-height: 25px;
        font-size: 16px;
      }
    }

    .btn-success {
      height: 26px;
      line-height: 26px;
      padding-top: 0;
      margin-top: 2px;
      margin-right: 20px;
    }
  }
  .panel-content {
    padding: 20px;

    .file {
      text-align: left;
      border: 1px solid #ececec;
      border-radius: 6px;
      margin-bottom: 10px;

      .trans-box:last-child {
        border-bottom: 0px;
      }
    }
    .title {
      font-size: 16px;
      font-weight: 500;
      line-height: 30px;
      background-color: #f3f3f3;
      padding: 0 10px;
      margin-bottom: 0;
      overflow: hidden;
      .cal-tip {
        span {
          color: #666;
          font-size: 14px;
        }
      }

      &.finished {
        background-color: #c9ffb0;
      }
    }
    .trans-box {
      padding: 10px;
      border-bottom: 1px solid #ececec;
      .item-label {
        width: 80px;
        min-width: 80px;
        word-break: break-all;
        margin-right: 20px;
        color: #666;
        font-size: 15px;
      }
      .item-text {
        flex: 1;
        .tip {
          padding: 0;
          margin: 0;
          color: #333;
        }

        textarea {
          height: inherit;
          margin-top: 5px;
        }
      }
    }
  }
}
</style>
