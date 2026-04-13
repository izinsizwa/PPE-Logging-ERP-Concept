<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <Transition name="slide">
          <div v-if="modelValue" class="modal modal-sm">
            <div class="modal-title"><i class="fa-solid fa-box-open" style="color:var(--accent);margin-right:8px"></i>Issue Item</div>
            <div class="modal-sub">To: <strong>{{ emp?.name }}</strong> &nbsp;·&nbsp; {{ emp?.depot }}</div>

            <div class="form-group">
              <label>Item</label>
              <select v-model="selectedItemId" @change="onItemChange">
                <option value="">Select item…</option>
                <option v-for="item in catalogue" :key="item.id" :value="item.id">{{ item.name }} ({{ item.category }})</option>
              </select>
            </div>

            <div v-if="selectedItem" class="form-group">
              <label>Size</label>
              <select v-model="selectedSize" @change="onSizeChange">
                <option value="">Select size…</option>
                <option v-for="s in selectedItem.sizes" :key="s" :value="s">
                  {{ s }} — {{ stockFor(s) }} in stock
                </option>
              </select>
            </div>

            <div v-if="selectedSize" class="stock-indicator" :class="stockClass">
              <i :class="stockIcon"></i> {{ stockText }}
            </div>

            <div class="form-group">
              <label>Quantity</label>
              <input type="number" v-model.number="qty" min="1" :max="currentStock" />
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" @click="$emit('update:modelValue', false)">Cancel</button>
              <button class="btn btn-primary" :disabled="!selectedItemId || !selectedSize" @click="confirm">
                <i class="fa-solid fa-check"></i> Issue Item
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePpeStore } from '@/stores/ppe'

const props = defineProps({ modelValue: Boolean, empId: String })
const emit  = defineEmits(['update:modelValue', 'issued'])

const store = usePpeStore()

const selectedItemId = ref('')
const selectedSize   = ref('')
const qty            = ref(1)
const currentStock   = ref(0)

const emp      = computed(() => store.getEmployee(props.empId))
const catalogue = computed(() => store.catalogue)
const selectedItem = computed(() => catalogue.value.find(c => c.id === selectedItemId.value))

function stockFor(size) {
  return emp.value ? store.stockAtDepot(emp.value.depot, selectedItemId.value, size) : 0
}

function onItemChange() { selectedSize.value = ''; currentStock.value = 0 }
function onSizeChange()  { currentStock.value = stockFor(selectedSize.value) }

const stockClass = computed(() => {
  if (!currentStock.value) return 'stock-out'
  if (currentStock.value <= 5) return 'stock-low'
  return 'stock-ok'
})
const stockIcon = computed(() => {
  if (!currentStock.value) return 'fa-solid fa-ban'
  if (currentStock.value <= 5) return 'fa-solid fa-triangle-exclamation'
  return 'fa-solid fa-circle-check'
})
const stockText = computed(() => {
  const d = emp.value?.depot
  if (!currentStock.value) return `Out of stock at ${d}`
  if (currentStock.value <= 5) return `Low stock — ${currentStock.value} units remaining`
  return `${currentStock.value} units available at ${d}`
})

function confirm() {
  const barcode = store.issueItem(props.empId, selectedItemId.value, selectedSize.value, qty.value)
  if (!barcode) return
  emit('issued', barcode)
  emit('update:modelValue', false)
}

watch(() => props.modelValue, v => {
  if (v) { selectedItemId.value = ''; selectedSize.value = ''; qty.value = 1 }
})
</script>
