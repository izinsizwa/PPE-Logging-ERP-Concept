<template>
  <AppLayout title="Employees" :subtitle="`${filtered.length} records found`" @scan="mode => { scanMode = mode; showScanner = true }">
    <div class="filters">
      <input type="text" class="grow" v-model="search" placeholder="Search name, ID, depot…" />
      <select v-model="divFilter">
        <option value="">All Divisions</option>
        <option v-for="[div] in divEntries" :key="div">{{ div }}</option>
      </select>
      <button class="btn btn-scan btn-sm" @click="scanMode='employee'; showScanner=true">
        <i class="fa-solid fa-barcode"></i> Scan ID
      </button>
    </div>

    <div class="glass table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Division</th><th>Role</th><th>Depot</th><th>Items</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in filtered" :key="emp.id" class="clickable" @click="$router.push(`/employees/${emp.id}`)">
            <td class="mono">{{ emp.id }}</td>
            <td style="font-weight:600">{{ emp.name }}</td>
            <td><span class="tag" :class="`tag-${DIVISION_META[emp.division]?.tag}`">{{ emp.division }}</span></td>
            <td class="muted">{{ emp.role }}</td>
            <td class="muted"><i class="fa-solid fa-location-dot" style="margin-right:4px"></i>{{ emp.depot }}</td>
            <td>
              {{ store.getIssuances(emp.id).length }}
              <span v-if="hasExpired(emp.id)" style="font-size:10px;font-weight:700;color:var(--red);margin-left:6px">EXPIRED</span>
            </td>
            <td style="color:var(--muted);font-size:16px">›</td>
          </tr>
        </tbody>
      </table>
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
const search    = ref('')
const divFilter = ref('')
const showScanner = ref(false)
const scanMode    = ref('employee')

const divEntries = computed(() => Object.entries(DIVISION_META))

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return store.employees.filter(e =>
    (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.depot.toLowerCase().includes(q)) &&
    (!divFilter.value || e.division === divFilter.value)
  )
})

function hasExpired(empId) {
  return store.getIssuances(empId).some(i => i.status === 'Expired')
}
</script>
