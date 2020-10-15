import splitN from '@/utils/splitN';
import * as cast from 'cast-unknown';

export abstract class OriginPrefix {
  static parse(v: string): OriginPrefix | undefined {
    switch (splitN(v, ':', 2)[0]) {
      case 'folder':
        return FolderOriginPrefix.parse(v);
      case 'cgteamwork':
        return CGTeamworkOriginPrefix.parse(v);
    }
  }

  equals(other: OriginPrefix): boolean {
    return this.toString() === other.toString();
  }

  isZero(): boolean {
    return !this.toString().split(':', 2)[1];
  }

  abstract toString(): string;
}

export class CGTeamworkOriginPrefix extends OriginPrefix {
  database: string;
  pipeline: string;
  prefix: string;

  constructor(database: string, pipeline: string, prefix: string) {
    super();
    this.database = database;
    this.pipeline = pipeline;
    this.prefix = prefix;
  }

  static parse(v: string): CGTeamworkOriginPrefix {
    const data = splitN(v, ':', 4);
    if (data[0] !== 'cgteamwork') {
      return new CGTeamworkOriginPrefix('', '', '');
    }
    return new CGTeamworkOriginPrefix(data[1], data[2], data[3]);
  }

  static cast(v: unknown): CGTeamworkOriginPrefix {
    if (v instanceof CGTeamworkOriginPrefix) {
      return v;
    }
    const o = cast.object(v);
    return new CGTeamworkOriginPrefix(
      cast.string(o.database),
      cast.string(o.pipeline),
      cast.string(o.value)
    );
  }

  isZero(): boolean {
    return !this.database;
  }

  toString(): string {
    return `cgteamwork:${this.database}:${this.pipeline}:${this.prefix}`.replace(
      /:+$/,
      ':'
    );
  }
}

export class FolderOriginPrefix extends OriginPrefix {
  root: string;

  constructor(root: string) {
    super();
    this.root = root;
  }

  static parse(v: string): FolderOriginPrefix {
    const data = v.split(':', 2);
    if (data[0] !== 'folder') {
      return new FolderOriginPrefix('');
    }
    return new FolderOriginPrefix(data[1]);
  }

  static cast(v: unknown): FolderOriginPrefix {
    if (v instanceof FolderOriginPrefix) {
      return v;
    }
    const o = cast.object(v);
    return new FolderOriginPrefix(cast.string(o.root));
  }

  isZero(): boolean {
    return !this.root;
  }

  toString(): string {
    return `folder:${this.root}`;
  }
}
