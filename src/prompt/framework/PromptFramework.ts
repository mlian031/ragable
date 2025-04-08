export interface PromptComponent<ContextType = Record<string, unknown>> {
  id: string;
  order: number;
  tagName: string;
  enabled?: boolean | ((context?: ContextType) => boolean);
  getContent(context?: ContextType): string;
}

export class StaticPromptComponent<ContextType = Record<string, unknown>> implements PromptComponent<ContextType> {
  constructor(
    public id: string,
    public content: string,
    public tagName: string,
    public order: number,
    public enabled: boolean | ((context?: ContextType) => boolean) = true
  ) {}

  getContent(): string {
    return this.content.trim();
  }
}

export class PromptBuilder<ContextType = Record<string, unknown>> {
  constructor(private components: PromptComponent<ContextType>[]) {}

  build(context?: ContextType): string {
    return this.components
      .filter((c) =>
        typeof c.enabled === 'function' ? c.enabled(context) : c.enabled !== false
      )
      .sort((a, b) => a.order - b.order)
      .map(
        (c) =>
          `<${c.tagName}>\n${c.getContent(context)}\n</${c.tagName}>`
      )
      .join('\n\n');
  }
}
