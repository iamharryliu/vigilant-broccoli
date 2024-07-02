import { Pipe, PipeTransform } from '@angular/core';

const EXCEPTIONS: Record<string, string> = {
  css: 'CSS',
  os: 'OS',
  iphone: 'iPhone',
  'it-support': 'IT Support',
};

@Pipe({
  standalone: true,
  name: 'hyphenatedToTitleCase',
})
export class HyphenatedToTitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    const withoutExtension = value.replace(/\.[^/.]+$/, '');

    if (EXCEPTIONS[withoutExtension]) {
      return EXCEPTIONS[withoutExtension];
    }

    return withoutExtension
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
