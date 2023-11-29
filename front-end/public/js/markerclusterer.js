/**
 * A Marker Clusterer that clusters markers. Google's origin (c) 2010: http://googlemaps.github.io/js-marker-clusterer/docs/reference.html
 * modified by Passio Transit and djdance in 2017-2018
 * compiled from ten forks from 2011-2016 years
 * 
 * 
 * new features: 
 * pie
 * each item consists of two: img lies under markers, transparent div for click above markers
 * 
 * 
 * 
 * HOWTO create a PIE
 * 0. add pie2,png...pie10.png to img/
 * 1. create array of stopMarkers
 * 2. push to cluster:
            stopMarkerCluster = new MarkerClusterer(map, stopMarkers, {
                imagePath: 'img/pie',   //path to pngs
                showTitle: false,
                gridSize: 10,    //treshold
                showMarkerCount: 0,   //to hide digits
                pieView:1,   //toggle PIE mode
                pieSize:15,  //diameter
            });
 * 
 * 
 * HOTWO get markers inside concrete custer
 * after creating MarkerClusterer add listener:
 * google.maps.event.addListener(stopMarkerCluster, "click", onClusterMarkerClick);
 * then create onClusterMarkerClick:
 * function onClusterMarkerClick(cluster,event){
 *   var markers=cluster.markers_;//this.getMarkers();   <- this returns all
 *   for(var i = 0; i < markers.length; i++) {....
 * 
 * 
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'averageCenter': (boolean) Whether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
*     'showMarkerCount': (boolean) Whether or not to show a number representing
*                         the # of markers in a given cluster on the cluster's icon
*     'onClusterAdded': (function) Fires whenever a cluster is added to the dom.
*                       Passes the Cluster object a parameter
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 *       'iconAnchor': (Array) The anchor position of the icon x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
    //console.log("MarkerClusterer called");
    
  // MarkerClusterer implements google.maps.OverlayView interface. We use the
  // extend function to extend MarkerClusterer with google.maps.OverlayView
  // because it might not always be available when the code is defined so we
  // look for it at the last possible moment. If it doesn't exist now then
  // there is no point going ahead :)
  this.extend(MarkerClusterer, google.maps.OverlayView);
  this.map_ = map;

    //Add a 'cluster' property to markers so it can access its own cluster
    google.maps.Marker.prototype.cluster = null;


  /**
   * @type {Array.<google.maps.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   *  @type {Array.<Cluster>}
   */
  this.clusters_ = [];

  /**
   * @type {Object} holding information about every markers cluster
   */
  this.markersCluster_ = {};

  /**
   * @type {Number} Unique markers ID
   */
  this.markersUniqueID = 1;


  /**
   * @private
   */
  this.styles_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.ready_ = false;

  var options = opt_options || {};



  this.pieSize_ = options['pieSize'] || 30;
  this.pieView_ = options['pieView'] || 0;
  //console.log("MarkerClusterer: this.pieView_="+this.pieView_);
  if (this.pieView_) 
      this.sizes = [this.pieSize_];
  else
      this.sizes = [53, 56, 66, 78, 90];

  /**
   * @type {number}
   * @private
   */
  this.gridSize_ = options['gridSize'] || 60;

  /**
   * @private
   */
  this.minClusterSize_ = options['minimumClusterSize'] || 2;

  
  /**
   * @type {?number}
   * @private
   */
  this.maxZoom_ = options['maxZoom'] || null;

  this.styles_ = options['styles'] || [];

  /**
   * @type {string}
   * @private
   */
  this.imagePath_ = options['imagePath'] || this.MARKER_CLUSTER_IMAGE_PATH_;
  this.showTitle_ = options['showTitle']||false;

  /**
   * @type {string}
   * @private
   */
  this.imageExtension_ = options['imageExtension'] ||
      this.MARKER_CLUSTER_IMAGE_EXTENSION_;

  this.customCount = options['customCount'] || null;

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnClick_ = true;

  if (options['zoomOnClick'] != undefined) {
    this.zoomOnClick_ = options['zoomOnClick'];
  }

  /**
   * @type {boolean}
   * @private
   */
  this.averageCenter_ = false;

  if (options['averageCenter'] != undefined) {
    this.averageCenter_ = options['averageCenter'];
  }

    /**
    * @type {boolean}
    * @private
    */
    this.showMarkerCount_ = false;

    if (options['showMarkerCount'] != undefined) {
        this.showMarkerCount_ = options['showMarkerCount'];
    }

    /**
    * @type {function}
    * @private
    */
    this.onClusterAdded_ = null;

    if (options['onClusterAdded'] != undefined) {
        this.onClusterAdded_ = options['onClusterAdded'];
    }

  this.setupStyles_();

  this.setMap(map);

  /**
   * @type {number}
   * @private
   */
  this.prevZoom_ = this.map_.getZoom();

  // Add the map event listeners
  var that = this;
  google.maps.event.addListener(this.map_, 'zoom_changed', function() {
    // Determines map type and prevent illegal zoom levels
    var zoom = that.map_.getZoom();
    var minZoom = that.map_.minZoom || 0;
    var maxZoom = Math.min(that.map_.maxZoom || 100,
                         that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom);
    zoom = Math.min(Math.max(zoom,minZoom),maxZoom);                     
    /*if (zoom < 0 || zoom > maxZoom) {
        return;
    }*/

    if (that.prevZoom_ != zoom) {
      that.prevZoom_ = zoom;
      that.resetViewport();
    }
  });

  google.maps.event.addListener(this.map_, 'idle', function() {
    that.redraw();
  });

  // Finally, add the markers
  if (opt_markers && (opt_markers.length || Object.keys(opt_markers).length)) {
    this.addMarkers(opt_markers, false);
  }
}


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ = '../images/m';


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
  this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() { };

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
  if (this.styles_.length) {
    return;
  }

   // console.log("setupStyles_: this.pieView_="+this.pieView_);
    if (this.pieView_)
        for (var i = 0; i<10; i++) {
          this.styles_.push({
            url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
            height: this.sizes[0],
            width: this.sizes[0]
          });
        }
    else
        for (var i = 0, size; size = this.sizes[i]; i++) {
          this.styles_.push({
            url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
            height: size,
            width: size
          });
        }
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
  var markers = this.getMarkers();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }

  this.map_.fitBounds(bounds);
};


/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
  this.styles_ = styles;
};


/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
  return this.styles_;
};


/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
  return this.zoomOnClick_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
  return this.averageCenter_;
};

/**
* Whether marker count is to be shown on an icon
*
* @return {boolean} True if showMarkerCount_ is true.
*/
MarkerClusterer.prototype.showMarkerCount = function() {
    return this.showMarkerCount_;
};

MarkerClusterer.prototype.pieView = function() {
    return this.pieView_;
};

/**
* Function to execute when a cluster is added to the map
*
* @return {function} with a paramter called cluster of type Cluster
*/
MarkerClusterer.prototype.onClusterAdded = function() {
    return this.onClusterAdded_;
};

/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
  return this.markers_.length;
};


/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
  this.maxZoom_ = maxZoom;
};


/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
  return this.maxZoom_;
};


/**
 * Gets marker's cluster object based on given marker
 * 
 * @param  {google.maps.Marker} marker
 * 
 * @return {Cluster}
 */
MarkerClusterer.prototype.getMarkersCluster = function(marker) {
  return this.clusters_[this.markersCluster_[marker.uniqueID]];
};


/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles, customCount,pieView,showMarkerCount) {
  var index = 0;
  var count = markers.length;
  var customCountValue = 0;
  var titles=[];

  if (customCount != null) {
    markers.forEach(function(itm) {
      customCountValue = customCountValue + parseInt(itm[customCount], 10);
    });
  }
  
    var colors=[];
    var firstColor="";
    var diffColors=false;
    markers.forEach(function(itm) {
      //console.log("cluster itm=",itm)
      if (titles.indexOf(itm.title)<0)
        titles.push(itm.title);
      
      var color = itm.icon?itm.icon.strokeColor:"#ffffff";
      if (color!="") colors.push(color);
      if (firstColor=="")
          firstColor=color;
      if (firstColor!=color){
          diffColors=true;
          //return;
      }
    });

    //console.log("calculator_: pieView="+pieView+", showMarkerCount="+showMarkerCount+",firstColor="+firstColor);
    if (pieView==1){
        index=Math.min(10,count);
        //console.log("calculator_ pie: index="+index+", count="+count);
    }else{
        var dv = count;
        while (dv !== 0) {
          dv = parseInt(dv / 10, 10);
          index++;
        }
        //console.log("calculator_ NOT pie: index="+index);
    }
    var iconText = (showMarkerCount) ? count : "";
  index = Math.min(index, numStyles);
  return {
        text: iconText,
    index: index,
     textCount: customCountValue,
     color: diffColors?"":firstColor,
     colors:colors,
     titles:titles
  };
};


/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
  this.calculator_ = calculator;
};


/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
  return this.calculator_;
};


/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
  if (markers.length) {
  for (var i = 0, marker; marker = markers[i]; i++) {
    this.pushMarkerTo_(marker);
  }
  } else if (Object.keys(markers).length) {
    for (var marker in markers) {
      this.pushMarkerTo_(markers[marker]);
    }
  }
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
  marker.isAdded = false;
  if (marker['draggable']) {
    // If the marker is draggable add a listener so we update the clusters on
    // the drag end.
    var that = this;
    google.maps.event.addListener(marker, 'dragend', function() {
      marker.isAdded = false;
      that.repaint();
    });
  }
  marker.uniqueID = this.markersUniqueID;
  this.markersUniqueID++;
  this.markers_.push(marker);
};


/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        index = i;
        break;
      }
    }
  }

  if (index == -1) {
    // Marker is not in our list of markers.
    return false;
  }

  marker.setMap(null);

  this.markers_.splice(index, 1);
  delete this.markersCluster_[marker.uniqueID];

  return true;
};


/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
  var removed = this.removeMarker_(marker);

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  } else {
   return false;
  }
};


/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
  // create a local copy of markers if required
  // (removeMarker_ modifies the getMarkers() array in place)
  var markersCopy = markers === this.getMarkers() ? markers.slice() : markers;
  var removed = false;

  for (var i = 0, marker; marker = markersCopy[i]; i++) { //was marker = markers[i]
    var r = this.removeMarker_(marker);
    removed = removed || r;
  }

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  }
};


/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
  if (!this.ready_) {
    this.ready_ = ready;
    this.createClusters_();
  }
};


/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
  return this.clusters_.length;
};


/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
  return this.map_;
};


/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
  this.map_ = map;
};


/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
  return this.gridSize_;
};


/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
  this.gridSize_ = size;
};


/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
  return this.minClusterSize_;
};

/**
 * Returns custom count parameter.
 *
 * @return {string} The custom count parameter.
 */
MarkerClusterer.prototype.getCustomCount = function() {
  return this.customCount;
};



/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
  this.minClusterSize_ = size;
};


/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
  var projection = this.getProjection();

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};


/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
  return bounds.contains(marker.getPosition());
};


/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
  this.resetViewport(true);

  // Set the markers a empty array.
  this.markers_ = [];
  this.markersCluster_ = {};
  this.markersUniqueID = 1;
};


/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
  // Remove all the clusters
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    cluster.remove();
  }

  // Reset the markers to not be added and to be invisible.
  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    marker.isAdded = false;
    if (opt_hide) {
      marker.setMap(null);
    }
  }

  this.clusters_ = [];
  this.markersCluster_ = {};
  this.markersUniqueID = 1;
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
  var oldClusters = this.clusters_.slice();
  this.clusters_.length = 0;
  this.resetViewport();
  this.redraw();

  // Remove the old clusters.
  // Do it in a timeout so the other clusters have been drawn first.
  window.setTimeout(function() {
    for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
      cluster.remove();
    }
  }, 0);
};


/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
  this.createClusters_();
};


/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};


/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
  var distance = 40000; // Some large number
  var clusterToAddTo = null;
  var pos = marker.getPosition();
  var clusterIndex = null;
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    var center = cluster.getCenter();
    if (center) {
      var d = this.distanceBetweenPoints_(center, marker.getPosition());
      if (d < distance) {
        distance = d;
        clusterToAddTo = cluster;
        clusterIndex = i;
      }
    }
  }

  if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
    clusterToAddTo.addMarker(marker);
  } else {
    var cluster = new Cluster(this);
    cluster.addMarker(marker);
    this.clusters_.push(cluster);
    clusterIndex = this.clusters_.length - 1;
  }

  if (marker.isAdded) {
    this.markersCluster_[marker.uniqueID] = clusterIndex;
  }
};


/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
  if (!this.ready_) {
    return;
  }

  // Get our current map view bounds.
  // Create a new bounds object so we don't affect the map.
  var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
      this.map_.getBounds().getNorthEast());
  var bounds = this.getExtendedBounds(mapBounds);

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
        if (marker.getVisible()){
            //console.log("createClusters_["+i+"] added "+marker.title);
            marker.cluster = null;//???djdance
      this.addToClosestCluster_(marker);
        } else{
            //console.log("createClusters_["+i+"] IGNORED "+marker.title);
    }
  }
  }
};


/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
  this.markerClusterer_ = markerClusterer;
  this.map_ = markerClusterer.getMap();
  this.gridSize_ = markerClusterer.getGridSize();
  this.minClusterSize_ = markerClusterer.getMinClusterSize();
  this.averageCenter_ = markerClusterer.isAverageCenter();
  this.customCount = markerClusterer.getCustomCount();
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(),
      markerClusterer.getGridSize());
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
  //console.log("addMarker: visible?"+marker.getVisible()+", "+marker.title);
  if (this.isMarkerAlreadyAdded(marker) || !marker.getVisible()) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  } else {
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
            var lat = (this.center_.lat() * (l - 1) + marker.getPosition().lat()) / l;
            var lng = (this.center_.lng() * (l - 1) + marker.getPosition().lng()) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
      this.calculateBounds_();
    }
  }

  marker.isAdded = true;
    marker.cluster = this;
  this.markers_.push(marker);

  var len = this.markers_.length;

  if (len < this.minClusterSize_ && marker.getMap() != this.map_) {
    // Min cluster size not reached so show the marker.
    marker.setMap(this.map_);
  }

  if (len == this.minClusterSize_) {
    // Hide the markers that were showing.
    for (var i = 0; i < len; i++) {
      this.markers_[i].setMap(null);
    }
  }

  if (len >= this.minClusterSize_) {
    marker.setMap(null);
  }

  this.updateIcon();
  return true;
};


/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
  return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  var markers = this.getMarkers();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }
  return bounds;
};

/**
* Whether or not the cluster has multiple markers (and thus is visible
*
*/
Cluster.prototype.hasMultipleMarkers = function() {
    if (this.markers_ == undefined) {
        return false;
    }
    return (this.markers_.length > 1);
};

/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
  this.clusterIcon_.remove();
  this.markers_.length = 0;
  delete this.markers_;
};


/**
 * Returns the number of markers in the cluster.
 *
 * @return {number} The number of markers in the cluster.
 */
Cluster.prototype.getSize = function() {
  return this.markers_.length;
};


/**
 * Returns a list of the markers in the cluster.
 *
 * @return {Array.<google.maps.Marker>} The markers in the cluster.
 */
Cluster.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
  return this.center_;
};


/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
  return this.bounds_.contains(marker.getPosition());
};


/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
  return this.map_;
};


/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
  var zoom = this.map_.getZoom();
  var mz = this.markerClusterer_.getMaxZoom();

  if (mz && zoom > mz) {
    // The zoom is greater than our max zoom so show all the markers in cluster.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
      marker.setMap(this.map_);
    }
    return;
  }

  if (this.markers_.length < this.minClusterSize_) {
    // Min cluster size not yet reached.
    this.clusterIcon_.hide();
    return;
  }

  var numStyles = this.markerClusterer_.getStyles().length;
  var customCountParam = this.markerClusterer_.getCustomCount();
  var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles, customCountParam,this.markerClusterer_.pieView_,this.markerClusterer_.showMarkerCount_);
  this.clusterIcon_.setCenter(this.center_);
  this.clusterIcon_.setSums(sums, customCountParam);
  this.clusterIcon_.show();
};

/**
* Updates the URL of the cluster icon
*/
Cluster.prototype.updateIconUrl = function(new_url) {
    this.clusterIcon_.div_.style["background-image"] = "url(" + new_url + ")";
};

/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
  cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

  this.styles_ = styles;
  this.padding_ = opt_padding || 0;
  this.cluster_ = cluster;
  this.center_ = null;
  this.map_ = cluster.getMap();
  this.div_ = null;
  this.div2_ = null;
  this.divTitle_ = null;
  this.sums_ = null;
  this.visible_ = false;

  this.setMap(this.map_);
}


/**
 * Triggers the clusterclick event and zoom's if the option is set.
 *
 * @param {google.maps.MouseEvent} event The event to propagate
 */
ClusterIcon.prototype.triggerClusterClick = function(event) {
  var markerClusterer = this.cluster_.getMarkerClusterer();

  // Trigger the clusterclick event.
  //console.log("triggerClusterClick, ? "+markerClusterer.isZoomOnClick()+", Gx="+Gx);
  google.maps.event.trigger(markerClusterer, 'click', this.cluster_, event);

  if (markerClusterer.isZoomOnClick()) {
    // Zoom into the cluster.
    if (Gx && Gy)
        this.map_.fitBounds(this.cluster_.getBounds(),Math.min(Gy,Gx)*0.35);
    else
    this.map_.fitBounds(this.cluster_.getBounds());
  }
};

/**
* Triggers the clustermouseover event
*/
ClusterIcon.prototype.triggerClusterMouseover = function() {
    var markerClusterer = this.cluster_.getMarkerClusterer();
    //console.log("triggerClusterMouseover");
    google.maps.event.trigger(markerClusterer, 'clustermouseover', this.cluster_);
    google.maps.event.trigger(markerClusterer, 'mouseover', this.cluster_,event);
}


/**
* Triggers the clustermouseout event
*/
ClusterIcon.prototype.triggerClusterMouseout = function() {
    var markerClusterer = this.cluster_.getMarkerClusterer();
    //console.log("triggerClusterMouseout");
    google.maps.event.trigger(markerClusterer, 'clustermouseout', this.cluster_);
    google.maps.event.trigger(markerClusterer, 'mouseout', this.cluster_);
}
/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
  this.div_ = document.createElement('DIV');
  this.div2_ = document.createElement('DIV');
  this.divTitle_= document.createElement('DIV');
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss2(pos)+this.createCss(pos);
    this.div_.innerHTML = (!this.sums_.textCount) ? this.sums_.text : this.sums_.textCount;
    this.div2_.style.cssText = this.createCss2(pos);
    this.div2_.id=Math.round(Math.random()*100000);
    //this.div2_.dataset.cluster=this.cluster_;
    //if (debug) console.log("ClusterIcon.prototype.onAdd: showTitle_=",this.cluster_.markerClusterer_.showTitle_);
    if (this.cluster_.markerClusterer_.showTitle_){
        this.divTitle_.style.cssText = this.createCss2(pos)+this.createCssTitle(pos);
        this.divTitle_.innerHTML = this.sums_.titles[0]+(this.sums_.titles.length>1?" +"+(this.sums_.titles.length-1):"");
        //console.log("ClusterIcon.prototype.onAdd: this.sums_.titles=",this.sums_.titles,this.divTitle_.style.cssText);
    }
  }

  var panes = this.getPanes();
  panes.markerLayer.appendChild(this.div_);//under buses
  panes.overlayMouseTarget.appendChild(this.div2_);//to test clicks
  panes.markerLayer.appendChild(this.divTitle_);//titles
  //panes.markerLayer.style['zIndex'] = parseInt(panes.overlayMouseTarget.style['zIndex'])+2;
  //console.log("markerLayer.zIndex="+panes.markerLayer.style['zIndex']);//103
  //console.log("overlayMouseTarget.zIndex="+panes.overlayMouseTarget.style['zIndex']);//106

  var that = this;
  var isDragging = false;
  var dragX=0, dragY=0;
  google.maps.event.addDomListener(this.div2_, 'click', function(event) {
      //console.log("click. isDragging="+isDragging);
      
    // Prevent event propagation 
    if (event.stop){
        event.stop();
    }
    event.cancelBubble = true;
    if (event.stopPropagation){
      event.stopPropagation();
    }
    if (event.preventDefault) {
        event.preventDefault(); 
    } else {
        event.returnValue = false;  
    }

    // Only perform click when not preceded by a drag
    if (!isDragging) {
      that.triggerClusterClick(event);
    }
  });

  google.maps.event.addDomListener(this.div2_, 'mouseover', function() {
        that.triggerClusterMouseover();
    });
    google.maps.event.addDomListener(this.div2_, 'mouseout', function() {
        that.triggerClusterMouseout();
    });
  google.maps.event.addDomListener(this.div2_, 'mousedown', function() {
    isDragging = false;
    dragX=parseInt(this.style.left);
    dragY=parseInt(this.style.top);
      //console.log("mousedown, this.style.left="+this.style.left+", dragX="+dragX);
  });
  google.maps.event.addDomListener(this.div2_, 'mousemove', function() {
      var dx=Math.abs(parseInt(this.style.left)-dragX);
      var dy=Math.abs(parseInt(this.style.top)-dragY);
      isDragging = dx>50 || dy>50;
      //console.log("mousemove, dragX="+dragX+", e="+this.style.left+", dx="+dx+", dy="+dy);
  });
    if (this.cluster_.markerClusterer_.onClusterAdded_ != null) {
        this.cluster_.markerClusterer_.onClusterAdded_(this.cluster_);
    }
};


/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
  var pos = this.getProjection().fromLatLngToDivPixel(latlng);

  if (typeof this.iconAnchor_ === 'object' && this.iconAnchor_.length === 2) {
    pos.x -= this.iconAnchor_[0];
    pos.y -= this.iconAnchor_[1];
  } else {
    pos.x -= parseInt(this.width_ / 2, 10);
    pos.y -= parseInt(this.height_ / 2, 10);
  }
  return pos;
};


/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.top = pos.y + 'px';
    this.div_.style.left = pos.x + 'px';
    this.div2_.style.top = pos.y + 'px';
    this.div2_.style.left = pos.x + 'px';
    this.divTitle_.style.top = pos.y + 'px';
    this.divTitle_.style.left = pos.x + 'px';
    //this.div_.style.zIndex = google.maps.Marker.MAX_ZINDEX + 1;
  }
};


/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.display = 'none';
    this.div2_.style.display = 'none';
    this.divTitle_.style.display = 'none';
  }
  this.visible_ = false;
};


/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
  if (this.div_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss2(pos)+this.createCss(pos);
    this.div_.style.display = '';
    this.div2_.style.cssText = this.createCss2(pos);
    this.div2_.style.display = '';
    this.divTitle_.style.cssText = this.createCss2(pos)+this.createCssTitle(pos);
    this.divTitle_.style.display = '';
  }
  this.visible_ = true;
};


/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
  this.setMap(null);
};


/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
  if (this.div_ && this.div_.parentNode) {
    this.hide();
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
    this.div2_.parentNode.removeChild(this.div2_);
    this.div2_ = null;
    this.divTitle_.parentNode.removeChild(this.divTitle_);
    this.divTitle_ = null;
  }
};


/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 *   'style': (number) The style of the icon.
 */
ClusterIcon.prototype.setSums = function(sums, customCountParam) {
  this.sums_ = sums;
  this.text_ = (!sums.textCount) ? sums.text : sums.textCount;
  //console.log("ClusterIcon setSums: sums=",sums);
  this.index_ = sums.index;
  if (this.div_) {
    this.div_.innerHTML = (!sums.textCount) ? sums.text : sums.textCount;
  }

  var style;
  if (sums.style)
    style = sums.style
  else if (sums.index) {
    var index = Math.max(0, sums.index - 1);
    index = Math.min(this.styles_.length - 1, index);
    style = this.styles_[index];
  }
  style['color']=sums.color;
  style['colors']=sums.colors;
  style['titles']=sums.titles;
  //console.log("ClusterIcon setSums.colors=",style.colors);
  this.useStyle(style);
};


/**
 * Sets the icon to the the styles.
 */
ClusterIcon.prototype.useStyle = function(style) {
  this.url_ = style['url'];
  this.height_ = style['height'];
  this.width_ = style['width'];
  this.color_ = style['color'];
  this.colors_ = style['colors'];
  this.textColor_ = style['textColor'];
  //console.log("useStyle: set this.colors=",this.colors_);
  this.anchor_ = style['anchor'];
  this.textSize_ = style['textSize'];
  this.backgroundPosition_ = style['backgroundPosition'];
  this.iconAnchor_ = style['iconAnchor'];
};


/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
  this.center_ = center;
};


/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
  var style = [];
  //console.log("createCss: color="+this.color_+", colors_=",this.colors_);
  if (this.color_!="" && this.color_!=undefined){
    style.push('background: url(' + this.url_ + '),#ffffff 100% 100% no-repeat;');
    style.push('background-size: 100%;');
    style.push('background-color: '+this.color_+';');
    style.push('background-blend-mode: overlay;');
  } else if (this.colors_ && this.colors_.length>0){
      var p=100/this.colors_.length;
      var g=[];
      for(var i=0;i<this.colors_.length;i++){
          g.push(this.colors_[i]+" "+(i*p)+"% "+((i+1)*p)+"%");
      }
      //p='background: linear-gradient(to bottom left,'+g.join(",")+');';
      //dont like p='background: radial-gradient('+g.join(",")+');';
      p='background: conic-gradient(from -45deg,'+g.join(",")+');';
      //console.log(p);
    style.push(p);
  } else {
    style.push('background: url(' + this.url_ + '),#ffffff 100% 100% no-repeat;');
    style.push('background-size: 100%;');
    style.push('background-color: #000000;');
    style.push('background-blend-mode: normal;');
  }
  style.push('border: 3px solid #ffffff;');//+this.color_+';');
  style.push('border-radius:50%;');
  var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
  style.push('background-position:' + backgroundPosition + ';');
  var txtColor = this.textColor_ ? this.textColor_ : 'black';
  var txtSize = this.textSize_ ? this.textSize_ : 11;
  style.push('color:' + txtColor + '; font-size:' +txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
  return style.join('');
};

ClusterIcon.prototype.createCss2 = function(pos) {
    //simple css for transparent item above
  var style = [];
  //style.push('background:#ff0000;');//debug

  if (typeof this.anchor_ === 'object') {
    if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 &&
        this.anchor_[0] < this.height_) {
      style.push('height:' + (this.height_ - this.anchor_[0]) +
          'px; padding-top:' + this.anchor_[0] + 'px;');
    } else if (typeof this.anchor_[0] === 'number' && this.anchor_[0] < 0 &&
        -this.anchor_[0] < this.height_) {
      style.push('height:' + this.height_ + 'px; line-height:' + (this.height_ + this.anchor_[0]) +
          'px;');
    } else {
      style.push('height:' + this.height_ + 'px; line-height:' + this.height_ +
          'px;');
    }
    if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 &&
        this.anchor_[1] < this.width_) {
      style.push('width:' + (this.width_ - this.anchor_[1]) +
          'px; padding-left:' + this.anchor_[1] + 'px;');
    } else {
      style.push('width:' + this.width_ + 'px; text-align:center;');
    }
  } else {
    style.push('height:' + this.height_ + 'px; line-height:' +
        this.height_ + 'px; width:' + this.width_ + 'px; text-align:center;');
  }
  style.push('cursor:pointer; top:' + pos.y + 'px; left:' + pos.x + 'px; position:absolute;');
  return style.join('');
};

ClusterIcon.prototype.createCssTitle = function(pos) {
    //title css 
  var style = [];
  var txtColor = this.textColor_ ? this.textColor_ : '#0000ffaa';
  var txtSize = this.textSize_ ? this.textSize_ : 11;
  style.push('text-align:left; color:' + txtColor + '; font-size:' +txtSize + 'px;');
  var s='margin-top:'+(this.height_*0.75)+'px; text-shadow: 1px 1px 0 white, -1px -1px 0 white;white-space:nowrap;';
  //console.log('createCssTitle: '+s);
  style.push(s);
  return style.join('');
};
