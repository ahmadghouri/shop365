import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react-native';
import { useUpdateLocationMutation } from '@/api/users/useUpdateLocationMutation';
import { useAuthStore } from '@/lib/authStore';
import { useLocation } from '@/lib/useLocation';
import { GlassCard } from '../reusable/GlassCard';
import { useNotificationStore } from '@/lib/notificationStore';

type HomeHeaderProps = {
    onNotificationPress?: () => void;
};

export function HomeHeader({ onNotificationPress }: HomeHeaderProps) {
    const user = useAuthStore((state) => state.user);
    const { location, loading, detectLocation } = useLocation();
    const updateLocation = useUpdateLocationMutation();
    const unreadCount = useNotificationStore((s) => s.unreadCount());
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const bellRef = useRef<any>(null);
    const shouldRing = unreadCount > 0;
    useEffect(() => {
        const t = setTimeout(() => {
            try {
                bellRef.current?.reset();
                if (shouldRing) bellRef.current?.play();
            } catch {}
        }, 16);
        return () => clearTimeout(t);
    }, [shouldRing]);

    const savedAddress = user?.address || user?.household_id?.address || user?.household?.address;
    const displayAddress = location?.address || savedAddress || 'Tap to detect location';
    const isLocating = loading || updateLocation.isPending;

    const handleDetectLocation = async () => {
        const detected = await detectLocation();
        const userId = user?._id || user?.id;
        if (!detected || !userId) return;

        updateLocation.mutate({ userId, location: detected });
    };

    const outerPadding = isUltraTinyScreen
        ? 'px-2.5 pb-1.5 pt-1.5'
        : isTinyScreen
          ? 'px-3 pb-2 pt-2'
          : isSmallScreen
            ? 'px-4 pb-2.5 pt-3'
            : 'px-5 pb-3 pt-4';
    const itemsGap = isUltraTinyScreen ? 'gap-1.5' : isTinyScreen ? 'gap-2' : isSmallScreen ? 'gap-3' : 'gap-4';
    const iconBtnSize = isUltraTinyScreen ? 'h-9 w-9' : isTinyScreen ? 'h-10 w-10' : isSmallScreen ? 'h-11 w-11' : 'h-12 w-12';
    const mapPinSize = isUltraTinyScreen ? 16 : isTinyScreen ? 17 : isSmallScreen ? 18 : 20;
    const greetingSize = isUltraTinyScreen
        ? 'text-[13px]'
        : isTinyScreen
          ? 'text-[14px]'
          : isSmallScreen
            ? 'text-[15px]'
            : 'text-[16px]';
    const addressSize = isUltraTinyScreen ? 'text-[10px]' : isTinyScreen ? 'text-[11px]' : isSmallScreen ? 'text-xs' : 'text-sm';
    const lottieSize = isUltraTinyScreen ? 36 : isTinyScreen ? 40 : isSmallScreen ? 44 : 50;
    const badgeTop = isUltraTinyScreen ? 5 : isTinyScreen ? 6 : isSmallScreen ? 7 : 8;
    const badgeRight = isUltraTinyScreen ? 5 : isTinyScreen ? 6 : isSmallScreen ? 7 : 8;
    const badgeHeight = isUltraTinyScreen ? 12 : isTinyScreen ? 13 : isSmallScreen ? 14 : 16;
    const badgeMinWidth = isUltraTinyScreen ? 12 : isTinyScreen ? 13 : isSmallScreen ? 14 : 16;
    const badgeRadius = isUltraTinyScreen ? 6 : isTinyScreen ? 6.5 : isSmallScreen ? 7 : 8;
    const badgeFontSize = isUltraTinyScreen ? 6.5 : isTinyScreen ? 7 : isSmallScreen ? 8 : 9;
    const badgePaddingH = isUltraTinyScreen ? 1.5 : isTinyScreen ? 2 : 3;

    return (
        <View className={`flex-row items-center justify-between ${outerPadding}`}>
            <View className={`flex-1 flex-row items-center ${itemsGap}`}>
                <GlassCard className="rounded-full">
                    <Pressable
                        className={`${iconBtnSize} items-center justify-center active:opacity-70`}
                        disabled={isLocating}
                        onPress={handleDetectLocation}
                    >
                        {isLocating ? (
                            <ActivityIndicator size="small" color="#111827" />
                        ) : (
                            <MapPin size={mapPinSize} color="#111827" />
                        )}
                    </Pressable>
                </GlassCard>

                <View className="flex-1">
                    <Text
                        className={`${greetingSize} font-normal font-lufga text-app-dark`}
                        numberOfLines={1}
                    >
                        Hey, {user?.name || 'User'}
                    </Text>
                    <View className="flex-row items-center">
                        <Text
                            className={`flex-1 ${addressSize} font-lufga font-light text-app-muted`}
                            numberOfLines={1}
                        >
                            {isLocating ? 'Detecting location...' : displayAddress}
                        </Text>
                    </View>
                </View>
            </View>

            <GlassCard className="rounded-full">
                <Pressable
                    className={`${iconBtnSize} items-center justify-center`}
                    onPress={onNotificationPress}
                >
                    <LottieView
                        ref={bellRef}
                        key={shouldRing ? 'ringing' : 'idle'}
                        source={require('@/assets/lottiefilesicons/bell.json')}
                        autoPlay={false}
                        loop={shouldRing}
                        speed={1}
                        renderMode="SOFTWARE"
                        resizeMode="contain"
                        style={{ width: lottieSize, height: lottieSize }}
                    />
                    {unreadCount > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: badgeTop,
                                right: badgeRight,
                                height: badgeHeight,
                                minWidth: badgeMinWidth,
                                borderRadius: badgeRadius,
                                backgroundColor: '#EAB308',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: badgePaddingH,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#111',
                                    fontSize: badgeFontSize,
                                    fontFamily: 'Lufga-Bold',
                                }}
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </GlassCard>
        </View>
    );
}
