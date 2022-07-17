// import 'ol/ol.css';
// import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
// import TileLayer from 'ol/layer/Tile';
// import View from 'ol/View';
// import WMTS from 'ol/source/WMTS';
// import WMTSTileGrid from 'ol/tilegrid/WMTS';
// import {get as getProjection} from 'ol/proj';
// import {getTopLeft, getWidth} from 'ol/extent';

const projection = ol.proj.get('EPSG:3857');
const projectionExtent = projection.getExtent();
const size = ol.extent.getWidth(projectionExtent) / 256;
const resolutions = new Array(19);
const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
function init(){
    const map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM(),
          }),
          new ol.layer.Tile({
            opacity: 0.7,
            source: new ol.source.WMTS({
              url: 'http://localhost:8080/geoserver/coplug/wms',
              layer: 'lso_mt_geo',
              matrixSet: 'GoogleMapsCompatible',
              format: 'image/png',
              projection: projection,
              tileGrid: ol.tileGrid.createFromCapabilitiesMatrixSet({
                origin: ol.extent.getTopLeft(projectionExtent),
                resolutions: resolutions,
                matrixIds: matrixIds,
              }),
              style: 'default',
              wrapX: true,
            }),
          }),
        ],
        target: 'map',
        view: new ol.View({
          center: [-11158582, 4813697],
          zoom: 4,
        }),
      });
}
