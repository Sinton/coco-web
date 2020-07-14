export default {
  filters: {
    trimShaSum(imageName) {
      if (imageName.indexOf('sha256:') === 0) {
        return imageName.substring(7, 19)
      }
      return _.split(imageName, '@sha256')[0]
    },
    truncate(text, length, suffix) {
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
    },
    truncatelr(text, max, left, right) {
      max = isNaN(max) ? 50 : max
      left = isNaN(left) ? 25 : left
      right = isNaN(right) ? 25 : right

      if (text.length <= max) {
        return text
      } else {
        return text.substring(0, left) + '[...]' + text.substring(text.length - right, text.length)
      }
    }
  }
}
