# 前端 CRUD 使用手册

## 编写 ejs

ejs 是一门 javascript 编写的高效模板引擎

ejs 入门， 请看https://ejs.bootcss.com/#install

## 可使用变量

```ts
interface CRUD {
    insertList: Array<Field> // 新增字段集合
    queryList: Array<Field> // 查询字段集合
    searchList: Array<Field> // 搜索字段集合
    suffix: string // 后缀
    templateName: string // 模板地址
    _: Object // lodash对象， 可以在ejs中使用lodash!!
}

// 字段信息
interface Field {
    Collation: string,
    Comment: string, // 注释
    Default: string, // 默认值
    Field: string, // 字段名
    Key: string, // 键名
    Null: string, // 是否可为空
    Privileges: string, // 权限
    Type: string // 类型
}
```

## 可使用方法

### lodash

lodash作为前端最受欢迎的工具库，里面有着许多方便的方法，而有的一些也已经成为了Javascript标准！

lodash是一个一致性、模块化、高性能的 JavaScript 实用工具库!

在ejs里面可以使用lodash的所有方法！

比如: 把字符串转成驼峰命名:
```js
_.camelCase(data.Field)
```

首字母大写:
```js
_.capitalize(data.Field)
```

转为kebabCase写法:
```js
_.kebabCase(data.Field)
```

学习了解lodash https://www.lodashjs.com/


还可以使用 JavaScript 的所有方法, 学习 JavaScript:

https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript
