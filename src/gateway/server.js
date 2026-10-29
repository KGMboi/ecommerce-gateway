import { createGatewayApp } from './app.js';
import { config } from '../shared/config.js';

createGatewayApp().listen(config.gatewayPort, () => {
  console.log(`[gateway] Composite API en http://localhost:${config.gatewayPort}`);
  console.log(`[gateway] Resumen de producto: GET /api/v1/product-summary/P-101`);
});
