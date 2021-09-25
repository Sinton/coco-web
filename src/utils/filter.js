import Vue from 'vue'
import { convertSize, dateFormat, isEmpty, isNotNumber } from './util'

Vue.filter('NumberFormat', (value) => {
  if (!value) {
    return '0'
  }
  // 将整数部分逢三一断
  return value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
})

Vue.filter('core', (cpu, decorate = true, decorationSuffix = '核') => {
  return `${cpu / Math.pow(10, 9)}${decorate ? decorationSuffix : ''}`
})

Vue.filter('cpuUsageRate', (cpu, percentage = true) => {
  const usageRate = cpu / Math.pow(10, 9)
  return percentage ? usageRate * 100 : usageRate
})

Vue.filter('size', (size, unit = true, reverse = false, base = 1000) => {
  return unit ? convertSize(size, unit, reverse, base) : Number.parseInt(convertSize(size, unit, reverse, base))
})

Vue.filter('moment', (dateStr, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  return dateFormat(dateStr, pattern)
})

Vue.filter('trimShaSum', (imageName) => {
  if (imageName.indexOf('sha256:') === 0) {
    return imageName.substring(7, 19)
  }
  return _.split(imageName, '@sha256')[0]
})

Vue.filter('truncate', (text, length, suffix) => {
  if (isEmpty(text)) {
    text = ''
  }
  if (isNotNumber(length)) {
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
  max = isNotNumber(max) ? 50 : max
  left = isNotNumber(left) ? 25 : left
  right = isNotNumber(right) ? 25 : right

  if (text.length <= max) {
    return text
  } else {
    return text.substring(0, left) + '[...]' + text.substring(text.length - right, text.length)
  }
})

Vue.filter('whether', (value) => {
  switch (typeof value) {
    case 'boolean':
      return value ? '是' : '否'
    case 'number':
      return value === 1 ? '是' : '否'
    default:
      return value
  }
})
