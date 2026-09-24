import { Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { ACCENT, ACCENT_DARK, STAGES } from './trackingConstants';

// A row of small dots between two stepper icons. Reached segments use the brand
// accent, the rest are muted grey, matching the design.
function DottedConnector({ active }: { active: boolean }) {
    return (
        <View className="mx-1.5 flex-1 flex-row items-center justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
                <View
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: active ? ACCENT : '#4A4A4A' }}
                />
            ))}
        </View>
    );
}

type TrackingStepperProps = {
    currentStage: number;
    cancelled: boolean;
};

/** Condensed 4-stage delivery stepper shown in the tracking bottom sheet. */
export function TrackingStepper({ currentStage, cancelled }: TrackingStepperProps) {
    return (
        <View className="mt-6 border-t border-b border-white/10 py-6">
            <View className="flex-row items-center justify-between">
                {STAGES.map((stage, index) => {
                    const done = !cancelled && index < currentStage;
                    const active = !cancelled && index === currentStage;
                    const reached = done || active;
                    const StageIcon = stage.Icon;
                    const isLast = index === STAGES.length - 1;

                    return (
                        <View
                            key={stage.key}
                            className={`flex-row items-center ${isLast ? '' : 'flex-1'}`}
                        >
                            {isLast ? (
                                // Delivered node: filled circle with a check
                                <View
                                    className={`h-10 w-10 items-center justify-center rounded-full ${reached ? 'bg-[#EAB308]' : 'bg-[#3A3A3A]'}`}
                                >
                                    <Check
                                        size={18}
                                        color={reached ? ACCENT_DARK : '#8A8A8A'}
                                        strokeWidth={3}
                                    />
                                </View>
                            ) : (
                                <StageIcon
                                    size={30}
                                    color={reached ? ACCENT : '#6B7280'}
                                    strokeWidth={2}
                                />
                            )}
                            {!isLast && <DottedConnector active={done} />}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
