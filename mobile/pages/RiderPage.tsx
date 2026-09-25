import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { PageHeader } from '@/components/reusable/PageHeader';
import { useMyRiderApplication } from '@/api/riders/useMyRiderApplication';
import { RiderApplicationForm } from '@/components/riders/RiderApplicationForm';
import { RiderStatusCard } from '@/components/riders/RiderStatusCard';

type RiderPageProps = {
    onBack: () => void;
};

export function RiderPage({ onBack }: RiderPageProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const px = isTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';

    const {
        data: myApplication,
        isLoading,
        refetch,
        isRefetching,
    } = useMyRiderApplication();

    // While checking for an existing application, show a spinner.
    if (isLoading) {
        return (
            <AppBackground>
                <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                    <PageHeader title="Become a Rider" onBack={onBack} />
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EAB308" />
                    </View>
                </SafeAreaView>
            </AppBackground>
        );
    }

    // Already applied → show the status/dashboard instead of the form.
    if (myApplication) {
        return (
            <AppBackground>
                <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                    <PageHeader title="Rider Application" onBack={onBack} />
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor="#EAB308"
                                colors={['#EAB308']}
                            />
                        }
                    >
                        <RiderStatusCard application={myApplication} px={px} />
                    </ScrollView>
                </SafeAreaView>
            </AppBackground>
        );
    }

    // Otherwise show the application form.
    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                <PageHeader
                    title="Become a Rider"
                    subtitle="Deliver orders and earn on your own schedule"
                    onBack={onBack}
                />
                <RiderApplicationForm refreshing={isRefetching} onRefresh={refetch} />
            </SafeAreaView>
        </AppBackground>
    );
}
