import os

file_paths = [
    # 'package.json',
    'index.html', 
    'js/app.js',
    'js/loader.js',
    'css/style.css',
    ]

res = ''

for file_path in file_paths:
    with open(file_path, 'r') as file:
        res += f'\n\n{os.path.basename(file_path)}:\n'
        res += file.read()
        res += '###EOF###\n'

with open('vytah.txt', 'w') as file:
    file.write(res)