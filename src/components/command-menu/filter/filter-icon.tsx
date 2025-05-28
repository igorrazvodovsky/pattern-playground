import { FilterType, Status, Assignee, Labels, Priority } from "./filter-types";

export const FilterIcon = ({
  type,
}: {
  type: FilterType | Status | Assignee | Labels | Priority;
}) => {
  switch (type) {
    case Assignee.ANDREW_LUO:
      return (
        <pp-avatar size="xsmall" style="color: blue">
          <iconify-icon class="icon" icon="ph:circle-fill"></iconify-icon>
        </pp-avatar>
      );
    case Assignee.NO_ASSIGNEE:
      return <iconify-icon class="icon" icon="ph:user-circle" />;
    case FilterType.STATUS:
      return <iconify-icon class="icon" icon="ph:circle-dashed" />;
    case FilterType.ASSIGNEE:
      return <iconify-icon class="icon" icon="ph:user-circle" />;
    case FilterType.LABELS:
      return <iconify-icon class="icon" icon="ph:tag" />;
    case FilterType.PRIORITY:
      return <iconify-icon class="icon" icon="ph:signal-high" />;
    case FilterType.DUE_DATE:
      return <iconify-icon class="icon" icon="ph:calendar" />;
    case FilterType.CREATED_DATE:
      return <iconify-icon class="icon" icon="ph:calendar-plus" />;
    case FilterType.UPDATED_DATE:
      return <iconify-icon class="icon" icon="ph:calendar-check" />;
    case Status.BACKLOG:
      return <iconify-icon class="icon" icon="ph:circle-dashed" />;
    case Status.TODO:
      return <iconify-icon class="icon" icon="ph:circle" />;
    case Status.IN_PROGRESS:
      return <iconify-icon class="icon" icon="ph:circle-half" />;
    case Status.IN_REVIEW:
      return <iconify-icon class="icon" icon="ph:circle-half-tilt" />;
    case Status.DONE:
      return <iconify-icon class="icon" icon="ph:check-circle" />;
    case Status.CANCELLED:
      return <iconify-icon class="icon" icon="ph:x-circle" />;
    case Priority.URGENT:
      return <iconify-icon class="icon" icon="ph:warning-circle" />;
    case Priority.HIGH:
      return <iconify-icon class="icon" icon="ph:signal-high" />;
    case Priority.MEDIUM:
      return <iconify-icon class="icon" icon="ph:signal-medium" />;
    case Priority.LOW:
      return <iconify-icon class="icon" icon="ph:signal-low" />;
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