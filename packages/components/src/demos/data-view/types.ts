export interface GroupingControlsProps {
  availableAttributes: string[];
  currentGrouping: string | null;
  onGroupingChange: (attribute: string | null) => void;
}
