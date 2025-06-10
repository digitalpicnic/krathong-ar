export interface GpsCoord {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface OrientationType {
  absolute?: boolean;
  alpha: number;
  beta: number;
  gamma: number;
  screenOrientation?: number;
}
