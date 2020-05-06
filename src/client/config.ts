import { apolloClient } from '@/client/client';
import {
  clientConfig,
  clientConfig_clientConfig as Config,
} from '@/graphql/types/clientConfig';

export async function get(): Promise<Config | null> {
  const { data } = await apolloClient.query<clientConfig>({
    query: require('@/graphql/queries/clientConfig.gql'),
  });
  return data.clientConfig;
}
