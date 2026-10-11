import React from 'react';
import { GroupedMoodFactorSelector, type GroupedMoodFactorSelectorProps } from './GroupedMoodFactorSelector';
import { MoodSelector as UIMoodSelector, type MoodSelectorProps as UIMoodSelectorProps } from '../ui/MoodSelector';

export interface MoodSelectorProps extends GroupedMoodFactorSelectorProps {}

/**
 * MoodSelector in components/mood provides the grouped 4-domain mood factor selector
 * to eliminate factor choice overload (Kuadran KURANGI), while maintaining backward-compatible
 * exports for both factor grouping and score selection.
 */
export const MoodSelector: React.FC<GroupedMoodFactorSelectorProps> = (props) => {
  return <GroupedMoodFactorSelector {...props} />;
};

export { GroupedMoodFactorSelector, UIMoodSelector };
export type { GroupedMoodFactorSelectorProps, UIMoodSelectorProps };
export default MoodSelector;
