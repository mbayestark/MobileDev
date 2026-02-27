import React from 'react';
import { ViewStyle } from 'react-native';

export interface MapComponentProps {
    style?: ViewStyle;
    region?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    selectedLocation?: {
        latitude: number;
        longitude: number;
    } | null;
    locationName?: string;
    theme?: string;
    accentColor?: string;
}

export interface MapComponentRef {
    animateToRegion: (region: any, duration?: number) => void;
}

declare const MapComponent: React.ForwardRefExoticComponent<MapComponentProps & React.RefAttributes<MapComponentRef>>;
export default MapComponent;
