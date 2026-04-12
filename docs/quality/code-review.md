# Code review workflow

After completing any implementation or change to code:

1. Use the code-reviewer agent to review for quality, security, maintainability, errors, inconsistencies, and best practice violations.
   - Invoke via: `Task` tool with `subagent_type: "code-reviewer"`
   - Provide file paths or directories to review in the prompt
   - Agent runs autonomously and returns findings in a single report
2. Implement any suggestions or improvements identified by the code-reviewer.
3. Only consider the implementation complete after addressing code review feedback.
