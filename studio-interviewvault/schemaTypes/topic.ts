// schemas/topic.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'topic',
  title: 'Topic Card (Sub-Category)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., Microservices, Database Design, Java OOP'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: 'Unique identifier for routing/queries.'
    }),
    defineField({
      name: 'iconName',
      title: 'Icon Name (e.g., Heroicons class)',
      type: 'string',
      description: 'The icon used on the card (e.g., i-heroicons-cube-transparent).'
    }),
    defineField({
      name: 'iconColor',
      title: 'Icon Color (Tailwind class)',
      type: 'string',
      description: 'The color class for the icon (e.g., text-purple-500).'
    }),
    // You can add fields like 'progressPercent' or 'questionCount' here later
  ]
})