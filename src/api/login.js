import { axios } from '@/utils/request'

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return axios({
    url: '/auth/login',
    method: 'post',
    data: parameter
  })
}

export function getSmsCaptcha (parameter) {
  return axios({
    url: '/auth/smsCaptcha',
    method: 'post',
    data: parameter
  })
}

export function getInfo () {
  return axios({
    url: '/user/profile',
    method: 'get'
  })
}

export function logout () {
  return axios({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * get user 2step code open?
 * @param parameter {*}
 */
export function get2step (parameter) {
  return axios({
    url: '/auth/twoFactor',
    method: 'post',
    data: parameter
  })
}
