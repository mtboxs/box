/* eslint-disable */
<script setup lang="ts">
import { ref } from 'vue'
import { closeToast, showLoadingToast, showToast } from 'vant'
import { joinActivity } from '@/api/activity'

const showModal = ref(true) // Show by default as per requirement/flow

const missions = [
  {
    id: 1,
    title: 'SPECIAL MISSIONS',
    subTitle: 'กิจกรรมพิเศษ',
    desc: 'ลงทะเบียนเข้าร่วมกิจกรรมหลังสั่งซื้อ 3 บิล\nเมื่อทำรายการครบ 3 รายการ ติดต่อกันให้เสร็จ\nแล้ว รับโบนัสและเข้าร่วมจากกิจกรรม',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Fashion/Model grayscale style
    target: 3,
  },
  {
    id: 2,
    title: 'SPECIAL MISSIONS',
    subTitle: 'กิจกรรมพิเศษ',
    desc: 'ลงทะเบียนเข้าร่วมกิจกรรมหลังสั่งซื้อ 4 บิล\nเมื่อทำรายการครบ 4 รายการ ติดต่อกันให้เสร็จ\nแล้ว รับโบนัสและเข้าร่วมจากกิจกรรม',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    target: 4,
  },
  {
    id: 3,
    title: 'SPECIAL MISSIONS',
    subTitle: 'กิจกรรมพิเศษ',
    desc: 'ลงทะเบียนเข้าร่วมกิจกรรมหลังสั่งซื้อ 5 บิล\nเมื่อทำรายการครบ 5 รายการ ติดต่อกันให้เสร็จ\nแล้ว รับโบนัสและเข้าร่วมจากกิจกรรม',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    target: 5,
  },
]

async function handleJoin() {
  showLoadingToast({
    message: 'Processing...',
    forbidClick: true,
  })

  try {
    const res = await joinActivity()
    if (res.code === '200') {
      closeToast()
      showToast({
        type: 'success',
        message: 'Success',
      })
    }
    else {
      closeToast()
      showToast({
        type: 'fail',
        message: res.msg || 'Failed',
      })
    }
  }
  catch (error) {
    closeToast()
    showToast({
      type: 'fail',
      message: 'Network Error',
    })
  }
}
</script>

<template>
  <div class="bg-black min-h-screen pb-24 font-sans relative">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm text-center py-3 shadow-sm">
      <h1 class="text-lg font-bold text-gray-900">
        กิจกรรม
      </h1>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-4">
      <div
        v-for="mission in missions"
        :key="mission.id"
        class="relative rounded-2xl overflow-hidden h-64 shadow-lg group cursor-pointer"
        @click="handleJoin"
      >
        <!-- Background Image (Grayscale) -->
        <img
          :src="mission.image"
          class="absolute inset-0 w-full h-full object-cover filter grayscale brightness-50"
          alt="Mission Background"
        >

        <!-- Sparkles/Overlay Effect -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <!-- Content Overlay -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white z-10">
          <!-- Card 2 in image 2 has a special "Received Order" overlay, implementing generic style for now -->

          <!-- Title Box -->
          <div class="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg mb-4 w-full max-w-[280px]">
            <h2 class="text-xl font-serif text-black font-bold tracking-wider mb-1">
              SPECIAL MISSIONS
            </h2>
            <div class="text-sm text-gray-800 font-medium">
              {{ mission.subTitle }}
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-gray-200 leading-relaxed max-w-[260px] whitespace-pre-line shadow-black drop-shadow-md">
            {{ mission.desc }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Dialog -->
    <van-popup
      v-model:show="showModal"
      :close-on-click-overlay="false"
      class="!bg-transparent w-[85vw] max-w-sm overflow-visible"
    >
      <div class="bg-[#1a1a1a] text-white rounded-3xl p-6 relative shadow-2xl border border-gray-800">
        <!-- Close Button (Top Right) -->
        <button 
          @click="showModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-white z-50 p-1"
        >
          <div class="i-carbon:close text-2xl"></div>
        </button>

        <h3 class="text-xl font-bold text-center mb-4">
          กิจกรรม
        </h3>

        <div class="text-sm text-gray-300 leading-loose text-left space-y-2 opacity-90">
          <p>
            สินค้า โปรโมชั่นทุกรายการระบบได้สุ่ม โดยอัตโนมัติ เมื่อเริ่มกิจกรรมแล้วไม่สามารถยกเลิกได้ ต้องทำออเดอร์ให้สำเร็จ
          </p>
          <p>
            หากต้องการเข้าร่วมกิจกรรมอื่นๆ ภายในงบ สามารถสมัครได้ที่ฝ่ายบริการลูกค้า แถมยังมี โอกาสลุ้นรอบอเดอร์เพิ่มเติมและรับโบนัสเพิ่ม กิจกรรมมากมาย โบนัสและค่าคอมมากมาย
          </p>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<route lang="json5">
{
  name: 'Activity',
  meta: {
    hideNavbar: true
  }
}
</route>
