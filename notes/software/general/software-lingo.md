# Software Lingo

## Technical Terms

- Closure - Enables functions to keep state.

## General

- CPU bound and IO bound
  - CPU bound - Used when actual calculations or processes are being done and require more computer resource.
  - IO bound - Used used when you are reading/writing to a location such as to a disk or over the network.
- Ternary Operator - A one line if else statement.
- URI - Uniform Resource Indicator
- URL - Uniform Resource Locator

```
foo://example.com:8042/over/there?name=ferret#nose
\_/   \______________/\_________/ \_________/ \__/
 |           |            |            |        |
scheme    authority      path        query     hash
```

## Tools

- Elastisearch - Open source search and analytics engine.
- Redis - Open source in-memory datastore used for database caching.
- Hadoop

  - Storage - Hadoop Distribute File System. Has copies of data on multiple systems making it fault tolerant.
  - MapReduce
    - Splits data into parts and processes it in different nodes for load balancing and saving time.
    - Map, Reduce, Shuffle
  - Yet Another Resource Manager(YARN) - Resource management and scheduling

- Bundlers - Used for combining files, managing dependencies, and optimizing the output for performance, making the application ready for deployment.
- Transpilers - Used for transforming code syntax and features, making sure the code runs across different environments.
- Javascript

  - Nx - Monorepo CI tool.
  - Nuxt - Opinionated Vue.
  - Next - Opinionated React.
  - Webpack (bundler)
  - Rollup (bundler)
  - Babel (compiler)
  - SWC (sppedy web compiler)
  - Vite (build tool, uses Rollup to bundle)
