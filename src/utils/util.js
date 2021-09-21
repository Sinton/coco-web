import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

export function welcome () {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent () {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader (callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function () {}
  window.addEventListener(
    'scroll',
    event => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false
  )
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate (id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

/**
 * 转换容量大小
 *
 * @param size
 * @param unit
 * @param reverse
 * @param base
 * @returns {string|number|*}
 */
export function convertSize(size, unit = true, reverse = false, base = 1000) {
  if (reverse) {
    if (size.endsWith('B')) {
      // 容量等级
      let level = 0
      if (size.endsWith('KB')) {
        level = 1
      } else if (size.endsWith('MB')) {
        level = 2
      } else if (size.endsWith('GB')) {
        level = 3
      }
      return level > 0 ? size * Math.pow(base, level) : size
    } else {
      return size
    }
  } else {
    if (size === 0) {
      return `${size}B`
    }
    // 单位
    const units = ['B', 'KB', 'MB', 'GB']
    // 容量等级
    const level = Math.floor(Math.log2(size) / Math.log2(base))
    // 当前容量
    const capacity = size / Math.pow(base, level)
    // 四舍五入
    const currSize = Math.round(capacity * 100) / 100
    return unit ? `${currSize}${units[level]}` : currSize
  }
}

/**
 * 时间格式化
 *
 * @param dateStr
 * @param pattern
 * @returns {string}
 */
export function dateFormat (dateStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dateStr).format(pattern)
}

/**
 * 秒数格式化
 *
 * @param timeSecondStr
 * @returns {string|*}
 */
export function timeSecondFormat (timeSecondStr) {
  const zeroSecond  = 0
  const nanoSecond  = 1
  const microSecond = nanoSecond * 1000
  const milliSecond = microSecond * 1000
  const second      = milliSecond * 1000
  const minute      = second * 60
  const hour        = minute * 60
  if (Number.isInteger(timeSecondStr)) {
    if (nanoSecond <= timeSecondStr && timeSecondStr < microSecond) {
      return `${timeSecondStr / nanoSecond}ns`
    } else if (microSecond <= timeSecondStr && timeSecondStr < milliSecond) {
      return `${timeSecondStr / microSecond}us`
    } else if (milliSecond <= timeSecondStr && timeSecondStr < second) {
      return `${timeSecondStr / milliSecond}ms`
    } else if (second <= timeSecondStr && timeSecondStr < minute) {
      return `${timeSecondStr / second}s`
    } else if (minute <= timeSecondStr && timeSecondStr < hour) {
      return `${timeSecondStr / minute}m`
    } else if (hour <= timeSecondStr) {
      return `${timeSecondStr / hour}h`
    } else {
      return `${zeroSecond}s`
    }
  }
}

/**
 * 判断时候不为空
 *
 * @param any
 * @returns {boolean}
 */
export function isNotEmpty(any) {
  return !_.isEmpty(any)
}

/**
 * 对象深度拷贝
 *
 * @param any
 * @returns {*}
 */
export function cloneDeep(any) {
  return _.cloneDeep(any)
}
