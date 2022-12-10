import json

# root = '/Users/gleb/Projects/AlgoView/ThreeJS/7 - GUI/data/'
root = './'

f = open(root + 'trial_json_full.json', 'r')
data = str(json.load(f)).replace("\'", "\"")
# print(data)
f.close()


f = open(root + 'jsonGraphData.js', 'w')
f.write(f'jsonGraphData = \'{data}\'')
f.close()
