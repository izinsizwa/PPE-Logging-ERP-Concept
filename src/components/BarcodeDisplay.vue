<template>
  <svg :id="svgId" ref="svgEl" :style="{ maxWidth: '100%', cursor: clickable ? 'pointer' : 'default' }" @click="clickable && $emit('click')"></svg>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import JsBarcode from 'jsbarcode'

const props = defineProps({
  code:        { type: String, required: true },
  width:       { type: Number, default: 1.6 },
  height:      { type: Number, default: 40 },
  showValue:   { type: Boolean, default: true },
  fontSize:    { type: Number, default: 11 },
  margin:      { type: Number, default: 6 },
  background:  { type: String, default: '#ffffff' },
  lineColor:   { type: String, default: '#1a1d2e' },
  clickable:   { type: Boolean, default: false },
})

defineEmits(['click'])

const svgEl = ref(null)
const svgId = `bc-${Math.random().toString(36).slice(2)}`

function render() {
  if (!svgEl.value || !props.code) return
  try {
    JsBarcode(svgEl.value, props.code, {
      format: 'CODE128',
      width: props.width, height: props.height,
      displayValue: props.showValue,
      fontSize: props.fontSize,
      font: 'DM Mono, monospace',
      margin: props.margin,
      background: props.background,
      lineColor: props.lineColor,
    })
  } catch (e) { /* invalid code */ }
}

onMounted(render)
watch(() => props.code, render)
</script>
