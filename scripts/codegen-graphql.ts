#!/usr/bin/env ts-node-script

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
const { readFile, utimes, readdir, unlink, stat } = fs;

async function run(cmd: string, args?: string[]): Promise<void> {
  const process = spawn(cmd, args, {
    shell: true,
    stdio: 'inherit',
  });
  return new Promise((resolve, reject) => {
    process.on('close', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`exit code ${code}: ${cmd} ${args}`));
      }
    });
  });
}

async function isGeneratedFile(path: string): Promise<boolean> {
  if (!path.endsWith('.ts')) {
    return false;
  }

  const data = await readFile(path);
  return data.includes('\n// @generated\n');
}

(async (): Promise<void> => {
  const startTime = new Date();
  const dir = 'src/graphql/types';

  await run('apollo', [
    'client:codegen',
    '--passthroughCustomScalars ',
    '--customScalarsPrefix',
    '"import(\'./scalars\')."',
    '--target',
    'typescript',
    '--globalTypesFile',
    path.join(dir, 'global.ts'),
    '--outputFlat',
    dir,
  ]);

  // cleanup unused files
  for (const i of await readdir(dir)) {
    if (!i.endsWith('.ts')) {
      continue;
    }

    const p = path.join(dir, i);
    const { mtime } = await stat(p);
    if (mtime > startTime) {
      continue;
    }
    if (!(await isGeneratedFile(p))) {
      continue;
    }
    await unlink(p);
    console.log({ msg: 'remove', path: p });
  }

  await utimes(dir, new Date(), new Date());
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
