import { computed, Ref } from '@vue/composition-api';

export default function useObjectContainRate(
  outerWidth: Ref<number>,
  outerHeight: Ref<number>,
  innerWidth: Ref<number>,
  innerHeight: Ref<number>
): Ref<number> {
  return computed(() => {
    // outer size
    const ow = outerWidth.value;
    const oh = outerHeight.value;
    // inner size
    let iw = innerWidth.value;
    let ih = innerHeight.value;

    // apply object contain
    ih = (ow / iw) * ih;
    iw = ow;
    if (ih > oh) {
      iw = (oh / ih) * iw;
      ih = oh;
    }
    return (iw * ih) / (ow * oh);
  });
}
