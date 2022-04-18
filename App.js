import React, {useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';

const App = () => {
  const BASE_URL = 'https://envioarquivoapi.herokuapp.com';
  const camera = useRef();

  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    const getPermissions = async () => {
      await Camera.getCameraPermissionStatus();
      await Camera.getMicrophonePermissionStatus();
    };

    getPermissions();
  }, []);

  const enviarFoto = async () => {
    const photo = await camera.current?.takePhoto({
      flash: 'on',
    });
    const photoFile = photo.path;

    const formData = new FormData();
    formData.append('file', {
      uri: `file://${photoFile}`,
      name: 'photo.jpg',
      type: 'image/jpg',
    });

    let res = await fetch(`${BASE_URL}/upload`, {
      method: 'post',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    let responseJson = await res.json();
    let message;
    if (responseJson.success) {
      message = 'Foto enviada com sucesso!';
      console.log(`Local da imagem: ${BASE_URL}/public/photo.jpg`);
    } else {
      message = responseJson.message;
    }
    Alert.alert('Resultado', message, [{text: 'OK', onPress: () => {}}]);
  };

  if (device == null) {
    return <Text>Carregando...</Text>;
  }
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar />
      <View style={{flex: 1}}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.botaoView}>
          <TouchableOpacity style={styles.botaoCaptura} onPress={enviarFoto}>
            <Text style={styles.botaoCapturaText}>Capturar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  botaoView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 20,
    right: 0,
    left: 0,
  },
  botaoCaptura: {
    backgroundColor: 'green',
    width: 90,
    borderRadius: 5,
  },
  botaoCapturaText: {
    color: 'white',
    textAlign: 'center',
    paddingVertical: 5,
  },
});

export default App;
