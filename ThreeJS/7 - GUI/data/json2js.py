import json

# root = '/Users/gleb/Projects/AlgoView/ThreeJS/7 - GUI/data/'
root = './'

f = open(root + 'trial_json_full.json', 'r')
data = str(json.load(f)).replace("\'", "\"")
# print(data)
f.close()


f = open(root + 'data.js', 'w')
f.write(f'data = \'{data}\'')
f.close()
