import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['dist/app.js', 'dist/settings.js', 'dist/audio-model.js', 'dist/light-renderer.js', 'server.cjs'];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.error || `Не удалось проверить ${file}`);
    process.exit(result.status || 1);
  }
}
console.log(`Синтаксис проверен: ${files.length} файлов.`);
