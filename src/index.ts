import { frames, onceOnlyFrames } from './frames';

type AnimationOptions =
  | 'fadeIn'
  | 'fadeOut'
  | 'zoomIn'
  | 'zoomOut'
  | 'slideDown'
  | 'slideUp'
  | 'slideLeft'
  | 'slideRight'
  | 'flipLeft'
  | 'flipRight';

type IntersectaEvents = {
  in: CustomEvent;
  out: CustomEvent;
};

type IntersectaOptions = {
  selector: string;
  threshold?: number;
  animation?: AnimationOptions;
  duration?: number;
  delay?: number;
  easing?: string;
  once?: boolean;
  waterfall?: boolean;
  custom?: any;
};

interface IntersectaInnerOptions extends IntersectaOptions {
  fill: FillMode;
}

const setObserverOptions = ({ root = null, rootMargin = '0px', threshold = 1 } = {}) => ({
  root,
  rootMargin,
  threshold,
});
const setAllOptions = ({
  selector,
  threshold,
  animation,
  duration = 1000,
  delay = 0,
  easing = 'linear',
  once = true,
  waterfall = false,
  custom = null,
}: IntersectaOptions) =>
  ({
    selector,
    threshold,
    animation,
    duration,
    delay,
    easing,
    fill: 'forwards',
    once,
    waterfall,
    custom,
  }) as IntersectaInnerOptions;
const handleOptionsErrors = (options: IntersectaOptions) => {
  if (
    options.threshold !== undefined &&
    (typeof options.threshold !== 'number' || options.threshold <= 0 || options.threshold > 1)
  ) {
    throw new Error('Threshold should be a number between 0 exclusive and 1 inclusive');
  }
};
const setEvents = (details = null) =>
  ({
    in: new CustomEvent('intersecta:in', { detail: details }),
    out: new CustomEvent('intersecta:out', { detail: details }),
  }) as IntersectaEvents;
const handleEntry = (
  entry: IntersectionObserverEntry,
  observer: IntersectionObserver,
  entryIndex: number,
  options: IntersectaInnerOptions,
  events: IntersectaEvents,
) => {
  const animationOptions = (({ duration, fill, delay, easing }) => ({
    duration,
    fill,
    delay,
    easing,
  }))(options);

  const animation = options.custom ? options.custom : frames[options.animation || 'fadeIn'];

  if (
    entry.isIntersecting &&
    entry.intersectionRatio.toFixed(1) >= (options.threshold ? options.threshold.toFixed(1) : 1)
  ) {
    if (options.waterfall) {
      if (animationOptions.delay) {
        animationOptions.delay *= entryIndex;
      } else {
        const defaultDelay = 100
        animationOptions.delay = entryIndex * defaultDelay;
      }
    }

    entry.target.dispatchEvent(events.in);

    entry.target.animate(
      animation,
      animationOptions,
    );

    if (options.once || onceOnlyFrames.has(animation)) observer.unobserve(entry.target);
  } else {
    entry.target.dispatchEvent(events.out);

    entry.target.animate(
      animation,
      { direction: 'reverse', fill: 'forwards', duration: 1 },
    );
  }
};
const intersecta = (userOptions: IntersectaOptions) => {
  handleOptionsErrors(userOptions);

  const events = setEvents();
  const options = setAllOptions(userOptions);
  const selectItems = document.querySelectorAll(options.selector);
  const intersectionEffect: IntersectionObserverCallback = (entries, obs) => {
    entries.forEach((entry, index) => handleEntry(entry, obs, index, options, events));
  };

  const observer = new IntersectionObserver(intersectionEffect, setObserverOptions(options));
  selectItems.forEach((t) => observer.observe(t));
  return {
    stop: () => {
      observer.disconnect();
    },
  };
};

export default intersecta;
