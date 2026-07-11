export interface PromptConfig {
  role: string;
  purpose: string;
  optionsTitle: string;
  specificRules: string[];
  exampleId: string;
  exampleLabel: string;
  exampleValue: string | number | boolean | null | string[]; // Simple serializable value or array
  exampleConfidence: number;
  exampleMetadata: Record<string, string | number | boolean | null | string[]>; // Simple serializable metadata
  exampleExplanation: string;
}

export const PROMPT_CONFIGS: Record<string, PromptConfig> = {
  filters: {
    role: "filter generation assistant",
    purpose: "convert natural language queries into structured filter objects",
    optionsTitle: "Available filter types and their possible values",
    specificRules: [
      "Use exact case-sensitive values from the lists above",
      "Choose appropriate operators: \"is\", \"is not\", \"is any of\", \"include\", \"do not include\", \"before\", \"after\""
    ],
    exampleId: "filter-1",
    exampleLabel: "Status is Todo",
    exampleValue: ["Todo"],
    exampleConfidence: 85,
    exampleMetadata: {
      type: "Status",
      operator: "is",
      value: ["Todo"]
    },
    exampleExplanation: "Applied filter for todo items"
  },

  commands: {
    role: "command generation assistant",
    purpose: "suggest relevant commands and actions based on user input",
    optionsTitle: "Available command categories and actions",
    specificRules: [
      "Use exact action names from the lists above",
      "Focus on action-oriented suggestions"
    ],
    exampleId: "cmd-1",
    exampleLabel: "New Meeting",
    exampleValue: "New Meeting",
    exampleConfidence: 90,
    exampleMetadata: {
      category: "Create",
      action: "New Meeting"
    },
    exampleExplanation: "Suggested actions for scheduling"
  },

  navigation: {
    role: "navigation assistant",
    purpose: "suggest relevant pages and destinations based on user input",
    optionsTitle: "Available navigation options",
    specificRules: [
      "Use exact page/section names from the lists above",
      "Focus on navigation destinations"
    ],
    exampleId: "nav-1",
    exampleLabel: "Dashboard",
    exampleValue: "Dashboard",
    exampleConfidence: 95,
    exampleMetadata: {
      type: "page",
      destination: "Dashboard"
    },
    exampleExplanation: "Navigation suggestions for dashboard access"
  }
};

export class PromptTemplateBuilder {
  static buildSystemPrompt(
    _type: string,
    availableOptions: Record<string, (string | number | boolean)[]>, // Arrays of primitive values for prompt building
    config?: PromptConfig
  ): string {
    const optionsText = Object.entries(availableOptions)
      .map(([key, values]) => `- ${key}: ${values.join(', ')}`)
      .join('\n');

    if (!config) {
      return this.buildDefaultPrompt(optionsText);
    }

    const commonRules = [
      "Return valid JSON only",
      "Provide confidence score (0-100)",
      "List any unmatched criteria"
    ];

    // Merge common rules with specific rules
    const allRules = [
      commonRules[0], // Rule 1
      ...config.specificRules, // Rules 2, 3, etc.
      commonRules[1], // Confidence score rule
      commonRules[2]  // Unmatched criteria rule
    ];

    const rulesText = allRules
      .map((rule, index) => `${index + 1}. ${rule}`)
      .join('\n');

    return `You are a ${config.role} for a task management system. Your job is to ${config.purpose}.

${config.optionsTitle}:
${optionsText}

Rules:
${rulesText}

Response format:
{
  "suggestions": [
    {
      "id": "${config.exampleId}",
      "label": "${config.exampleLabel}",
      "value": ${JSON.stringify(config.exampleValue)},
      "confidence": ${config.exampleConfidence},
      "metadata": ${JSON.stringify(config.exampleMetadata)}
    }
  ],
  "explanation": "${config.exampleExplanation}",
  "confidence": ${config.exampleConfidence},
  "unmatchedCriteria": []
}`;
  }

  private static buildDefaultPrompt(optionsText: string): string {
    return `You are an AI assistant. Your job is to suggest relevant items based on user input.

Available options:
${optionsText}

Rules:
1. Return valid JSON only
2. Use exact values from the lists above when possible
3. Provide confidence score (0-100)
4. List any unmatched criteria

Response format:
{
  "suggestions": [
    {
      "id": "suggestion-1",
      "label": "Suggested Item",
      "value": "item-value",
      "confidence": 80,
      "metadata": {}
    }
  ],
  "explanation": "AI generated suggestions",
  "confidence": 80,
  "unmatchedCriteria": []
}`;
  }
}