import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GradientPill } from './GradientPill';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'dark' | 'outline' | 'danger';

type RiderButtonProps = {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
    variant?: Variant;
    left?: ReactNode;
    className?: string;
};

/** Primary reusable button — yellow gradient by default, matching the app. */
export function RiderButton({
    label,
    onPress,
    disabled,
    variant = 'primary',
    left,
    className,
}: RiderButtonProps) {
    const inner = (
        <View className="flex-1 flex-row items-center justify-center px-4">
            {left}
            <Text
                className={cn(
                    'text-base font-bold',
                    variant === 'dark' || variant === 'danger' ? 'text-white' : 'text-slate-950'
                )}
                numberOfLines={1}
                style={left ? { marginLeft: 8 } : undefined}
            >
                {label}
            </Text>
        </View>
    );

    if (variant === 'primary') {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled}
                className={cn('active:opacity-80', disabled && 'opacity-50', className)}
            >
                <GradientPill className="h-12 rounded-full">{inner}</GradientPill>
            </Pressable>
        );
    }

    const bg =
        variant === 'dark'
            ? 'bg-[#141414]'
            : variant === 'danger'
              ? 'bg-red-500'
              : 'border border-slate-300 bg-white';

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={cn(
                'h-12 flex-row items-center justify-center rounded-full active:opacity-80',
                bg,
                disabled && 'opacity-50',
                className
            )}
        >
            {inner}
        </Pressable>
    );
}
