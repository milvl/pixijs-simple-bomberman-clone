npm run clean
mkdir dist
cp -r img dist
cp -r audio dist
cp -r fonts dist
cp favicon.ico dist
parcel build index.html game.html