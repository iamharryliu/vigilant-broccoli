import {defineArrayMember, defineField, defineType} from 'sanity'

export const faqPageType = defineType({
  name: 'faqPage',
  title: 'FAQ Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (rule) => rule.required(),
      initialValue: 'FAQ',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description: 'Optional intro copy shown above the FAQ list.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      initialValue: 'FAQ',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      initialValue:
        'Frequently asked questions about Cloud8Skate, skating in Toronto, equipment, locations, and our skating community events.',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO Keywords',
      type: 'string',
      initialValue: 'skating FAQ, Toronto skating questions, inline skating help',
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      validation: (rule) => rule.min(1).required(),
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'FAQ Item',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'faqLink',
                  title: 'Link',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'url',
                      title: 'URL',
                      type: 'url',
                      validation: (rule) =>
                        rule.required().uri({
                          allowRelative: false,
                          scheme: ['http', 'https'],
                        }),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      subtitle: 'url',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer',
            },
          },
        }),
      ],
      initialValue: [
        {
          question: 'Where can I find Cloud8?',
          answer:
            'Cloud8 can usually be found at The Bentway, College Park, and various ice skating rinks around Toronto.',
          links: [
            {
              label: 'The Bentway',
              url: 'https://maps.app.goo.gl/Aqu6WuqkiFAagZEK8',
            },
            {
              label: 'College Park',
              url: 'https://maps.app.goo.gl/BEv617tQgPUvRZGW8',
            },
          ],
        },
        {
          question: 'What kind of skating does Cloud8 do?',
          answer:
            'Cloud8 welcomes enthusiasts of all skating styles, including inline skating, rollerblading, quad skating, roller skating, and ice skating.',
        },
        {
          question: 'Do you have events?',
          answer:
            'Yes. Keep an eye on our calendar and Instagram for upcoming meetups, sessions, and announcements.',
          links: [
            {
              label: 'Calendar',
              url: 'https://cloud8skate.com/calendar',
            },
            {
              label: '@cloud8skate on Instagram',
              url: 'https://www.instagram.com/cloud8skate/',
            },
          ],
        },
        {
          question: 'How can I join?',
          answer: 'Just show up and skate with us.',
        },
        {
          question: 'Are there rules?',
          answer: 'Yes. Please review the community rules before joining a session.',
          links: [
            {
              label: 'Community rules',
              url: 'https://docs.google.com/document/d/1uSd7tTWcFiKoUa-FERtknOZR24hzQpfBLOSnPOI2ID0/edit?tab=t.0',
            },
          ],
        },
        {
          question: 'Where can I find the music you skate to?',
          answer: 'You can find playlists on the Cloud8 music page.',
          links: [
            {
              label: 'Music playlists',
              url: 'https://cloud8skate.com/playlists',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      faqItems: 'faqItems',
    },
    prepare({title, faqItems}) {
      const count = Array.isArray(faqItems) ? faqItems.length : 0

      return {
        title: title || 'FAQ Page',
        subtitle: `${count} FAQ item${count === 1 ? '' : 's'}`,
      }
    },
  },
})
