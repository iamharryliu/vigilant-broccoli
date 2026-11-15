# Language Learning

- The home page's **Language** tab (`/?tab=Language`) shows one random everyday word in English, Swedish, French, Spanish and Chinese, each with common synonyms (and pinyin for Chinese). The refresh button loads a new word.
- Words come from the local `EVERYDAY_WORDS` list (`src/app/constants/everyday-words.ts`), not from the LLM: frequency-ranked base forms from `wordfreq`'s top 3,500, filtered through WordNet to drop proper nouns, inflected forms, numerals and function words, plus hand-written phrases. The generator script is not in the repo; regenerate the list the same way rather than editing it by hand.
- The All/Nouns/Adjectives/Verbs/Phrases tabs filter the pool. All picks a type first with equal odds, so the short phrase list is not drowned out by nouns.
- The server (`/api/language-learning/word`) picks the word; the LLM only translates it and returns synonyms, its part of speech and its antonym.
- Seen words are stored in the browser (`localStorage`, not synced between devices) and the latest 300 are excluded from picking. When a tab runs out of unseen words, the pool restarts instead of failing.
- The "Seen words" toggle lists them newest first; × removes one so it can return, and "Clear all" (after confirmation) empties the list.
- **Opposite** appears when the word has a natural antonym of the same part of speech and loads that word. It comes from the LLM, so it may not be on the word list, and it still counts as seen.
- Each row's speaker plays the word at 0.75× through `/api/text-to-speech`, an authenticated vb-express proxy. The sentence button asks the LLM for one short example sentence in that language, shown with an English translation (and pinyin) and its own speaker; each click gives a new one, and sentences clear when the word changes.
- Clicking a word copies it to the clipboard and briefly shows "Copied". Clipboard access needs HTTPS or `localhost`.
