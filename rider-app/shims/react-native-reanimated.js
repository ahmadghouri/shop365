// Ponytail: nativewind/react-native-css-interop hard-requires reanimated for
// animation/transition paths, but this project doesn't use those features.
// Shim exports those names as no-ops so Metro can resolve the module.
// Upgrade path: `npm install react-native-reanimated` + babel plugin and delete
// this file + the metro extraNodeModules alias.

const noop = () => undefined;

function shimWithFn(_anim, ...rest) {
  // If user ever declares an animation/transition className, this shim will
  // just propagate the last argument (or undefined) instead of crashing.
  if (rest.length > 0) return rest[rest.length - 1];
  return undefined;
}

const Animated = {
  createAnimatedComponent: (Component) => Component,
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  inOut: (fn) => fn || ((t) => t),
  out: (fn) => fn || ((t) => t),
  in: (fn) => fn || ((t) => t),
  bezier: () => (t) => t,
  elastic: () => (t) => t,
  bounce: () => (t) => t,
  back: () => (t) => t,
};

function useAnimatedStyle(updater) {
  return updater ? updater() : {};
}

function makeSharedValueWrapper(value) {
  const store = { value };
  store._isReanimatedSharedValue = true;
  return store;
}

module.exports = {
  default: Animated,
  Animated,
  Easing,
  makeMutable: makeSharedValueWrapper,
  useSharedValue: makeSharedValueWrapper,
  useAnimatedStyle,
  useAnimatedProps: (updater) => (updater ? updater() : {}),
  useAnimatedReaction: noop,
  useDerivedValue: (fn) => ({ _isReanimatedSharedValue: true, value: fn?.() }),
  useAnimatedGestureHandler: () => ({}),
  useAnimatedScrollHandler: () => ({}),
  withTiming: shimWithFn,
  withSpring: shimWithFn,
  withDecay: shimWithFn,
  withRepeat: shimWithFn,
  withSequence: shimWithFn,
  withDelay: shimWithFn,
  withClamp: (_, anim) => anim,
  cancelAnimation: noop,
  createAnimatedComponent: (Component) => Component,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  measure: noop,
  scrollTo: noop,
  setGestureState: noop,
  defineAnimation: (factory) => factory,
  interpolate: (value, input, output, _extrap) => {
    if (!input || !output || input.length < 2) return output?.[0] ?? value;
    if (value <= input[0]) return output[0];
    if (value >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 1; i < input.length; i++) {
      if (value <= input[i]) {
        const t = (value - input[i - 1]) / (input[i] - input[i - 1]);
        const a = output[i - 1];
        const b = output[i];
        if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
        return a;
      }
    }
    return output[output.length - 1];
  },
  interpolateColor: () => 'transparent',
  Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  KeyboardState: { UNKNOWN: 0, OPENING: 1, OPEN: 2, CLOSING: 3, CLOSED: 4 },
  KeyboardEventName: {
    KEYBOARD_S_SHOW: 'onKeyboardShow',
    KEYBOARD_S_HIDE: 'onKeyboardHide',
  },
  setUpTests: noop,
};
