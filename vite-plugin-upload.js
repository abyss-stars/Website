import fs from 'fs';
import path from 'path';

const IMG_ROOT = path.resolve('public/img/user');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export default function uploadPlugin() {
  return {
    name: 'vite-plugin-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const chunks = [];
        req.on('data', chunk => { chunks.push(chunk); });
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks).toString('utf-8');
            const { username, type, filename, data } = JSON.parse(body);
            if (!username || !type || !filename || !data) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing fields' }));
              return;
            }
            if (!['pic', 'video'].includes(type)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'type must be pic or video' }));
              return;
            }

            const userDir = path.join(IMG_ROOT, username, type);
            ensureDir(userDir);

            const buffer = Buffer.from(data, 'base64');
            const filePath = path.join(userDir, filename);
            fs.writeFileSync(filePath, buffer);

            const relativePath = `/img/user/${username}/${type}/${filename}`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, path: relativePath }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}
