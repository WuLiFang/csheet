#!/usr/bin/env ts-node-script

import { spawnSync } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
const { readFile, utimes, readdir, unlink, stat } = fs;

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

  spawnSync(
    'apollo',
    [
      'client:codegen',
      '--passthroughCustomScalars ',
      '--customScalarsPrefix',
      "import('./scalars').",
      '--target',
      'typescript',
      '--globalTypesFile',
      path.join(dir, 'global.ts'),
      '--outputFlat',
      dir,
    ],
    {
      shell: true,
      stdio: 'inherit',
    }
  );

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
})().catch(err => {
  console.error(err);
  process.exit(1);
});
