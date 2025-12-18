// schemas/question.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'question',
  title: 'Question',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'topic',
      title: 'Topic Card',
      type: 'reference',
      to: [{ type: 'topic' }],
      validation: (Rule) => Rule.required(),
      description:
        'The specific card/sub-category this question belongs to (e.g., Microservices).',
    }),

    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [
        // ✅ normal rich-text blocks with LINK annotation enabled
        {
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },

        // ✅ standalone image inside the answer flow
        {
          type: 'image',
          name: 'answerImage',
          title: 'Answer Image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption (optional)',
            },
          ],
        },

        // code block
        {
          type: 'code',
          title: 'Code snippet',
          options: {
            language: 'python',
            languageAlternatives: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'Java', value: 'java' },
              { title: 'Bash', value: 'bash' },
            ],
            withFilename: true,
          },
        },

        // ✅ Example box (now with image)
        {
          type: 'object',
          name: 'exampleBox',
          title: 'Example Box',
          fields: [
            { name: 'title', type: 'string', initialValue: 'Example 1' },
            { name: 'input', type: 'text' },
            { name: 'output', type: 'text' },
            {
              name: 'image',
              title: 'Example Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alt text',
                },
                {
                  name: 'caption',
                  type: 'string',
                  title: 'Caption (optional)',
                },
              ],
            },
          ],
        },

        // Divider object
        {
          type: 'object',
          name: 'divider',
          title: 'Divider',
          fields: [
            {
              name: 'style',
              type: 'string',
              initialValue: 'line',
              hidden: true,
            },
          ],
          preview: {
            prepare() {
              return {
                title: 'Divider',
                subtitle: 'Horizontal line',
              }
            },
          },
        },
      ],
    }),
  ],
})
