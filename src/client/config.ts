import { filePathFormat } from '@/const';
import queries from '@/graphql/queries';
import {
  clientConfig_clientConfig as Config
} from '@/graphql/types/clientConfig';

export async function get(): Promise<Config | null> {
  const { data } = await queries.clientConfig({ filePathFormat });
  return data.clientConfig;
}
