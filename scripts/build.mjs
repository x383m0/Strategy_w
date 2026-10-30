import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {standalone} from './standalone.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const html=await standalone(root);
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});
await writeFile(new URL('../index.html',import.meta.url),html);
await writeFile(new URL('../dist/index.html',import.meta.url),html);
console.log('index.html et dist/index.html autonomes prêts pour GitHub Pages.');
