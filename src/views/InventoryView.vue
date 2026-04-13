<template>
  <AppLayout title="Inventory" :subtitle="`${totalUnits.toLocaleString()} units across ${store.depots.length} depots`" @scan="openScanner">
    <div class="page-actions">
      <div></div>
      <div class="page-actions-btns">
        <button class="btn btn-scan" @click="openScanner('grn-scan')"><i class="fa-solid fa-barcode"></i> Scan to Receive</button>
        <button class="btn btn-green" @click="showGrn = true"><i class="fa-solid fa-plus"></i> Receive Stock (GRN)</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="inv-stats">
      <div class="glass stat-card">
        <div class="stat-icon" style="background:rgba(108,99,255,.08)"><i class="fa-solid fa-boxes-stacked"></i></div>
        <div class="stat-label">Units On Hand</div>
        <div class="stat-value" style="font-size:26px">{{ totalUnits.toLocaleString() }}</div>
      </div>
      <div class="glass stat-card">
        <div class="stat-icon" style="background:rgba(108,99,255,.08)"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="stat-label">Low Stock Lines</div>
        <div class="stat-value" style="font-size:26px" :style="lowCount > 0 ? 'color:var(--orange)' : ''">{{ lowCount }}</div>
      </div>
      <div class="glass stat-card">
        <div class="stat-icon" style="background:rgba(108,99,255,.08)"><i class="fa-solid fa-ban"></i></div>
        <div class="stat-label">Out of Stock Lines</div>
        <div class="stat-value" style="font-size:26px" :style="outCount > 0 ? 'color:var(--red)' : ''">{{ outCount }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn" :class="{ active: tab === 'stock' }" @click="tab = 'stock'">Stock Levels</button>
      <button class="tab-btn" :class="{ active: tab === 'movements' }" @click="tab = 'movements'">Movements</button>
    </div>

    <!-- Stock tab -->
    <div v-if="tab === 'stock'">
      <div class="filters">
        <select v-model="depotFilter">
          <option value="">All Depots</option>
          <option v-for="d in store.depots" :key="d">{{ d }}</option>
        </select>
        <select v-model="statusFilter">
          <option value="">All Status</option>
          <option>OK</option><option>Low Stock</option><option>Out of Stock</option>
        </select>
        <span class="filter-count">{{ filteredStock.length }} lines</span>
      </div>
      <div class="glass table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Type</th><th>Size</th><th>Depot</th><th>On Hand</th><th>Reorder</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="l in filteredStock" :key="`${l.depot}-${l.item.id}-${l.size}`">
              <td style="font-weight:600">{{ l.item.name }}</td>
              <td><span class="tag" :class="l.item.category === 'PPE' ? 'tag-ppe' : 'tag-uniform'">{{ l.item.category }}</span></td>
              <td class="mono">{{ l.size }}</td>
              <td class="muted"><i class="fa-solid fa-location-dot" style="margin-right:4px"></i>{{ l.depot }}</td>
              <td><span :class="l.qty === 0 ? 'qty-out' : l.qty <= l.reorder ? 'qty-low' : 'qty-ok'">{{ l.qty }}</span></td>
              <td class="muted">{{ l.reorder }}</td>
              <td><span class="tag" :class="l.status === 'OK' ? 'tag-ok' : l.status === 'Low Stock' ? 'tag-low' : 'tag-out'">{{ l.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Movements tab -->
    <div v-if="tab === 'movements'">
      <div class="glass table-wrap">
        <table>
          <thead><tr><th>Type</th><th>Item</th><th>Size</th><th>Qty</th><th>Depot</th><th>Date</th><th>Barcode Ref</th><th>Note</th></tr></thead>
          <tbody>
            <tr v-for="m in store.movements" :key="m.id">
              <td><span class="tag" :class="m.type === 'GRN' ? 'tag-grn' : 'tag-issue'">{{ m.type }}</span></td>
              <td style="font-weight:500">{{ m.itemName }}</td>
              <td class="mono">{{ m.size }}</td>
              <td><span :class="m.type === 'GRN' ? 'move-pos' : 'move-neg'">{{ m.type === 'GRN' ? '+' : '-' }}{{ m.qty }}</span></td>
              <td class="muted">{{ m.depot }}</td>
              <td class="muted">{{ m.date }}</td>
              <td>
                <span class="barcode-link" @click="viewBc(m.barcode, m.itemName, m.type + ' – ' + m.depot)">
                  <i class="fa-solid fa-barcode"></i> {{ m.barcode }}
                </span>
              </td>
              <td class="muted">{{ m.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <GrnModal v-model="showGrn" :prefill-item-id="prefillItemId" @received="showToast('Stock received successfully')" />
    <ScannerModal v-model="showScanner" :mode="scanMode" @open-grn="id => { prefillItemId = id; showGrn = true }" />
    <BarcodeViewerModal v-model="showBcViewer" :code="bcData.code" :name="bcData.name" :subtitle="bcData.sub" />
  </AppLayout>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import GrnModal from '@/components/GrnModal.vue'
import ScannerModal from '@/components/ScannerModal.vue'
import BarcodeViewerModal from '@/components/BarcodeViewerModal.vue'
import { usePpeStore } from '@/stores/ppe'

const store     = usePpeStore()
const showToast = inject('showToast')

const tab          = ref('stock')
const depotFilter  = ref('')
const statusFilter = ref('')
const showGrn      = ref(false)
const showScanner  = ref(false)
const scanMode     = ref('grn-scan')
const prefillItemId = ref('')
const showBcViewer = ref(false)
const bcData       = ref({ code: '', name: '', sub: '' })

const totalUnits = computed(() => store.allStockLines.reduce((a, l) => a + l.qty, 0))
const lowCount   = computed(() => store.allStockLines.filter(l => l.status === 'Low Stock').length)
const outCount   = computed(() => store.allStockLines.filter(l => l.status === 'Out of Stock').length)

const filteredStock = computed(() =>
  store.allStockLines.filter(l =>
    (!depotFilter.value  || l.depot   === depotFilter.value) &&
    (!statusFilter.value || l.status  === statusFilter.value)
  )
)

function openScanner(mode) { scanMode.value = mode || 'grn-scan'; showScanner.value = true }

function viewBc(code, name, sub) {
  bcData.value = { code, name, sub }
  showBcViewer.value = true
}
</script>

<style scoped>
.inv-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 20px; }
</style>
