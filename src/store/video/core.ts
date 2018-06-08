import { VideoResponse, VideoRole } from '@/interface';
import { isFileProtocol } from '@/packtools';

function getPackedPath(
  videoData: VideoResponse,
  role: VideoRole,
): string | null {
  if (!getMtime(videoData, role)) {
    return null;
  }
  let ret: string | null = null;
  switch (role) {
    case VideoRole.thumb: {
      ret = _getPackedPath(videoData, 'thumbs', '.jpg');
      break;
    }
    case VideoRole.poster: {
      ret = _getPackedPath(videoData, 'images', '.jpg');
      break;
    }
    case VideoRole.preview: {
      ret = _getPackedPath(videoData, 'previews', '.mp4');
      break;
    }
  }
  return ret;
}

function _getPackedPath(
  videoData: VideoResponse,
  folder: string,
  suffix: string,
) {
  return `${folder}/${videoData.label}${suffix}`;
}
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
  isForce = false,
): string | null {
  const mtime = getMtime(videoData, role);
  if (!mtime) {
    return null;
  }
  let ret = `/videos/${videoData.uuid}.${role}?timestamp=${mtime}`;
  if (isForce) {
    ret += `?forceUpdateAt=${new Date().getTime()}`;
  }
  return ret;
}

export function getPath(
  videoData: VideoResponse,
  role: VideoRole,
  isForce = false,
): string | null {
  if (isFileProtocol) {
    return getPackedPath(videoData, role);
  }
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
