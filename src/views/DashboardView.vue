<template>
  <AppLayout title="Dashboard" subtitle="PPE & Uniform issuance overview" @scan="mode => { scanMode = mode; showScanner = true }">
    <!-- Stats -->
    <div class="grid-4">
      <div class="accent-card">
        <div class="stat-icon" style="background:rgba(255,255,255,.2)"><i class="fa-solid fa-users"></i></div>
        <div class="stat-label">Total Employees</div>
        <div class="stat-value">{{ store.employees.length }}</div>
        <div class="stat-note">Active workforce</div>
      </div>
      <div class="glass stat-card">
        <div class="stat-icon" style="background:rgba(108,99,255,.08)"><i class="fa-solid fa-box"></i></div>
        <div class="stat-label">Items Issued</div>
        <div class="stat-value">{{ store.totalIssued }}</div>
        <div class="stat-note">Across all staff</div>
      </div>
      <div class="glass stat-card">
        <div class="stat-icon" style="background:rgba(108,99,255,.08)"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="stat-label">Stock Alerts</div>
        <div class="stat-value" :style="store.stockAlerts.length > 0 ? 'color:var(--red)' : ''">{{ store.stockAlerts.length }}</div>
        <div class="stat-note">{{ outOfStock }} out of stock</div>
      </div>
      <div class="glass stat-card">
        <div class="stat-icon" style="background:rgba(108,99,255,.08)"><i class="fa-solid fa-circle-check"></i></div>
        <div class="stat-label">Compliant Staff</div>
        <div class="stat-value">{{ store.compliantCount }}/{{ store.employees.length }}</div>
        <div class="stat-note">Fully equipped</div>
      </div>
    </div>

    <!-- Alert banner -->
    <div v-if="store.stockAlerts.length" class="alert-banner">
      <div class="alert-title"><i class="fa-solid fa-triangle-exclamation"></i> Stock Alerts</div>
      <div class="chips">
        <span v-for="l in store.stockAlerts.slice(0,8)" :key="`${l.depot}-${l.item.id}-${l.size}`"
          class="chip" :class="l.status === 'Out of Stock' ? 'chip-red' : 'chip-orange'">
          {{ l.item.name }} {{ l.size }} · {{ l.depot }}: {{ l.qty === 0 ? 'OUT' : `${l.qty} left` }}
        </span>
      </div>
    </div>

    <!-- Two col -->
    <div class="grid-2">
      <div class="glass" style="padding:22px">
        <div style="font-size:14px;font-weight:600;margin-bottom:18px">Employees by Division</div>
        <div v-for="[div, meta] in divisionEntries" :key="div" class="prog-row">
          <div class="prog-header">
            <span><i class="fa-solid" :class="meta.icon" style="margin-right:6px"></i>{{ div }}</span>
            <span style="color:var(--muted);font-weight:500">{{ divCount(div) }}</span>
          </div>
          <div class="prog-track">
            <div class="prog-fill" :style="{ width: `${(divCount(div) / store.employees.length) * 100}%`, background: meta.color }"></div>
          </div>
        </div>
      </div>

      <div class="glass" style="padding:22px">
        <div style="font-size:14px;font-weight:600;margin-bottom:18px">Stock by Depot</div>
        <div v-for="depot in store.depots" :key="depot" class="depot-row">
          <span style="font-weight:500"><i class="fa-solid fa-location-dot" style="color:var(--accent);margin-right:6px"></i>{{ depot }}</span>
          <div style="display:flex;gap:10px;align-items:center">
            <span v-if="depotAlerts(depot) > 0" style="font-size:11px;color:var(--red);font-weight:600">
              {{ depotAlerts(depot) }} alert{{ depotAlerts(depot) > 1 ? 's' : '' }}
            </span>
            <span style="color:var(--muted);font-size:13px">{{ depotTotal(depot).toLocaleString() }} units</span>
          </div>
        </div>
      </div>
    </div>

    <ScannerModal v-model="showScanner" :mode="scanMode" />
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ScannerModal from '@/components/ScannerModal.vue'
import { usePpeStore } from '@/stores/ppe'
import { DIVISION_META } from '@/data'

const store = usePpeStore()
const showScanner = ref(false)
const scanMode    = ref('general')

const outOfStock     = computed(() => store.stockAlerts.filter(l => l.status === 'Out of Stock').length)
const divisionEntries = computed(() => Object.entries(DIVISION_META))

function divCount(div)    { return store.employees.filter(e => e.division === div).length }
function depotTotal(d)    { return store.allStockLines.filter(l => l.depot === d).reduce((a, l) => a + l.qty, 0) }
function depotAlerts(d)   { return store.allStockLines.filter(l => l.depot === d && l.status !== 'OK').length }
</script>

<style scoped>
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 20px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style>
