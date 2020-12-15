import Vue from 'vue'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import VueSocketIO from 'vue-socket.io'

export function socketConnect() {
  if(Cookies.get(ACCESS_TOKEN)) {
    Vue.use(new VueSocketIO({
      debug: true,
      connection: 'http://localhost:9099'
    }))
  }
}
