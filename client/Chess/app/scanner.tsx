import { StatusBar, StyleSheet, View, SafeAreaView, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera'

const Scanner = () => {
    const [permission, requestPermission] = useCameraPermissions()
    const [hasPermission, setHasPermission] = useState(false)

    useEffect(() => {
        requestPermission()
        if (permission?.granted) {
            setHasPermission(true)
        }
    }, [])

    return (
        <SafeAreaView style={StyleSheet.absoluteFillObject}>
        <StatusBar hidden />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data) {
                console.log('barcode scanned', data)
                Linking.openURL(data)
            }
          }}
        />
      </SafeAreaView>
    )
}

export default Scanner
