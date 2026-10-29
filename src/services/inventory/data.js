// Inventario en memoria (simula la base de datos del almacén).
const inventory = [
  {
    product_id: 'P-101',
    available_units: 15,
    warehouse: 'Almacén Chihuahua Norte',
    location: 'Pasillo B, Estante 4',
    estimated_delivery_days: 2,
  },
  {
    product_id: 'P-102',
    available_units: 120,
    warehouse: 'Almacén Chihuahua Norte',
    location: 'Pasillo A, Estante 1',
    estimated_delivery_days: 2,
  },
  {
    product_id: 'P-103',
    available_units: 4,
    warehouse: 'Almacén Ciudad Juárez',
    location: 'Pasillo C, Estante 2',
    estimated_delivery_days: 4,
  },
  {
    product_id: 'P-104',
    available_units: 38,
    warehouse: 'Almacén Chihuahua Norte',
    location: 'Pasillo A, Estante 3',
    estimated_delivery_days: 2,
  },
  {
    product_id: 'P-105',
    available_units: 0,
    warehouse: 'Almacén Ciudad Juárez',
    location: 'Pasillo D, Estante 1',
    estimated_delivery_days: 7,
  },
];

export function findInventoryByProductId(productId) {
  return inventory.find((item) => item.product_id === productId) ?? null;
}
