import { createInventoryApp } from './app.js';
import { config } from '../../shared/config.js';

const delayMs = Number(process.env.INVENTORY_DELAY_MS ?? 0);

createInventoryApp({ delayMs }).listen(config.inventoryPort, () => {
  console.log(`[inventory-service] escuchando en http://localhost:${config.inventoryPort}`);
});
