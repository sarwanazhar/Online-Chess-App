import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').min(3, 'Email must be at least 3 characters'),
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

const formForSignUp = () => {
    const router = useRouter()
  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
            const response = await fetch("http://192.168.100.9:8000/users/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: values.username,
                    email: values.email,
                    password: values.password,
                }),
              })

              if (response.status === 201) {
                Alert.alert("Success", "User created successfully")
              }else if(response.status == 400){
                Alert.alert("Error", "User already exists")
              } else {
                Alert.alert("Error", "Something went wrong")
              }
        }}
      >
        {({ handleChange, handleSubmit, values, errors }) => (
            <View style={styles.formContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    placeholderTextColor="#999999"
                />
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Username"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    placeholderTextColor="#999999"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    placeholderTextColor="#999999"
                />
                <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        )}
      </Formik>
      <View style={styles.container2}>
        <View style={styles.lineContainer}>
            <View style={styles.line}/>
            <Text style={styles.orText}>or</Text>
            <View style={styles.line}/>
        </View>
        <TouchableOpacity style={styles.button2} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText2}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default formForSignUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(5)
    },
    formContainer: {
        flex: 1,
    },
    label: {
        fontSize: hp(2),
        color: '#FFFFFF',
        fontWeight: '500',
        marginBottom: hp(1),
    },
    input: {
        width: wp(90),
        height: hp(6),
        borderWidth: 1,
        borderColor: '#3D3D3D',
        backgroundColor: '#3D3D3D',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        color: '#FFFFFF',
    },
    button: {
        width: wp(90),
        height: hp(6),
        backgroundColor: '#007BFF',
        borderRadius: hp(1),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    buttonText: {
        fontSize: hp(2),
        color: '#FFFFFF',
        fontWeight: '600',
    },
    container2: {
        flex: 1,
        marginTop: hp(25),
    },
    lineContainer: {
        flexDirection: 'row',
        height: hp(6),
    },
    line: {
        width: wp(40),
        height: 1,
        backgroundColor: '#444444',
        marginVertical: hp(2),
    },
    orText: {
        fontSize: hp(2.5),
        color: '#FFFFFF',
        fontWeight: '300',
        marginLeft: wp(2),
        marginRight: wp(2),
    },
    button2: {
        width: '100%',
        height: hp(6),
        borderRadius: hp(1),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007BFF',
        marginTop: hp(2),
    },
    buttonText2: {
        fontSize: hp(2),
        color: '#FFFFFF',
        fontWeight: '600',
    }
})