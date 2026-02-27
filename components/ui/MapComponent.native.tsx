import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MapComponentProps, MapComponentRef } from './MapComponent';

const DARK_MAP_STYLE = [
    { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#2d3561" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#c0873f" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0d1b2a" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
];

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>((props, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
        animateToRegion: (region: any, duration = 1000) => {
            mapRef.current?.animateToRegion(region, duration);
        },
    }));

    return (
        <MapView
            ref={mapRef}
            style={props.style}
            provider={PROVIDER_DEFAULT}
            customMapStyle={props.theme === "dark" ? DARK_MAP_STYLE : []}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
            initialRegion={props.region}
        >
            {props.selectedLocation && (
                <Marker coordinate={props.selectedLocation} title={props.locationName}>
                    <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: props.accentColor || '#3b82f6',
                        borderWidth: 3,
                        borderColor: props.theme === 'dark' ? '#1f2937' : '#fff',
                    }} />
                </Marker>
            )}
        </MapView>
    );
});

export default MapComponent;
