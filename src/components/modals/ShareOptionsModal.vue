<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
  url: string
}>()

const emit = defineEmits<{
  close: []
}>()

const copySuccess = ref(false)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}

function share(platform: string) {
  const text = 'Δείτε το πλάνο αδειών μου στο Ανάσα:'
  let shareUrl = ''

  switch (platform) {
    case 'email':
      shareUrl = `mailto:?subject=Το πλάνο αδειών μου&body=${encodeURIComponent(text)} ${encodeURIComponent(props.url)}`
      break
    case 'viber':
      shareUrl = `viber://forward?text=${encodeURIComponent(text + ' ' + props.url)}`
      break
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + props.url)}`
      break
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(text)}`
      break
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`
      break
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900">Κοινοποίηση Πλάνου</h3>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- URL Input -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 uppercase">Σύνδεσμος Πλάνου</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  :value="url"
                  readonly
                  class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 select-all"
                />
                <button
                  @click="copyLink"
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shrink-0"
                  :class="copySuccess 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'"
                >
                  <span v-if="copySuccess">Αντιγράφηκε!</span>
                  <span v-else>Αντιγραφή</span>
                  <svg v-if="!copySuccess" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Share Buttons Grid -->
            <div class="grid grid-cols-2 gap-3">
              <button @click="share('viber')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95 bg-[#7360f2] text-white hover:bg-[#5e4ee6]">
                <!-- Viber (Boxicons/Standard) -->
                <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.172 1.957-1.77 5.475-2.01 7.11-2.02zm.36 2.6a.299.299 0 0 0-.3.299.3.3 0 0 0 .3.3 5.631 5.631 0 0 1 4.03 1.59c1.09 1.06 1.621 2.48 1.641 4.34a.3.3 0 0 0 .3.3v-.009a.3.3 0 0 0 .3-.3 6.451 6.451 0 0 0-1.81-4.76c-1.19-1.16-2.692-1.76-4.462-1.76zm-3.954.69a.955.955 0 0 0-.615.12h-.012c-.41.24-.788.54-1.148.94-.27.32-.421.639-.461.949a1.24 1.24 0 0 0 .05.541l.02.01a13.722 13.722 0 0 0 1.2 2.6 15.383 15.383 0 0 0 2.32 3.171l.03.04.04.03.03.03.03.03a15.603 15.603 0 0 0 3.18 2.33c1.32.72 2.122 1.06 2.602 1.2v.01c.14.04.268.06.398.06a1.84 1.84 0 0 0 1.102-.472c.39-.35.7-.738.93-1.148v-.01c.23-.43.15-.841-.18-1.121a13.632 13.632 0 0 0-2.15-1.54c-.51-.28-1.03-.11-1.24.17l-.45.569c-.23.28-.65.24-.65.24l-.012.01c-3.12-.8-3.95-3.959-3.95-3.959s-.04-.43.25-.65l.56-.45c.27-.22.46-.74.17-1.25a13.522 13.522 0 0 0-1.54-2.15.843.843 0 0 0-.504-.3zm4.473.89a.3.3 0 0 0 .002.6 3.78 3.78 0 0 1 2.65 1.15 3.5 3.5 0 0 1 .9 2.57.3.3 0 0 0 .3.299l.01.012a.3.3 0 0 0 .3-.301c.03-1.19-.34-2.19-1.07-2.99-.73-.8-1.75-1.25-3.05-1.34a.3.3 0 0 0-.042 0zm.49 1.619a.305.305 0 0 0-.018.611c.99.05 1.47.55 1.53 1.58a.3.3 0 0 0 .3.29h.01a.3.3 0 0 0 .29-.32c-.07-1.34-.8-2.091-2.1-2.161a.305.305 0 0 0-.012 0z"/></svg>
                <span>Viber</span>
              </button>
              
              <button @click="share('whatsapp')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95 bg-[#25D366] text-white hover:bg-[#20bd5a]">
                <!-- WhatsApp (Boxicons) -->
                <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-6.605-2.392zM12.057 19.46c-1.363 0-2.688-.366-3.858-1.06l-.276-.164-2.871.755.766-2.797-.179-.285a7.485 7.485 0 0 1-1.15-3.957c.002-4.137 3.366-7.502 7.502-7.502a7.458 7.458 0 0 1 5.304 2.197 7.46 7.46 0 0 1 2.199 5.304 7.492 7.492 0 0 1-7.437 7.51zM16.148 14.509c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.15.225-.579.73-.71.881-.131.15-.262.169-.486.056-.225-.113-.949-.35-1.808-1.116-.622-.555-1.043-1.24-1.164-1.452-.122-.211-.013-.324.099-.436.101-.1.225-.262.337-.394.113-.131.15-.225.225-.374.075-.15.038-.281-.019-.393-.056-.113-.505-1.217-.692-1.666-.182-.435-.366-.375-.504-.383-.13-.006-.28-.008-.429-.008-.15 0-.394.056-.6.281-.205.225-.785.768-.785 1.874 0 1.106.806 2.174.919 2.324.112.15 1.586 2.422 3.842 3.396.536.232.955.37 1.28.473.535.169 1.022.146 1.409.088.428-.065 1.327-.543 1.514-1.066.187-.525.187-.975.131-1.068-.056-.094-.206-.15-.431-.26z"/></svg>
                <span>WhatsApp</span>
              </button>

              <button @click="share('telegram')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95 bg-[#0088cc] text-white hover:bg-[#0077b5]">
                <!-- Telegram (Boxicons) -->
                <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.002-1.371.646z"/></svg>
                <span>Telegram</span>
              </button>

              <button @click="share('email')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95 bg-gray-600 text-white hover:bg-gray-700">
                <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>


.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-fade-in-up,
.modal-leave-active .animate-fade-in-up {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .animate-fade-in-up {
  transform: translateY(20px);
  opacity: 0;
}
</style>
