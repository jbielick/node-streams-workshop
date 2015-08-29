feature=$1

for file in ./$feature/*.zip
do
  ogr2ogr \
    -t_srs crs:84 \
    -f "GeoJSON" \
    /vsistdout/ /vsizip/$file | \
    ./pluck-features.js | \
    mongoimport \
      --jsonArray \
      --upsert \
      --upsertFields properties.GEOID10 \
      --collection \
      --db geo \
      $feature
done
