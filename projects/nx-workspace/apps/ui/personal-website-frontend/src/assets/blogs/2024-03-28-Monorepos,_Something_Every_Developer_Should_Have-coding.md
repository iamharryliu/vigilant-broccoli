# Personal Monorepo, Every Developer Should Have One

Recently I have been looking for ways to improve in software development but at the same time have fun doing so. I believe I have finally found a balance by picking up the practices of coding personal projects in a monorepo. I see my personal monorepo as a passion project but with direct value to my career path as a developer.

## What is a monorepo?

Monorepos are repositories that store the code for a number of different projects in a **single repository instead of multiple different ones**, a **shareable codebase**. This is a practice that is exercised by many large tech companies such as Google, Microsoft, and Facebook to create a **single source of truth** for their devlopers.

## Why I use a monorepo.

Whether you're starting off learning software development, working on a new project, or take coding beyond a career as a hobby like myself then monorepos are a very practical approach to developement. Being a developer for a few years and making multiple Github repos I started to question what is the point of writing all your code into separate repositories that you would most likely forget about in time, why not write everything in a single repository, especially if I'm going to be the main person touching this code? The problem of creating multiple repositories creates too much friction of accessing code. Having code shareded into different repos creates friction and leads to forgotten code and scrap projects. Having everything in a single repository gives you the more visibility over your code structure and to me is more manageable which is why I personally adopted using monorepos to write personal code. Monorepos provide many advantages over sharded projects for developers on every level.

## Advantages

I originally created my personal monorepo _vigilant-broccoli_ for the sole purpose of using it as a software developent toolkit containing machine setup configurations, code snippets, boilerplate code, etc but I found that the more time I spent coding in my monorepo, the more advantages I started to find and interesting ways to leverage using a monorepo.

### Software Development Kit

- Setup tools to configure your developer environment settings with an install script and dotfiles. Think aliases, scripts, shortcuts, environment variables etc..
- You get to pocket all the code you ever wrote in a single repository. Your tools are housed in a single place, similar to a carpenter and a good toolbox.

### Accessibility of code

- **Single git pull** to get all your projects (coupled with single setup script to get all your code up and running is mint)
- Combing through a single repository is easier than having multiple different repos to keep an eye on. Everything can be cleanly organized in a single file structure.
- With all your code so close it gives the advantage of having **everything a few keystrokes away** instead of having to open them seperately. All your **code is easier to find for a quick copy, paste**.
- Less friction when it comes to refactoring code since you don't need to access a different repo and you can everything an be committed to the same repo.

### Management

- You can have shareable code that is coupled between projects and write shareable utility code to improve your workflows for those projects such as scripts and hooks.
- Incentivizes to write and use **documentation/notes because you can quickly access it through file searching** on your text editor.
- Potential to exercise devops practices such as CICD pipelines and IaC within your monorepo.

### Progress Tracking

- Great way to track improvement as a new developer, the **single commit history is a track record of your progress**. You can see what you've been working on lately, last time you actually coded, etc..
- **Looking at old code** can teach you something next time you look at it with fresh eyes. You will find that you are able to rewrite a lot of old code in better ways over time.

### Lifestyle tool

- Potention of setting up your own **personal productivity tools** or **documentation/notetaking/planning with markdown**.
- Can be used as a **career portfolio** to showcase your skillsets.

## Conclusion

Using a monorepo is my preferred approach to writing personal software because of the benefits from having everything in one place. Of course having good monorepo practices takes a bit of finesse but it is definitely worth it in my opinion and fun to do. I intent to write a blog to share how I organize my monorepo for personal software development and ways I use it as a lifestyle tool.
