import { marked } from 'marked';

const DEFAULT_MARKDOWN_OPTIONS = { breaks: true };

export class MarkdownService {
  static markdownParser = marked.setOptions(DEFAULT_MARKDOWN_OPTIONS);

  static async parse(data: string): Promise<string> {
    return this.markdownParser.parse(data);
  }
}
