export interface PromptComponent {
  id: string;
  order: number;
  tagName: string;
  enabled?: boolean | ((context?: any) => boolean);
  getContent(context?: any): string;
}

export class StaticPromptComponent implements PromptComponent {
  constructor(
    public id: string,
    public content: string,
    public tagName: string,
    public order: number,
    public enabled: boolean | ((context?: any) => boolean) = true
  ) {}

  getContent(): string {
    return this.content.trim();
  }
}

export class PromptBuilder {
  constructor(private components: PromptComponent[]) {}

  build(context?: any): string {
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
