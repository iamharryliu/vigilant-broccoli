# Coding From Scratch: What is CSS and Styling Your Site

Now that you have your super awesome site from [Coding From Scratch Part 1](https://harryliu.design/blogs/2024-03-26/coding/Coding_From_Scratch_Part_1:_What_is_HTML_and_Building_Your_First_Website) we might want to make style changes to it so let's do something about that.

Web developers style websites with instructions called **CSS** (Cascading Style Sheet) which is a **text file that gives instructions on how our blocks of HTML should be styled**. There are several layers to CSS(as with any topic) and since this is more of a laymen/beginner tutorial we will keep it fairly simple with the bare bone basics of the gist of what we can do with it and how web developers write CSS.

<p style="color: red; font-size: 24px;">This is a paragraph with red text and larger font size.</p>
<p style="background-color: blue; color: white;">This is another paragraph with blue background and white text.</p>

In this example we changed the style of the typography of the lines of text but there are even more styling options that can be manipulated with CSS. Here's a few to name off the top of my head:

- typography (ie from our example above)
- spacing (margin and padding)
- backgrounds
- borders
- and many more options.

**CSS can be implemented on HTML files in 3 different ways**:

- inline CSS
- internal/embedded CSS
- external CSS

The following are examples of these implementations that you can try out on your computer.

### Inline CSS

Paste following code in an _HTML_ file and open in a browser.

```
<p style="color:#009900; font-size:50px; font-style:italic; text-align:center;">
    This paragraph tag uses inline styling.
</p>
```

### Internal/Embedded CSS

Paste following code in an _HTML_ file and open in a browser.

```
<style>
    p {
        color:#009900;
        font-size:50px;
        font-style:italic;
        text-align:center;
    }
</style>
<p>This paragraph tag uses internal/embedded CSS styling.</p>
```

### External CSS

The last method of implementing CSS requires creating a separate file that is used to contain all the CSS and used to apply on the HTML file. This method is used to access CSS files outside of the HTML for reasons such as using external styling libraries and keeping a separation of concern bewteen the HTML files (visual blocks that make up the site) and CSS (styling instuction for visual blocks). A simple way of how this would be implemented is done by the following:

Creating a separate file that contains your external CSS called _style.css_ and adding in this code:

```
p {
    color:#009900;
    font-size:50px;
    font-style:italic;
    text-align:center;
}
```

In your HTML file you can write a link tag to link the stylesheet from _style.css_ to _hello-world_.html. Also if you are copying this example, make sure that the files are in the same folder.

```
<link rel="stylesheet" href="style.css">
<p>This paragraph tag uses external styling.</p>
```

There you go! In this blog we described very generally what CSS is and 3 different ways to style CSS! If you tried the three different methods I mentioned above then you should get similar looking results in terms of style for all three of them (different text content).

## Site Makeover

So let's add some styling to our personal website from the previous blog. If you add the inline styling to the _hello-world.html_ file from part one you should get a stylized website.

```
<h1 style="text-align: center; color: #333; font-family: Arial, sans-serif;">Hello World, this is my first website</h1>
<hr style="border-color: #333;">
<p style="text-align: center; font-size: 16px; line-height: 1.6; color: #666; font-family: Arial, sans-serif;">This is a paragraph in my website</p>
```

There we go, we got some style on our cool website now!

## Summary

In short, **CSS is what web developers use to tell HTML how it should look** and it can be implemented in three different ways: _inline, internal/embedded, external_.
