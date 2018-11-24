import { VideoResponse, VideoRole } from '@/interface';

function getMtime(videoData: VideoResponse, role: VideoRole): number | null {
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
  videoData: VideoResponse,
  role: VideoRole,
  isForce = false
): string | null {
  const mtime = getMtime(videoData, role);
  if (!mtime) {
    return null;
  }
  const suffix =
    {
      thumb: '.jpg',
      poster: '.jpg',
      preview: '.mp4',
    }[role] || '';
  let ret = `/video/${role}/${videoData.uuid}${suffix}?timestamp=${mtime}`;
  if (isForce) {
    ret += `?forceUpdateAt=${new Date().getTime()}`;
  }
  return ret;
}

export function getPath(
  videoData: VideoResponse,
  role: VideoRole,
  isForce = false
): string | null {
  return getPathWithMtime(videoData, role, isForce);
}

export function isElementAppread(element: HTMLElement, expand = 10): boolean {
  if (!element || element.hidden) {
    return false;
  }
  const top = window.scrollY - expand;
  const bottom = top + window.innerHeight + expand * 2;
  const ypos = element.offsetTop;
  const boxHeight = element.clientHeight;
  const ret = top <= ypos + boxHeight && ypos <= bottom;
  return ret;
}
