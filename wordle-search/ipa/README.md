# cmudict notes
both homophones and homonyms are present.

all lengths:
- 134303 total entries
- 133457 unique spellings
- 115377 unique pronunciations

5-phoneme words:
- 23222 total entries (`wc -l`)
- 23217 unique spellings (`cut -d' ' -f1 | sort -u | wc -l`)
- 19925 unique pronunciations (`cut -d' ' -f3- | sort -u | wc -l`)

## is preprocessing worth the time?

filesizes:
- original cmudict: 3716713 bytes
- naive json file with ipa by length plus spelling map: 6719394 bytes

5-phoneme filesizes:
- original cmudict: 518389 bytes
- naive json file with only ipa by length: 330873 bytes
- naive json file also with ipa to spelling map preprocessed: 948923 bytes
- cmudict lines direct to json: 680943 bytes

shrinking the filesize (if necessary)
- [ ] use a trie
- [ ] remove unused stress annotations

TODO performance: ?
