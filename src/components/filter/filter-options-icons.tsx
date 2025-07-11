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
    // Assignee specific icons
    case Assignee.NO_ASSIGNEE:
      return <iconify-icon icon="ph:user-minus" className="icon" {...props} />;
    case Assignee.SARAH_CHEN:
    case Assignee.MARCUS_RODRIGUEZ:
    case Assignee.EMILY_WATSON:
    case Assignee.DAVID_KIM:
    case Assignee.ALEX_THOMPSON:
    case Assignee.ALICE_JOHNSON:
    case Assignee.BOB_SMITH:
    case Assignee.CHARLIE_BROWN:
    case Assignee.EVE_DAVIS:
      return <iconify-icon icon="ph:user-fill" className="icon" {...props} />;
    
    // Filter type icons
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
    
    // Status specific icons
    case Status.BACKLOG:
      return <iconify-icon icon="ph:circle-dashed" className="icon" {...props} />;
    case Status.TODO:
      return <iconify-icon icon="ph:circle" className="icon" {...props} />;
    case Status.IN_PROGRESS:
      return <iconify-icon icon="ph:circle-half-tilt" className="icon" {...props} />;
    case Status.IN_REVIEW:
      return <iconify-icon icon="ph:eye" className="icon" {...props} />;
    case Status.DONE:
      return <iconify-icon icon="ph:check-circle" className="icon" {...props} />;
    case Status.CANCELLED:
      return <iconify-icon icon="ph:x-circle" className="icon" {...props} />;
    
    // Priority specific icons
    case Priority.URGENT:
      return <iconify-icon icon="ph:exclamation-triangle" className="icon" {...props} />;
    case Priority.HIGH:
      return <iconify-icon icon="ph:arrow-up" className="icon" {...props} />;
    case Priority.MEDIUM:
      return <iconify-icon icon="ph:minus" className="icon" {...props} />;
    case Priority.LOW:
      return <iconify-icon icon="ph:arrow-down" className="icon" {...props} />;
    
    // Label specific icons
    case Labels.BUG:
      return <iconify-icon icon="ph:bug" className="icon" {...props} />;
    case Labels.FEATURE:
      return <iconify-icon icon="ph:sparkle" className="icon" {...props} />;
    case Labels.HOTFIX:
      return <iconify-icon icon="ph:fire" className="icon" {...props} />;
    case Labels.RELEASE:
      return <iconify-icon icon="ph:rocket" className="icon" {...props} />;
    case Labels.DOCUMENTATION:
      return <iconify-icon icon="ph:book" className="icon" {...props} />;
    case Labels.DESIGN:
      return <iconify-icon icon="ph:palette" className="icon" {...props} />;
    case Labels.TESTING:
      return <iconify-icon icon="ph:test-tube" className="icon" {...props} />;
    
    // Default case
    default:
      return <iconify-icon icon="ph:circle" className="icon" {...props} />;
  }
};