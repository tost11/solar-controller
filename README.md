# solar-controller
Solar Moitoring for solarcontroller e.g tracer<br>
View current status of Solar Power life in browser via websockets<br>
Backend stors data in mongodb and calculates day, month and year view<br>
Client(e.g raspberrypi) reads out solar-controller and sends them to server

Example: [solar.tost-soft.de](https://solar.tost-soft.de)

## dependencies
java open-jdk 11 or later, python3, react 

## setup

## config parameters
|parameter|function|default value|
|:---|:---|:---|
|client.auth-token|endpoint token for pushing solar data|token|
|input.delay|delay of checking solardata on client in seconds|10|
|view.min-battery-voltage|min voltage on battery graph|10|
|view.max-battery-voltage|max voltage on battery graph|15|
|view.max-load-voltage|max voltage on solar input graph|70|
|view.max-load-ampere|max ampere on solar input graph|20|
|view.max-load-watt|max watt on solar input graph|350|
|view.max-consumer-voltage|max voltage on load graph|15|
|view.max-consumer-ampere|max ampere on load graph|10|
|view.max-consumer-watt|max watt on load graph|75|
|view.max-year-watt-hours|max watt on year graph|2000|
|view.max-year-consumed-watt-hours|max load watt on year graph|200|

## client
The client uses python and modbus to read out the status of the solar-controller and sends the inforamation to the server (spring boot aplication).
As hardware i use a raspberrypi with an RS485 Adapter us adapter.As software an installation of python3 and pymodbus is nessesary. Also you habe to change the url and token declared in post-data.py in the first lines. Most of the python code comes from [here](https://github.com/lewismoten/solar-log/tree/master/charge-controller). There are even more scripts for reading statistic-data and so on.

## images
