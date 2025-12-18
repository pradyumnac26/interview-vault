// ~/lib/sanityClient.ts
import { createClient } from '@sanity/client'

const projectId = 'ewopxjth'
const dataset = 'production'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true
})

// 1) Tracks list (NO CHANGE NEEDED)
// List all tracks for /questionbank
export function fetchTracks() {
  const query = `
    *[_type == "track"] | order(date desc){
      _id,
      title,
      description,
      "slug": slug.current,
      badge,
      date,
      "image": {
        "src": image.asset->url,
        "alt": title
      }
    }
  `
  return sanityClient.fetch(query)
}

// 2) TRACK DATA (NEW/REPLACEMENT FUNCTION)
// Fetch the main track document, all its tabs, and all linked topic card metadata
export function fetchTrackData(slug: string) {
  const query = `
    *[_type == "track" && slug.current == $slug][0]{
      _id,
      title,
      description,
      "slug": slug.current,
      badge,
      date,
      image,
      // 👇 Fetch the nested tabs and dereference the 'topic' cards
      "tabsData": tabs[]{
        tabLabel,
        "topics": topics[]->{
          _id, // IMPORTANT: Needed to link to questions
          title,
          "slug": slug.current,
          iconName,
          iconColor,
          // 👇 NEW: Count questions that reference this Topic Card's ID
          "questionCount": count(*[_type == "question" && references(^._id)])
        }
      }
    }
  `
  return sanityClient.fetch(query, { slug })
}


// 3) QUESTIONS BY TOPIC ID (NEW FUNCTION)
// Fetch all questions that reference a specific Topic document (the selected card)
// 3) QUESTIONS BY TOPIC ID (UPDATED)
export function fetchQuestionsByTopicId(topicId: string) {
  const query = `
    *[_type == "question" && references($topicId)]
      | order(_createdAt asc){
        _id,
        title,
        // 👇 Hydrate nested answer content, including images
        answer[]{
          ...,

          // Standalone images in the answer array
          _type == "answerImage" => {
            ...,
            "asset": asset->{ url }
          },

          // Example boxes with nested image
          _type == "exampleBox" => {
            ...,
            image{
              ...,
              "asset": asset->{ url }
            }
          }
        },

        "topicLabel": topic->title,
        "topicSlug": topic->slug.current
      }
  `
  return sanityClient.fetch(query, { topicId })
}
