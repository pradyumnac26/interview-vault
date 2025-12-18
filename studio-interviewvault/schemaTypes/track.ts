// schemas/track.ts

import { defineType, defineField, defineArrayMember } from 'sanity'

export default defineType({
  name: 'track',
  title: 'Track / Top Tab Group',
  type: 'document',
  fields: [
    // --- TOP LEVEL CARD METADATA (For /questionbank landing page) ---
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'The main Track name (e.g., Backend Engineer, DevOps/Cloud Engineering).'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'badge',
      title: 'Badge label',
      type: 'string'
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime'
    }),
    defineField({
      name: 'image',
      title: 'Hero image',
      type: 'image'
    }),

    // --- NESTED TABS STRUCTURE ---
    defineField({
      name: 'tabs',
      title: 'Navigation Tabs & Topics',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      description: 'Define the top navigation tabs and the topic cards associated with each tab.',
      of: [
        // FIX: Using defineArrayMember for the nested object type definition
        defineArrayMember({ 
          name: 'tabGroup',
          title: 'Tab Group',
          type: 'object',
          fields: [
            defineField({
              name: 'tabLabel',
              title: 'Tab Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'e.g., System Design, Java'
            }),
            defineField({
              name: 'topics',
              title: 'Topic Cards in this Tab',
              type: 'array',
              of: [{ 
                type: 'reference', 
                to: [{ type: 'topic' }] 
              }],
              validation: (Rule) => Rule.required().min(1),
              description: 'References to the topic cards displayed when this tab is active.'
            })
          ]
        })
      ]
    })
  ]
})