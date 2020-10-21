interface PointerEventSupportGetCoalescedEvents extends PointerEvent {
  /** https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents */
  getCoalescedEvents(): PointerEvent[];
}

function supportGetCoalescedEvents(
  e: PointerEvent
): e is PointerEventSupportGetCoalescedEvents {
  return 'getCoalescedEvents' in e;
}

export default function getCoalescedPointerEvents(
  e: PointerEvent
): PointerEvent[] {
  if (supportGetCoalescedEvents(e)) {
    return e.getCoalescedEvents();
  }
  return [e];
}
