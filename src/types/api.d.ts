declare module '../../../utils/api' {
  /**
   * Calls the OpenAI API with the given prompt
   * @param prompt - The prompt to send to OpenAI
   * @returns The response from OpenAI
   */
  export function callOpenAI(prompt: string): Promise<string>;
}