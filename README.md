# node-streams-workshop
streams, pipes, transformations and utilities to deal with large data in node

This collection of scripts downloads, converts, massages and imports the U.S. Census Bureau TIGER shapefiles into a local mongo database using node streams and unix pipes.

You'll need `ogr2ogr` (`gdal`) for this as well as a local mongo server running on the default port.

`brew install ogr2ogr`

### Download Shapefiles:

`zcta5` is the postal code feature. Other features can be found at the top of `Makefile`.

`make zcta4.zip` will download the zip files in the TIGER2014 ftp folder and place them in `./zcta5`

### Convert and Import

You can then run `./mongo-batch-import zcta5` to convert all of the features in the zip file to GeoJSON and stream them into a local mongo database named `geo`. Change the script as necessary to include your database settings. The command used is `mongoimport`.

Create a `2dsphere` index on the `geometry` field.

Example:

`db.postalcodes.ensureIndex('2dsphere', 'geometry')`
