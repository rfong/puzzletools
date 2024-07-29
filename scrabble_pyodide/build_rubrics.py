### This script is used to build a py file containing all the rubric data.

import json
import os

with open("rubrics.py", "w") as f:
  f.write("RAW_RUBRICS = {")
  for fname in os.listdir("rubrics"):
    if not fname.endswith(".txt"):
      continue
    lang = fname.split(".")[0]
    with open("rubrics/"+fname, "r") as rubricFile:
      f.write("'{lang}': '''{scores}''', ".format(lang=lang, scores=rubricFile.read().strip()))

  f.write("}")
