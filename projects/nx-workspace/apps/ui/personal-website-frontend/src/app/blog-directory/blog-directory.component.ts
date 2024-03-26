import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GeneralLayoutComponent } from '../components/layouts/general/genreral-layout.component';
import { NewsLetterSubFormComponent } from '../components/features/subscribe-form/subscribe-form.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../core/services/blog.service';

interface Blog {
  type: string;
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
  blogsByYear: Record<string, Blog[]> = {};

  constructor(
    private router: Router,
    public datePipe: DatePipe,
    private http: HttpClient,
    private blogService: BlogService,
  ) {}

  ngOnInit(): void {
    this.http.get('assets/blogs.json').subscribe(data => {
      this.fetchBlogs(data as string[]);
    });
  }

  fetchBlogs(filenames: string[]): void {
    filenames.forEach(filename => {
      const parts = filename.split('-');
      parts[parts.length - 1] = parts[parts.length - 1]
        .replace('.md', '')
        .trim();
      const year = parts[0];
      const title = this.blogService.titleCase(parts[3]);
      const [y, m, d] = parts.slice(0, 3).map(String);
      // TODO: clean this up
      const date = new Date(`${y}-${m}-${d}T00:00`);
      const type = parts[4];
      const blog: Blog = { filename, title, date, type };
      if (!this.blogsByYear[year]) {
        this.blogsByYear[year] = [];
      }
      this.blogsByYear[year].push(blog);
    });
    Object.values(this.blogsByYear).forEach(blogs => {
      blogs.sort((a, b) => b.date.getTime() - a.date.getTime());
    });
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  goToBlog(blog: Blog) {
    const parts = blog.filename.split('-');
    const date = this.datePipe.transform(blog.date.toISOString(), 'yyyy-MM-dd');
    const title = parts[3].replace('.md', '').trim();
    this.router.navigateByUrl(`blogs/${date}/${blog.type}/${title}`);
  }
}
