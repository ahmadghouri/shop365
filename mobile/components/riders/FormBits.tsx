import { Text, View } from 'react-native';

/** Small inline error text shown under a form field. */
export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <Text className="mt-1 px-2 text-xs font-lufga text-red-500">{message}</Text>;
}

/** A label/value row used in the approved rider dashboard. */
export function DetailRow({
    label,
    value,
    last,
}: {
    label: string;
    value?: string;
    last?: boolean;
}) {
    return (
        <View
            className={`flex-row items-start justify-between py-2 ${last ? '' : 'border-b border-slate-100'}`}
        >
            <Text className="text-xs font-lufga text-slate-400">{label}</Text>
            <Text
                className="ml-4 flex-1 text-right text-sm font-lufga-semibold text-slate-800"
                numberOfLines={2}
            >
                {value || '—'}
            </Text>
        </View>
    );
}
