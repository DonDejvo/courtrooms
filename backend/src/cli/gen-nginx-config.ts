import * as fs from 'fs';
import * as path from 'path';
import { config } from '../confg';

// Get project directory from command-line args
const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error('Usage: node gen-nginx-config.js <project_directory> <frontend_port>');
    process.exit(1);
}

const projectDir = path.resolve(args[0]);
const frontendPort = args[1];

const nginxConfig = `
server {
    listen ${frontendPort};
    server_name localhost;

    # Root directory and index file
    root "${path.join(projectDir, "frontend", "dist").replace(/\\/g, "/")}";
    index index.html index.htm;

    # Increase the maximum request size if needed
    client_max_body_size 10M;

    # Handle proxy to backend
    location ~ ^/(api|media|socket\.io) {
        proxy_pass http://localhost:${config.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Catch-all for React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`.trim();

const outputPath = path.resolve("courtrooms-nginx.conf");
fs.writeFileSync(outputPath, nginxConfig, "utf-8");

console.log(`nginx config generated successfully at ${outputPath}`);