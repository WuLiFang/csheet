#!/usr/bin/env ts-node-script

import { program } from 'commander';
import * as _fs from 'fs';
import { render } from 'pug';
import { promisify } from 'util';

const readFile = promisify(_fs.readFile);
const writeFile = promisify(_fs.writeFile);

async function renderTemplateInPlace(path: string): Promise<void> {
  const data = (await readFile(path)).toString();

  const match = /<template lang="pug">(.+)<\/template>/s.exec(data);
  if (!match) {
    return;
  }
  match.index;
  const pug = match[1];
  const html = render(`template\n${pug}`, { pretty: true });
  await writeFile(path, data.replace(match[0], html));
}

(async () => {
  program.usage('[file ...]');
  const { args } = program.parse();

  for (const i of args) {
    console.log(i);
    await renderTemplateInPlace(i);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
