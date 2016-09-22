var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var MapLeafletComponent = (function () {
    function MapLeafletComponent(_router) {
        this._router = _router;
        this.onPlaceSelected = new core_1.EventEmitter();
        this.currentCoords = [44, -121.5];
        this.currentZoom = 5.5;
        this.detailViewOffset = -300;
        this.crt_layers_url = 'http://lib-arcgis5.library.oregonstate.edu/arcgis/rest/services/people_communities/oe_crt/MapServer';
        this.crt_layer_cities_id = 1;
        this.crt_layer_tracts_id = 2;
        this.crt_layer_counties_id = 3;
        this.processedCity = false;
        this.processedCounty = false;
        this.processedTract = false;
        this.oregon = {
            Name: 'Oregon',
            ResID: '41',
            Type: 'Oregon',
            TypeCategory: 'State',
            Desc: 'Oregon'
        };
        this.california = {
            Name: 'California',
            ResID: '06',
            Type: 'California',
            TypeCategory: 'State',
            Desc: 'California'
        };
        this.labels = {};
    }
    MapLeafletComponent.prototype.loadMap = function () {
        console.log('start loadmap', this.selectedPlaces);
        if (!this.map) {
            this.map = L.map('map', {
                zoomControl: false
            });
            this.setInitialMapView();
            var mapScope = this;
            this.map.on('popupopen', function (evt) {
                console.log('popup', evt);
                mapScope.handlePopupPlaceClick(mapScope);
            });
            this.map.createPane('labels');
            this.map.getPane('labels').style.zIndex = 650;
            this.map.getPane('labels').style.pointerEvents = 'none';
            L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }).addTo(this.map);
            var baseMapLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                pane: 'labels',
                minZoom: 1,
                maxZoom: this.viewType === 'indicatorDetail' ? 7 : 8
            });
            baseMapLabels.addTo(this.map);
            var ctTypes = ['Tracts', 'Unincorporated Place'];
            var hasCT = this.selectedPlaces ? this.selectedPlaces.filter(function (place) { return ctTypes.indexOf(place.TypeCategory) !== -1; }) : [];
            this.crt_layers = L.esri.dynamicMapLayer({
                url: this.crt_layers_url,
                opacity: 0.7,
                layers: hasCT.length > 0 ? [this.crt_layer_cities_id, this.crt_layer_tracts_id, this.crt_layer_counties_id] : [this.crt_layer_cities_id, this.crt_layer_counties_id],
                useCors: true
            }).addTo(this.map);
            baseMapLabels.bringToFront();
            var identifiedGeoJsonStyle = {
                'color': '#C34500',
                'opacity': 0.2
            };
            var selectedLayerStyle = {
                'color': '#244068',
                'opacity': 0.2
            };
            this.identifiedLayer = L.geoJson(null, {
                style: identifiedGeoJsonStyle
            }).addTo(this.map);
            this.selectedLayer = L.geoJson(null, {
                style: selectedLayerStyle,
            }).addTo(this.map);
            this.map.on('popupclose', function (e) {
                mapScope.identifiedLayer.clearLayers();
            });
            L.Control.zoomHome = L.Control.extend({
                options: {
                    position: 'topright',
                    zoomInText: '+',
                    zoomInTitle: 'Zoom in',
                    zoomOutText: '-',
                    zoomOutTitle: 'Zoom out',
                    zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
                    zoomHomeTitle: 'Zoom home'
                },
                onAdd: function (map) {
                    var controlName = 'gin-control-zoom', container = L.DomUtil.create('div', controlName + ' leaflet-bar'), options = this.options;
                    this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle, controlName + '-in', container, this._zoomIn);
                    this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle, controlName + '-home', container, this._zoomHomeWrapper);
                    this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle, controlName + '-out', container, this._zoomOut);
                    this._updateDisabled();
                    map.on('zoomend zoomlevelschange', this._updateDisabled, this);
                    return container;
                },
                onRemove: function (map) {
                    map.off('zoomend zoomlevelschange', this._updateDisabled, this);
                },
                _zoomIn: function (e) {
                    this._map.zoomIn(e.shiftKey ? 3 : 1);
                },
                _zoomOut: function (e) {
                    this._map.zoomOut(e.shiftKey ? 3 : 1);
                },
                _zoomHomeWrapper: function (e) {
                    this._zoomHome(e);
                    var zoomScope = this;
                    if (mapScope.viewType === 'indicatorDetail') {
                        window.setTimeout(function () {
                            zoomScope._zoomHome(e);
                        }, 500);
                    }
                },
                _zoomHome: function (e) {
                    if (mapScope.viewType === 'indicatorDetail') {
                        this._map.setZoom(6);
                        this._map.panToOffset([44, -121.5], [mapScope.detailViewOffset, 0]);
                    }
                    else {
                        this._map.setView([44, -121.5], 5.5);
                    }
                },
                _createButton: function (html, title, className, container, fn) {
                    var link = L.DomUtil.create('a', className, container);
                    link.innerHTML = html;
                    link.href = '#';
                    link.title = title;
                    L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                        .on(link, 'click', L.DomEvent.stop)
                        .on(link, 'click', fn, this)
                        .on(link, 'click', this._refocusOnMap, this);
                    return link;
                },
                _updateDisabled: function () {
                    var map = this._map, className = 'leaflet-disabled';
                    L.DomUtil.removeClass(this._zoomInButton, className);
                    L.DomUtil.removeClass(this._zoomOutButton, className);
                    if (map._zoom === map.getMinZoom()) {
                        L.DomUtil.addClass(this._zoomOutButton, className);
                    }
                    if (map._zoom === map.getMaxZoom()) {
                        L.DomUtil.addClass(this._zoomInButton, className);
                    }
                }
            });
            var zoomHome = new L.Control.zoomHome();
            zoomHome.addTo(this.map);
            var locate = L.control.locate({
                position: 'topright',
                icon: 'fa fa-location-arrow',
                setView: 'once',
            });
            locate.addTo(this.map);
            function onLocationFound(e) {
                if (mapScope.viewType === 'indicatorDetail') {
                    mapScope.map.panToOffset(e.latlng, [mapScope.detailViewOffset, 100]);
                }
            }
            this.map.on('locationfound', onLocationFound);
            this.countyBtn = this.createLayerBtn('Counties', 3);
            this.tractBtn = this.createLayerBtn('Tracts', 2);
            this.cityBtn = this.createLayerBtn('Cities', 1);
            L.easyBar([this.countyBtn, this.tractBtn, this.cityBtn]).addTo(this.map);
            if (hasCT.length === 0) {
                this.tractBtn.state('layer-inactive');
            }
            this.setDetailView();
            this.crt_layers.bindPopup(function (error, featureCollection, resp) {
                if (error || featureCollection.features.length === 0) {
                    mapScope.identifiedLayer.clearLayers();
                    return false;
                }
                else {
                    mapScope.identifiedLayer.clearLayers();
                    var returnText = '';
                    if (featureCollection.features.length > 0) {
                        mapScope.identifiedLayer.addData(featureCollection.features);
                        if (mapScope.viewType === 'indicatorDetail') {
                            mapScope.map.fitBounds(mapScope.identifiedLayer.getBounds(), {
                                paddingTopLeft: new L.Point(mapScope.detailViewOffset - 100, 100)
                            });
                        }
                        else {
                            mapScope.map.fitBounds(mapScope.identifiedLayer.getBounds());
                        }
                        var counties = featureCollection.features.filter(function (feature) { return feature.layerId === mapScope.crt_layer_counties_id; });
                        var tracts = featureCollection.features.filter(function (feature) { return feature.layerId === mapScope.crt_layer_tracts_id; });
                        var cities = featureCollection.features.filter(function (feature) { return feature.layerId === mapScope.crt_layer_cities_id; });
                        if (counties.length > 0) {
                            returnText += '<div class="ptHeading">County</div>';
                            counties.forEach(function (feature) {
                                var featProp = mapScope.createDataFeature('County', feature.properties);
                                returnText += '<div class="ptPlaceWrapper" data-feature=\'' + featProp + '\'>';
                                returnText += '<div class="ptPlace">' + feature.properties.NAMELSAD10 + '</div>';
                                returnText += '</div>';
                            });
                        }
                        if (tracts.length > 0) {
                            returnText += '<div class="ptHeading">Census Tract</div>';
                            tracts.forEach(function (feature) {
                                var featProp = mapScope.createDataFeature('Tract', feature.properties);
                                returnText += '<div class="ptPlaceWrapper" data-feature=\'' + featProp + '\'>';
                                returnText += '<div class="ptPlace">' + feature.properties.NAMELSAD10 + '</div>';
                                returnText += '<div class="ptContainsPartOf">';
                                returnText += feature.properties.CONTAINS_A !== '' ? '<span><b>Contains:</b> ' + feature.properties.CONTAINS_A + '</span>' : '';
                                returnText += feature.properties.PART_OF !== ' ' ? '<span><b>Part of:</b> ' + feature.properties.PART_OF + '</span>' : '';
                                returnText += '</div>';
                                returnText += '</div>';
                            });
                        }
                        if (cities.length > 0) {
                            returnText += '<div class="ptHeading">City</div>';
                            cities.forEach(function (feature) {
                                var featProp = mapScope.createDataFeature('City', feature.properties);
                                returnText += '<div class="ptPlaceWrapper" data-feature=\'' + featProp + '\'>';
                                returnText += '<div class="ptPlace">' + feature.properties.name + '</div>';
                                returnText += '</div>';
                            });
                        }
                    }
                    return returnText;
                }
            }, {
                maxWidth: 200,
                minWidth: 100,
                maxHeight: 200,
                className: 'identLayersPopup',
            });
        }
    };
    MapLeafletComponent.prototype.handlePopupPlaceClick = function (mapScope) {
        $('.ptPlaceWrapper').on('click', function (feature) {
            var place = $(feature.currentTarget).data('feature');
            if (!mapScope.viewType) {
                var places = '';
                if (place.ResID.indexOf('41') === 0) {
                    places = encodeURIComponent(JSON.stringify(mapScope.oregon));
                }
                else {
                    places = encodeURIComponent(JSON.stringify(mapScope.california));
                }
                place = encodeURIComponent(JSON.stringify(place));
                places += ',' + place;
                mapScope._router.navigate(['Explore', { places: places }]);
                window.scrollTo(0, 0);
            }
            else {
                var identLayer = mapScope.identifiedLayer.getLayers().filter(function (layer) {
                    return layer.feature.properties.GEOID10 ? layer.feature.properties.GEOID10 === $(feature.currentTarget).data('feature').ResID : layer.feature.properties.geoid === $(feature.currentTarget).data('feature').ResID;
                });
                console.log('removing layer', identLayer);
                mapScope.identifiedLayer.removeLayer(identLayer[0]);
                console.log('identLayer', mapScope.identifiedLayer.getLayers());
                mapScope.onPlaceSelected.emit($(feature.currentTarget).data('feature'));
            }
        });
    };
    MapLeafletComponent.prototype.setDetailView = function () {
        if (this.viewType === 'indicatorDetail') {
            var leftPadding = $('.crt-logo').css('padding-left');
            $('.leaflet-left').css('left', leftPadding);
            var rightPadding = (530 + parseInt(leftPadding.replace('px', ''))) + 'px';
            $('.leaflet-right').css('right', rightPadding);
        }
    };
    MapLeafletComponent.prototype.setInitialMapView = function () {
        var initialCoords = [44, -121.5];
        var initialZoom = this.viewType === 'indicatorDetail' ? 6 : 5.5;
        this.map.setView(initialCoords, initialZoom);
        var mapScope = this;
        if (this.viewType === 'indicatorDetail') {
            window.setTimeout(function () {
                mapScope.map.panToOffset(mapScope.map.getCenter(), [mapScope.detailViewOffset, 0]);
            }, 500);
            var timeOut;
            this.map.on('resize', function () {
                console.log('mapresizing');
                clearTimeout(timeOut);
                timeOut = setTimeout(function () {
                    if (mapScope.selectedLayer.getLayers().length > 0) {
                        var center = mapScope.selectedLayer.getBounds().getCenter();
                        mapScope.map.panToOffset(center, [mapScope.detailViewOffset, 0]);
                    }
                    else {
                        mapScope.map.panToOffset(mapScope.map.getCenter(), [mapScope.detailViewOffset, 0]);
                    }
                }, 500);
                mapScope.setDetailView();
            });
        }
    };
    MapLeafletComponent.prototype.createDataFeature = function (dataType, properties) {
        var returnData = '';
        var returnObj = {};
        switch (dataType) {
            case 'County':
                returnObj = {
                    'Name': properties.NAMELSAD10,
                    'ResID': properties.GEOID10,
                    'Type': 'Place',
                    'TypeCategory': 'Counties',
                    'Desc': 'County'
                };
                break;
            case 'Tract':
                returnObj = {
                    'Name': properties.NAMELSAD10,
                    'ResID': properties.GEOID10,
                    'Type': 'Place',
                    'TypeCategory': 'Tracts',
                    'Desc': 'Tracts'
                };
                break;
            case 'City':
                returnObj = {
                    'Name': properties.name,
                    'ResID': properties.geoid,
                    'Type': 'Place',
                    'TypeCategory': 'Incorporated City',
                    'Desc': 'From Map'
                };
                break;
            default:
                break;
        }
        returnData = JSON.stringify(returnObj);
        console.log('json', returnData);
        return returnData;
    };
    MapLeafletComponent.prototype.createLayerBtn = function (layerName, layerId) {
        var mapScope = this;
        var btn = L.easyButton({
            states: [{
                    stateName: 'layer-active',
                    icon: '<span>' + layerName + '</span>',
                    title: 'Turn ' + layerName + ' layer off',
                    onClick: function (btn, map) {
                        var currLayers = mapScope.crt_layers.getLayers();
                        console.log('currlayers', currLayers);
                        if (currLayers.length === 1) {
                            currLayers = [];
                        }
                        else {
                            currLayers.indexOf(layerId) === -1 ? currLayers.push(layerId) : currLayers.splice(currLayers.indexOf(layerId), 1);
                        }
                        mapScope.crt_layers.setLayers(currLayers);
                        btn.state('layer-inactive');
                    }
                },
                {
                    stateName: 'layer-inactive',
                    icon: '<span>' + layerName + '</span>',
                    title: 'Turn ' + layerName + ' layer on',
                    onClick: function (btn, map) {
                        var currLayers = mapScope.crt_layers.getLayers();
                        currLayers.indexOf(layerId) === -1 ? currLayers.push(layerId) : currLayers.splice(currLayers.indexOf(layerId), 1);
                        mapScope.crt_layers.setLayers(currLayers);
                        btn.state('layer-active');
                    }
                }
            ]
        });
        return btn;
    };
    MapLeafletComponent.prototype.ngOnInit = function () {
        console.log('mapload', this.viewType);
        try {
            console.log('mapload check offset', $('.crt-logo').css('padding-left'));
            this.loadMap();
        }
        catch (ex) {
            console.log(ex);
            this.loadMap();
        }
    };
    MapLeafletComponent.prototype.ngOnChanges = function (changes) {
        console.log('map input changed', changes);
        if (!this.map) {
            console.log('map not loaded');
            this.loadMap();
        }
        if (changes.selectedPlaces) {
            console.log('selectedPlaces', changes.selectedPlaces);
            var selPlaces = changes.selectedPlaces.currentValue;
            this.runSelectedPlaceQueries(selPlaces);
        }
    };
    MapLeafletComponent.prototype.runSelectedPlaceQueries = function (selPlaces) {
        this.processedCity = false;
        this.processedCounty = false;
        this.processedTract = false;
        var selectedCities = selPlaces.filter(function (place) {
            return place.TypeCategory === 'Incorporated City' || place.TypeCategory === 'Incorporated Town' || place.TypeCategory === 'Census Designated Place' || place.TypeCategory === 'Places';
        });
        var selectedCounties = selPlaces.filter(function (place) { return place.TypeCategory === 'Counties' || place.TypeCategory === 'County'; });
        var selectedTracts = selPlaces.filter(function (place) {
            return place.TypeCategory === 'Census Tract' || place.TypeCategory === 'Unincorporated Place';
        });
        var mapScope = this;
        this.selectedLayer.clearLayers();
        for (var id in this.labels) {
            console.log('clearing labels', this, id);
            mapScope.map.removeLayer(mapScope.labels[id]);
        }
        if (selectedCities.length > 0) {
            var cityGeoids = '';
            selectedCities.forEach(function (city) {
                cityGeoids += '\'' + city.ResID + '\',';
            });
            cityGeoids = cityGeoids.substring(0, cityGeoids.length - 1);
            this.crt_layers.query()
                .layer(this.crt_layer_cities_id)
                .where('geoid in (' + cityGeoids + ')')
                .simplify(this.map, 0)
                .run(function (err, featureCollection, response) {
                mapScope.selectedLayer.addData(featureCollection.features);
                mapScope.processedCity = true;
            });
        }
        else {
            this.processedCity = true;
        }
        if (selectedCounties.length > 0) {
            var geoids = '';
            selectedCounties.forEach(function (county) {
                geoids += '\'' + county.ResID + '\',';
            });
            geoids = geoids.substring(0, geoids.length - 1);
            this.crt_layers.query()
                .layer(this.crt_layer_counties_id)
                .where('GEOID10 in (' + geoids + ')')
                .simplify(this.map, 0)
                .run(function (err, featureCollection, response) {
                mapScope.selectedLayer.addData(featureCollection.features);
                mapScope.processedCounty = true;
            });
        }
        else {
            this.processedCounty = true;
        }
        if (selectedTracts.length > 0) {
            var geoids = '';
            selectedTracts.forEach(function (tract) {
                geoids += '\'' + tract.ResID + '\',';
            });
            geoids = geoids.substring(0, geoids.length - 1);
            this.crt_layers.query()
                .layer(this.crt_layer_tracts_id)
                .where('GEOID10 in (' + geoids + ')')
                .simplify(this.map, 0)
                .run(function (err, featureCollection, response) {
                mapScope.selectedLayer.addData(featureCollection.features);
                var currLayers = mapScope.crt_layers.getLayers();
                currLayers.indexOf(mapScope.crt_layer_tracts_id) === -1 ? currLayers.push(mapScope.crt_layer_tracts_id) : currLayers.splice(currLayers.indexOf(mapScope.crt_layer_tracts_id), 1);
                mapScope.crt_layers.setLayers(currLayers);
                mapScope.tractBtn.state('layer-active');
                mapScope.processedTract = true;
            });
        }
        else {
            this.processedTract = true;
        }
        var runInterval = setInterval(runCheck, 500);
        function runCheck() {
            if (mapScope.processedCity && mapScope.processedCounty && mapScope.processedTract) {
                console.log('finished getting query results');
                clearInterval(runInterval);
                if (mapScope.selectedLayer.getLayers().length > 0) {
                    var center = mapScope.selectedLayer.getBounds().getCenter();
                    if (mapScope.viewType === 'indicatorDetail') {
                        mapScope.map.panToOffset(center, [mapScope.detailViewOffset, 0]);
                    }
                    else {
                        mapScope.map.fitBounds(mapScope.selectedLayer.getBounds());
                    }
                }
                else {
                    mapScope.setInitialMapView();
                }
            }
            else {
                console.log('still waiting for query finish');
            }
        }
    };
    MapLeafletComponent.prototype.refreshMap = function () {
        window.dispatchEvent(new Event('resize'));
        this.setInitialMapView();
        if (this.selectedLayer.getLayers().length > 0) {
            var mapScope = this;
            window.setTimeout(function () {
                mapScope.map.fitBounds(mapScope.selectedLayer.getBounds());
                if (mapScope.viewType === 'indicatorDetail') {
                    mapScope.map.panToOffset(mapScope.map.getCenter(), [mapScope.detailViewOffset, 0]);
                }
            }, 500);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], MapLeafletComponent.prototype, "viewType", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], MapLeafletComponent.prototype, "isVisible", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], MapLeafletComponent.prototype, "selectedPlaces", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], MapLeafletComponent.prototype, "onPlaceSelected", void 0);
    MapLeafletComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'leaflet-map',
            templateUrl: 'map.leaflet.component.html',
            styleUrls: ['map.leaflet.component.css']
        }), 
        __metadata('design:paramtypes', [router_1.Router])
    ], MapLeafletComponent);
    return MapLeafletComponent;
})();
exports.MapLeafletComponent = MapLeafletComponent;
//# sourceMappingURL=map.leaflet.component.js.map