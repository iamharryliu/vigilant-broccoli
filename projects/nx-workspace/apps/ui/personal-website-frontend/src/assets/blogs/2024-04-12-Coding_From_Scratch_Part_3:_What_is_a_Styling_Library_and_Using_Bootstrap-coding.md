# Coding From Scratch Part 3: What is a Styling Library and Using Bootstrap

From the previous lesson you learned about CSS and how to style HTML components using the 3 different methods of implementing CSS styling (inline, internal/embedded, and external CSS). If you played around with styling your site with CSS you may have begun to notice the difficulty of writing your own CSS and organizing it when it becomes more complex. Styling web pages with CSS is a skill and takes time to hone before being able to get it exactly how you want it

Fortunately for us there are styling libraries. Styling libraries are generic external CSS libraries written by other developers to help with styling HTML pages. In this lesson we are going to ditch the previously manual styled inline CSS and opt for using a styling library called [Bootstrap](https://getbootstrap.com/). We're going to use some code from the [Getting Started with Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/) template for our _hello-world.html_. Our code styled with boot strap will look like this now:

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  </head>
  <body>
    <h1>Hello World, this is my first website</h1>
    <p>This is a paragraph in my website</p>
  </body>
</html>
```

Some generic HTML page boiler plate tags were added that you may not be familiar with but the most important tags to pay attention to right now is the &lt;link> tag which is the external CSS that is being applied to the HTML page that you should be able to see if you open the HTML page on a browser. Voila, you have styled a web page using a styling library.

## References

[Getting Started with Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
