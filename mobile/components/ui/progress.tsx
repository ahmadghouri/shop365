import { cn } from '@/lib/utils';
import * as ProgressPrimitive from '@rn-primitives/progress';
import { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
      {...props}>
      <Indicator value={value} className={indicatorClassName} />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

const Indicator = Platform.select({
  web: WebIndicator,
  native: NativeIndicator,
  default: NullIndicator,
});

type IndicatorProps = {
  value: number | undefined | null;
  className?: string;
};

function WebIndicator({ value, className }: IndicatorProps) {
  if (Platform.OS !== 'web') return null;
  return (
    <View
      className={cn('bg-primary h-full w-full flex-1 transition-all', className)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` } as any}>
      <ProgressPrimitive.Indicator className={cn('h-full w-full', className)} />
    </View>
  );
}

function NativeIndicator({ value, className }: IndicatorProps) {
  const anim = useRef(new Animated.Value(value ?? 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.max(1, Math.min(100, value ?? 0)),
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  if (Platform.OS === 'web') return null;

  return (
    <ProgressPrimitive.Indicator asChild>
      <Animated.View style={{ width }} className={cn('bg-foreground h-full', className)} />
    </ProgressPrimitive.Indicator>
  );
}

function NullIndicator(_props: IndicatorProps) {
  return null;
}
