import 'leaflet/dist/leaflet.css';
import './assets/app.css';

import React from 'react';
import L, { divIcon } from 'leaflet';
import _ from 'lodash';
import Sidebar from 'react-sidebar';
import { Map, Marker, Polygon, TileLayer, Tooltip, ZoomControl } from 'react-leaflet';
import Control from 'react-leaflet-control';
import Slider from 'rc-slider';
import LoadingOverlay from 'react-loading-overlay';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import { center, defaultFill, defaultOpacity, highGreenIndex, lowGreenIndex, zoom } from './config';
import ButtonGroup from './Components/ButtonGroup';
import DetailLevel, { LevelOptions } from './constants/DetailLevel';
import ImageModal from './Components/ImageModal';

class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isShowing: false,
      isLoadingData: false,
      detailLevel: DetailLevel.Tract,
      selectedPolygon: null,
      settingsAreOpen: false,
      opacity: defaultOpacity,
      fillOpacity: defaultFill,
      parsedData: {},
      selectedMarker: null,
    };
  }

  loadParsedData = (path) => {
    this.setState({ isLoadingData: true });

    window.fetch(path)
      .then(res => res.json())
      .then((data) => {
        this.setState({ isLoadingData: false, parsedData: data });
        return data;
      });
  };

  componentDidMount () {
    this.loadParsedData('/data/parsedTract.json');
  }

  getParsed = () => {
    const { parsedData } = this.state;

    return parsedData || { min: 0, max: 0, values: [] };
  };

  getPolygons = () => {
    const { values } = this.getParsed();

    return values;
  };

  toggleSettings = () => {
    const { settingsAreOpen } = this.state;
    this.setState({ settingsAreOpen: !settingsAreOpen });
  };

  setFillOpacity = (fillOpacity) => {
    this.setState({ fillOpacity: fillOpacity });
  };

  setOpacity = (opacity) => {
    this.setState({ opacity: opacity });
  };

  setDetailLevel = (detailLevel) => {
    switch (detailLevel) {
      case DetailLevel.Block: {
        this.loadParsedData('/data/parsedBlock.json');
        break;
      }
      case DetailLevel.Tract: {
        this.loadParsedData('/data/parsedTract.json');
        break;
      }
      default: {
        break;
      }
    }

    this.setState({ detailLevel: detailLevel, selectedPolygon: null });
  };

  createClusterCustomIcon = (cluster) => {
    const items = cluster.getAllChildMarkers();
    const averageGreenIndex = _.meanBy(items, ({ options: { position: { options: { greenIndex } } } }) => greenIndex);
    const { min, max } = this.getParsed();

    const adjustedAverage = (averageGreenIndex - min) / (max - min);

    return L.divIcon({
      html: `<span title="Average Green Index: ${_.round(averageGreenIndex, 2)}" style="background-color: #${pickHex(highGreenIndex, lowGreenIndex, adjustedAverage)}; padding:10px; border-radius: 50%">${cluster.getChildCount()}</span>`,
      className: 'marker-cluster-custom',
      iconSize: L.point(40, 40, true),
    });
  };

  renderSidebar = () => {
    const { fillOpacity, opacity, detailLevel } = this.state;
    return (
      <div className="sidebar">
        <div className="form-group">
          <label>Fill:</label>
          <Slider min={0} max={100} value={fillOpacity} onChange={this.setFillOpacity} />
        </div>

        <div className="form-group">
          <label>Opacity:</label>
          <Slider min={0} max={100} value={opacity} onChange={this.setOpacity} />
        </div>

        <div className="form-group">
          <label>Detail Level:</label>
          <div className="mt-1">
            <ButtonGroup options={LevelOptions} value={detailLevel} onClick={this.setDetailLevel} />
          </div>
        </div>
      </div>
    );
  };

  render () {
    const { settingsAreOpen, fillOpacity, opacity, selectedPolygon, isLoadingData, selectedMarker } = this.state;

    return (
      <Sidebar
        sidebar={this.renderSidebar()}
        open={settingsAreOpen}
        onSetOpen={this.toggleSettings}
        styles={{ sidebar: { zIndex: 2000, backgroundColor: 'white' } }}
      >
        <LoadingOverlay active={isLoadingData} spinner text="Loading Data...">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
            <Map
              zoomControl={false}
              maxZoom={20}
              style={{ flex: 1 }}
              zoom={zoom}
              center={center}
            >
              <TileLayer url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png" />
              {
                _.map(this.getPolygons(), (data) => {
                  const { fipsTract, averageGreenIndex, adjustedAverage, coordinates } = data;
                  const isSelected = selectedPolygon && selectedPolygon.fipsTract === fipsTract;
                  return (
                    <Polygon
                      key={fipsTract}
                      fillOpacity={isSelected ? 0 : (fillOpacity / 100)}
                      opacity={opacity / 100}
                      color={`#${pickHex(highGreenIndex, lowGreenIndex, adjustedAverage)}`}
                      positions={coordinates}
                      onClick={() => {
                        console.log({ data });
                        this.setState({ selectedPolygon: { ...data } });
                      }}
                    >
                      <Tooltip sticky>Green Index: {_.round(averageGreenIndex, 2)}</Tooltip>
                    </Polygon>
                  );
                })
              }
              {selectedPolygon && (
                <MarkerClusterGroup iconCreateFunction={this.createClusterCustomIcon}>
                  {
                    _.map(selectedPolygon.vegetation, (data, i) => {
                      const { min, max } = this.getParsed();

                      const adjustedAverage = (data.greenIndex - min) / (max - min);

                      const icon = divIcon({
                        className: 'my-div-icon',
                        html: `<i class="fa fa-3x fa-map-marker" style="color: #${pickHex(highGreenIndex, lowGreenIndex, adjustedAverage)};"></i>`,
                      });
                      const { lat, lng } = data;
                      return (
                        <Marker key={i} icon={icon} position={{ lat, lng, options: data }} onClick={() => this.setState({ selectedMarker: data })}>
                          <Tooltip sticky>Green Index: {data.greenIndex}</Tooltip>
                        </Marker>
                      );
                    })
                  }
                </MarkerClusterGroup>
              )}

              <Control position="bottomright">
                <button className="btn btn-secondary" onClick={this.toggleSettings}>
                  <i className="fa fa-cog" />
                </button>
              </Control>

              <ZoomControl position="topright" />
            </Map>
          </div>
        </LoadingOverlay>

        <ImageModal show={!!selectedMarker} selectedMarker={selectedMarker} hide={() => this.setState({ selectedMarker: null })} />
      </Sidebar>
    );
  }
}

export default App;

function pickHex (highColor, lowColor, ratio) {
  const hex = function (x) {
    x = x.toString(16);
    return (x.length === 1) ? '0' + x : x;
  };

  const r = Math.ceil(parseInt(highColor.substring(0, 2), 16) * ratio + parseInt(lowColor.substring(0, 2), 16) * (1 - ratio));
  const g = Math.ceil(parseInt(highColor.substring(2, 4), 16) * ratio + parseInt(lowColor.substring(2, 4), 16) * (1 - ratio));
  const b = Math.ceil(parseInt(highColor.substring(4, 6), 16) * ratio + parseInt(lowColor.substring(4, 6), 16) * (1 - ratio));

  return hex(r) + hex(g) + hex(b);
}
