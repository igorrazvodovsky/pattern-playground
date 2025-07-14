import { Task } from './types';
import { formatTimestamp } from './time-utils';

export const renderTaskToHTML = (task: Task): string => {
  const historyHTML = task.history.map(entry => `
    <li class="stepper__item">
      <div class="stepper__content">
        <h4>${entry.action}</h4>
        <p class="muted">${entry.actor} • ${formatTimestamp(entry.timestamp)}</p>
        ${entry.details ? `<p class="muted">${entry.details}</p>` : ''}
      </div>
    </li>
  `).join('');

  // <header >
  //   <span class="${getStatusBadgeClass(task.status)}" >
  //     ${ task.status }
  //   </span>
  // </header>

  return `
    <div class="task-view">

      ${task.assignee ? `
        <div>
          <strong>Assignee:</strong> ${task.assignee}
        </div>
      ` : ''}

      ${task.progress !== undefined ? `
        <div>
          <progress value="${task.progress}" max="100">${task.progress}%</progress>
          <span>${task.progress}%</span>
        </div>
      ` : ''}

      <section class="task-view__history">
        <ol class="stepper">
          ${historyHTML}
        </ol>
      </section>
    </div>
  `;
};