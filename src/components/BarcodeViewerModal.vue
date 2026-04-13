<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <Transition name="slide">
          <div v-if="modelValue" class="modal modal-sm">
            <div class="modal-title"><i class="fa-solid fa-barcode" style="color:var(--accent);margin-right:8px"></i>Item Barcode</div>
            <div class="modal-sub">{{ subtitle }}</div>

            <div class="bc-print-area">
              <BarcodeDisplay :code="code" :width="2.4" :height="70" :font-size="13" :margin="12" />
              <div class="bc-print-name">{{ name }}</div>
              <div class="bc-print-id">{{ code }}</div>
            </div>

            <p style="font-size:12px;color:var(--muted);margin-top:14px;text-align:center">
              <i class="fa-solid fa-print"></i> Use Ctrl+P or right-click to print this barcode label
            </p>

            <div class="modal-actions">
              <button class="btn btn-outline" @click="$emit('update:modelValue', false)">Close</button>
              <button class="btn btn-primary" @click="window.print()"><i class="fa-solid fa-print"></i> Print</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import BarcodeDisplay from './BarcodeDisplay.vue'

defineProps({
  modelValue: Boolean,
  code:       { type: String, default: '' },
  name:       { type: String, default: '' },
  subtitle:   { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>
