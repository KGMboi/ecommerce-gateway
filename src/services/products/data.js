// Catálogo de productos en memoria (simula la base de datos del microservicio).
const products = [
  {
    product_id: 'P-101',
    name: 'Laptop Gamer XYZ',
    description: 'Laptop con procesador de 8 núcleos, 16 GB de RAM y tarjeta gráfica dedicada.',
    category: 'Computadoras',
    base_price_usd: 1200.0,
  },
  {
    product_id: 'P-102',
    name: 'Mouse Inalámbrico Pro',
    description: 'Mouse ergonómico inalámbrico con sensor de 16,000 DPI.',
    category: 'Accesorios',
    base_price_usd: 25.5,
  },
  {
    product_id: 'P-103',
    name: 'Monitor 27" 4K',
    description: 'Monitor IPS de 27 pulgadas con resolución 4K y 60 Hz.',
    category: 'Monitores',
    base_price_usd: 399.99,
  },
  {
    product_id: 'P-104',
    name: 'Teclado Mecánico RGB',
    description: 'Teclado mecánico con interruptores rojos e iluminación RGB.',
    category: 'Accesorios',
    base_price_usd: 89.9,
  },
  {
    product_id: 'P-105',
    name: 'Audífonos Studio',
    description: 'Audífonos de diadema con cancelación activa de ruido.',
    category: 'Audio',
    base_price_usd: 149.0,
  },
];

export function findProductById(id) {
  return products.find((product) => product.product_id === id) ?? null;
}
