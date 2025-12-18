// schemas/schemaTypes.ts (or wherever your SchemaTypeDefinition array lives)

import { type SchemaTypeDefinition } from 'sanity'
import question from './question'
import track from './track'
import topic from './topic' // <--- ADD THIS IMPORT!

export const schemaTypes: SchemaTypeDefinition[] = [
    track,
    topic,    // <--- ADD THIS TO THE ARRAY!
    question
]