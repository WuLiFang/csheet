import useStorage from '@/composables/useStorage';
import '@/plugins/composition-api';

const storage = location.protocol === 'file:' ? sessionStorage : localStorage;

export const isCellOverlayVisible = useStorage(
  storage,
  'is-cell-overlay-visible',
  true
);

export const isPresentationAnnotationVisible = useStorage(
  storage,
  'is-presentation-annotation-visible',
  true
);

export const recentTags = useStorage(
  storage,
  'recent-collection-tags',
  [] as string[]
);

export const viewerBackground = useStorage(
  storage,
  'viewer-background',
  'checkboard'
);

export const viewerPresentationType = useStorage(
  storage,
  'viewer-presentation-type',
  'video'
);

export const viewerAnnotationPainter = useStorage(
  storage,
  'viewer-annotation-painter',
  'select'
);

export const viewerAnnotationConfig = useStorage(
  storage,
  'viewer-annotation-config',
  {
    strokeWidth: 8,
    color: '#ff0000',
    cornerRadius: 0,
    firstFrame: undefined as number | undefined,
    lastFrame: undefined as number | undefined,
    frameRangeMode: 'NULL',
    fontSize: 24,
    backgroundColor: '#000000',
  }
);

// Migrations

async function idbResult<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
}
interface IDBPreferenceV2 {
  presentationType: string;
  cellOverlayVisible: boolean;
  viewerBackground: string;
  viewerAnnotationPainter: string;
  viewerAnnotationConfig: {
    strokeWidth: number;
    color: string;
    cornerRadius: number;
    firstFrame: number | undefined;
    lastFrame: number | undefined;
    frameRangeMode: string;
    fontSize: number;
    backgroundColor: string;
  };
}

function isIDBPreferenceV2(v: unknown): v is IDBPreferenceV2 {
  if (typeof v !== 'object') {
    return false;
  }
  if (v == null) {
    return false;
  }

  return (
    'presentationType' in v &&
    'cellOverlayVisible' in v &&
    'viewerBackground' in v &&
    'viewerAnnotationPainter' in v &&
    'viewerAnnotationConfig' in v
  );
}

declare global {
  const webkitIndexedDB: IDBFactory | undefined;
  const mozIndexedDB: IDBFactory | undefined;
  const OIndexedDB: IDBFactory | undefined;
  const msIndexedDB: IDBFactory | undefined;
}

async function migrateFromIndexedDB() {
  const idb =
    indexedDB || webkitIndexedDB || mozIndexedDB || OIndexedDB || msIndexedDB;
  if (!idb) {
    return;
  }
  const dbName = 'preference';
  const storeName = 'keyvaluepairs';

  const db = await idbResult(indexedDB.open(dbName, 2));
  if (db.objectStoreNames.length === 0) {
    db.close();
    await idbResult(indexedDB.deleteDatabase(dbName));
    return;
  }
  if (!db.objectStoreNames.contains(storeName)) {
    return;
  }

  const txn = db.transaction(storeName);
  const store = txn.objectStore(storeName);

  const oldData = await idbResult(store.get('root'));
  if (!isIDBPreferenceV2(oldData)) {
    return;
  }
  isCellOverlayVisible.value = oldData.cellOverlayVisible;
  viewerPresentationType.value = oldData.presentationType;
  viewerAnnotationConfig.value = oldData.viewerAnnotationConfig;
  viewerAnnotationPainter.value = oldData.viewerAnnotationPainter;
  viewerBackground.value = oldData.viewerBackground;

  db.close();
  await idbResult(indexedDB.deleteDatabase(dbName));
}

migrateFromIndexedDB();
