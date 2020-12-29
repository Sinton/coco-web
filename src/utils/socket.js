import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import VueSocketIO from 'vue-socket.io'

export function socketConnect() {
  if(Vue.ls.get(ACCESS_TOKEN)) {
    const authenticate = {}
    authenticate[ACCESS_TOKEN] = Vue.ls.get(ACCESS_TOKEN)
    Vue.use(new VueSocketIO({
      debug: !(process.env.NODE_ENV === 'production' && process.env.VUE_APP_PREVIEW !== 'true'),
      connection: 'http://localhost:9099',
      options: {
        query: authenticate
      }
    }))
  }
}
