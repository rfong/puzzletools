# todos
- [x] filter cmudict by wordnik words
- [ ] bug: empty yellow cells should disappear when cell focus ends

# cmudict notes

## word quality
cmudict contains a significant amount of proper nouns and other non dictionary 
words. filtered by [wordnik](https://github.com/wordnik/wordlist) for higher 
quality results.

## stats
both homophones and homonyms are present.
- 134303 total entries (`wc -l`)
- 133457 unique spellings (`cut -d' ' -f1 | sort -u | wc -l`)
- 115377 unique pronunciations (`cut -d' ' -f3- | sort -u | wc -l`)

## filesize issues
filesizes:
- original cmudict: 3716713 bytes
- naive json file with ipa by length plus spelling map: 6719394 bytes
- json filtered by wordnik words: 2683188 bytes

shrinking the filesize
- [x] remove unused stress annotations (saved ~500Kb)
- [x] wordnik filter (saved ~4Mb)
- [ ] ? convert arpabet to ipa at the preprocessing step? (would have to tokenize dipthongs)
- [ ] use a trie representation
