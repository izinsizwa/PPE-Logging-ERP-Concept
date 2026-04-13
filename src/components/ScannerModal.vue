<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <Transition name="slide">
          <div v-if="modelValue" class="modal modal-md">
            <div class="modal-title">
              <i class="fa-solid fa-barcode" style="color:var(--accent);margin-right:8px"></i>{{ titles[mode] }}
            </div>
            <div class="modal-sub" v-html="subs[mode]"></div>

            <!-- Camera feed -->
            <div v-show="cameraActive" class="scanner-area">
              <video ref="videoEl" class="scanner-video" autoplay playsinline muted></video>
              <div class="scanner-overlay">
                <div class="scanner-frame"><div class="scanner-line"></div></div>
              </div>
            </div>

            <div class="scanner-status" :class="statusClass">{{ statusText }}</div>

            <!-- Result -->
            <div v-if="result" class="scan-result">
              <div class="scan-result-label">Scanned</div>
              <div class="scan-result-name">{{ result.name }}</div>
              <div class="scan-result-sub">{{ result.sub }}</div>
            </div>

            <!-- Action after scan -->
            <div v-if="result">
              <!-- Employee found -->
              <button v-if="result.type === 'employee'" class="btn btn-primary" style="width:100%;margin-bottom:8px"
                @click="close(); $router.push(`/employees/${result.data.id}`)">
                <i class="fa-solid fa-arrow-right"></i> Open {{ result.data.name }}'s Profile
              </button>

              <!-- Item found - GRN mode -->
              <button v-if="result.type === 'item' && (mode === 'grn-scan' || mode === 'general')" class="btn btn-green" style="width:100%;margin-bottom:8px"
                @click="close(); $emit('open-grn', result.data.id)">
                <i class="fa-solid fa-truck-ramp-box"></i> Open GRN for {{ result.data.name }}
              </button>

              <!-- Item found - issue mode -->
              <template v-if="result.type === 'item' && mode === 'issue-scan'">
                <div class="form-group">
                  <label>Size</label>
                  <select v-model="scanSize" @change="updateScanStock">
                    <option value="">Select size…</option>
                    <option v-for="s in result.data.sizes" :key="s" :value="s">
                      {{ s }} — {{ stockFor(result.data.id, s) }} in stock
                    </option>
                  </select>
                </div>
                <div v-if="scanSize" class="stock-indicator" :class="scanStockClass">
                  <i :class="scanStockIcon"></i> {{ scanStockText }}
                </div>
                <div class="form-group">
                  <label>Quantity</label>
                  <input type="number" v-model.number="scanQty" min="1" />
                </div>
                <button class="btn btn-primary" style="width:100%;margin-bottom:8px" @click="confirmIssue">
                  <i class="fa-solid fa-check"></i> Confirm Issue to {{ empName }}
                </button>
              </template>

              <!-- Issuance found -->
              <button v-if="result.type === 'issuance'" class="btn btn-primary" style="width:100%;margin-bottom:8px"
                @click="close(); $router.push(`/employees/${result.owner?.id}`)">
                <i class="fa-solid fa-arrow-right"></i> View {{ result.owner?.name }}'s Profile
              </button>
            </div>

            <div class="scan-divider">or enter manually</div>

            <div class="scan-input-row">
              <div class="form-group">
                <label>Barcode / ID</label>
                <input ref="manualInput" type="text" v-model="manualCode"
                  placeholder="e.g. TN-001  or  C003  or  ISS-TN001-C002-001"
                  style="font-family:'DM Mono',monospace"
                  @keydown.enter="processManual" />
              </div>
              <button class="btn btn-primary" @click="processManual">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" @click="close">Close</button>
              <button class="btn btn-scan" @click="toggleCamera">
                <i :class="cameraActive ? 'fa-solid fa-stop' : 'fa-solid fa-camera'"></i>
                {{ cameraActive ? 'Stop Camera' : 'Use Camera' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue'
import { usePpeStore } from '@/stores/ppe'

const props = defineProps({
  modelValue: Boolean,
  mode:       { type: String, default: 'general' },
  empId:      { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'issued', 'open-grn'])

const store    = usePpeStore()
const showToast = inject('showToast')

const videoEl    = ref(null)
const manualInput = ref(null)
const manualCode = ref('')
const result     = ref(null)
const statusText = ref('')
const statusClass = ref('')
const cameraActive = ref(false)
let stream = null
let scanInterval = null

const scanSize  = ref('')
const scanQty   = ref(1)
const scanStock = ref(0)

const empName = computed(() => store.getEmployee(props.empId)?.name || '')

const titles = {
  general:    'Scan Barcode',
  employee:   'Scan Employee ID',
  'issue-scan': 'Scan Item to Issue',
  'grn-scan': 'Scan Item to Receive',
}

const subs = computed(() => ({
  general:    'Scan any barcode — employee ID, item code, or issuance reference.',
  employee:   'Scan an employee ID barcode to open their profile.',
  'issue-scan': `Scan an item barcode to issue it to <strong>${empName.value}</strong>.`,
  'grn-scan': 'Scan an item barcode to pre-fill the stock receiving form.',
}))

const scanStockClass = computed(() => {
  if (!scanStock.value) return 'stock-out'
  if (scanStock.value <= 5) return 'stock-low'
  return 'stock-ok'
})
const scanStockIcon = computed(() => {
  if (!scanStock.value) return 'fa-solid fa-ban'
  if (scanStock.value <= 5) return 'fa-solid fa-triangle-exclamation'
  return 'fa-solid fa-circle-check'
})
const scanStockText = computed(() => {
  const depot = store.getEmployee(props.empId)?.depot
  if (!scanStock.value) return `Out of stock at ${depot}`
  if (scanStock.value <= 5) return `Low stock — ${scanStock.value} remaining at ${depot}`
  return `${scanStock.value} units available at ${depot}`
})

function stockFor(itemId, size) {
  const depot = store.getEmployee(props.empId)?.depot
  return depot ? store.stockAtDepot(depot, itemId, size) : 0
}

function updateScanStock() {
  if (!result.value || !scanSize.value) return
  scanStock.value = stockFor(result.value.data.id, scanSize.value)
}

function processBarcode(code) {
  const resolved = store.resolveBarcode(code)
  statusClass.value = resolved ? 'found' : ''
  statusText.value  = resolved ? '✓ Record found' : `No record found for: "${code}"`
  if (!resolved) {
    result.value = { type: 'unknown', name: 'Unknown barcode', sub: code }
    return
  }
  const { type, data, owner } = resolved
  if (type === 'employee') {
    result.value = { type, data, name: data.name, sub: `${data.id} · ${data.division} · ${data.depot}` }
  } else if (type === 'item') {
    result.value = { type, data, name: data.name, sub: `${data.id} · ${data.category} · Sizes: ${data.sizes.join(', ')}` }
    scanSize.value = ''
    scanQty.value = 1
  } else if (type === 'issuance') {
    result.value = { type, data, owner, name: `${data.itemName} (${data.size})`, sub: `Issued to ${owner?.name || 'Unknown'} · ${data.issuedDate} · ${data.status}` }
  }
}

function processManual() {
  if (!manualCode.value.trim()) return
  processBarcode(manualCode.value.trim())
}

async function toggleCamera() {
  if (cameraActive.value) { stopCamera(); return }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    await nextTick()
    videoEl.value.srcObject = stream
    cameraActive.value = true
    statusText.value = 'Scanning…'
    statusClass.value = 'scanning'

    if ('BarcodeDetector' in window) {
      const detector = new BarcodeDetector({ formats: ['code_128','code_39','ean_13','qr_code'] })
      scanInterval = setInterval(async () => {
        if (!stream) { clearInterval(scanInterval); return }
        try {
          const codes = await detector.detect(videoEl.value)
          if (codes.length) {
            stopCamera()
            processBarcode(codes[0].rawValue)
          }
        } catch {}
      }, 400)
    } else {
      statusText.value = 'Camera active — BarcodeDetector not supported in this browser, use manual entry.'
      statusClass.value = ''
    }
  } catch {
    statusText.value = 'Camera access denied. Use manual entry below.'
    statusClass.value = ''
  }
}

function stopCamera() {
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  clearInterval(scanInterval)
  cameraActive.value = false
}

function confirmIssue() {
  if (!scanSize.value) { showToast('Please select a size', true); return }
  const barcode = store.issueItem(props.empId, result.value.data.id, scanSize.value, scanQty.value)
  if (!barcode) { showToast('Insufficient stock', true); return }
  showToast(`${result.value.data.name} issued to ${empName.value}`)
  emit('issued', barcode)
  close()
}

function close() {
  stopCamera()
  result.value = null
  manualCode.value = ''
  statusText.value = ''
  statusClass.value = ''
  scanSize.value = ''
  scanQty.value = 1
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (v) => {
  if (v) {
    result.value = null
    manualCode.value = ''
    nextTick(() => manualInput.value?.focus())
  } else {
    stopCamera()
  }
})
</script>
