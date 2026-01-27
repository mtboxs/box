import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProductInfo } from '@/api/home'

const useProductStore = defineStore('product', () => {
  const currentProduct = ref<ProductInfo | null>(null)

  const setCurrentProduct = (product: ProductInfo) => {
    currentProduct.value = product
  }

  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  return {
    currentProduct,
    setCurrentProduct,
    clearCurrentProduct
  }
})

export default useProductStore
