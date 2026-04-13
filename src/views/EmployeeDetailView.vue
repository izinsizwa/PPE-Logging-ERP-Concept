<template>
  <AppLayout :title="emp?.name || 'Employee'" subtitle="Issued items & profile" @scan="openScanner">
    <button class="back-btn" @click="$router.push('/employees')">
      <i class="fa-solid fa-arrow-left"></i> Back to Employees
    </button>

    <div v-if="emp" class="detail-grid">
      <!-- Profile card -->
      <div class="glass profile-card">
        <div class="profile-avatar"><i class="fa-solid fa-user"></i></div>
        <div class="profile-name">{{ emp.name }}</div>
        <div class="profile-id">{{ emp.id }}</div>

        <div v-for="[label, val] in profileFields" :key="label" class="profile-field">
          <div class="pf-label">{{ label }}</div>
          <div class="pf-val">{{ val }}</div>
        </div>

        <!-- Employee barcode -->
        <div class="barcode-wrap">
          <div class="barcode-label"><i class="fa-solid fa-barcode"></i> Employee ID Barcode</div>
          <BarcodeDisplay :code="emp.id" :width="1.5" :height="38" :font-size="10" :margin="6" />
          <div class="barcode-hint">Scan to pull up this employee's record</div>
        </div>
      </div>

      <!-- Issued items -->
      <div>
        <div class="detail-header">
          <div>
            <div class="detail-title">Issued Items</div>
            <div class="detail-sub">{{ issuances.length }} items on record</div>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-scan" @click="openScanner('issue-scan')">
              <i class="fa-solid fa-barcode"></i> Scan to Issue
            </button>
            <button class="btn btn-primary" @click="showIssueModal = true">
              <i class="fa-solid fa-plus"></i> Issue Item
            </button>
          </div>
        </div>

        <div class="glass">
          <div v-if="!issuances.length" class="empty-state">
            <i class="fa-solid fa-box-open"></i>
            No items issued yet
          </div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr><th>Item</th><th>Type</th><th>Size</th><th>Qty</th><th>Issued</th><th>Expiry</th><th>Status</th><th>Barcode</th></tr>
              </thead>
              <tbody>
                <tr v-for="it in issuances" :key="it.id">
                  <td style="font-weight:600">{{ it.itemName }}</td>
                  <td><span class="tag" :class="itemCat(it.itemId) === 'PPE' ? 'tag-ppe' : 'tag-uniform'">{{ itemCat(it.itemId) }}</span></td>
                  <td class="mono">{{ it.size }}</td>
                  <td>{{ it.qty }}</td>
                  <td class="muted">{{ it.issuedDate }}</td>
                  <td class="muted">{{ it.expiryDate }}</td>
                  <td><span class="tag" :class="it.status === 'Active' ? 'tag-active' : 'tag-expired'">{{ it.status }}</span></td>
                  <td>
                    <div style="cursor:pointer" @click="viewBarcode(it)">
                      <BarcodeDisplay :code="it.barcode" :width="1" :height="26" :show-value="false" :margin="2" background="transparent" />
                      <div class="barcode-link"><i class="fa-solid fa-expand"></i> {{ it.barcode }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <IssueItemModal v-model="showIssueModal" :emp-id="empId" @issued="onIssued" />
    <ScannerModal v-model="showScanner" :mode="scanMode" :emp-id="empId" @issued="onIssued" />
    <BarcodeViewerModal v-model="showBarcodeViewer" :code="barcodeData.code" :name="barcodeData.name" :subtitle="barcodeData.sub" />
  </AppLayout>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BarcodeDisplay from '@/components/BarcodeDisplay.vue'
import BarcodeViewerModal from '@/components/BarcodeViewerModal.vue'
import IssueItemModal from '@/components/IssueItemModal.vue'
import ScannerModal from '@/components/ScannerModal.vue'
import { usePpeStore } from '@/stores/ppe'

const route     = useRoute()
const store     = usePpeStore()
const showToast = inject('showToast')

const empId = computed(() => route.params.id)
const emp   = computed(() => store.getEmployee(empId.value))
const issuances = computed(() => store.getIssuances(empId.value))

const profileFields = computed(() => [
  ['Division', emp.value?.division],
  ['Role', emp.value?.role],
  ['Depot', emp.value?.depot],
  ['Status', emp.value?.status],
])

const showIssueModal    = ref(false)
const showScanner       = ref(false)
const scanMode          = ref('issue-scan')
const showBarcodeViewer = ref(false)
const barcodeData       = ref({ code: '', name: '', sub: '' })

function itemCat(itemId) {
  return store.catalogue.find(c => c.id === itemId)?.category || ''
}

function viewBarcode(it) {
  barcodeData.value = { code: it.barcode, name: `${it.itemName} – ${emp.value?.name}`, sub: `Issued ${it.issuedDate} · Expires ${it.expiryDate}` }
  showBarcodeViewer.value = true
}

function openScanner(mode) {
  scanMode.value = mode || 'issue-scan'
  showScanner.value = true
}

function onIssued(barcode) {
  showToast(`Item issued successfully`)
  barcodeData.value = { code: barcode, name: `Issued to ${emp.value?.name}`, sub: `Print and attach to item` }
  setTimeout(() => { showBarcodeViewer.value = true }, 300)
}
</script>

<style scoped>
.detail-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
.profile-card { padding: 24px; }
.profile-avatar { width: 56px; height: 56px; border-radius: 16px; background: var(--grad2); display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(59,130,246,.3); }
.profile-name { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
.profile-id   { font-size: 12px; color: var(--accent); font-family: 'DM Mono',monospace; margin-bottom: 16px; font-weight: 600; }
.profile-field { margin-bottom: 12px; }
.pf-label { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 3px; }
.pf-val   { font-size: 13px; font-weight: 500; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.detail-title  { font-size: 15px; font-weight: 700; }
.detail-sub    { font-size: 12px; color: var(--muted); margin-top: 2px; }
</style>
