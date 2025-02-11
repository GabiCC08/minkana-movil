import React from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";
import {
  Text,
  TextField,
  Button,
  View,
  DateTimePicker,
  Picker,
  Image,
} from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/styles";
import translateMessage from "../utils/translateMessage";
import { useToast } from "../utils/toast";
import { useAuth } from "../utils/auth";
import moment from "moment";
import { loadImageFromGallery } from "../utils/helpers";
import { uploadImage } from "../services/reports";
import { db } from "../utils/firebase";
import Loading from "../components/Loading";

const schema = yup.object().shape({
  title: yup.string().required("Ingrese un título a su denuncia"),
  description: yup.string().required("Ingrese una descripción a su denuncia"),
  incidentLocation: yup
    .string()
    .required("Ingrese el lugar en específico del abuso"),
  incidentDate: yup.number().required("Ingrese la fecha del suceso"),
  type: yup.string().required("Escoja el tipo de acoso experimentado"),
  iesOccurred: yup.string().required("Selecciona una universidad"),
});

const schema2 = yup.object().shape({
  title: yup.string().required("Ingrese un título a su denuncia"),
  description: yup.string().required("Ingrese una descripción a su denuncia"),
  incidentLocation: yup
    .string()
    .required("Ingrese el lugar en específico del abuso"),
  incidentDate: yup.number().required("Ingrese la fecha del suceso"),
  type: yup.string().required("Escoja el tipo de acoso experimentado"),
  iesOccurred: yup.string().required("Selecciona una universidad"),
  anotherType: yup.string().required("Especifique un tipo de acoso"),
});

const ReportScreen = ({ navigation }) => {
  const { control, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    errors: errors2,
  } = useForm({
    resolver: yupResolver(schema2),
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToast();
  const { user } = useAuth();
  const [resultImage, setResultImage] = useState(false);
  const [uriImage, setUriImage] = useState("");
  const [selectedValueIes, setSelectedValueIes] = useState(user.ies);
  const [selectedValueType, setSelectedValueType] = useState("");
  const [valueOtros, setvalueOtros] = useState(false);

  const handleImage = async () => {
    setLoading(true);
    let result;
    try {
      result = await loadImageFromGallery([3, 2]);
    } catch (error) {
      addToast({
        position: "top",
        backgroundColor: "#CC0000",
        message: "Revise su conexión de Internet",
      });
    }

    if (result.image) {
      setResultImage(true);
      setUriImage(result.image);
    } else {
      setResultImage(false);
      setUriImage("");
      setLoading(false);
    }
    if (!result.status) {
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const onCreate = async (data) => {
    console.log("datos crearte: ", data);
    setLoading(true);
    try {
      let dataTotal = {};
      if (!resultImage) {
        dataTotal = {
          ...data,
          whistleblower: user.uid,
          status: "Pendiente",
          emitionDate: moment().valueOf(),
          photoURL:
            "https://firebasestorage.googleapis.com/v0/b/minkana-5ca07.appspot.com/o/places%2Fimagendenuncia.jpg?alt=media&token=02c8315f-8433-4167-b26f-58a3c59b5d0e",
        };
      } else {
        const namePhoto =
          user.uid + "Report" + moment().format("YYYY-MM-DD kk:mm:ss");
        const resultUploadImage = await uploadImage(
          uriImage,
          "places",
          namePhoto
        );
        if (!resultUploadImage.statusResponse) {
          Alert.alert(
            "Ha ocurrido un error al almacenar la evidencia de la denuncia"
          );
          setResultImage(false);
          setUriImage("");

          setLoading(false);
          return;
        }

        dataTotal = {
          ...data,
          whistleblower: user.uid,
          status: "Pendiente",
          emitionDate: moment().valueOf(),
          photoURL: resultUploadImage.url,
        };
      }

      await db
        .collection("reports")
        .add({ ...dataTotal })
        .then(async (docRef) => {
          await db
            .collection("reports")
            .doc(docRef.id)
            .update({ id: docRef.id });
        });

      setLoading(false);
      setResultImage(false);
      setUriImage("");

      navigation.navigate("Home");
      addToast({
        position: "top",
        backgroundColor: "green",
        message: "Reporte registrado con éxito",
      });
    } catch (error) {
      addToast({
        position: "top",
        backgroundColor: "#CC0000",
        message: translateMessage(error.code),
      });
      setLoading(false);
    }
  };

  return (
    <>
      <LinearGradient
        colors={["#E1E1E1", "#D5D5D5", "#F4F1DE"]}
        style={styles.background2}
      />
      {loading && <Loading />}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
      >
        <View style={{ marginBottom: 5, marginTop: 2 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View marginT-10 marginL-10 marginR-10>
              <Text h1>Ingrese su denuncia</Text>
              <Text h6>Título</Text>
              <Controller
                control={valueOtros ? control2 : control}
                name="title"
                defaultValue=""
                render={(props) => (
                  <TextField
                    style={styles.textFileReport}
                    placeholder="Título de la denuncia"
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    onChangeText={(value) => props.onChange(value)}
                    returnKeyType={"go"}
                    error={
                      valueOtros
                        ? errors2.title?.message
                        : errors.title?.message
                    }
                    enableErrors={valueOtros ? !!errors2.title : !!errors.title}
                  />
                )}
              />

              <Text h6 style={{ marginTop: 15 }}>
                Descripción de la denuncia
              </Text>
              <Controller
                control={valueOtros ? control2 : control}
                name="description"
                defaultValue=""
                render={(props) => (
                  <TextField
                    style={styles.textAreaReport}
                    autoCapitalize="sentences"
                    multiline
                    autoCorrect={false}
                    onChangeText={(value) => props.onChange(value)}
                    returnKeyType={"go"}
                    error={
                      valueOtros
                        ? errors2.description?.message
                        : errors.description?.message
                    }
                    enableErrors={
                      valueOtros ? !!errors2.description : !!errors.description
                    }
                  />
                )}
              />

              <Text h6 style={{ marginTop: 15 }}>
                Fecha del suceso
              </Text>
              <Text
                h8
                style={{
                  marginTop: 1,
                  marginBottom: -12,
                  color: "#CC0000",
                }}
              >
                Nota: Al momento de seleccionar una fecha, presionar el botón
                aceptar.
              </Text>
              <Controller
                control={valueOtros ? control2 : control}
                name="incidentDate"
                defaultValue={undefined}
                render={(props) => (
                  <DateTimePicker
                    onBackgroundPress={false}
                    display="default"
                    error={
                      valueOtros
                        ? errors2.incidentDate?.message
                        : errors.incidentDate?.message
                    }
                    enableErrors={
                      valueOtros
                        ? !!errors2.incidentDate
                        : !!errors.incidentDate
                    }
                    placeholder={"Seleccione la fecha del suceso"}
                    minimumDate={
                      new Date(
                        moment().subtract(15, "days").format("YYYY-MM-DD")
                      )
                    }
                    maximumDate={
                      new Date(moment().add(1, "days").format("YYYY-MM-DD"))
                    }
                    dateFormat={"YYYY-MM-DD"}
                    onChange={(value) => {
                      const tp = moment(value).valueOf();
                      props.onChange(tp);
                    }}
                  />
                )}
              />

              <Text h6 style={{ marginTop: 15 }}>
                Tipo de acoso
              </Text>
              <Controller
                name="type"
                control={valueOtros ? control2 : control}
                defaultValue=""
                render={(props) => (
                  <Picker
                    enableModalBlur={false}
                    topBarProps={{ title: "Tipo de acoso" }}
                    style={{
                      marginTop: 15,
                      height: 45,
                      paddingHorizontal: 15,
                      borderColor: "#E8E8E8",
                      borderWidth: 1,
                      backgroundColor: "#F6F6F6",
                      borderRadius: 5,
                    }}
                    placeholder="Escoja el tipo de acoso"
                    value={selectedValueType}
                    error={
                      valueOtros ? errors2.type?.message : errors.type?.message
                    }
                    enableErrors={valueOtros ? !!errors2.type : !!errors.type}
                    onChange={(value) => {
                      props.onChange(value.value);
                      setSelectedValueType(value.value);
                      if (value.value === "Otro") {
                        setvalueOtros(true);
                      } else {
                        setvalueOtros(false);
                      }
                    }}
                  >
                    <Picker.Item label="Físico" value="Físico" />
                    <Picker.Item label="Psicológico" value="Psicológico" />
                    <Picker.Item label="Verbal" value="Verbal" />
                    <Picker.Item label="Escrito" value="Escrito" />
                    <Picker.Item label="Visual" value="Visual" />
                    <Picker.Item label="Otro" value="Otro" />
                  </Picker>
                )}
              />
              {valueOtros ? (
                <>
                  <Text marginT-10 h6>
                    Especifique el acoso
                  </Text>
                  <Controller
                    control={valueOtros ? control2 : control}
                    name="anotherType"
                    defaultValue=""
                    render={(props) => (
                      <TextField
                        style={styles.textFileReport}
                        placeholder="Especifique el acoso"
                        autoCapitalize="sentences"
                        autoCorrect={false}
                        onChangeText={(value) => props.onChange(value)}
                        returnKeyType={"go"}
                        error={errors2.anotherType?.message}
                        enableErrors={!!errors2.anotherType}
                      />
                    )}
                  />
                </>
              ) : null}

              <Text h6 style={{ marginTop: 15 }}>
                IES donde ocurrio
              </Text>
              <Controller
                name="iesOccurred"
                control={valueOtros ? control2 : control}
                defaultValue={user.ies}
                render={(props) => (
                  <Picker
                    enableModalBlur={false}
                    topBarProps={{ title: "Universidades" }}
                    style={styles.textFileRegisterEdit}
                    showSearch
                    searchPlaceholder={"Busca tu universidad"}
                    searchStyle={{
                      color: "black",
                      placeholderTextColor: "black",
                    }}
                    placeholder="Escoje tu universidad"
                    value={selectedValueIes}
                    error={
                      valueOtros
                        ? errors2.iesOccurred?.message
                        : errors.iesOccurred?.message
                    }
                    enableErrors={
                      valueOtros ? !!errors2.iesOccurred : !!errors.iesOccurred
                    }
                    onChange={(value) => {
                      props.onChange(value.value);
                      setSelectedValueIes(value.value);
                    }}
                  >
                    <Picker.Item
                      label="Escuela Politécnica Nacional (EPN)"
                      value="Escuela Politécnica Nacional"
                    />
                    <Picker.Item
                      label="Universidad Central del Ecuador (UCE)"
                      value="Universidad Central del Ecuador"
                    />
                    <Picker.Item
                      label="Pontificia Uni. Católica del Ecuador (PUCE)"
                      value="Pontificia Uni. Católica del Ecuador"
                    />
                    <Picker.Item
                      label="Escuela Politécnica del Ejército (ESPE)"
                      value="Escuela Politécnica del Ejército"
                    />
                    <Picker.Item
                      label="Escuela Sup. Politécnica del Litoral (ESPOL)"
                      value="Escuela Sup. Politécnica del Litoral"
                    />
                    <Picker.Item
                      label="Universidad Politécnica Salesiana (UPS)"
                      value="Universidad Politécnica Salesiana"
                    />
                    <Picker.Item
                      label="Universidad Andina Simón Bolívar (UASB)"
                      value="Universidad Andina Simón Bolívar"
                    />

                    <Picker.Item
                      label="Universidad Internacional del Ecuador (UIDE)"
                      value="Universidad Internacional del Ecuador"
                    />
                    <Picker.Item
                      label="Universidad San Francisco de Quito (USFQ)"
                      value="Universidad San Francisco de Quito"
                    />
                    <Picker.Item
                      label="Universidad Tecnológica Equinoccial (UTE)"
                      value="Universidad Tecnológica Equinoccial"
                    />
                    <Picker.Item
                      label="Universidad de las Américas (UDLA)"
                      value="Universidad de las Américas"
                    />
                  </Picker>
                )}
              />

              <Text h6 style={{ marginTop: 15 }}>
                Lugar dentro de la IES
              </Text>
              <Controller
                control={valueOtros ? control2 : control}
                name="incidentLocation"
                defaultValue=""
                render={(props) => (
                  <TextField
                    style={styles.textFileReport}
                    placeholder="Lugar del suceso"
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    onChangeText={(value) => props.onChange(value)}
                    error={
                      valueOtros
                        ? errors2.incidentLocation?.message
                        : errors.incidentLocation?.message
                    }
                    enableErrors={
                      valueOtros
                        ? !!errors2.incidentLocation
                        : !!errors.incidentLocation
                    }
                  />
                )}
              />

              <Text h6 style={{ marginTop: 15, marginBottom: 10 }}>
                Adjunta una imagen (Opcional)
              </Text>
              <View marginH-15>
                {resultImage ? (
                  <Image
                    borderRadius={25}
                    source={{ uri: uriImage }}
                    style={{
                      height: 250,
                      width: "100%",
                    }}
                    cover={false}
                  />
                ) : null}
              </View>
              <Button
                label="Selecciona una imagen"
                labelStyle={{ fontSize: 14, padding: 2 }}
                enableShadow
                onPress={handleImage}
                style={{
                  backgroundColor: "#3D405B",
                  marginLeft: 80,
                  marginRight: 80,
                  marginTop: 15,
                  marginBottom: 20,
                }}
              />

              <Button
                label="Crear reporte"
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: 20,
                  padding: 5,
                }}
                enableShadow
                onPress={
                  valueOtros ? handleSubmit2(onCreate) : handleSubmit(onCreate)
                }
                style={{
                  backgroundColor: "#E07A5F",
                  marginLeft: 50,
                  marginRight: 50,
                  marginTop: 20,
                  marginBottom: 20,
                }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ReportScreen;
