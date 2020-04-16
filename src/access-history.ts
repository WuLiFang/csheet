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
interface ICGTeamworkPage extends IPage {
  type: 'cgteamwork';
}
export type Page = ILocalPage | ICGTeamworkPage;

export interface IPageHistory {
  id: string;
  atime: Date;
  page: Page;
}

function getId(href: string): string {
  const u = new URL(href);
  return u.pathname + u.search;
}

export async function push(page: Page): Promise<void> {
  const i: IPageHistory = { id: getId(page.href), page, atime: new Date() };

  await storage.setItem(i.id, i);
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
  const pruneBefore: Date = uniqBy(
    histories.map(i => i.atime),
    i => i.getTime()
  )[max - 1];
  for (const i of histories) {
    if (i.atime < pruneBefore) {
      await storage.removeItem(i.page.href);
    }
  }
}

export async function remove(v: IPageHistory): Promise<void> {
  if (!v.id) {
    // Old key is using page href, should remove this after 2019-10-01
    await storage.removeItem(v.page.href);
    return;
  }
  await storage.removeItem(v.id);
}
