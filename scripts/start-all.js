// Inicia los tres procesos (catálogo, inventario y gateway) con un solo comando.
import { spawn } from 'node:child_process';

const processes = [
  { name: 'products', file: 'src/services/products/server.js' },
  { name: 'inventory', file: 'src/services/inventory/server.js' },
  { name: 'gateway', file: 'src/gateway/server.js' },
];

const children = processes.map(({ name, file }) => {
  const child = spawn(process.execPath, [file], { stdio: ['ignore', 'inherit', 'inherit'] });
  child.on('exit', (code) => {
    console.log(`[launcher] ${name} terminó con código ${code}`);
  });
  return child;
});

function stopAll() {
  children.forEach((child) => child.kill());
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
