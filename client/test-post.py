#!/usr/bin/python
import requests

TOKEN = "token"
API_ENDPOINT = "https://my.example.domain:8080/api/solar"

a=5

data ={'chargeVolt':3600.0,
        'chargeAmpere':1000,
        'batteryVoltage':1200,
        'batteryAmperes':1000,
        'dischargeVoltage':1200,
        'dischargeAmperes':1000,
        'batteryTemperature':1000,
        'deviceTemperature':1000,
        'chargerTemperature':1000
}
headers = {'token':TOKEN}
r = requests.post(url = API_ENDPOINT, json = data,headers=headers)

# for self signed http certificate
#r = requests.post(url = API_ENDPOINT, data = data, headers=headers, verify=False)
