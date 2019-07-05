import { IVideoResponse, VideoRole } from '@/interface';
import { isFileProtocol } from '@/packtools';

function getMtime(videoData: IVideoResponse, role: VideoRole): number | null {
  switch (role) {
    case VideoRole.thumb: {
      return videoData.thumb_mtime;
    }
    case VideoRole.poster: {
      return videoData.poster_mtime;
    }
    case VideoRole.preview: {
      return videoData.preview_mtime;
    }
    default:
      return null;
  }
}

function getPathWithMtime(
  videoData: IVideoResponse,
  role: VideoRole
): string | null {
  const mtime = getMtime(videoData, role);
  if (!mtime) {
    return null;
  }
  const suffix =
    {
      poster: '.jpg',
      preview: '.mp4',
      thumb: '.jpg',
    }[role] || '';

  return isFileProtocol
    ? `video/${role}/${videoData.label || videoData.uuid}${suffix}`
    : `/video/${role}/${videoData.uuid}${suffix}?timestamp=${mtime}`;
}

export function getPath(
  videoData: IVideoResponse,
  role: VideoRole,
  isForce = false
): string | null {
  const path: string | null = getRolePath(videoData, role);
  if (path && path.startsWith('cache')) {
    return `/${path}`;
  }
  let ret: string | null = getPathWithMtime(videoData, role);
  if (isForce && ret) {
    ret += `?forceUpdateAt=${new Date().getTime()}`;
  }
  return ret;
}

function getRolePath(
  videoData: IVideoResponse,
  role: VideoRole
): string | null {
  return (
    {
      poster: videoData.poster,
      preview: videoData.preview,
      thumb: videoData.thumb,
    }[role] || null
  );
}

export function isElementAppeared(element: HTMLElement, expand = 10): boolean {
  if (!element || element.hidden) {
    return false;
  }
  const top = window.scrollY - expand;
  const bottom = top + window.innerHeight + expand * 2;
  const ypos = element.offsetTop;
  const boxHeight = element.clientHeight;
  return top <= ypos + boxHeight && ypos <= bottom;
}
