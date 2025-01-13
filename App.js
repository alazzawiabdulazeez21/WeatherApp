import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, ActivityIndicator, View, ScrollView } from 'react-native';
import axios from 'axios';
import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherEffects from './components/AnimatedBubbles';

const getTimeOfDay = (datetime) => {
  if (!datetime) return 'night';

  const hour = parseInt(datetime.split(':')[0]);

  if (hour >= 5 && hour < 7) return 'sunrise';
  if (hour >= 7 && hour < 19) return 'day';
  if (hour >= 19 && hour < 21) return 'sunset';
  return 'night';
};

const formatDay = (dateString, index) => {
  if (index === 1) return 'Tmr';
  
  const date = new Date(dateString);
  // For first week, show day names
  if (index < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  // After a week, show month/day
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
};


const getWeatherIcon = (iconName) => {
  const needsY = ['rain', 'snow']; // Add more cases if needed
  const baseIcon = iconName.replace('-day', '');

  if (baseIcon === 'clear') {
    return 'weather-sunny';
  } else if (needsY.includes(baseIcon)) {
    return `weather-${baseIcon}y`;
  } else {
    return `weather-${baseIcon}`;
  }
};

const getGradientColors = (conditions, datetime) => {
  if (!conditions) return ['#89CFF0', '#6CB4EE'];

  const weatherCondition = conditions.toLowerCase();

  const gradients = {
    clear: {
      day: ['#00B4DB', '#0083B0'], 
      sunrise: ['#FF416C', '#FF4B2B'], 
      sunset: ['#f2709c', '#ff9472'],
      night: ['#0F2027', '#203A43'] 
    },
    cloudy: {
      day: ['#5D4157', '#A8CABA'], 
      sunrise: ['#cc2b5e', '#753a88'], 
      sunset: ['#2C3E50', '#3498db'], 
      night: ['#0f0c29', '#302b63'] 
    },
    rain: {
      day: ['#373B44', '#4286f4'], 
      sunrise: ['#3a7bd5', '#3a6073'], 
      sunset: ['#0F2027', '#203A43'], 
      night: ['#141E30', '#243B55'] 
    },
    snow: {
      day: ['#E0EAFC', '#CFDEF3'], 
      sunrise: ['#7F7FD5', '#91EAE4'], 
      sunset: ['#E6DADA', '#274046'], 
      night: ['#243949', '#517fa4'] 
    },
    storm: {
      day: ['#4B79A1', '#283E51'], 
      sunrise: ['#0f0c29', '#302b63'], 
      sunset: ['#203A43', '#2C5364'], 
      night: ['#000428', '#004e92'] 
    },
    fog: {
      day: ['#606c88', '#3f4c6b'], 
      sunrise: ['#B79891', '#94716B'], 
      sunset: ['#757F9A', '#D7DDE8'], 
      night: ['#29323c', '#485563'] 
    },
    partly: {
      day: ['#2980B9', '#6DD5FA'], 
      sunrise: ['#FF8008', '#FFC837'], 
      sunset: ['#36D1DC', '#5B86E5'], 
      night: ['#2C3E50', '#3498DB'] 
    }
  };

  const weatherKey = Object.keys(gradients).find(key => {
    if (weatherCondition.includes('partly') && weatherCondition.includes('cloudy')) {
      return 'partly';
    }
    return weatherCondition.includes(key);
  }) || 'clear';

  const selectedGradient = gradients[weatherKey][datetime];

  return selectedGradient || gradients.clear.day;
};


export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  async function loadFonts() {
    try {
      await Font.loadAsync({
        'Merriweather': require('./assets/fonts/Merriweather/Merriweather-Black.ttf'),
      });
      setFontsLoaded(true);
    } catch (err) {
      console.error('Error loading fonts:', err);
    }
  }

  useEffect(() => {
    loadFonts();
    
    const fetchWeather = async () => {
      const apiWeather = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/43220?unitGroup=us&key=SAHLDQMRAX2SMR2MZGKY7NE87&contentType=json";
      try {
        const response = await axios.get(apiWeather);
        setWeather(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error Fetching Weather data:", err);
        setLoading(false);
      }
    };
    fetchWeather();
    
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const time = getTimeOfDay(weather?.currentConditions?.datetime);
  const colors = getGradientColors(weather?.currentConditions?.conditions, time);

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors} style={styles.gradient}>
        <WeatherEffects 
            weatherCondition={weather?.currentConditions?.conditions} 
            timeOfDay={time}
          />
        <SafeAreaView>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            scrollEventThrottle={16}
            overScrollMode="never"
          >

          
            <View style={styles.safeArea}>
              <StatusBar style="auto" />
              <View style={styles.contentContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : weather ? (
                  <View style={styles.weatherContainer}>
                    <Text style={styles.locationText}>Dublin, Ohio</Text>
                    <Text style={styles.thisDate}>Today {weather.days[0].datetime}</Text>
                    <View style={{flexDirection:'column',marginBottom:50,justifyContent:'center'}}>
                      <Text style={styles.weatherText}>
                        {weather.currentConditions?.temp}°<Text style={{fontSize:40}}>F</Text>
                      </Text>
                      <View style={{flexDirection:'row', alignItems:'baseline'}}>
                        <MaterialCommunityIcons name="weather-cloudy" size={20} color="white" />
                        <Text style={{marginLeft:5,color:'white',fontWeight:600}}>
                          {weather.currentConditions?.conditions}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.conditionsCurrent}>
                      Oh look, {weather.currentConditions?.conditions.toLowerCase()} today
                    </Text>
                  </View>
                ) : (
                  <Text>Failed to load weather data.</Text>
                )}
              </View>
              
              <View style={styles.forecastContainer}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  {weather?.days.slice(1).map((day, index) => (
                    <View key={index} style={styles.weatherCard}>
                      <Text style={styles.date}>{formatDay(day.datetime, index + 1)}</Text>
                      <MaterialCommunityIcons 
                        name={getWeatherIcon(day.icon)}
                        size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <View>
                        <Text style={styles.maxTemp}>{day.tempmax}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <Text style={{width:'100%',fontSize:20,color:'white',fontWeight:700,marginTop:20}}>Deatils:</Text>;

              </View>
            </View>

            {loading?(
              <ActivityIndicator size="large" color="#0000ff" />
            ) : weather?(
              <View style={styles.weatherDetailContainer}>
                <View style={styles.weatherDetailCard}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons 
                      name="weather-windy"
                      size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <Text style={{color:'white',fontWeight:700,fontSize:20}}>Wind</Text>
                  </View>
                  <Text style={styles.numberDetail}>{weather?.currentConditions?.windspeed} km/h</Text>
                </View>

                <View style={styles.weatherDetailCard}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons 
                      name="water"
                      size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <Text style={{color:'white',fontWeight:700,fontSize:20}}>Humadity</Text>
                  </View>
                  <Text style={styles.numberDetail}>{weather.currentConditions?.humidity}%</Text>
                </View>

                <View style={styles.weatherDetailCard}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons 
                      name="weather-sunny"
                      size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <Text style={{color:'white',fontWeight:700,fontSize:20}}>Pressure</Text>
                  </View>
                  <Text style={styles.numberDetail}>{weather?.currentConditions?.pressure} hpa</Text>
                </View>

                <View style={styles.weatherDetailCard}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons 
                      name="weather-sunny"
                      size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <Text style={{color:'white',fontWeight:700,fontSize:20}}>Feel Like</Text>
                  </View>
                  <Text style={styles.numberDetail}>{weather?.currentConditions?.feelslike} hpa</Text>
                </View>

                <View style={styles.weatherDetailCard}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons 
                      name="weather-sunny"
                      size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <Text style={{color:'white',fontWeight:700,fontSize:20}}>Temp min</Text>
                  </View>
                  <Text style={styles.numberDetail}>{weather?.days[0].tempmin}° F</Text>
                </View>
                <View style={styles.weatherDetailCard}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons 
                      name="weather-sunny"
                      size={30} 
                        color="white" 
                        style={{marginVertical:5}}
                      />
                      <Text style={{color:'white',fontWeight:700,fontSize:20}}>Temp max</Text>
                  </View>
                  <Text style={styles.numberDetail}>{weather?.days[0].tempmax}° F</Text>
                </View>
                
              </View>
            ) : (
              <Text>Failed to load weather data.</Text>
            )}
          </ScrollView>
        </SafeAreaView>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  locationText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 35,
    borderBottomColor: "white",
    borderBottomWidth: 1,
    width: '57%',
    paddingBottom: 5,
    marginBottom: 10,
    letterSpacing: 1,
  },
  thisDate: {
    color: 'white',
    fontSize: 20,
    fontWeight: '300',
    marginBottom: 50
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
  },
  weatherContainer: {
    borderRadius: 200,
    padding: 10,
    paddingHorizontal: 25,
  },
  conditionsCurrent: {
    color: 'white',
    fontSize: 50,
    fontWeight: '500',
    fontFamily: 'Merriweather',
    width: '60%'
  },
  weatherText: {
    color: 'white',
    fontSize: 50,
    fontWeight: '700',
  },
  forecastContainer: {
    paddingVertical: 10,
    marginHorizontal: 10,
    borderBottomColor: 'white',
    borderTopColor: 'rgb(255,255,255)',
    borderBottomWidth: 0.2,
    borderTopWidth: 0.2,
    marginTop: 20
  },
  weatherCard: {
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
    marginRight: 10,
    justifyContent: 'space-between'
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  maxTemp: {
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
    color: 'white'
  },
  weatherDetailContainer:{
    marginTop:20,
    paddingBottom:20,
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'center',
  },
  weatherDetailCard:{
    backgroundColor:'rgba(197,210,216,.5)',
    marginHorizontal:15,
    borderRadius:15,
    paddingHorizontal:10,
    margin:15,
    width:'150',
    height:'100'


  },
  numberDetail:{
    fontWeight:700,
    fontSize:20,
    color:'white',
    padding:10,
    marginHorizontal:'auto'
  }
});