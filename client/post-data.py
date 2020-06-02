#!/usr/bin/python
from common import *
import requests

API_ENDPOINT = "https://my.example.domain:8080/api/solar"
TOKEN="token"

client = getClient()
if client.connect():
    result = client.read_input_registers(0x3100, 19, unit=CHARGE_CONTROLLER_UNIT)
    if isinstance(result, Exception):
        print("Got exception reading 0x3100 - 0x3118")
        print(result)
    else:
        if result.function_code < 0x80:
            data = {'chargeVolt':result.registers[0],
                    'chargeAmpere':result.registers[1],
                    'batteryVoltage':result.registers[4],
                    'batteryAmperes':result.registers[5],
                    'dischargeVoltage':result.registers[12],
                    'dischargeAmperes':result.registers[13],
                    'batteryTemperature':result.registers[16],
                    'deviceTemperature':result.registers[17],
                    'chargerTemperature':result.registers[18]
            }
            headers = {'client-token':TOKEN}
            r = requests.post(url = API_ENDPOINT,headers=headers, json = data)
            print(r)
            #when using self signed certificate
            #r = requests.post(url = API_ENDPOINT, json = data,headers=headers, verify=False);
        else:
            print("Unable to read 0x3100 - 0x3112")

    result = client.read_input_registers(0x311A, 2, unit=CHARGE_CONTROLLER_UNIT)
    if isinstance(result, Exception):
        print("Got exception reading 0x311A - 0x311B")
        print(result)
    else:
        if result.function_code < 0x80:
            print("Battery SOC: {}".format(result.registers[0]))
            print("Remote battery temperature: {}".format(result.registers[1]))
        else:
            print("Unable to read 0x311A - 0x311B")

    result = client.read_input_registers(0x311D, 1, unit=CHARGE_CONTROLLER_UNIT)
    if isinstance(result, Exception):
        print("Got exception reading 0x311D")
        print(result)
    else:
        if result.function_code < 0x80:
            print("Battery's real rated power: {}".format(result.registers[0]))
        else:
            print("Unable to read 0x311D")

    client.close()
