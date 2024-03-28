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
      this.setBlogs(data as string[]);
    });
  }

  setBlogs(filenames: string[]): void {
    filenames.forEach(filename => {
      const [year, month, day, title, type] = this.parseFilename(filename);
      const date = new Date(`${year}-${month}-${day}T00:00`);
      const formattedTitle = this.blogService.titleCase(title);
      const blog: Blog = { filename, title: formattedTitle, date, type };
      this.addToBlogsByYear(year, blog);
    });

    this.sortBlogsByYear();
  }

  private parseFilename(
    filename: string,
  ): [string, string, string, string, string] {
    const parts = filename
      .replace('.md', '')
      .split('-')
      .map(part => part.trim());
    const [year, month, day, ...rest] = parts;
    const title = rest.slice(0, -1).join('-');
    const type = rest[rest.length - 1];
    return [year, month, day, title, type];
  }

  private addToBlogsByYear(year: string, blog: Blog): void {
    if (!this.blogsByYear[year]) {
      this.blogsByYear[year] = [];
    }
    this.blogsByYear[year].push(blog);
  }

  private sortBlogsByYear(): void {
    for (const year in this.blogsByYear) {
      this.blogsByYear[year].sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      );
    }
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
