<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const hasSeenHelp = ref(false)
const showPulse = ref(false)

onMounted(() => {
  // Check if user has seen help before
  const seen = localStorage.getItem('anasa-help-seen')
  hasSeenHelp.value = seen === 'true'

  // Show pulse animation for first-time visitors
  if (!hasSeenHelp.value) {
    setTimeout(() => {
      showPulse.value = true
    }, 2000)
  }
})

function openHelp() {
  isOpen.value = true
  showPulse.value = false

  // Mark as seen
  if (!hasSeenHelp.value) {
    localStorage.setItem('anasa-help-seen', 'true')
    hasSeenHelp.value = true
  }
}

function closeHelp() {
  isOpen.value = false
}

// Close on escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    closeHelp()
  }
}

// Close when clicking backdrop
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    closeHelp()
  }
}
</script>

<template>
  <!-- Floating Help Button -->
  <button
    @click="openHelp"
    class="help-fab"
    :class="{ 'help-fab-pulse': showPulse }"
    aria-label="Οδηγίες χρήσης"
  >
    <!-- Lighthouse Icon - Guiding Light -->
    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      <circle cx="12" cy="12" r="4" />
    </svg>

    <!-- Notification dot for first-time visitors -->
    <span v-if="!hasSeenHelp" class="help-fab-dot"></span>
  </button>

  <!-- Backdrop + Drawer -->
  <Teleport to="body">
    <Transition name="help-drawer">
      <div
        v-if="isOpen"
        class="help-backdrop"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div class="help-drawer" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <!-- Header -->
          <div class="help-drawer-header">
            <div class="help-drawer-icon-container">
              <div class="help-drawer-icon-bg">
                <svg class="w-8 h-8 text-(--aegean-600)" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
            </div>
            <div class="help-drawer-title-group">
              <h2 id="help-title" class="help-drawer-title">Πώς να χρησιμοποιήσετε το Ανάσα</h2>
              <p class="help-drawer-subtitle">Μεγιστοποιήστε τις διακοπές σας με έξυπνο προγραμματισμό</p>
            </div>
            <button @click="closeHelp" class="help-drawer-close-btn" aria-label="Κλείσιμο">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>




          <!-- Scrollable Content -->
          <div class="help-drawer-content relative">
            <!-- Welcome -->
            <div class="help-section help-welcome">
              <p>
                Το <strong>Ανάσα</strong> σας βοηθά να βρείτε τις καλύτερες περιόδους για άδεια,
                αξιοποιώντας τις αργίες και τα Σαββατοκύριακα για μέγιστο χρόνο ξεκούρασης.
              </p>
            </div>

            <!-- Steps -->
            <div class="help-section">
              <h3 class="help-section-title">
                <span class="help-section-number">1</span>
                Ρυθμίστε τις προτιμήσεις σας
              </h3>
              <ul class="help-list">
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Επιλέξτε <strong>έτος</strong> με τα βελάκια</span>
                </li>
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Ορίστε τις <strong>ημέρες άδειας</strong> που έχετε</span>
                </li>
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span>Προσθέστε <strong>τοπικές αργίες</strong> (π.χ. πολιούχος)</span>
                </li>
              </ul>
            </div>

            <div class="help-section">
              <h3 class="help-section-title">
                <span class="help-section-number">2</span>
                Εξερευνήστε τις ευκαιρίες
              </h3>
              <ul class="help-list">
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon text-(--success-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span>Οι κάρτες δείχνουν πόσες <strong>ημέρες κερδίζετε</strong></span>
                </li>
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon text-(--warning-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                  <span>Ταξινομήστε κατά <strong>απόδοση</strong> ή <strong>ημερομηνία</strong></span>
                </li>
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon text-(--aegean-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Κάθε κάρτα δείχνει <strong>ανάλυση ημερών</strong> (αργίες, Σ/Κ, εργάσιμες)</span>
                </li>
              </ul>
            </div>

            <div class="help-section">
              <h3 class="help-section-title">
                <span class="help-section-number">3</span>
                Δημιουργήστε το πλάνο σας
              </h3>
              <ul class="help-list">
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon text-(--terracotta-500)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span>Πατήστε <strong>«Προσθήκη»</strong> για να κρατήσετε περιόδους</span>
                </li>
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon text-(--aegean-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span><strong>Μοιραστείτε</strong> το πλάνο με σύνδεσμο ή εικόνα</span>
                </li>
                <li>
                  <div class="help-icon-box">
                    <svg class="help-list-icon text-(--success-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <span><strong>Εξαγωγή</strong> σε ημερολόγιο (.ics)</span>
                </li>
              </ul>
            </div>

            <!-- Tips -->
            <div class="help-section help-tips">
              <h3 class="help-tips-title">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                Χρήσιμες συμβουλές
              </h3>
              <div class="help-tips-grid">
                <div class="help-tip">
                  <div class="help-tip-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Λειτουργία Γονέα</strong>
                    <p>Βρείτε άδειες που συμπίπτουν με σχολικές διακοπές</p>
                  </div>
                </div>
                <div class="help-tip">
                  <div class="help-tip-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Αγίου Πνεύματος</strong>
                    <p>Απενεργοποιήστε αν η εταιρεία σας δεν την δίνει</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="help-drawer-footer">
            <button @click="closeHelp" class="help-drawer-action-btn">
              Κατάλαβα!
            </button>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING ACTION BUTTON
   ═══════════════════════════════════════════════════════════════════════════ */

.help-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 40;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--aegean-600) 0%, var(--aegean-700) 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 14px rgba(13, 79, 139, 0.4),
    0 2px 6px rgba(13, 79, 139, 0.2),
    0 0 0 4px rgba(255, 255, 255, 0.2); /* Glass ring */
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(4px);
}

.help-fab:hover {
  transform: scale(1.08);
  box-shadow:
    0 6px 20px rgba(13, 79, 139, 0.5),
    0 3px 10px rgba(13, 79, 139, 0.3);
}

.help-fab:active {
  transform: scale(0.95);
}

/* Pulse animation for first-time visitors */
.help-fab-pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--aegean-400);
  opacity: 0;
  animation: helpPulse 2s ease-out infinite;
}

@keyframes helpPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* Notification dot */
.help-fab-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--terracotta-500);
  border: 2px solid white;
  animation: dotBounce 1s ease-in-out infinite;
}

@keyframes dotBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Dark mode */
:global(.dark) .help-fab {
  background: linear-gradient(135deg, var(--aegean-500) 0%, var(--aegean-600) 100%);
  box-shadow:
    0 4px 14px rgba(33, 150, 243, 0.3),
    0 2px 6px rgba(33, 150, 243, 0.2);
}

/* ═══════════════════════════════════════════════════════════════════════════
   BACKDROP
   ═══════════════════════════════════════════════════════════════════════════ */

.help-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(10, 37, 64, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.help-drawer {
  width: 100%;
  max-width: 800px;
  background: var(--marble-white);
  border-radius: 2rem;
  box-shadow: 0 25px 50px -12px rgba(10, 37, 64, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from { transform: scale(0.95) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

  /* Header */
.help-drawer-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--marble-200);
}

.help-drawer-icon-container {
  flex-shrink: 0;
}

.help-drawer-icon-bg {
  width: 60px;
  height: 60px;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, var(--aegean-50) 0%, var(--aegean-100) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 6px -1px rgba(13, 79, 139, 0.1);
}

.help-drawer-title-group {
  flex: 1;
}

.help-drawer-title {
  font-family: var(--font-body);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--aegean-900);
  margin: 0;
  letter-spacing: -0.02em;
}

.help-drawer-subtitle {
  font-size: 1rem;
  color: var(--marble-500);
  margin: 0.25rem 0 0;
}

.help-drawer-close-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--marble-100);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--marble-500);
  transition: all 0.2s ease;
}

.help-drawer-close-btn:hover {
  background: var(--marble-200);
  color: var(--marble-800);
}

/* Content */
.help-drawer-content {
  overflow-y: auto;
  padding: 0 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: 70vh;
}

.help-welcome {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--aegean-50)/50;
  border-radius: 1.25rem;
  border-left: 4px solid var(--aegean-500);
  text-align: left;
}

.help-welcome p {
  margin: 0;
  font-size: 1.05rem;
  color: var(--aegean-800);
  line-height: 1.6;
}

.help-section {
  position: relative; /* For timeline z-index */
  z-index: 1;
  background: var(--marble-50); /* Card effect */
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid var(--marble-100);
}

.help-section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--aegean-900);
  margin: 0 0 1.25rem;
  text-align: left;
}

.help-section-number {
  width: 32px;
  height: 32px;
  border-radius: 50%; /* Fully round */
  background: linear-gradient(135deg, var(--aegean-500) 0%, var(--aegean-700) 100%);
  box-shadow: 0 4px 6px -1px rgba(13, 79, 139, 0.3);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  color: var(--marble-600);
  text-align: left;
}

.help-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-list-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--marble-400);
}

.help-tips {
  padding: 1.5rem;
  background: var(--terracotta-50)/50;
  border-radius: 1.5rem;
  border: 1px solid var(--terracotta-100);
}

.help-tips-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--terracotta-700);
  margin: 0 0 1.5rem;
}

.help-tips-grid {
  display: grid;
  grid-template-cols: 1fr;
  gap: 1.5rem;
}

.help-tip {
  display: flex;
  gap: 1rem;
  text-align: left;
}

.help-tip-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--terracotta-500);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.help-tip strong {
  display: block;
  font-size: 1rem;
  color: var(--terracotta-800);
  margin-bottom: 0.25rem;
}

.help-tip p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--terracotta-600);
  line-height: 1.4;
}

/* Footer */
.help-drawer-footer {
  padding: 1.5rem 2rem 2rem;
  background: var(--marble-white);
  border-top: 1px solid var(--marble-200);
}

.help-drawer-action-btn {
  width: 100%;
  padding: 1rem;
  background: var(--aegean-600);
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(13, 79, 139, 0.2);
}

.help-drawer-action-btn:hover {
  background: var(--aegean-700);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(13, 79, 139, 0.3);
}

/* Transitions */
.help-drawer-enter-active, .help-drawer-leave-active {
  transition: opacity 0.3s ease;
}

.help-drawer-enter-from, .help-drawer-leave-to {
  opacity: 0;
}

/* Dark Mode */
:global(.dark) .help-drawer {
  background: var(--marble-100);
  border: 1px solid var(--marble-200);
}

:global(.dark) .help-drawer-title { color: white; }
:global(.dark) .help-drawer-icon-bg { background: var(--aegean-900)/30; }
:global(.dark) .help-welcome { background: var(--aegean-900)/20; }
:global(.dark) .help-welcome p { color: var(--aegean-200); }
:global(.dark) .help-list li { color: var(--marble-400); }
:global(.dark) .help-tips { background: var(--terracotta-900)/20; }
:global(.dark) .help-tip-icon { background: var(--marble-200); }
:global(.dark) .help-drawer-footer { background: var(--marble-100); }

@media (max-width: 640px) {
  .help-backdrop {
    padding: 0;
    align-items: flex-end;
  }
  
  .help-drawer {
    border-radius: 2rem 2rem 0 0;
    max-height: 90vh;
  }
}

@media (min-width: 768px) {
  .help-tips-grid {
    grid-template-cols: 1fr 1fr;
  }
}
</style>
