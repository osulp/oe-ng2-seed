import {Injectable} from 'angular2/core';
import {Jsonp, URLSearchParams} from 'angular2/http';
@Injectable()
export class GetGeoJSONService {
    constructor(private jsonp: Jsonp) { }
    load(placeType: string, mostRecent: boolean) {
        let serviceUrl = 'http://oe.oregonexplorer.info/rural/crt_rest_api/geojson';
        var params = new URLSearchParams();
        //params.set('term', term); // the user's search value        
        params.set('f', 'json');
        params.set('callback', 'JSONP_CALLBACK');
        return this.jsonp
            .get(serviceUrl, { search: params })
            .map(request => <string[]>request.json());
    }
}
