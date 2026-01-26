<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getMessages, sendMessage } from '@/api/mine'
import type { ChatMsgLog } from '@/api/mine'
import { showToast, showImagePreview } from 'vant'
import { useUserStore } from '@/stores'
import { uploadImage } from '@/api/common'

const router = useRouter()
const userStore = useUserStore()
const messages = ref<ChatMsgLog[]>([])
const inputText = ref('')
const loading = ref(false)
const sending = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const chatId = ref(0)
let pollTimer: ReturnType<typeof setInterval> | null = null

// Check if content is image format: img[url]
const isImageContent = (content: string) => {
  return /^img\[.+\]$/.test(content)
}

// Extract image URL from img[url] format
const getImageUrl = (content: string) => {
  const match = content.match(/^img\[(.+)\]$/)
  return match ? match[1] : ''
}

// Format time display
const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (isToday) {
    return `${hours}:${minutes}`
  }

  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// Check if should show time (more than 5 minutes gap)
const shouldShowTime = (index: number) => {
  if (index === 0) return true
  const current = new Date(messages.value[index].createAt).getTime()
  const prev = new Date(messages.value[index - 1].createAt).getTime()
  return current - prev > 5 * 60 * 1000
}

// Load messages from API
const loadMessages = async (showLoading = true) => {
  if (showLoading) loading.value = true
  try {
    const userId = userStore.userInfo?.id || 0
    const res = await getMessages({ id: userId })
    if (res.code === '200' && res.data) {
      const msgList = Array.isArray(res.data) ? res.data : [res.data]
      messages.value = msgList.sort((a, b) =>
        new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
      )
      // Get chatId from first message if available
      if (msgList.length > 0 && msgList[0].chatId) {
        chatId.value = msgList[0].chatId
      }
      scrollToBottom()
    }
  } catch (e) {
    console.error('Failed to load messages', e)
  } finally {
    loading.value = false
  }
}

// Send message
const handleSend = async () => {
  const content = inputText.value.trim()
  if (!content || sending.value) return

  sending.value = true

  // Optimistic update
  const tempMsg: ChatMsgLog = {
    id: Date.now(),
    chatId: chatId.value,
    ownerId: userStore.userInfo?.id || 0,
    content: content,
    customerFlg: false,
    imageFlg: false,
    disabled: false,
    createAt: new Date().toISOString()
  }
  messages.value.push(tempMsg)
  inputText.value = ''
  scrollToBottom()

  try {
    const res = await sendMessage({ chatId: chatId.value, content })
    if (res.code === '200') {
      // Refresh to get server response
      await loadMessages(false)
    } else {
      showToast(res.msg || 'Failed to send')
      // Remove optimistic message on failure
      messages.value = messages.value.filter(m => m.id !== tempMsg.id)
    }
  } catch (e) {
    showToast('Network error')
    messages.value = messages.value.filter(m => m.id !== tempMsg.id)
  } finally {
    sending.value = false
  }
}

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Start polling for new messages
const startPolling = () => {
  pollTimer = setInterval(() => {
    loadMessages(false)
  }, 5000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// Preview image
const previewImage = (url: string) => {
  showImagePreview({
    images: [url],
    closeable: true,
  })
}

// Handle image upload
const fileInput = ref<HTMLInputElement | null>(null)

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const handleImageSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size should be less than 5MB')
    return
  }

  sending.value = true

  try {
    // Upload image
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadImage(formData)

    if (res.code === '200' && res.data) {
      // Send image message in img[url] format
      const imageContent = `img[${res.data}]`
      await sendImageMessage(imageContent)
    } else {
      showToast(res.msg || 'Upload failed')
    }
  } catch (e) {
    showToast('Upload failed')
  } finally {
    sending.value = false
    // Reset file input
    if (target) target.value = ''
  }
}

const sendImageMessage = async (content: string) => {
  // Optimistic update
  const tempMsg: ChatMsgLog = {
    id: Date.now(),
    chatId: chatId.value,
    ownerId: userStore.userInfo?.id || 0,
    content: content,
    customerFlg: false,
    imageFlg: true,
    disabled: false,
    createAt: new Date().toISOString()
  }
  messages.value.push(tempMsg)
  scrollToBottom()

  try {
    const res = await sendMessage({ chatId: chatId.value, content })
    if (res.code === '200') {
      await loadMessages(false)
    } else {
      showToast(res.msg || 'Failed to send')
      messages.value = messages.value.filter(m => m.id !== tempMsg.id)
    }
  } catch (e) {
    showToast('Network error')
    messages.value = messages.value.filter(m => m.id !== tempMsg.id)
  }
}

const goBack = () => router.back()

onMounted(() => {
  loadMessages()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="h-screen flex flex-col bg-[#EDEDED]">
    <!-- Header -->
    <div class="bg-[#EDEDED] px-4 py-3 flex items-center border-b border-gray-200 sticky top-0 z-10">
      <button @click="goBack" class="p-1 -ml-1">
        <div class="i-carbon:chevron-left text-2xl text-gray-700"></div>
      </button>
      <h1 class="text-base font-medium flex-1 text-center text-gray-800">Online Service</h1>
      <div class="w-8"></div>
    </div>

    <!-- Chat Messages -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-3">
      <!-- Loading -->
      <div v-if="loading && messages.length === 0" class="flex justify-center py-8">
        <van-loading size="24px" color="#999">Loading...</van-loading>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && messages.length === 0" class="flex flex-col items-center justify-center py-16">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <div class="i-carbon:chat text-4xl text-gray-400"></div>
        </div>
        <p class="text-gray-500 text-sm">No messages yet</p>
        <p class="text-gray-400 text-xs mt-1">Send a message to start chatting</p>
      </div>

      <!-- Messages -->
      <div v-else class="space-y-4">
        <template v-for="(msg, index) in messages" :key="msg.id">
          <!-- Time Divider -->
          <div v-if="shouldShowTime(index)" class="flex justify-center">
            <span class="text-xs text-gray-500 bg-gray-200/80 px-3 py-1 rounded-full">
              {{ formatTime(msg.createAt) }}
            </span>
          </div>

          <!-- Message Row -->
          <div
            class="flex gap-3"
            :class="msg.customerFlg ? '' : 'flex-row-reverse'"
          >
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm"
                :class="msg.customerFlg ? 'ring-2 ring-blue-100' : 'ring-2 ring-green-100'"
              >
                <img
                  :src="msg.customerFlg
                    ? 'https://cdn-icons-png.flaticon.com/512/4233/4233830.png'
                    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
                  class="w-full h-full object-cover"
                  :alt="msg.customerFlg ? 'Service' : 'Me'"
                />
              </div>
            </div>

            <!-- Message Bubble -->
            <div class="max-w-[70%] flex flex-col" :class="msg.customerFlg ? 'items-start' : 'items-end'">
              <!-- Image Message: img[url] format -->
              <template v-if="isImageContent(msg.content)">
                <div class="rounded-lg overflow-hidden shadow-sm">
                  <img
                    :src="getImageUrl(msg.content)"
                    class="max-w-full max-h-48 object-cover cursor-pointer"
                    @click="previewImage(getImageUrl(msg.content))"
                  />
                </div>
              </template>
              <!-- Text Message -->
              <template v-else>
                <div
                  class="relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                  :class="msg.customerFlg
                    ? 'bg-white text-gray-800 rounded-tl-sm'
                    : 'bg-[#95EC69] text-gray-800 rounded-tr-sm'"
                >
                  <span class="whitespace-pre-wrap break-words">{{ msg.content }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Input Area -->
    <div class="bg-[#F7F7F7] border-t border-gray-200 px-4 py-3 pb-safe">
      <div class="flex items-end gap-2">
        <!-- Image Upload Button -->
        <button
          @click="triggerImageUpload"
          :disabled="sending"
          class="flex-shrink-0 p-2 text-gray-500 active:text-gray-700 disabled:opacity-50"
        >
          <div class="i-carbon:image text-2xl"></div>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageSelect"
        />

        <!-- Text Input -->
        <div class="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <textarea
            v-model="inputText"
            rows="1"
            class="w-full px-3 py-2.5 text-sm resize-none focus:outline-none max-h-24"
            placeholder="Type a message..."
            @keydown.enter.exact.prevent="handleSend"
          ></textarea>
        </div>

        <!-- Send Button -->
        <button
          @click="handleSend"
          :disabled="!inputText.trim() || sending"
          class="flex-shrink-0 bg-[#07C160] text-white text-sm px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <span v-if="sending">...</span>
          <span v-else>Send</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}

textarea {
  line-height: 1.5;
}

/* Auto-grow textarea */
textarea {
  field-sizing: content;
  min-height: 40px;
}
</style>

<route lang="json5">
{
  name: 'Chat',
  meta: {
    hideTabbar: true,
  }
}
</route>
