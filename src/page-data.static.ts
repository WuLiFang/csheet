import type { Config } from '@/graphql/queries/clientConfig';
import { cgteamworkStatuses } from '@/graphql/types/cgteamworkStatuses';
import type { collections } from '@/graphql/types/collections';
import '@/plugins/composition-api';
import { ref, watchEffect } from '@vue/composition-api';

export interface PageData {
  __typename: 'StaticPageData';
  clientConfig: Pick<Config, '__typename' | 'issueTrackerURL'>;
  collections: {
    __typename: collections['collections']['__typename'];
    nodes: collections['collections']['nodes'];
    pageInfo: Pick<
      collections['collections']['pageInfo'],
      'hasNextPage' | '__typename'
    >;
  };
  cgteamworkStatuses: cgteamworkStatuses['cgteamworkStatuses'];
  title: string;
}

export function isPageData(v: unknown): v is PageData {
  if (v == null) {
    return false;
  }
  const o = v as Record<string, unknown>;
  return (
    o.__typename === 'StaticPageData' &&
    'collections' in o &&
    'clientConfig' in o
  );
}

export function getPageDataFromElement(
  el: Element | null | undefined
): PageData {
  const d: PageData = {
    __typename: 'StaticPageData',
    clientConfig: { __typename: 'ClientConfig', issueTrackerURL: null },
    collections: {
      __typename: 'CollectionConnection',
      nodes: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
      },
    },
    title: '色板 - 数据载入出错',
  };
  if (!el?.textContent) {
    return d;
  }
  try {
    const data = JSON.parse(el.textContent);
    if (!isPageData(data)) {
      return d;
    }
    return data;
  } catch {
    return d;
  }
}

export const PAGE_DATA = ref(
  getPageDataFromElement(document.getElementById('static-page-data'))
);

watchEffect(() => {
  document.title = PAGE_DATA.value.title ?? document.title;
});

// Development only code

async function getPageDataFromAPI(): Promise<PageData> {
  const { filePathFormat } = await import('@/const');

  // not use @/client to bypass import check
  const { data, errors } = await (
    await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `\
fragment Presentation on Presentation {
  id
  type
  raw {
    path(format: $filePathFormat)
    modTime
    size
  }
  thumb {
    url
  }
  isThumbTranscodeFailed
  regular {
    url
  }
  isRegularOutdated
  isRegularTranscodeFailed
  metadata {
    k
    v
  }
}

fragment Collection on Collection {
  id
  title
  origin
  metadata {
    k
    v
  }
  presentations {
    ...Presentation
  }
  collectTime
  tags
}
      
query staticPageData(
  $first: Int
  $originPrefix: String
  $filePathFormat: String
  $presentationCountGt: Int
  $tagOr: [String!]
  $tagAnd: [String!]
) {
  clientConfig(name: "web") {
    __typename
    issueTrackerURL 
  }
  collections(
    first: $first
    originPrefix: $originPrefix
    presentationCountGt: $presentationCountGt
    tagOr: $tagOr
    tagAnd: $tagAnd
  ) {
    __typename
    nodes {
      ...Collection
    }
    pageInfo {
      __typename
      hasNextPage
    }
  }
}`,
        variables: {
          first: 100,
          filePathFormat,
        },
      }),
    })
  ).json();

  if (errors) {
    throw new Error(`fetch error: ${errors}`);
  }

  return {
    ...data,
    __typename: 'StaticPageData',
    title: '色板 - 开发模式',
  };
}

if (process.env.NODE_ENV === 'development') {
  (async () => {
    PAGE_DATA.value = await getPageDataFromAPI();
  })();
}
