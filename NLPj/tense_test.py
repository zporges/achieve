import tense

def testTransformToPastTense(num):
    lineNumber = 1
    f = open('verb_phrases_' + num + '.txt', 'r')
    results = open('verb_phrases_results_' + num + '.txt', 'w')
    results.write("")
    results = open('verb_phrases_results_' + num + '.txt', 'a')
    for line in f:
        if line.startswith("#") or len(line.strip()) == 0:
            results.write(line)
            print str(lineNumber) + ": " + line.strip()
        else:
            #word = tense.transformToPastTense("I " + line)
            pretext = "I "
            word = tense.toPastTense(pretext + line)
            results.write(line + " | " + word[3+len(pretext):] + "\n")
            print str(lineNumber) + ": " + word
        lineNumber += 1
    f.close()
        
testTransformToPastTense('3')
