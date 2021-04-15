import serial
import libscrc
import time
import struct

ser = serial.Serial('COM4', 115200, timeout=1)
print(ser.name)

while(True):

    packet = bytearray()
    packet.append(0x03)
    packet.append(0x43)
    packet.append(0x31)
    packet.append(0x08)
    packet.append(0x00)
    packet.append(0x08)
    packet.append(0xcb)
    packet.append(0x1f)

    ser.write(packet)
    s = ser.read(22)
    print(s.hex())

    crc16 = libscrc.modbus(s)
    print(crc16)

    if(crc16 == 0):
        print("checksum ok")
        arr = struct.unpack(">BBHHHHHHHHHH", s)
        print("Input Voltage",arr[3]/100)
        print("Output Voltage",arr[7]/100)
        print("Output Ampere",arr[8]/100)
        print("Output Watt: ",arr[9]/100)       
        print(arr)
    else:
        print("Bad checksum")

    time.sleep(2)
    
ser.close()
