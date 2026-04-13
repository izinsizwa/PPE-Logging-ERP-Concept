<template>
  <AppLayout title="Item Catalogue" subtitle="All registered PPE and uniform items">
    <div class="cat-grid">
      <div v-for="item in store.catalogue" :key="item.id" class="glass cat-card">
        <div class="cat-header">
          <span class="tag" :class="item.category === 'PPE' ? 'tag-ppe' : 'tag-uniform'">{{ item.category }}</span>
          <span style="font-size:11px;color:var(--muted);font-family:'DM Mono',monospace">{{ item.id }}</span>
        </div>
        <div class="cat-name">{{ item.name }}</div>
        <div class="cat-detail">Lifespan: <span>{{ item.lifespanMonths }} months</span></div>
        <div class="cat-detail">Sizes: <span>{{ item.sizes.join(', ') }}</span></div>
        <div class="cat-barcode">
          <BarcodeDisplay :code="item.id" :width="1.4" :height="30" :font-size="9" :margin="4" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'
import BarcodeDisplay from '@/components/BarcodeDisplay.vue'
import { usePpeStore } from '@/stores/ppe'

const store = usePpeStore()
</script>

<style scoped>
.cat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.cat-card { padding: 20px; }
.cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.cat-name   { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.cat-detail { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.cat-detail span { color: var(--text); font-weight: 500; }
.cat-barcode { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(108,99,255,.08); text-align: center; }
</style>
