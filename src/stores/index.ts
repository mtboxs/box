import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import useUserStore from './modules/user'
import useCounterStore from './modules/counter'
import useRouteCacheStore from './modules/routeCache'
import useProductStore from './modules/product'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { useUserStore, useCounterStore, useRouteCacheStore, useProductStore }
export default pinia
