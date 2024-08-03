#!/usr/bin/env python3

import json

with open("wordnik-20210729-withquotes.txt", "r") as f:
  words_by_len = {}
  for line in f.readlines():
    word = line.split('"')[1]  # remove the quotes
    if (len(word) not in words_by_len):
      words_by_len[len(word)] = []
    words_by_len[len(word)].append(word)
  for i, listy in words_by_len.items():
    print(i, listy)
    words_by_len[i] = ' ' + '  '.join(listy) + ' '
  with open("wordnik_by_len.json", "w") as fout:
    fout.write(json.dumps(words_by_len))
