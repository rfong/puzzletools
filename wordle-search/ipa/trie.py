'''
Simple trie for looking up string inclusion in large wordbanks.
- No additional values stored at leaves; only the string tokens themselves.
- Nodes do not know their parents; we are only traversing downward.
- Assume tokens may be multicharacter strings; all "words" will be assumed to 
  be lists of tokens, rather than strings.
'''

def make_trie(word_list):
  trie = Trie()
  for word in word_list:
    trie.insert(word)
  return trie

class Trie(object):
  # a trie node
  def __init__(self):
    self.children = {}

  def insert(self, tokens):
    '''a list of tokens is coming downward; insert it into the trie'''
    if len(tokens)==0:
      return
    tok = tokens[0]
    if (tok not in self.children):
      self.children[tok] = Trie()
    self.children[tok].insert(tokens[1:])

  def has(self, tokens):
    '''return true if this chain of tokens exists in our trie'''
    if len(tokens)==0:
      return True
    if tokens[0] not in self.children:
      return False
    return self.children[tokens[0]].has(tokens[1:])

