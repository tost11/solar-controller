#!/usr/bin/python
import ctypes
import datetime

from pymodbus.client.sync import ModbusSerialClient as ModbusClient
from pymodbus.exceptions import ModbusIOException
from pymodbus.mei_message import ReadDeviceInformationRequest
from pymodbus.constants import DeviceInformation

CHARGE_CONTROLLER_UNIT = 1

def getClient():
    return ModbusClient(
        method = "rtu",
        port = "/dev/ttyUSB0",
        baudrate = 115200,
        timeout = 1
    )
