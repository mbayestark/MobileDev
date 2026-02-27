import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapComponentProps, MapComponentRef } from './MapComponent';

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>((props, ref) => {
    useImperativeHandle(ref, () => ({
        animateToRegion: (region: any) => {
            console.log('Web Map: Animate to region', region);
        },
    }));

    const isDark = props.theme === 'dark';

    return (
        <View style={[props.style, styles.webPlaceholder, isDark && styles.darkPlaceholder]}>
            <Text style={[styles.text, isDark && styles.darkText]}>📍 Map Preview (Web)</Text>
            <Text style={[styles.subText, isDark && styles.darkSubText]}>
                {props.locationName || 'Your Location'}
            </Text>
            {props.selectedLocation && (
                <Text style={[styles.coords, isDark && styles.darkSubText]}>
                    Lat: {props.selectedLocation.latitude.toFixed(4)} | Lng: {props.selectedLocation.longitude.toFixed(4)}
                </Text>
            )}
            <View style={[styles.info, isDark && styles.darkInfo]}>
                <Text style={[styles.infoText, isDark && styles.darkSubText]}>Native maps are not available on web preview.</Text>
                <Text style={[styles.infoText, isDark && styles.darkSubText]}>The mobile app will show a live OpenStreetMap.</Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    webPlaceholder: {
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    darkPlaceholder: {
        backgroundColor: '#1a1a2e',
        borderColor: '#2d3561',
    },
    text: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#333' },
    darkText: { color: '#F0EDE6' },
    subText: { fontSize: 15, color: '#666', marginBottom: 6, textAlign: 'center' },
    darkSubText: { color: '#9ca3af' },
    coords: { fontSize: 13, color: '#888', fontFamily: 'monospace', marginTop: 10 },
    info: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 12,
        alignItems: 'center'
    },
    darkInfo: { backgroundColor: '#2d3561' },
    infoText: { fontSize: 12, color: '#555', lineHeight: 18 }
});

export default MapComponent;
