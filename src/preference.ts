import * as localForage from 'localforage';
import Vue from 'vue';

const preference = Vue.observable({
  presentationType: 'video',
  cgteamworkStage: 'leader',
  cellOverlayVisible: true,
  viewerBackground: 'checkboard',
});

export type Preference = typeof preference;

const storage = localForage.createInstance({
  name: 'preference',
  version: 1,
});

export async function save(): Promise<void> {
  await storage.setItem('root', preference);
}

export async function load(): Promise<void> {
  Object.assign(preference, await storage.getItem('root'));
}

export function get<K extends keyof Preference>(k: K): Preference[K] {
  return preference[k];
}

export function set<K extends keyof Preference>(k: K, v: Preference[K]): void {
  preference[k] = v;
  save();
}
