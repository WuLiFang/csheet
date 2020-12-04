#!/usr/bin/env ts-node-script

import { spawnSync } from 'child_process';
import { utimesSync } from 'fs';

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
    'src/graphql/types/global.ts ',
    '--outputFlat',
    'src/graphql/types',
  ],
  {
    shell: true,
    stdio: 'inherit',
  }
);
utimesSync('src/graphql/types', new Date(), new Date());
