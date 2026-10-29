import { createProductsApp } from './app.js';
import { config } from '../../shared/config.js';

const delayMs = Number(process.env.PRODUCTS_DELAY_MS ?? 0);

createProductsApp({ delayMs }).listen(config.productsPort, () => {
  console.log(`[products-service] escuchando en http://localhost:${config.productsPort}`);
});
