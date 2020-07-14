import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { convertSize } from './util'
moment.locale('zh-cn')

Vue.filter('NumberFormat', (value) => {
  if (!value) {
    return '0'
  }
  // 将整数部分逢三一断
  return value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
})

Vue.filter('core', (cpu) => {
  return `${cpu / Math.pow(10, 9)}核`
})

Vue.filter('size', (size, base = 1000) => {
  return convertSize(size, base)
})

Vue.filter('moment', (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(dataStr).format(pattern)
})

Vue.filter('trimShaSum', (imageName) => {
  if (imageName.indexOf('sha256:') === 0) {
    return imageName.substring(7, 19)
  }
  return _.split(imageName, '@sha256')[0]
})

Vue.filter('truncate', (text, length, suffix) => {
  if (isNaN(length)) {
    length = 10
  }
  if (suffix === undefined) {
    suffix = '...'
  }
  if (text.length <= length || text.length - suffix.length <= length) {
    return text
  } else {
    return String(text).substring(0, length - suffix.length) + suffix
  }
})

Vue.filter('truncatelr', (text, max, left, right) => {
  max = isNaN(max) ? 50 : max
  left = isNaN(left) ? 25 : left
  right = isNaN(right) ? 25 : right

  if (text.length <= max) {
    return text
  } else {
    return text.substring(0, left) + '[...]' + text.substring(text.length - right, text.length)
  }
})

Vue.filter('whether', (bool) => {
  if (typeof bool === 'boolean') {
    return bool ? '是' : '否'
  }
  return bool
})
