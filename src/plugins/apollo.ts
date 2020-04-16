import { apolloClient } from '@/client';
import VueApollo from 'vue-apollo';
import Vue from 'vue';

Vue.use(VueApollo);

export const apolloProvider: VueApollo = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loadingCount',
  },
});
