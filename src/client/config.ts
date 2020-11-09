import { apolloClient } from '@/client/client';
import { filePathFormat } from '@/const';
import { clientConfig, clientConfigVariables, clientConfig_clientConfig as Config } from '@/graphql/types/clientConfig';

export async function get(): Promise<Config | null> {
  
  const variables: clientConfigVariables = {filePathFormat}
  const { data } = await apolloClient.query<clientConfig>({
    query: require('@/graphql/queries/clientConfig.gql'),
    variables,
  });
  return data.clientConfig;
}
