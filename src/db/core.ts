import Vue from 'vue';

export abstract class State<T> {
  observer: {
    state: T;
  };

  constructor(initialState: T) {
    this.observer = Vue.observable({ state: this.load() || initialState });
  }

  get(): T {
    return this.observer.state;
  }

  set(state: T): void {
    this.observer.state = state;
    this.save(state);
  }

  abstract load(): T | undefined;
  abstract save(state: T): void;
}
