import { FilterType, Status, Assignee, Labels, Priority } from "./filter-types";
import 'iconify-icon';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': any;
    }
  }
}

export const FilterIcon = ({
  type,
  ...props
}: {
  type: FilterType | Status | Assignee | Labels | Priority;
  [key: string]: any;
}) => {
  switch (type) {
    case Assignee.NO_ASSIGNEE:
      return <iconify-icon icon="ph:user-circle" className="icon" {...props} />;
    case Assignee.ASSIGNEE:
      return <iconify-icon icon="ph:user-circle" className="icon" {...props} />;
    case FilterType.STATUS:
      return <iconify-icon icon="ph:circle-dashed" className="icon" {...props} />;
    case FilterType.ASSIGNEE:
      return <iconify-icon icon="ph:user" className="icon" {...props} />;
    case FilterType.LABELS:
      return <iconify-icon icon="ph:tag" className="icon" {...props} />;
    case FilterType.PRIORITY:
      return <iconify-icon icon="ph:cell-signal-high" className="icon" {...props} />;
    case FilterType.DUE_DATE:
      return <iconify-icon icon="ph:calendar" className="icon" {...props} />;
    case FilterType.CREATED_DATE:
      return <iconify-icon icon="ph:calendar-plus" className="icon" {...props} />;
    case FilterType.UPDATED_DATE:
      return <iconify-icon icon="ph:calendar-check" className="icon" {...props} />;
    case Status.BACKLOG:
      return <iconify-icon icon="ph:circle-dashed" className="icon" {...props} />;
    case Status.TODO:
      return <iconify-icon icon="ph:circle" className="icon" {...props} />;
    case Status.IN_PROGRESS:
      return <iconify-icon icon="ph:circle-half" className="icon" {...props} />;
    case Status.IN_REVIEW:
      return <iconify-icon icon="ph:circle-half-tilt" className="icon" {...props} />;
    case Status.DONE:
      return <iconify-icon icon="ph:check-circle" className="icon" {...props} />;
    case Status.CANCELLED:
      return <iconify-icon icon="ph:x-circle" className="icon" {...props} />;
    case Priority.URGENT:
      return <iconify-icon icon="ph:warning-circle" className="icon" {...props} />;
    case Priority.HIGH:
      return <iconify-icon icon="ph:cell-signal-high" className="icon" {...props} />;
    case Priority.MEDIUM:
      return <iconify-icon icon="ph:cell-signal-medium" className="icon" {...props} />;
    case Priority.LOW:
      return <iconify-icon icon="ph:cell-signal-low" className="icon" {...props} />;
    case Labels.BUG:
      return <div {...props} />;
    case Labels.FEATURE:
      return <div {...props} />;
    case Labels.HOTFIX:
      return <div {...props} />;
    case Labels.RELEASE:
      return <div {...props} />;
  }
};