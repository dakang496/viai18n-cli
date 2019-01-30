# viai18n-cli
manage i18n files  and  provides a visual interface for translating.   
it works along with [viai18n-loader](https://www.npmjs.com/package/viai18n-loader) frequently.
## Install

```sh
npm install viai18n-cli -g
```

## Usage
you should have a config file before execute below commands.    
Please refer to /example/viai18n.config.js.

+ collect locales together
```
viai18n collect
```
+ split locales
```
viai18n split
```
+ generate html for translating

```
viai18n gen
```
+ padding untranslated texts with translated texts

```
viai18n padding
```

viai18n-cli provides a  set of commands. use ``` viai18n --help ``` to learn more.

