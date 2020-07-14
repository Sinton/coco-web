import { axios } from '@/utils/request'

/**
 * 基础接口调用
 * @param url
 * @param params
 * @param method
 * @param async
 */
export function invokeApi(url, params = null, method = 'post', async = true) {
  if (async) {
    return axios({
      url: url,
      method: method,
      data: params
    })
  } else {
    return syncInvokeApi(url, params, method)
  }
}

/**
 * 接口同步请求
 * @param url
 * @param params
 * @param method
 */
export function syncInvokeApi(url, params = null, method = 'GET') {
  return null
}
