#!/usr/bin/env python3

import json

with open("cmudict-0.7b", "r") as f:
  ipa_by_len = {}
  to_spelling = {}
  for line in f.readlines():
    (spelling, ipa) = line.split('  ')
    ipa = ipa.strip()
    ipa_len = len(ipa.split(' '))
    to_spelling[ipa] = to_spelling.get(ipa, []) + [spelling]

    if (ipa_len not in ipa_by_len):
      ipa_by_len[ipa_len] = []
    ipa_by_len[ipa_len].append(ipa)
  for i, listy in ipa_by_len.items():
    print(i, listy)
    ipa_by_len[i] = ',' + ','.join(listy) + ','
  print("lengths:", list(ipa_by_len.keys()))
  with open("ipa_by_len.json", "w") as fout:
    fout.write(json.dumps({
      "ipa_by_len": ipa_by_len,
      "ipa_to_spelling": to_spelling,
    }))

#with open("cmudict-5-phonemes", "r") as f:
#  data = [line.strip().split('  ') for line in f.readlines()]
#  with open("cmudict.json", "w") as fout:
#    fout.write(json.dumps(data))
