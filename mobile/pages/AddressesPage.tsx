import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { PageHeader } from '@/components/reusable/PageHeader';
import { LocationAddressManager } from '@/components/LocationAddressManager';

type AddressesPageProps = {
    onBack?: () => void;
};

/** Standalone "My Addresses" page (same UI as the old profile modal). */
export function AddressesPage({ onBack }: AddressesPageProps) {
    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <PageHeader title="My Addresses" onBack={onBack} backIconColor="#1e293b" />
                <View className="flex-1 px-5">
                    <LocationAddressManager />
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}
