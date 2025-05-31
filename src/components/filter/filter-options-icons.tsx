import { FilterType, Status, Assignee, Labels, Priority } from "./filter-types";
import { Icon } from '@iconify/react'

export const FilterIcon = ({
  type,
}: {
  type: FilterType | Status | Assignee | Labels | Priority;
}) => {
  switch (type) {
    case Assignee.NO_ASSIGNEE:
      return <Icon icon="ph:user-circle" className="icon" />;
    case Assignee.ASSIGNEE:
      return <Icon icon="ph:user-circle" className="icon" />;
    case FilterType.STATUS:
      return <Icon icon="ph:circle-dashed" className="icon" />;
    case FilterType.ASSIGNEE:
      return <Icon icon="ph:user-circle" className="icon" />;
    case FilterType.LABELS:
      return <Icon icon="ph:tag" className="icon" />;
    case FilterType.PRIORITY:
      return <Icon icon="ph:signal-high" className="icon" />;
    case FilterType.DUE_DATE:
      return <Icon icon="ph:calendar" className="icon" />;
    case FilterType.CREATED_DATE:
      return <Icon icon="ph:calendar-plus" className="icon" />;
    case FilterType.UPDATED_DATE:
      return <Icon icon="ph:calendar-check" className="icon" />;
    case Status.BACKLOG:
      return <Icon icon="ph:circle-dashed" className="icon" />;
    case Status.TODO:
      return <Icon icon="ph:circle" className="icon" />;
    case Status.IN_PROGRESS:
      return <Icon icon="ph:circle-half" className="icon" />;
    case Status.IN_REVIEW:
      return <Icon icon="ph:circle-half-tilt" className="icon" />;
    case Status.DONE:
      return <Icon icon="ph:check-circle" className="icon" />;
    case Status.CANCELLED:
      return <Icon icon="ph:x-circle" className="icon" />;
    case Priority.URGENT:
      return <Icon icon="ph:warning-circle" className="icon" />;
    case Priority.HIGH:
      return <Icon icon="ph:signal-high" className="icon" />;
    case Priority.MEDIUM:
      return <Icon icon="ph:signal-medium" className="icon" />;
    case Priority.LOW:
      return <Icon icon="ph:signal-low" className="icon" />;
    case Labels.BUG:
      return <div className="bg-red-400 rounded-full size-2.5" />;
    case Labels.FEATURE:
      return <div className="bg-blue-400 rounded-full size-2.5" />;
    case Labels.HOTFIX:
      return <div className="bg-amber-400 rounded-full size-2.5" />;
    case Labels.RELEASE:
      return <div className="bg-green-400 rounded-full size-2.5" />;
  }
};