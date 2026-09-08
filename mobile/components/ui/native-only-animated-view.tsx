import { Platform, Pressable, View } from 'react-native';

/**
 * Wrapper that renders children directly (no animation).
 * Previously used react-native-reanimated for enter/exit animations;
 * now falls back to plain View/Pressable since reanimated was removed.
 */
function NativeOnlyAnimatedView(
  props: ({ as?: 'View' } & React.ComponentProps<typeof View>) |
    ({ as: 'Pressable' } & React.ComponentProps<typeof Pressable>)
) {
  const { as, entering: _e, exiting: _x, layout: _l, ...rest } = props as any;

  if (Platform.OS === 'web') {
    return <>{props.children}</>;
  }

  if (as === 'Pressable') {
    return <Pressable {...rest} />;
  }

  return <View {...rest} />;
}

export { NativeOnlyAnimatedView };
