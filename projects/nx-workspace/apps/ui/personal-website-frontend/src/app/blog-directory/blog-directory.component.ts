import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { NewsLetterSubFormComponent } from '../components/features/subscribe-form/subscribe-form.component';

interface Blog {
  title: string;
  date: any;
}

@Component({
  selector: 'app-blog-directory',
  standalone: true,
  imports: [CommonModule, GeneralLayoutComponent, NewsLetterSubFormComponent],
  templateUrl: './blog-directory.component.html',
})
export class BlogDirectoryComponent implements OnInit {
  blogsByYear: { [year: string]: Blog[] } = {};

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    const files = ['2024-03-15-test_blog.md'];
    files.forEach(file => {
      const parts = file.split('-');
      const year = parts[0];
      const title = this.titleCase(parts[3].replace('.md', '').trim());
      const date = new Date(parts.slice(0, 3).join('-'));
      const blog: Blog = { title, date };
      if (!this.blogsByYear[year]) {
        this.blogsByYear[year] = [];
      }
      this.blogsByYear[year].push(blog);
    });
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  titleCase(str: string): string {
    return str
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
