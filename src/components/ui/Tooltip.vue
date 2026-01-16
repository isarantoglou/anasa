<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = defineProps<{
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const isVisible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const positionStyles = ref({})
const arrowStyles = ref({})

const tooltipPosition = computed(() => props.position || 'top')

async function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  
  const viewportWidth = window.innerWidth
  const padding = 12 // Min distance from screen edge

  const triggerCenterX = triggerRect.left + triggerRect.width / 2
  const triggerCenterY = triggerRect.top + triggerRect.height / 2
  
  let top = 0
  let left = 0
  
  // Initial arrow styles (reset)
  let arrowCss: any = { transform: 'rotate(45deg)' }

  if (tooltipPosition.value === 'top' || tooltipPosition.value === 'bottom') {
    // Horizontal Centering Logic with Clamping
    left = triggerCenterX + scrollX - (tooltipRect.width / 2)
    
    // Clamp to viewport
    const minLeft = scrollX + padding
    const maxLeft = scrollX + viewportWidth - tooltipRect.width - padding
    
    if (left < minLeft) left = minLeft
    if (left > maxLeft) left = maxLeft
    
    // Calculate Arrow X relative to Tooltip
    // We want the arrow to point to TriggerCenterX.
    // Arrow Left = (TriggerCenterXInPage) - (TooltipLeftInPage)
    // We subtract half arrow width (4px) to center it since we use left positioning
    const arrowX = (triggerCenterX + scrollX) - left - 4 
    arrowCss.left = `${arrowX}px`
    
    if (tooltipPosition.value === 'top') {
      top = triggerRect.top + scrollY - tooltipRect.height - 8
      arrowCss.bottom = '-4px'
    } else {
      top = triggerRect.bottom + scrollY + 8
      arrowCss.top = '-4px'
    }
  } else {
    // Left/Right positioning (simplified, usually less prone to overflow in this app)
    // Vertical Centering
    top = triggerCenterY + scrollY - (tooltipRect.height / 2)
    arrowCss.top = '50%'
    arrowCss.transform = 'translateY(-50%) rotate(45deg)'
    
    if (tooltipPosition.value === 'left') {
      left = triggerRect.left + scrollX - tooltipRect.width - 8
      arrowCss.right = '-4px'
    } else {
      left = triggerRect.right + scrollX + 8
      arrowCss.left = '-4px'
    }
  }

  positionStyles.value = {
    top: `${top}px`,
    left: `${left}px`
  }
  
  arrowStyles.value = arrowCss
}

async function show() {
  isVisible.value = true
  await nextTick()
  updatePosition()
}

function hide() {
  isVisible.value = false
}
</script>

<template>
  <div ref="triggerRef" class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
    <slot></slot>
  </div>
  
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div 
        v-if="isVisible" 
        ref="tooltipRef"
        class="modern-tooltip-fixed" 
        :class="`tooltip-${tooltipPosition}`"
        :style="positionStyles"
      >
        <div class="mt-content">{{ content }}</div>
        <div class="mt-arrow" :style="arrowStyles"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tooltip-wrapper {
  display: inline-flex;
}

.modern-tooltip-fixed {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
  max-width: 280px; /* Prevent wide tooltips */
  width: max-content;
}

.mt-content {
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(10, 37, 64, 0.95) 0%, rgba(13, 79, 139, 0.95) 100%);
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  white-space: normal; /* Allow text wrapping */
  text-align: left;
  line-height: 1.4;
}

.mt-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(10, 37, 64, 0.95);
  transform: rotate(45deg); /* Default, overridden by JS sometimes */
}

/* Transitions */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  /* Add subtle scale/shift effect */
  transform: scale(0.95); 
}

/* Dark mode */
:global(.dark) .mt-content {
  background: linear-gradient(135deg, rgba(254, 253, 251, 0.95) 0%, rgba(228, 226, 222, 0.95) 100%);
  color: var(--aegean-800);
}

:global(.dark) .mt-arrow {
  background: rgba(254, 253, 251, 0.95);
}
</style>
