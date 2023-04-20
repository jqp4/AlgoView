import os
import json

# /Users/gleb/Projects/AlgoView/code/data/json2js.py

try:
    os.chdir("./code/data/")
except:
    pass


root = './'
filename = "data"
f = open(root + filename + '.json', 'r')
data = str(json.load(f)).replace("\'", "\"")
# print(data)
f.close()


f = open(root + 'jsonGraphData.js', 'w')
f.write(f'jsonGraphData = \'{data}\'')
f.close()
