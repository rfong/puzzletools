import json
import sys

from rubrics import RAW_RUBRICS

class Rubric:
  def __init__(self, lang, scores):
    self.lang = lang
    self.scores = scores
    self.max_token_len = max(len(token) for token in scores)

  def __str__(self):
    return f'Rubric({self.lang},{self.scores})'

class IllegalCharacterError(Exception):
  pass

def parseRubrics():
  # parse raw rubrics into reasonable data
  for lang, raw_text in RAW_RUBRICS.items():
    scores = {} # map tokens to point values
    for line in raw_text.split('\n'):
      line = line.strip()
      score = int(line.split(' ')[0])
      for substr in line.split(':')[1].strip().split(','):
        ch = substr.strip().split(' ')[0]
        scores[ch] = score
    rubrics[lang] = Rubric(lang, scores)
  return rubrics

def find_next_token(text, rubric, start_pos=0):
  '''get next token from `text`, using `rubric`'''
  token_len = rubric.max_token_len
  # search for possible tokens in descending order of token length
  while token_len > 0:
    token = text[start_pos : start_pos+token_len]
    if token in rubric.scores:
      return token
    token_len -= 1
  # if we reached this point, must have an illegal character
  raise IllegalCharacterError(
    "Error: Could not find {lang} token matching {token}.".format(
      lang=getLangName(rubric.lang), token=token))

def tokenize(text, rubric):
  tokens = []
  pos = 0
  while pos < len(text):
    token = find_next_token(text, rubric, start_pos=pos)
    tokens.append(token)
    pos += len(tokens[-1])
  return tokens
  
def scorePhrase(lang, phrase):
  # Return a list of scores for each word in the phrase.
  # If unparseable, return a string message.

  # clean the phrase
  phrase = phrase.strip().upper().replace(".", "").replace(",", "").replace("'","")
  print(phrase)

  rubric = rubrics[lang]

  # tokenize and score each word
  scores = []
  for word in phrase.split(' '):
    try:
      my_tokens = tokenize(word, rubric)
    except IllegalCharacterError as e:
      return str(e)
    word_score = 0
    for token in my_tokens:
      word_score += rubric.scores[token]
    scores.append(word_score)
 
  return scores

def getLangs():
  return list(rubrics.keys())

def getLangName(lang):
  return lang[0].upper() + lang[1:]

rubrics = {}
parseRubrics() 

#print(scorePhrase("polish", "Pchnąć w tę łódź jeża lub ośm skrzyń fig"))
