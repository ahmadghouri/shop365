import { Platform, Pressable, View } from 'react-native';

function NativeOnlyAnimatedView(
  props: (React.ComponentProps<typeof View> & { as?: "View" })
    | (React.ComponentProps<typeof Pressable> & { as: "Pressable" })
) {
  if (props.as === "Pressable") {
    const { as, ...rest } = props as React.ComponentProps<typeof Pressable> & { as: "Pressable" };
    return <Pressable {...rest} />;
  }
  const { as, ...rest } = props as React.ComponentProps<typeof View> & { as?: "View" };
  return <View {...rest} />;
}

export { NativeOnlyAnimatedView };
