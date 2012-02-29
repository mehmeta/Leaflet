L.Handler.PolyDraw = L.Handler.PolyEdit.extend({
	addHooks: function () {
		if (this._poly._map) {
			if (!this._markerGroup) {
				this._markerGroup = new L.LayerGroup();
				this._markers = [];
				// Ignore all the points but the first in the draw mode
				this._poly._latlngs = [this._poly._latlngs[0]];
				var latlng = this._poly._latlngs[0];
				// This assumes that there's a single point in the polygon, starting point
				this._firstMarker = this._lastMarker = this._createMarker(latlng, 0);
				this._firstMarker.on('click', this._onMarkerClick, this);
				this._markers.push(this._lastMarker);
				// Add a duplicate of the same point in the polygon, since this will be the point we'll constantly be modifying
				this._poly.addLatLng(latlng);
			}
			this._poly._map.addLayer(this._markerGroup);
			this._poly._map.on("mousemove", this._onMousemove, this);
			// Clicking means dropping a point
			this._poly._map.on("click", this._onMapClick, this);
		}
	},
	removeHooks: function () {
		if (this._poly._map) {
			this._poly._map.removeLayer(this._markerGroup);
		}
		this._poly._map.off("mousemove", this._onMousemove, this);
		// Clicking means dropping a point
		this._poly._map.off("click", this._onMapClick, this);
	},
	stop: function () {
		// Last marker in the chain is the marker we use to draw on mousemove event, therefore remove it since we're stopping hand-drawing
		this._poly.spliceLatLngs(this._poly._latlngs.length - 1, 1);
		this.disable();
		// Leave the object in an editable state when we finish drawing
		if (!this._poly.editing) {
			this._poly.editing = new L.Handler.PolyEdit(this._poly);
		}
		this._poly.editing.enable();
		
	},
	_onMousemove: function (e) {
		this._poly.spliceLatLngs(this._poly._latlngs.length - 1, 1, e.latlng);
	},
	_onMapClick: function (e) {
		var latlng = e.latlng;
		this._poly.addLatLng(latlng);
		this._lastMarker = this._createMarker(latlng, this._markers.length);
		this._lastMarker.on("click", this._onMarkerClick, this);
		this._markers.push(this._lastMarker);
	},
	_onMarkerClick: function (e) {
		var marker = e.target;
		
		if (this._markers.length < 2) {
			return;
		}
		// Clicking on the last marker stops drawing mode
		if (marker === this._lastMarker) {
			this.stop();
			return;
		}
		
	},

	_createMarker: function (latlng, index) {
		var marker = new L.Marker(latlng, {
			draggable: false,
			icon: this.options.icon
		});

		marker._origLatLng = latlng;
		marker._index = index;

		this._markerGroup.addLayer(marker);
		return marker;
	}

});