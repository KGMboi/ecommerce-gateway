# E-Commerce Gateway & Dashboard

Composite API (API Aggregator) para la pantalla de detalle de un producto. Reemplaza tres peticiones del cliente (catálogo, inventario y tipo de cambio) por una sola.

Proyecto de la asignatura Desarrollo Web Integral, Unidad 3, UTCH.

## Arquitectura


Las tres consultas se lanzan al mismo tiempo con `Promise.allSettled`.

## Requisitos

- Node.js 18 o superior (`node -v`)

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abre http://localhost:3000 para ver la interfaz. Para detenerlo, presiona Ctrl+C.

También se puede iniciar cada servicio por separado:

```bash
npm run start:products
npm run start:inventory
npm run start:gateway
```

Variables de entorno opcionales: `GATEWAY_PORT`, `PRODUCTS_PORT`, `INVENTORY_PORT`, `PRODUCTS_URL`, `INVENTORY_URL`, `CURRENCY_API_URL`, `REQUEST_TIMEOUT_MS`, `RATE_CACHE_TTL_MS`, `PRODUCTS_DELAY_MS`, `INVENTORY_DELAY_MS`.

Si `api.frankfurter.app` no responde, usa la dirección actual del servicio:

```bash
CURRENCY_API_URL="https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN" npm start
```

## Pruebas

```bash
npm test
```

Las pruebas levantan los servicios en puertos libres y simulan la API de divisas, por lo que no necesitan internet.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/v1/product-summary/{id}` | Resumen consolidado del producto (Composite API) |
| GET | `/api/v1/products/{id}/summary` | Alias de la ruta anterior |
| GET | `/microservices/products/{id}` | Microservicio 1: catálogo (puerto 3001) |
| GET | `/microservices/inventory/{productId}` | Microservicio 2: inventario (puerto 3002) |
| GET | `/health` | Estado del gateway |

Productos de ejemplo: P-101 a P-105.

## Contrato de respuesta

```json
{
  "product_id": "P-101",
  "title": "Laptop Gamer XYZ",
  "price_usd": 1200,
  "price_mxn": 20400,
  "stock_status": "IN_STOCK",
  "available_units": 15,
  "currency_conversion_source": "Frankfurter External API",
  "status": "SUCCESS"
}
```

`status` es `SUCCESS` cuando responden los tres servicios y `PARTIAL` cuando falla inventario o divisas; en ese caso se agrega la lista `warnings`. Si falla el catálogo o el producto no existe, la respuesta es un error 404 o 502 con el formato `{ "status": "ERROR", "error": { "code", "message" } }`.

## Flujo de ramas

`main` (estable), `develop` (integración) y una rama `feature/*` por funcionalidad, que se integra a `develop` con un merge `--no-ff`.
