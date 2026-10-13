import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'akt6kw0u',
    dataset: 'production',
  },
  deployment: {
    appId: 'ek3f096j4gzjxyaci1n5dfrq',
    autoUpdates: true,
  },
})
