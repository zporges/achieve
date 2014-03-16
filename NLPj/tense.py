import en
import nltk

pastTenseMap = ({"bless": "blessed", "bolt": "bolted", "burn": "burned", "color": "colored", "drag": "dragged", 
    "dream": "dreamed", "escape": "escaped", "fax": "faxed", "find": "found", "grip": "gripped", 
    "heat": "heated", "kneel": "kneeled", "learn": "learned", "level": "leveled", "offer": "offered",
    "plug": "plugged", "program": "programmed", "queue": "queued", "rhyme": "rhymed", "smell": "smelled",
    "spell": "spelled", "spill": "spilled", "spoil": "spoiled", "travel": "traveled", "use": "used",
    "wrap": "wrapped", "x-ray": "x-rayed",
                    
    "bite": "bit", "get": "got", 
    "lay": "laid", "leave": "left", "pay": "paid", "'s": "was"})

"""
def processQuotations(tagged):
    newTagged = []
    quote = ""
    for phrase in tagged:
        word = phrase[0]
        if word != "''" and word != "``":
            if len(quote) == 0:
                newTagged.append(phrase)
            else:
                quote += word + " "
        elif len(quote) != 0:
            quote = quote.strip() + '"'
            newTagged.append([quote, "QUOTE"])
            quote = ""
        else:
            quote = '"'
    return newTagged


def transformToPastTense(sentence):
    tokens = nltk.word_tokenize(sentence)
    tagged = nltk.pos_tag(tokens)
    tagged = processQuotations(tagged)
    
    #entities = nltk.chunk.ne_chunk(tagged)
    #print entities
    
    text = ""
    for phrase in tagged:
        #print phrase
        word = phrase[0]
        tag = phrase[1]
        if tag != "QUOTE":
            word = word.lower()
        newWord = word
        
        #process pronouns
        if word == "my":
            newWord = "his/her"
        elif word == "i":
            newWord = "s/he"
        
        #words that weren't correctly labeled as verbs
        if word == "pour" or word == "rely":
            tag = "VB"
            
        if tag.startswith("VB") and tag != "VBG" and tag != "VBN":
            #verbs that are conjugated incorrectly
            global pastTenseMap
            if word in pastTenseMap:
                newWord = pastTenseMap[word]
            else:
                try:
                    newWord = en.verb.past(word, person=3)
                except KeyError:
                    text = "I accomplished part of the goal"
                    break
        
        #handles possessions and punctuation
        if (newWord == "'s" and tag == "POS") or newWord == ",":
            text += newWord
        else:
            text += " " + newWord

    return text.strip()
"""
    
def assignTokenToWord(sentence):
    words = sentence.split(" ")
    assignedWords = []
    for i in range(len(words)):
        assignedWords.append([])
        
    tokens = nltk.word_tokenize(sentence)
    tagged = nltk.pos_tag(tokens)
    #tagged = en.sentence.tag(sentence)
    print tagged
    
    for taggedToken in tagged:
        #print taggedToken
        word = taggedToken[0].lower()
        for i in xrange(0, len(words)):
            if words[i].lower().startswith(word):
                assignedWords[i].append(taggedToken)
                words[i] = words[i][len(word):]
                break
            elif words[i].startswith('"') and (word == "''" or word == "``"):
                assignedWords[i].append(('"', taggedToken[1]))
                words[i] = words[i][1:]
                break
                
    return assignedWords
    
def toPastTense(sentence):
    tokenedWords = assignTokenToWord(sentence)
    
    quotesOn = False
    newSentence = ""
    for tokens in tokenedWords:
        text = ""
        for token in tokens:
            #print token
            word = token[0]
            tag = token[1]
            newWord = word
            lowWord = word.lower()
            
            if word == '"' or word == "''" or word == "``":
                quotesOn = not quotesOn
            
            if not quotesOn:
                #process pronouns
                if lowWord == "my":
                    newWord = "his/her"
                elif lowWord == "i":
                    newWord = "s/he"
                
                #words that weren't correctly labeled as verbs
                if lowWord == "pour" or lowWord == "rely":
                    pass#tag = "VBP"
                    
                if tag.startswith("VB") and tag != "VBG" and tag != "VBN" and tag != "VB":
                    #verbs that are conjugated incorrectly
                    global pastTenseMap
                    if lowWord in pastTenseMap:
                        newWord = pastTenseMap[lowWord]
                    else:
                        try:
                            newWord = en.verb.past(lowWord, person=3)
                        except KeyError:
                            text = "I accomplished part of the goal"
                            break
            
            text += newWord
        newSentence += text + " "
    return newSentence.strip()
    
    
#print en.verb.past("want")
#print en.verb.past("be", person=1, negate=True)

sen = "I will exercise because, although I don't have a girlfriend, I don't want to be fat"
sen = "At eight a.m. on Thursday morning Arthur did not feel very good"
tokens = nltk.word_tokenize(sen)
tagged = nltk.pos_tag(tokens)
entities = nltk.ne_chunk(tagged)
print entities

print

#print nltk.parse.api.ParserI.parse(sen)
    
