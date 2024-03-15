import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Blog {
  title: string;
  date: any;
}

@Component({
  selector: 'app-blog-directory',
  standalone: true,
  imports: [CommonModule],
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
      const title = parts.slice(3).join('-').replace('.md', '').trim();
      const date = new Date(parts.slice(0, 3).join('-'));
      const blog: Blog = { title, date };
      if (!this.blogsByYear[year]) {
        this.blogsByYear[year] = [];
      }
      this.blogsByYear[year].push(blog);
    });
  }
}
