import {defineArrayMember, defineField, defineType} from 'sanity'

export const playlistsPageType = defineType({
  name: 'playlistsPage',
  title: 'Playlists Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (rule) => rule.required(),
      initialValue: 'Playlists',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description: 'Optional intro copy shown above the playlists.',
      initialValue: 'Collection of music playlists curated by Cloud8.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      initialValue: 'Playlists',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      initialValue:
        'Cloud8Skate music playlists for skating. Listen to curated playlists for inline skating and roller skating sessions.',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO Keywords',
      type: 'string',
      initialValue: 'skating music, skating playlists, Cloud8 music, skating songs',
    }),
    defineField({
      name: 'playlistItems',
      title: 'Playlist Items',
      type: 'array',
      validation: (rule) => rule.min(1).required(),
      of: [
        defineArrayMember({
          name: 'playlistItem',
          title: 'Playlist Item',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Playlist Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Playlist URL',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({
                  allowRelative: false,
                  scheme: ['http', 'https'],
                }),
            }),
            defineField({
              name: 'curator',
              title: 'Curator',
              type: 'string',
              description: 'Optional curator or creator name.',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'curator',
            },
            prepare({title, subtitle}) {
              return {
                title,
                subtitle: subtitle ? `Curated by ${subtitle}` : 'Playlist',
              }
            },
          },
        }),
      ],
      initialValue: [
        {
          title: 'Unofficial cloud8skate playlist',
          url: 'https://open.spotify.com/playlist/61CzxnV9FJHQ6E3j2ItCzv',
          curator: 'Marco Tam',
        },
        {
          title: 'Slow skate jams to dip to',
          url: 'https://open.spotify.com/playlist/0SlaPZWKdlNmhvCqqd0OEh',
          curator: 'Jessie Bellew',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      playlistItems: 'playlistItems',
    },
    prepare({title, playlistItems}) {
      const count = Array.isArray(playlistItems) ? playlistItems.length : 0

      return {
        title: title || 'Playlists Page',
        subtitle: `${count} playlist${count === 1 ? '' : 's'}`,
      }
    },
  },
})
