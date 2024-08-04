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

with open("cmudict-0.7b", "r") as f:
  cmu_by_len = {}
  to_spelling = {}
  for line in f.readlines():
    (spelling, cmu) = line.split('  ')
    # remove stress annotations from cmu string, except AH0
    cmu = [
      (ph if ph=="AH0" else re.sub('[012]', '', ph))
      for ph in cmu.strip().split(' ')
    ]
    cmu_len = len(cmu)
    cmu = ' '.join(cmu)
    to_spelling[cmu] = to_spelling.get(cmu, []) + [spelling]

    if (cmu_len not in cmu_by_len):
      cmu_by_len[cmu_len] = []
    cmu_by_len[cmu_len].append(cmu)
  for i, listy in cmu_by_len.items():
    print(i, listy)
    cmu_by_len[i] = ',' + ','.join(listy) + ','
  print("lengths:", list(cmu_by_len.keys()))
  with open("cmu_by_len.json", "w") as fout:
    fout.write(json.dumps({
      "cmu_by_len": cmu_by_len,
      "cmu_to_spelling": to_spelling,
    }))
