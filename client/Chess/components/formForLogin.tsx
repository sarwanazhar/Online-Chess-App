import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Yup from 'yup';
import useStore from '../store/useStore';
import { storage } from '@/libs/storage';

const validationSchema = Yup.object().shape({
    emailOrUsername: Yup.string().required('Email or Username is required').min(3, 'Email or Username must be at least 3 characters'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

const formForLogin = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const setLoggedInUser = useStore((state) => state.setLoggedInToken)
    const loggedInToken = useStore((state) => state.loggedInToken)
    if(loggedInToken) {
        router.replace('/(tabs)')
    }
  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ emailOrUsername: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setErrors }) => {
          console.log(values);
          setIsLoading(true)
            try {
                const response = await fetch("http://192.168.100.9:8000/users/login", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                })
                const data = await response.json()
                console.log(data)
                if(data.message === "Invalid credentials") {
                    setErrors({emailOrUsername: "Invalid username or password or email"})
                } else {
                    setLoggedInUser(data.user.token)
                    storage.set("loggedInToken", data.user.token)
                    storage.set("username", data.user.name)
                    storage.set("email", data.user.email)
                    storage.set("id", data.user.id)
                }
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }}
      >
        {({ handleChange, handleSubmit, values, errors, setErrors }) => (
            <View style={styles.formContainer}>
                <Text style={styles.label}>Email or Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Email or Username"
                    value={values.emailOrUsername}
                    onChangeText={handleChange('emailOrUsername')}
                    placeholderTextColor="#999999"
                />
                {errors.emailOrUsername && <Text style={styles.errorText}>{errors.emailOrUsername}</Text>}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    placeholderTextColor="#999999"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Sign In'}</Text>
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
        <TouchableOpacity style={styles.button2} onPress={() => router.replace('/signup')}>
            <Text style={styles.buttonText2} disabled={isLoading}>{isLoading ? 'Loading...' : 'Create A New Account'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default formForLogin

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
        marginTop: hp(10),
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
    },
    errorText: {
        fontSize: hp(1.5),
        color: '#FF0000',
        fontWeight: '500',
        marginBottom: hp(1),
    }
})