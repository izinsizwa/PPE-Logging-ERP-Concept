import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { EMPLOYEES, CATALOGUE, DEPOTS, buildInventory, SEED_ISSUANCES, SEED_MOVEMENTS } from '@/data'

export const usePpeStore = defineStore('ppe', () => {
  const employees = ref([...EMPLOYEES])
  const catalogue = ref([...CATALOGUE])
  const depots = ref([...DEPOTS])
  const inventory = ref(buildInventory())
  const issuances = ref(JSON.parse(JSON.stringify(SEED_ISSUANCES)))
  const movements = ref([...SEED_MOVEMENTS])

  // ── Computed ─────────────────────────────────────────────────────────────
  const allStockLines = computed(() => {
    const lines = []
    depots.value.forEach(d => {
      catalogue.value.forEach(item => {
        item.sizes.forEach(s => {
          const st = inventory.value[d]?.[item.id]?.[s]
          if (st) {
            const status = st.qty === 0 ? 'Out of Stock' : st.qty <= st.reorderLevel ? 'Low Stock' : 'OK'
            lines.push({ depot: d, item, size: s, qty: st.qty, reorder: st.reorderLevel, status })
          }
        })
      })
    })
    return lines
  })

  const stockAlerts = computed(() => allStockLines.value.filter(l => l.status !== 'OK'))
  const totalIssued = computed(() => Object.values(issuances.value).flat().length)
  const compliantCount = computed(() => employees.value.filter(e => (issuances.value[e.id] || []).length >= 2).length)

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getEmployee(id) {
    return employees.value.find(e => e.id === id)
  }

  function getIssuances(empId) {
    return issuances.value[empId] || []
  }

  function generateIssuanceBarcode(empId, itemId) {
    const empPart = empId.replace(/-/g, '')
    const existing = (issuances.value[empId] || []).filter(i => i.itemId === itemId).length
    return `ISS-${empPart}-${itemId}-${String(existing + 1).padStart(3, '0')}`
  }

  function stockAtDepot(depot, itemId, size) {
    return inventory.value[depot]?.[itemId]?.[size]?.qty ?? 0
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  function issueItem(empId, itemId, size, qty) {
    const item = catalogue.value.find(c => c.id === itemId)
    const emp  = employees.value.find(e => e.id === empId)
    if (!item || !emp) return null

    const depot = emp.depot
    const stock = inventory.value[depot]?.[itemId]?.[size]?.qty ?? 0
    if (stock < qty) return null

    const today   = new Date().toISOString().split('T')[0]
    const expDate = new Date()
    expDate.setMonth(expDate.getMonth() + item.lifespanMonths)

    const barcode = generateIssuanceBarcode(empId, itemId)

    inventory.value[depot][itemId][size].qty -= qty

    movements.value.unshift({
      id: Date.now(), type: 'ISSUE', depot,
      itemName: item.name, size, qty, date: today,
      ref: empId, barcode, note: `Issued to ${emp.name}`,
    })

    if (!issuances.value[empId]) issuances.value[empId] = []
    const record = {
      id: Date.now(), barcode, itemId, itemName: item.name,
      size, qty, issuedDate: today,
      expiryDate: expDate.toISOString().split('T')[0],
      status: 'Active',
    }
    issuances.value[empId].push(record)
    return barcode
  }

  function receiveStock(depot, itemId, size, qty, ref, note) {
    const item = catalogue.value.find(c => c.id === itemId)
    if (!item) return

    inventory.value[depot][itemId][size].qty += qty

    movements.value.unshift({
      id: Date.now(), type: 'GRN', depot,
      itemName: item.name, size, qty,
      date: new Date().toISOString().split('T')[0],
      ref: ref || `GRN-${Date.now()}`,
      barcode: itemId,
      note: note || 'Stock received',
    })
  }

  function resolveBarcode(code) {
    const clean = code.trim()

    // Employee ID
    const emp = employees.value.find(e =>
      e.id === clean || e.id.replace(/-/g, '') === clean.replace(/-/g, '')
    )
    if (emp) return { type: 'employee', data: emp }

    // Catalogue item
    const item = catalogue.value.find(c => c.id === clean)
    if (item) return { type: 'item', data: item }

    // Issuance barcode
    for (const [empId, records] of Object.entries(issuances.value)) {
      const record = records.find(r => r.barcode === clean)
      if (record) {
        return { type: 'issuance', data: record, owner: employees.value.find(e => e.id === empId) }
      }
    }

    return null
  }

  return {
    employees, catalogue, depots, inventory, issuances, movements,
    allStockLines, stockAlerts, totalIssued, compliantCount,
    getEmployee, getIssuances, generateIssuanceBarcode, stockAtDepot,
    issueItem, receiveStock, resolveBarcode,
  }
})
