objects=zcta5 county place state
tiger_url=ftp://ftp2.census.gov/geo/tiger/TIGER2014

zcta5: zcta5.geo.json
county: county.geo.json
place: place.geo.json
state: state.geo.json

%.geo.json: %.zip
	ogr2ogr -t_srs crs:84 -f "GeoJSON" /vsistdout/ /vsizip/$< | \
		./pluck_features.js > $@.tmp
	mv $@.tmp $@

%.zip: %.manifest
	curl $(shell head -n 1 $<) -o $@.download
	mv $@.download $@

%.manifest:
	$(eval url := $(tiger_url)/$(shell echo $* | tr -s '[:lower:]' '[:upper:]')/)
	curl -l $(url) | \
		sort -nr | \
		sed 's,^,$(url)/,' > $*.tmp
	test -s ./$*.tmp && mv $*.tmp $@

clean:
	# pass

.PRECIOUS: %.zip %.geo.json
.INTERMEDIA: %.tmp

.PHONY: clean zcta5 county place state