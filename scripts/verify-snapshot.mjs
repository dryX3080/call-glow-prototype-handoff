import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'SOURCE-MANIFEST.json'), 'utf8'));
const failures = [];
for (const file of manifest.files) {
  try {
    const bytes = await readFile(path.join(root, file.path));
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (hash !== file.sha256 || bytes.length !== file.bytes) failures.push(`Изменён: ${file.path}`);
  } catch { failures.push(`Отсутствует: ${file.path}`); }
}
async function walk(relative) {
  const paths = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const name = `${relative}/${entry.name}`;
    if (entry.isDirectory()) paths.push(...await walk(name));
    else paths.push(name);
  }
  return paths;
}
const frozen = new Set(manifest.files.map(file => file.path));
for (const relative of [...await walk('dist'), ...await walk('tests')]) {
  if (!frozen.has(relative)) failures.push(`Дополнительный файл в исходном снимке: ${relative}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  console.error('Снимок отличается от одобренной версии. Для новых изменений используйте отдельную ветку.');
  process.exitCode = 1;
} else console.log(`Снимок v5 совпадает: ${manifest.files.length} файлов, SHA256 проверены.`);
