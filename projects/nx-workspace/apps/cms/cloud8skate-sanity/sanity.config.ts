import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Cloud8Skate',

  projectId: 'akt6kw0u',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('FAQ Page')
              .child(S.document().schemaType('faqPage').documentId('faqPage')),
            S.listItem()
              .title('Playlists Page')
              .child(S.document().schemaType('playlistsPage').documentId('playlistsPage')),
            S.documentTypeListItem('galleryAlbum').title('Gallery Albums'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
