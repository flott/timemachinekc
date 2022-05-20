import { tiledMapLayer } from 'esri-leaflet'
import L from 'leaflet'

export default {
  "Roads": tiledMapLayer({ url: 'https://gismaps.kingcounty.gov/arcgis/rest/services/BaseMaps/KingCo_Aerial_Overlay/MapServer' })
}
