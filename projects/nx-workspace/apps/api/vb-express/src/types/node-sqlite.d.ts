// Minimal shim until workspace @types/node is bumped to >=22 (runtime is Node 22).
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string);
  }
}
