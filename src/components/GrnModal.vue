<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <Transition name="slide">
          <div v-if="modelValue" class="modal modal-md">
            <div class="modal-title"><i class="fa-solid fa-truck-ramp-box" style="color:var(--green);margin-right:8px"></i>Receive Stock</div>
            <div class="modal-sub">Goods Received Note (GRN)</div>

            <div class="form-group">
              <label>Depot</label>
              <select v-model="form.depot">
                <option value="">Select depot…</option>
                <option v-for="d in store.depots" :key="d">{{ d }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Item</label>
              <select v-model="form.itemId" @change="onItemChange">
                <option value="">Select item…</option>
                <option v-for="item in store.catalogue" :key="item.id" :value="item.id">{{ item.name }} ({{ item.category }})</option>
              </select>
            </div>

            <div v-if="selectedItem" class="form-group">
              <label>Size</label>
              <select v-model="form.size">
                <option value="">Select size…</option>
                <option v-for="s in selectedItem.sizes" :key="s">{{ s }}</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Quantity</label>
                <input type="number" v-model.number="form.qty" min="1" />
              </div>
              <div class="form-group">
                <label>GRN Reference</label>
                <input type="text" v-model="form.ref" placeholder="e.g. GRN-2025-042" />
              </div>
            </div>

            <div class="form-group">
              <label>Note (optional)</label>
              <input type="text" v-model="form.note" placeholder="e.g. Quarterly restock" />
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" @click="$emit('update:modelValue', false)">Cancel</button>
              <button class="btn btn-green" :disabled="!form.depot || !form.itemId || !form.size" @click="confirm">
                <i class="fa-solid fa-check"></i> Confirm Receipt
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { usePpeStore } from '@/stores/ppe'

const props = defineProps({ modelValue: Boolean, prefillItemId: { type: String, default: '' } })
const emit  = defineEmits(['update:modelValue', 'received'])

const store = usePpeStore()
const form  = reactive({ depot: '', itemId: '', size: '', qty: 1, ref: '', note: '' })

const selectedItem = computed(() => store.catalogue.find(c => c.id === form.itemId))
function onItemChange() { form.size = '' }

function confirm() {
  store.receiveStock(form.depot, form.itemId, form.size, form.qty, form.ref, form.note)
  emit('received')
  emit('update:modelValue', false)
}

watch(() => props.modelValue, v => {
  if (v) {
    Object.assign(form, { depot: '', itemId: props.prefillItemId || '', size: '', qty: 1, ref: '', note: '' })
    if (form.itemId) onItemChange()
  }
})

watch(() => props.prefillItemId, id => { if (id) { form.itemId = id; onItemChange() } })
</script>
