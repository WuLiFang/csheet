import * as localForage from 'localforage';
import { sortBy, uniqBy } from 'lodash';
const storage = localForage.createInstance({
  name: 'access-history',
  version: 2,
});

interface IPage {
  href: string;
  counts: {
    item: number;
    image: number;
    video: number;
  };
}

interface ILocalPage extends IPage {
  type: 'local';
}
interface ICGTeamWorkPage extends IPage {
  type: 'cgteamwork';
}
export type Page = ILocalPage | ICGTeamWorkPage;

export interface IPageHistory {
  atime: Date;
  page: Page;
}

export async function push(page: Page): Promise<void> {
  const i: IPageHistory = { page, atime: new Date() };
  await storage.setItem(page.href, i);
}

export async function getAll(): Promise<IPageHistory[]> {
  const keys: string[] = await storage.keys();
  return sortBy(
    await Promise.all(keys.map(k => storage.getItem<IPageHistory>(k))),
    i => i.atime
  ).reverse();
}

export async function prune(max: number = 10): Promise<void> {
  if ((await storage.length()) < max) {
    return;
  }
  const histories = await getAll();
  const pruneBefore: Date = uniqBy(histories.map(i => i.atime), i =>
    i.getTime()
  )[max - 1];
  for (const i of histories) {
    if (i.atime < pruneBefore) {
      await storage.removeItem(i.page.href);
    }
  }
}

export async function remove(href: string): Promise<void> {
  await storage.removeItem(href);
}
