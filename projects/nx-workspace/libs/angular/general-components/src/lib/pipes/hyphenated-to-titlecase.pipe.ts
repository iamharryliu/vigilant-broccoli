import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'hyphenatedToTitleCase',
})
export class HyphenatedToTitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Remove file extension if present
    const withoutExtension = value.replace(/\.[^/.]+$/, '');

    return withoutExtension
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
