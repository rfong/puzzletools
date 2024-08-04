#!/usr/bin/env python3
'''
Map a cmudict file to a JSON file containing:
{
  "cmu_by_len": {phoneme_len : <concatenated words of that len>},
  "cmu_to_spelling": {cmu_word : [<spellings matching that pronunciation>]}
}
'''

import json
import re

from trie import make_trie, Trie

# get wordnik for filtering
with open("../wordnik-20210729-withquotes.txt", "r") as f:
  print("parsing wordnik")
  wordnik = [
    line.strip().split('"')[1].upper()
    for line in f.readlines()
  ]
  print("parsed wordnik; %d entries" % len(wordnik))

  print("building lookup trie of wordnik entries")
  wordnik_lookup = make_trie(wordnik)
  print("built trie")
print()

# parse cmudict
with open("cmudict-0.7b", "r") as f:
  # dicts for vanilla cmu
  cmu_by_len = {}   # {<ipa_len>:[glosses]}
  to_spelling = {}  # {ipa:[spellings]}
  # dicts for wordnik variants
  cmu_by_len_wn = {}
  to_spelling_wn = {}

  print("parsing cmudict")
  # for each cmudict entry
  for line in f.readlines():
    (spelling, cmu) = line.split('  ')
    # remove stress annotations from cmu string, except AH0
    cmu = [
      (ph if ph=="AH0" else re.sub('[012]', '', ph))
      for ph in cmu.strip().split(' ')
    ]
    cmu_len = len(cmu)
    cmu = ' '.join(cmu)

    if (cmu_len not in cmu_by_len):
      cmu_by_len[cmu_len] = []
    cmu_by_len[cmu_len].append(cmu)
    to_spelling[cmu] = to_spelling.get(cmu, []) + [spelling]

    # wordnik filter
    if (wordnik_lookup.has(spelling)):
      if (cmu_len not in cmu_by_len_wn):
        cmu_by_len_wn[cmu_len] = []
      cmu_by_len_wn[cmu_len].append(cmu)
      to_spelling_wn[cmu] = to_spelling_wn.get(cmu, []) + [spelling]

  print("# of unique cmu glosses:", len(to_spelling.keys()))
  print("# of unique cmu!wordnik glosses:", len(to_spelling_wn.keys()))

# output
with open("cmu_by_len.json", "w") as fout:
  fout.write(json.dumps({
    "cmu_by_len": {
      cmu: (',' + ','.join(spellings) + ',')
      for (cmu, spellings) in cmu_by_len.items()
    },
    "cmu_to_spelling": to_spelling,
  }))
  print("wrote json output to cmu_by_len.json")

# wordnik output
with open("cmu_wordnik_by_len.json", "w") as fout:
  fout.write(json.dumps({
    "cmu_by_len": {
      cmu: (',' + ','.join(spellings) + ',')
      for (cmu, spellings) in cmu_by_len_wn.items()
    },
    "cmu_to_spelling": to_spelling_wn,
  }))
  print("wrote json output to cmu_wordnik_by_len.json")

