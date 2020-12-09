import isString from '@/utils/isString';

export interface RelayNode {
  id: string;
}

export default function isRelayNode(v: unknown): v is RelayNode {
  try {
    return isString((v as { id: unknown }).id);
  } catch {
    return false;
  }
}
