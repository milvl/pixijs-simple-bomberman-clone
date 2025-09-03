Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path dist
Copy-Item -Recurse img -Destination dist\img
Copy-Item -Recurse audio -Destination dist\audio
Copy-Item -Recurse fonts -Destination dist\fonts
Copy-Item favicon.ico -Destination dist\
parcel build index.html game.html
