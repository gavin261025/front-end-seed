import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import Axios from 'axios'
import { createDiscreteApi } from 'naive-ui'
import nProgress from 'nProgress'
import Cookies from 'js-cookie'
import qs from 'qs'

const message = createDiscreteApi(['message', 'notification'])

// eslint-disable-next-line no-underscore-dangle
const _instance = Axios.create({
  baseURL: '/api'
})

_instance.interceptors.request.use(
  (config) => {
    const c = { ...config }
    c.paramsSerializer = (params) => {
      return qs.stringify(params, { indices: false })
    }
    nProgress.start()
    const token = Cookies.get('token')
    if (token) {
      c.headers!.Authorization = `Bearer ${token}`
    }
    return c
  },
  () => {}
)

_instance.interceptors.response.use(
  (res: AxiosResponse<API.Response>) => {
    nProgress.done()
    const response = res.data
    if (!response.success) {
      switch (response.showType) {
        case 0:
          break
        case 1:
          message.message.warning(response.errorMessage)
          break
        case 2:
          message.message.error(response.errorMessage)
          break
        case 4:
          // 未登录提示框
          // message.notification.error({
          //   content: response.errorMessage
          // })
          break
        case 9:
          break
        default:
      }
      throw new Error(response.errorMessage)
    }

    return res.data
  },
  () => {
    nProgress.done()
  }
)

const request = (
  url: string,
  params?: {
    method?: 'GET' | 'POST' | 'DELETE' | 'PUT'
    params?: any
    config?: AxiosRequestConfig
    data?: any
  }
): Promise<API.Response> => {
  switch (params?.method) {
    case undefined:
    case 'GET':
      return _instance.get(url, {
        params: params?.params,
        ...params?.config
      })
    case 'POST':
      return _instance.post(url, params.data, {
        params: params.params,
        ...params.config
      })
    case 'DELETE':
      return _instance.delete(url, {
        params: params.params,
        ...params.config
      })
    case 'PUT':
      return _instance.put(url, params.data, {
        params: params.params,
        ...params.config
      })
    default:
      return _instance.get(url, {
        params: params?.params,
        ...params?.config
      })
  }
}

export default request
