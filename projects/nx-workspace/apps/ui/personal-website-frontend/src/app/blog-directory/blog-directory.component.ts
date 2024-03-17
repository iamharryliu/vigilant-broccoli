import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { NewsLetterSubFormComponent } from '../components/features/subscribe-form/subscribe-form.component';
import { Router } from '@angular/router';

interface Blog {
  filename: string;
  title: string;
  date: any;
}

@Component({
  selector: 'app-blog-directory',
  standalone: true,
  imports: [CommonModule, GeneralLayoutComponent, NewsLetterSubFormComponent],
  providers: [DatePipe],
  templateUrl: './blog-directory.component.html',
})
export class BlogDirectoryComponent implements OnInit {
  blogsByYear: { [year: string]: Blog[] } = {};

  constructor(private router: Router, public datePipe: DatePipe) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    const filenames = ['2024-03-15-test_blog.md'];
    filenames.forEach(filename => {
      const parts = filename.split('-');
      const year = parts[0];
      const title = this.titleCase(parts[3].replace('.md', '').trim());
      const [y, m, d] = parts.slice(0, 3).map(Number);
      const date = new Date(`${m}-${d}-${y}`);
      const blog: Blog = { filename, title, date };
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

  goToBlog(blog: Blog) {
    const parts = blog.filename.split('-');
    const date = this.datePipe.transform(blog.date, 'yyyy-MM-dd');
    const title = parts[3].replace('.md', '').trim();
    console.log(`/blogs/${date}/${title}`);
    this.router.navigateByUrl(`/blogs/${date}/${title}`);
  }
}
