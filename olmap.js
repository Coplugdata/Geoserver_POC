var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
var uk_lsoa;
var ik_lsoa_vector;
var uk_detailed_layer;
var GEOSERVER_WFS_URL ='http://localhost:8080/geoserver/coplug/wfs?service=WFS';
var GEOSERVER_WMS_URL ='http://localhost:8080/geoserver/coplug/wms?service=wms';
var map;
for (var z = 0; z < 20; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
function initControls(){
  $( "#divMapControls" ).dialog({
    
    position:{  at: "left top+35%"},
    autoOpen: false,
    show: {
      effect: "blind",
      duration: 1000
    },
    hide: {
      effect: "explode",
      duration: 1000
    }
  });
  $( "#divMapControls" ).dialog( "open" );
 
}
function initLegend(){
  $( "#divMapLegend" ).dialog({
    
    position:{  at: "left bottom-35%"},
    autoOpen: false,
    show: {
      effect: "blind",
      duration: 1000
    },
    hide: {
      effect: "explode",
      duration: 1000
    }
  });
  $( "#divMapLegend" ).dialog( "open" );
 
}
function initProgress(trueFalse){
  var progressbar = $( "#progressbar" );
  var progressLabel = $( ".progress-label" );
  $( "#dialog" ).dialog({
    autoOpen: false,
    //closeOnEscape: false,
    resizable: false,
    //buttons: dialogButtons,
    // open: function() {
    //   progressTimer = setTimeout( progress, 2000 );
    // },
    // beforeClose: function() {
    //   downloadButton.button( "option", {
    //     disabled: false,
    //     label: "Start Download"
    //   });
    // }
  })
  progressbar.progressbar({
    value: false,
    change: function() {
      progressLabel.text( progressbar.progressbar( "value" ) + "%" );
    },
    complete: function() {
      progressLabel.text( "Complete!" );
    }
  });
  if (trueFalse){
    $( "#dialog" ).dialog( "open" );
  }
  else{
    $( "#dialog" ).dialog( "close" );
  }
}
function initDetails(){
  $( "#divInfo" ).dialog({
    
    position:{  at: "center bottom-5%"},
    width:'100%',
    autoOpen: false,
    show: {
      effect: "blind",
      duration: 1000
    },
    hide: {
      effect: "explode",
      duration: 1000
    }
  });
  $( "#divInfo" ).dialog( "open" );
 
}
function init(){
  var layers = [];
  var osm =  new ol.layer.Tile({
    maxResolution:50,
    minResolution: 1,
    source: new ol.source.OSM(),
  });
  layers.push(osm);
  var uk_county = new ol.layer.Tile({
    opacity: 0.7,
    maxResolution:3000,
    minResolution:30,
    zIndex:20,
    source: new ol.source.TileWMS({             
      url: 'http://localhost:8080/geoserver/coplug/wms',
      params:{
        layers: 'uk_county',version:'1.1.1'
      },
      

      matrixSet: 'EPSG:3857',
      format: 'image/png',
      projection: projection,
      tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default',
      wrapX: true
    })
  });
  uk_county.on("postrender",function(e){
    document.getElementById('imgLegend').src= 'http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=uk_county';
    
      initLegend();
  })
  uk_lsoa = new ol.layer.Tile({
    opacity:0.7,
    maxResolution:30,
    minResolution: 1,
    zIndex:10,
    title:'oa_mt_geo',
    source: new ol.source.TileWMS({             
      url: 'http://localhost:8080/geoserver/coplug/wms',
      params:{
        layers: 'oa_mt_geo',version:'1.1.1'
      },
      

      matrixSet: 'EPSG:3857',
      format: 'image/png',
      projection: projection,
      tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default',
      wrapX: true
    })
  });
  uk_lsoa.on("postrender",function(e){
    document.getElementById('imgLegend').src= 'http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=oa_mt_geo';
    
      initLegend();
  })
  uk_detailed_layer = new ol.layer.Vector({
    title:'detail',
    style:new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 1.0)',
        width: 2,
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.5)',
      })
    }),
  })
 //ik_lsoa_vector = getVectorLayer('oa_mt_geo');
  layers.push(uk_county);
  //layers.push(uk_lsoa);
  layers.push(uk_detailed_layer);
    map = new ol.Map({
        layers: layers,
        target: 'map',
        controls: ol.control.defaults({
          attributionOptions: {
            collapsible: false
          }
        }),
        view: new ol.View({
          projection:'EPSG:3857',
          center: ol.proj.transform([-1.598509,53.509628 ],'EPSG:4326','EPSG:3857'),//[-11158582, 4813697],
          //center:[-1.598509,51.509628],
          zoom:7
        })
      })
      map.on('singleclick', function (evt) {
       // document.getElementById('info').innerHTML = '';
        const viewResolution = /** @type {number} */ (map.getView().getResolution());
        const url = uk_county.getSource().getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          'EPSG:3857',
       //   {'INFO_FORMAT': 'text/html',QUERY_LAYERS :'oa_mt_geo'}
        {'INFO_FORMAT': 'application/json',QUERY_LAYERS :'uk_county'}
        );
        if (url) {
          fetch(url)
            .then((response) => response.text())
            .then((html) => {
              document.getElementById('divInfo').innerHTML = html;
              //initDetails();
              var fmt = new ol.format.GeoJSON();
              var features = fmt.readFeatures(html,{dataProject:'EPSG:3857'});
              var src = getDetailedData('oa_mt_geo',null,null,features[0].getGeometry());
              uk_detailed_layer.setSource(src);
            });
        }
      });
      initControls();
}
function refreshLayer(){
  var src = getDetailedData('oa_mt_geo',null,null,);
  uk_detailed_layer.setSource(src);
  
}
function getDetailedData(geo_layer_name,field,fieldValue,ol_geom){
  var vectorSource = new ol.source.Vector();
  const featureRequest = new ol.format.WFS().writeGetFeature({
    srsName: 'EPSG:3857',
    //featureNS: 'http://openstreemap.org',
    //featurePrefix: 'osm',
    featureTypes: [geo_layer_name],
    outputFormat: 'application/json',
    filter: ol.format.filter.within("geom",ol_geom)
    //filter: ol.format.filter.intersects("geom",ol_geom)
    // ol.format.filter.and(
    //  // likeFilter(field, 'Mississippi*'),
    //   //new ol.format.filter.EqualTo(field, fieldValue)
    //   ol.format.filter.within("geom",ol_geom)
    // ),
  });
initProgress(true);
  
  // then post the request and add the received features to a layer
  fetch(GEOSERVER_WFS_URL, {
    method: 'POST',
    body: new XMLSerializer().serializeToString(featureRequest),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      initProgress(false);
      const features = new ol.format.GeoJSON().readFeatures(json);
      vectorSource.addFeatures(features);
      map.getView().fit(vectorSource.getExtent());
    });
  return vectorSource;
}

function getVectorLayer(layer_name){
  dialog.dialog( "open" );
  const vectorSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function (extent) {
      var extent_4326 = ol.proj.transformExtent(extent,'EPSG:3857','EPSG:4326');
      return (
        'http://localhost:8080/geoserver/coplug/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename='+layer_name+'&' +
        'outputFormat=application/json&srsname=EPSG:4326&' +
        'bbox=' +
        extent_4326.join(',') +
        ',EPSG:4326'
       //'&maxFeatures=2000'
      );
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({tileSize: 512})),
  });
  var lyr = new ol.layer.Vector({
   maxResolution:30,
    minResolution: 1,
    source:vectorSource,
    style:new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 1.0)',
        width: 2,
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 1.0)',
      })
    }),
  });
  return lyr;
}
