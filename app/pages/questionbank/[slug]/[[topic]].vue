<script setup lang="ts">
// @ts-nocheck 

import { PortableText } from '@portabletext/vue'
import { h, computed, ref, watchEffect } from 'vue' // Added ref, watchEffect, computed
import hljs from 'highlight.js/lib/common'
import {
  fetchTrackData,
  fetchQuestionsByTopicId
} from '../../../../lib/sanityClient'

const route = useRoute()
const router = useRouter()

// /questionbank/[slug]/[[topic]]
const trackSlug = computed(() => route.params.slug as string)

// --- 1) Fetch Track Data (Track, Tabs, and Topics) ---
const { data: trackData } = await useAsyncData(
  () => `track-data-${trackSlug.value}`,
  () => fetchTrackData(trackSlug.value)
)
const glowClasses = [
  'hover:shadow-[0_0_40px_rgba(129,140,248,0.8)] dark:hover:shadow-[0_0_40px_rgba(129,140,248,0.9)]', // indigo
  'hover:shadow-[0_0_40px_rgba(52,211,153,0.8)] dark:hover:shadow-[0_0_40px_rgba(52,211,153,0.9)]',  // emerald
  'hover:shadow-[0_0_40px_rgba(251,191,36,0.8)] dark:hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]',  // amber
  'hover:shadow-[0_0_40px_rgba(248,113,113,0.8)] dark:hover:shadow-[0_0_40px_rgba(248,113,113,0.9)]' // red
]

const getGlowClass = (index: number) => glowClasses[index % glowClasses.length]

if (!trackData.value) {
  throw createError({ statusCode: 404, statusMessage: 'Track not found', fatal: true })
}

const track = computed(() => trackData.value)

// --- 2) State for View Control and Search ---

// Tabs are pure UI state
const internalTabLabel = ref(track.value.tabsData[0]?.tabLabel || '')
const activeTabLabel = computed(() => internalTabLabel.value)

const searchQuery = ref('')

// Topic from path param
const selectedTopicSlug = computed(() => {
  const slug = route.params.topic
  if (typeof slug !== 'string' || slug === 'undefined') return null
  return slug
})

// All topics across all tabs (to resolve slug → topic reliably)
const allTopics = computed(() => {
  const tabs = track.value?.tabsData || []
  return tabs.flatMap((tab: any) => tab.topics || [])
})

// When opening /questionbank/backend-engineer/microservices directly,
// auto-select the tab that contains this topic.
watchEffect(() => {
  const slug = selectedTopicSlug.value
  if (!slug) return

  const tabs = track.value?.tabsData || []
  const tabWithTopic = tabs.find((tab: any) =>
    (tab.topics || []).some((t: any) => t.slug === slug)
  )

  if (tabWithTopic && internalTabLabel.value !== tabWithTopic.tabLabel) {
    internalTabLabel.value = tabWithTopic.tabLabel
  }
})

// --- 3) Computed Properties for Tab/Card Filtering ---

const tabItems = computed(() => {
  return track.value.tabsData.map((t: any) => ({ label: t.tabLabel }))
})

const activeTab = computed(() => {
  const normalizedLabel = activeTabLabel.value.toLowerCase().trim()
  return track.value.tabsData.find(
    (tab: any) => tab.tabLabel.toLowerCase().trim() === normalizedLabel
  )
})

const topicsForGrid = computed(() => {
  return activeTab.value ? activeTab.value.topics : []
})

// Selected topic (full object) from slug
const selectedTopic = computed(() => {
  const slug = selectedTopicSlug.value
  if (!slug) return null

  return (
    allTopics.value.find(
      (t: any) =>
        String(t.slug).toLowerCase().trim() === slug.toLowerCase().trim()
    ) || null
  )
})

// Topic label for headings
const currentTopicLabel = computed(() => {
  return selectedTopic.value?.title || 'Topics'
})

/**
 * NEW: Determine the active tab for the sidebar based on the current topic slug
 */
const activeTabLabelForSidebar = computed(() => {
  const slug = selectedTopicSlug.value
  if (!slug) return null 
  
  const activeTab = track.value?.tabsData.find((tab: any) =>
    (tab.topics || []).some((t: any) => t.slug === slug)
  )
  
  return activeTab ? activeTab.tabLabel : null;
})

/**
 * NEW: State for opening/closing topic lists in the sidebar
 */
const tabOpenState = ref(
  track.value?.tabsData?.reduce((acc, tab) => {
    const isActiveTab = activeTabLabelForSidebar.value === tab.tabLabel;
    
    // In question view, only the active tab should be open initially
    if (selectedTopicSlug.value) {
        acc[tab.tabLabel] = isActiveTab;
    } else {
        // Not strictly necessary as sidebar is hidden in card view, but good practice
        acc[tab.tabLabel] = true; 
    }
    return acc;
  }, {})
);

const toggleTab = (label: string) => {
  if (tabOpenState.value) {
    tabOpenState.value[label] = !tabOpenState.value[label];
  }
};


// --- 4) Questions Fetch ---

const selectedTopicId = computed(() => {
  return selectedTopic.value?._id || null
})

const { data: questionsData, pending: questionsPending } = await useAsyncData(
  () => `questions-${selectedTopicId.value ?? 'none'}`,
  async () => {
    const id = selectedTopicId.value
    if (!id) return []
    return fetchQuestionsByTopicId(id)
  },
  {
    watch: [selectedTopicId] // refetch whenever topic changes
  }
)

// --- 5) Filter logic: Apply Search Filter ---
const filteredItems = computed(() => {
  const term = searchQuery.value.toLowerCase().trim()
  const items = questionsData.value || []

  return items
    .filter((item: any) => {
      return !term || (item.title && item.title.toLowerCase().includes(term))
    })
    .map((q: any, index: number) => ({
      label: `${index + 1}. ${q.title}`,
      value: String(index),
      index: index + 1,
      question: q
    }))
})

// --- 6) Handlers ---

// Clicking a topic card or a sidebar link
const selectTopic = (topicSlug: string | null | undefined) => {
  if (!topicSlug) return
  
  // Find the parent tab for the clicked topic
  const topic = allTopics.value.find((t: any) => t.slug === topicSlug);
  if (topic) {
     const parentTab = track.value.tabsData.find((tab: any) => tab.topics.some((t: any) => t._id === topic._id));
     if (parentTab) {
         // Update the main tab state and ensure the sidebar tab is open
         internalTabLabel.value = parentTab.tabLabel;
         if (tabOpenState.value) {
            tabOpenState.value[parentTab.tabLabel] = true;
         }
     }
  }

  router.push(`/questionbank/${trackSlug.value}/${topicSlug}`)
  searchQuery.value = ''
}

// Back button → /questionbank/backend-engineer
const goBackToCards = () => {
  router.push(`/questionbank/${trackSlug.value}`)
  searchQuery.value = ''
}

const goBackToMain = () => {
  router.push(`/questionbank/`)
  searchQuery.value = ''
}

const highlightCode = (code: string, language?: string) => {
  if (!code) return ''
  try {
    // If language is known, use it; otherwise let hljs auto-detect
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    }
    return hljs.highlightAuto(code).value
  } catch {
    // Fallback: basic escaping
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
}

// Format the title: turn `code` parts into inline <code> tags
const formatTitle = (raw: string | null | undefined): string => {
  if (!raw) return ''

  // Escape HTML so user content is safe
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Replace `something` with <code>something</code> + styling
  return escaped.replace(
    /`([^`]+)`/g,
    '<code class="inline bg-slate-200 dark:bg-slate-700 rounded-[2px] px-0.5 text-[0.85rem] font-mono text-slate-900 dark:text-slate-100">$1</code>'
  )
}



/**
 * PortableText components: (Full definition for completeness)
 */
const portableTextComponents = {

  types: {
    // ✅ Example card (Example 1 / Input / Output + optional image)
   exampleBox: ({ value }: any) =>
      h(
        'div',
        {
          class:
            'mt-2 mb-6 rounded-xl border text-sm p-4 shadow-sm ' +
            'bg-sky-50 border-sky-200 text-slate-900 ' +
            'dark:bg-slate-900/70 dark:border-sky-500/60 dark:text-slate-50'
        },
        [
          // Title
          h(
            'p',
            {
              class:
                'font-semibold mb-2 text-sky-900 dark:text-sky-100 tracking-tight'
            },
            value.title
          ),

          // 👉 Example image (smaller, left, no extra box)
          value.image && value.image.asset?.url
            ? h(
                'div',
                { class: 'mb-3' },
                [
                  h('img', {
                    src: value.image.asset.url,
                    alt: value.image.alt || '',
                    class:
                      // smaller width, not centered
                      'w-full max-w-[260px] md:max-w-[320px] ' +
                      'object-contain rounded-md border border-slate-200 ' +
                      'bg-white dark:border-slate-700 dark:bg-slate-900'
                  }),
                  value.image.caption
                    ? h(
                        'p',
                        {
                          class:
                            'mt-1 text-[11px] text-slate-500 dark:text-slate-400'
                        },
                        value.image.caption
                      )
                    : null
                ]
              )
            : null,

          // Input line
          h('p', {}, [
            h(
              'span',
              {
                class:
                  'font-semibold text-sky-700 dark:text-sky-300'
              },
              'Input: '
            ),
            value.input
          ]),

          // Output line
          h('p', {}, [
            h(
              'span',
              {
                class:
                  'font-semibold text-sky-700 dark:text-sky-300'
              },
              'Output: '
            ),
            value.output
          ])
        ]
      ),

    // ✅ Big code block with syntax highlighting (unchanged)
    code: ({ value }: any) => {
      const rawCode = value?.code || ''
      const lang = value?.language || 'python'
      const title = value?.filename || (lang || 'code').toUpperCase()
      const highlighted = highlightCode(rawCode, lang)

      return h(
        'div',
        {
          class:
            'my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ' +
            'dark:border-slate-800 dark:bg-slate-950'
        },
        [
          h(
            'div',
            {
              class:
                'flex items-center justify-between px-4 py-2 text-[11px] font-mono uppercase tracking-wide ' +
                'bg-slate-100 border-b border-slate-200 text-slate-600 ' +
                'dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
            },
            title
          ),
          h('pre', {
            class:
              'm-0 max-h-[480px] overflow-auto px-4 py-3 ' +
              'text-[0.9rem] leading-[1.7] font-mono',
            innerHTML: `<code class="hljs language-${lang}">${highlighted}</code>`
          })
        ]
      )
    },

    // ✅ Standalone image blocks in Answer
    answerImage: ({ value }: any) =>
      h(
        'figure',
        { class: 'my-4 flex flex-col items-center justify-center' },
        [
          h('img', {
            src: value.asset?.url || value.url,
            alt: value.alt || '',
            class:
              'max-h-80 w-full object-contain rounded-lg border border-slate-200 bg-white ' +
              'dark:border-slate-700 dark:bg-slate-900'
          }),
          value.caption
            ? h(
                'figcaption',
                {
                  class:
                    'mt-2 text-xs text-center text-slate-500 dark:text-slate-400'
                },
                value.caption
              )
            : null
        ]
      ),

    // Divider type → horizontal line
    divider: () =>
      h('hr', {
        class:
          'my-6 border-0 border-t-2 border-slate-300 dark:border-slate-500'
      })
  },

  marks: {
    // inline code – now just highlighted bg, no pill
    code: (props: any) =>
      h(
        'code',
        {
          class:
            'inline bg-slate-200 dark:bg-slate-700 rounded-[2px] px-0.5 ' +
            'text-[0.85rem] font-mono text-slate-900 dark:text-slate-100',
        },
        (props.children && props.children.length
          ? props.children
          : props.text) || '',
      ),

    // Link mark
    link: (props: any, { slots }: any) =>
      h(
        'a',
        {
          href: props?.value?.href || '#',
          target: '_blank',
          rel: 'noopener noreferrer',
          class:
            'font-medium underline decoration-sky-400 decoration-2 underline-offset-[3px] ' +
            'text-sky-600 hover:text-sky-700 ' +
            'dark:text-sky-300 dark:hover:text-sky-200',
        },
        slots?.default ? slots.default() : props.text,
      ),
  },
}

</script>

<template>
  <UContainer v-if="track">
    <UPageHeader
      :title="track.title"
      :description="track.description"
    >
      <template #headline>
        <UBadge
          v-if="track.badge"
          :label="track.badge"
          variant="subtle"
        />
        <span v-if="track.date" class="text-muted"> &middot; </span>
        <time v-if="track.date" class="text-muted">
          {{
            new Date(track.date).toLocaleDateString('en', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }}
        </time>
      </template>
    </UPageHeader>

    <UPage>
      <UPageBody :key="selectedTopicSlug || 'card-view'" class="flex flex-col lg:grid lg:grid-cols-12 lg:gap-10">
        <div v-if="!selectedTopicSlug" class="lg:col-span-12 mb-4">
            <UButton
            icon="i-heroicons-arrow-left-20-solid"
            color="primary"
            variant="ghost"
            class="mb-6 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            @click="goBackToMain"
          >
            Back to QuestionBank
          </UButton>
          <nav class="flex items-center gap-6">
            <button
              v-for="tab in tabItems"
              :key="tab.label"
              type="button"
              class="relative inline-flex items-center px-3 pt-1 pb-1.5 text-sm font-semibold cursor-pointer rounded-md transition-colors duration-150"
              :class="internalTabLabel === tab.label
                ? [
                    // ACTIVE TAB
                    'text-blue-500 dark:text-blue-400',
                    // underline
                    'after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:bg-blue-500 dark:after:bg-blue-400',
                    // very soft bg only when active
                    'bg-blue-50 dark:bg-blue-500/10'
                  ].join(' ')
                : [
                    // INACTIVE TABS
                    'text-gray-500 dark:text-gray-400',
                    // hover: only change text color in light, bg only in dark
                    'hover:text-blue-500 dark:hover:text-blue-300 dark:hover:bg-gray-800/70'
                  ].join(' ')
              "
              @click="internalTabLabel = tab.label"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>



        <div v-if="!selectedTopicSlug" class="lg:col-span-12">
          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <UCard
              v-for="(topic, idx) in topicsForGrid"
              :key="topic._id"
              :class="[
                // smooth float-up motion
                'cursor-pointer transform transition-transform duration-300 ease-out',
                // more lift + ring colors
                'hover:-translate-y-3 hover:ring-2 hover:ring-primary-500 dark:hover:ring-primary-400',
                // per-card glow
                getGlowClass(idx)
              ]"
              :ui="{ base: 'h-full', body: { padding: 'p-4' } }"
              @click="selectTopic(topic.slug)"
            >
              <div class="flex flex-col items-start gap-4 h-full">
                <UIcon
                  :name="topic.iconName || 'i-heroicons-folder'"
                  class="h-10 w-10 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  :class="topic.iconColor"
                />

                <p
                  class="font-semibold text-lg text-gray-900 dark:text-gray-100"
                >
                  {{ topic.title }}
                </p>

                <div
                  class="mt-auto text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between w-full pt-2 border-t border-gray-100 dark:border-gray-800"
                >
                  <span class="text-primary-500 font-medium">
                    {{ topic.questionCount || 0 }} Questions
                  </span>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <template v-else>
          <div class="lg:col-span-3">
             <div class="lg:sticky lg:top-8 lg:self-start">
                
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  color="primary"
                  variant="ghost"
                  class="mb-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  @click="goBackToCards"
                >
                  Back to Topics
                </UButton>
                
                <UButton
                  icon="i-heroicons-home-20-solid"
                  color="primary"
                  variant="ghost"
                  class="mb-6 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  @click="goBackToMain"
                >
                  Back to QuestionBank
                </UButton>



                <nav>
                    <ul class="space-y-4">
                        <li v-for="tab in track.tabsData" :key="tab.tabLabel">
                            
                            <button
                                class="w-full flex items-center justify-between text-sm cursor-pointer"
                                @click="toggleTab(tab.tabLabel)"
                            >
                                <span 
                                    class="font-bold block uppercase tracking-wide text-base"
                                    :class="activeTabLabelForSidebar === tab.tabLabel ? 'text-primary-500 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'"
                                >
                                    {{ tab.tabLabel }}
                                </span>
                                <UIcon
                                    :name="tabOpenState && tabOpenState[tab.tabLabel] ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
                                    class="w-4 h-4 shrink-0 transition-transform duration-200 text-gray-500 dark:text-gray-400"
                                />
                            </button>
                            
                            <ul 
                                v-if="tabOpenState && tabOpenState[tab.tabLabel]" 
                                class="space-y-0.5 py-1 mt-1 border-l border-gray-200 dark:border-gray-700 ml-2 pl-3"
                            >
                                <li v-for="topic in tab.topics" :key="topic._id">
                                    <button
                                        class="w-full flex items-center px-2 py-1.5 rounded-md text-left transition-colors duration-150 text-sm"
                                        :class="[
                                            selectedTopicSlug === topic.slug
                                            ? 'font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
                                            : 'font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                                        ]"
                                        @click="selectTopic(topic.slug)"
                                    >
                                        <span class="flex-grow truncate">{{ topic.title }}</span>
                                        <span class="text-xs shrink-0 ml-2" :class="selectedTopicSlug === topic.slug ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'">
                                            ({{ topic.questionCount || 0 }})
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
             </div>
          </div>

          <div class="lg:col-span-9">

            <h2
              class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100"
            >
              {{ currentTopicLabel }} Questions
            </h2>

            <div class="mb-6">
              <UInput
                v-model="searchQuery"
                size="lg"
                icon="i-heroicons-magnifying-glass-20-solid"
                :placeholder="`Search questions within ${currentTopicLabel}...`"
                class="w-full"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              >
                <template #trailing v-if="searchQuery">
                  <UButton
                    color="gray"
                    variant="link"
                    icon="i-heroicons-x-mark-20-solid"
                    :padded="false"
                    @click="searchQuery = ''"
                  />
                </template>
              </UInput>
            </div>

          <UAccordion
              v-if="!questionsPending && filteredItems.length"
              type="multiple"
              :items="filteredItems"
              :ui="{
                // 1. WRAPPER: Remove borders/dividers here. Add 'gap' to separate items.
                wrapper: 'flex flex-col gap-6 w-full',

                // 2. ITEM: This creates the 'Container' look for each Q&A pair
                item: 'bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:border-primary-300 dark:hover:border-primary-700/50 transition-colors duration-200 mb-4',

                // 3. Header styling
                header: 'group transition-colors',
                
                // 4. Trigger button styling
                trigger: 'w-full flex items-center gap-4 px-4 py-4 text-left focus:outline-none',
                
                leadingIcon: 'hidden',
                
                // Arrow icon styling
                trailingIcon: 'ml-auto h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-transform duration-200 data-[state=open]:rotate-180',
                
                // Content (Answer) padding
                content: 'px-4 pb-5 pt-0 text-md text-gray-600 dark:text-gray-300',

                transition: {
                  enterActiveClass: 'transition-all duration-200 ease-out',
                  leaveActiveClass: 'transition-all duration-150 ease-in',
                  enterFromClass: 'opacity-0 max-h-0',
                  enterToClass: 'opacity-100 max-h-[1000px]',
                  leaveFromClass: 'opacity-100 max-h-[1000px]',
                  leaveToClass: 'opacity-0 max-h-0'
                }
              }"
            >
              <template #default="{ item, open }">
                <div class="flex w-full items-center gap-4">
                  <div
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors"
                    :class="[
                      open
                        ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'border-gray-300 text-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 group-hover:border-primary-400 group-hover:text-primary-500'
                    ]"
                  >
                    {{ item.index }}
                  </div>

                  <span
                    class="text-base font-medium text-gray-900 dark:text-gray-100 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    v-html="formatTitle(item.question.title)"
                  />
                </div>
              </template>

<template #body="{ item }">
                <div class="py-4 px-6">
       <div class="answer prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert
            prose-p:mt-4 prose-p:mb-4 prose-ul:mt-4 prose-ul:mb-4
            prose-pre:not-prose prose-code:not-prose"  style="
    font-size: 17px;
    line-height: 1.65;
  " >  
                  <PortableText
                      :value="item.question.answer"
                      :components="portableTextComponents"
                    />

</div>

              
                </div>
              </template>
            </UAccordion>


            <div v-else-if="questionsPending" class="py-12 text-center text-gray-500">
              Loading questions for {{ currentTopicLabel }}...
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <UIcon
                  name="i-heroicons-funnel"
                  class="h-6 w-6 text-gray-400"
                />
              </div>
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span v-if="searchQuery">
                  No questions match your search for
                  <strong>"{{ searchQuery }}"</strong> in
                  <strong>{{ currentTopicLabel }}</strong>.
                  <button
                    @click="searchQuery = ''"
                    class="mt-2 block text-primary hover:underline mx-auto"
                  >
                    Clear Search
                  </button>
                </span>
                <span v-else>
                  No questions found for the topic
                  <strong>{{ currentTopicLabel }}</strong> yet.
                </span>
              </p>
            </div>
          </div>
        </template>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style>
/* same CSS */
.answer {
  font-size: 16px;
  line-height: 1.65;
}

.answer h1 {
  font-size: 30px;
  line-height: 1.25;
  margin-top: 1.2em;
}

.answer h2 {
  font-size: 24px;
  line-height: 1.3;
  margin-top: 1em;
}

.answer h3 {
  font-size: 20px;
  line-height: 1.35;
  margin-top: 0.8em;
}

/* Fix bullet/dot that comes from typography/list styling */
.answer pre,
.answer code {
  list-style: none !important;
}
</style>
