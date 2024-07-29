### This script is used to build a JSON file containing all the rubric data.

import json
import os

with open("rubrics.json", "w") as f:
  rubrics = {}
  # each line corresponds to a language's scrabble rubric definition
  for fname in os.listdir("rubrics"):
    if not fname.endswith(".txt"):
      continue
    lang = fname.split(".")[0]
    with open("rubrics/"+fname, "r") as rubricFile:
      rubrics[lang] = rubricFile.read().strip()

  f.write(json.dumps(rubrics))
