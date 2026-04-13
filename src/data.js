export const ADMINS = [
  { username: 'admin', password: 'transnet2025', name: 'System Administrator', role: 'Super Admin', initial: 'SA' },
  { username: 'depot.jhb', password: 'depot123', name: 'Kagiso Letsapa', role: 'Depot Manager – JHB', initial: 'KL' },
]

export const EMPLOYEES = [
  { id: 'TN-001', name: 'Sipho Dlamini',        division: 'Freight Rail',   role: 'Locomotive Driver',  depot: 'Johannesburg', status: 'Active' },
  { id: 'TN-002', name: 'Thandi Nkosi',          division: 'Port Terminals', role: 'Crane Operator',     depot: 'Durban',       status: 'Active' },
  { id: 'TN-003', name: 'Pieter van der Merwe',  division: 'Engineering',    role: 'Technician',         depot: 'Cape Town',    status: 'Active' },
  { id: 'TN-004', name: 'Nomvula Sithole',        division: 'Pipelines',      role: 'Field Inspector',    depot: 'Secunda',      status: 'Active' },
  { id: 'TN-005', name: 'Kagiso Mokoena',         division: 'Freight Rail',   role: 'Track Maintenance',  depot: 'Pretoria',     status: 'Active' },
]

export const CATALOGUE = [
  { id: 'C001', name: 'Hard Hat',       category: 'PPE',     sizes: ['One Size'],                         lifespanMonths: 36 },
  { id: 'C002', name: 'High-Vis Vest',  category: 'PPE',     sizes: ['S','M','L','XL','XXL'],             lifespanMonths: 12 },
  { id: 'C003', name: 'Safety Boots',   category: 'PPE',     sizes: ['5','6','7','8','9','10','11','12'], lifespanMonths: 12 },
  { id: 'C004', name: 'Safety Gloves',  category: 'PPE',     sizes: ['S','M','L','XL'],                   lifespanMonths: 6  },
  { id: 'C005', name: 'Safety Glasses', category: 'PPE',     sizes: ['One Size'],                         lifespanMonths: 24 },
  { id: 'C006', name: 'Overalls',       category: 'Uniform', sizes: ['S','M','L','XL','XXL'],             lifespanMonths: 12 },
  { id: 'C007', name: 'Work Shirt',     category: 'Uniform', sizes: ['S','M','L','XL','XXL'],             lifespanMonths: 12 },
  { id: 'C008', name: 'Safety Harness', category: 'PPE',     sizes: ['S','M','L','XL'],                   lifespanMonths: 24 },
]

export const DEPOTS = ['Johannesburg', 'Durban', 'Cape Town', 'Secunda', 'Pretoria']

export const DIVISION_META = {
  'Freight Rail':   { color: '#f59e0b', tag: 'freight', icon: 'fa-train' },
  'Port Terminals': { color: '#3b82f6', tag: 'port',    icon: 'fa-anchor' },
  'Engineering':    { color: '#22c55e', tag: 'eng',     icon: 'fa-gear' },
  'Pipelines':      { color: '#a78bfa', tag: 'pipe',    icon: 'fa-pipe-valve' },
}

export function buildInventory() {
  const inv = {}
  DEPOTS.forEach(d => {
    inv[d] = {}
    CATALOGUE.forEach(item => {
      inv[d][item.id] = {}
      item.sizes.forEach(s => {
        inv[d][item.id][s] = { qty: Math.floor(Math.random() * 28) + 6, reorderLevel: 5 }
      })
    })
  })
  // Seed some problem lines for demo
  inv['Johannesburg']['C003']['9'] = { qty: 2, reorderLevel: 5 }
  inv['Durban']['C002']['L']       = { qty: 0, reorderLevel: 5 }
  inv['Cape Town']['C006']['XL']   = { qty: 1, reorderLevel: 5 }
  return inv
}

export const SEED_ISSUANCES = {
  'TN-001': [
    { id: 1, barcode: 'ISS-TN001-C001-001', itemId: 'C001', itemName: 'Hard Hat',      size: 'One Size', qty: 1, issuedDate: '2024-03-15', expiryDate: '2027-03-15', status: 'Active' },
    { id: 2, barcode: 'ISS-TN001-C002-001', itemId: 'C002', itemName: 'High-Vis Vest', size: 'L',        qty: 2, issuedDate: '2024-03-15', expiryDate: '2025-03-15', status: 'Active' },
    { id: 3, barcode: 'ISS-TN001-C003-001', itemId: 'C003', itemName: 'Safety Boots',  size: '9',        qty: 1, issuedDate: '2024-03-15', expiryDate: '2025-03-15', status: 'Active' },
  ],
  'TN-002': [
    { id: 4, barcode: 'ISS-TN002-C001-001', itemId: 'C001', itemName: 'Hard Hat',       size: 'One Size', qty: 1, issuedDate: '2023-11-01', expiryDate: '2026-11-01', status: 'Active' },
    { id: 5, barcode: 'ISS-TN002-C008-001', itemId: 'C008', itemName: 'Safety Harness', size: 'M',        qty: 1, issuedDate: '2023-11-01', expiryDate: '2025-11-01', status: 'Active' },
  ],
  'TN-003': [],
  'TN-004': [
    { id: 6, barcode: 'ISS-TN004-C006-001', itemId: 'C006', itemName: 'Overalls', size: 'XL', qty: 2, issuedDate: '2024-01-10', expiryDate: '2025-01-10', status: 'Active' },
  ],
  'TN-005': [
    { id: 7, barcode: 'ISS-TN005-C002-001', itemId: 'C002', itemName: 'High-Vis Vest', size: 'M', qty: 1, issuedDate: '2023-06-01', expiryDate: '2024-06-01', status: 'Expired' },
  ],
}

export const SEED_MOVEMENTS = [
  { id: 1, type: 'GRN',   depot: 'Johannesburg', itemName: 'Hard Hat',      size: 'One Size', qty: 50, date: '2024-02-10', ref: 'GRN-2024-001', barcode: 'C001', note: 'Quarterly restock' },
  { id: 2, type: 'ISSUE', depot: 'Johannesburg', itemName: 'Safety Boots',  size: '9',        qty: 1,  date: '2024-03-15', ref: 'TN-001',        barcode: 'ISS-TN001-C003-001', note: 'Issued to Sipho Dlamini' },
  { id: 3, type: 'GRN',   depot: 'Durban',       itemName: 'High-Vis Vest', size: 'L',        qty: 20, date: '2024-01-05', ref: 'GRN-2024-002', barcode: 'C002', note: 'Annual stock' },
]
