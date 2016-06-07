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
var HmapMenu = (function () {
    function HmapMenu() {
        this.selMapView = new core_1.EventEmitter();
    }
    HmapMenu.prototype.mapViewClick = function (evt) {
        console.log(evt.target.value);
        if (evt.target.value !== this._translatedMapView) {
            this.selMapView.emit(evt.target.value);
        }
    };
    HmapMenu.prototype.ngOnInit = function () {
        console.log('HMAP MENU INPUT VALUE');
        console.log(this.mapView);
        this.mapViews = ['Counties', 'Cities', 'Census Tracts', 'School Districts'];
    };
    HmapMenu.prototype.ngOnChanges = function (changes) {
        console.log('Change detected:', changes);
        console.log(changes['mapView'].currentValue);
        if (changes['mapView'].currentValue !== changes['mapView'].previousValue) {
            switch (changes['mapView'].currentValue) {
                case 'Counties':
                    this._translatedMapView = 'Counties';
                    break;
                case 'Places':
                    this._translatedMapView = 'Cities';
                    break;
                case 'Tracts':
                    this._translatedMapView = 'Census Tracts';
                    break;
                case 'School District':
                    this._translatedMapView = 'School Districts';
                    break;
                default:
                    break;
            }
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], HmapMenu.prototype, "mapView", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], HmapMenu.prototype, "selMapView", void 0);
    HmapMenu = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'hmap-menu',
            templateUrl: './shared/components/data_tile/hmap-menu/hmap-menu.html',
            styleUrls: ['./shared/components/data_tile/hmap-menu/hmap-menu.css']
        }), 
        __metadata('design:paramtypes', [])
    ], HmapMenu);
    return HmapMenu;
})();
exports.HmapMenu = HmapMenu;
//# sourceMappingURL=hmap.menu.component.js.map