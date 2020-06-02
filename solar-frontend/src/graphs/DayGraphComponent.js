import React, {useEffect, useState} from 'react';
import InfoController from "../service/InfoController";
import moment from "moment";
import {VictoryArea, VictoryAxis, VictoryChart, VictoryLabel} from "victory";

function DayGraphComponent(props) {

    const [testDat, setData] = useState([]);
    const [voltData, setVoltData] = useState([]);
    const [wattHours, setWattHours] = useState(0);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        InfoController.fetchDay(moment(date).format("YYYY-MM-DD")).then((res) => {
            if (res.status === 200) {
                res.json().then((obj) => {
                    setWattHours(obj.wattHours);

                    let arr = [];
                    let arrVolt = [];
                    for (let i = 0; i < 1440; i++) {
                        arr[i] = 0;
                        arrVolt[i] = 0;
                    }
                    let last = 0;
                    let LastVolt = 0;
                    let lastIndex = 0;
                    obj.solardata.forEach(data => {
                        let m = new moment(data.creationDate);
                        let min = m.hour() * 60 + m.minute();
                        let current = data.chargeWatt;
                        let currentVolt = data.batteryVoltage;
                        if (min <= lastIndex) {
                            return;
                        }
                        for (let i = lastIndex; i < min; i++) {
                            let dist = min - lastIndex;
                            let fak = (i - lastIndex) / dist;
                            arr[i] = fak * last + (1 - fak) * current;
                            arr[i] = arr[i] * Math.max(0, Math.min(1, Math.max(
                                2 - (i - lastIndex) * 0.1,
                                2 - (min - i) * 0.1
                            )));
                            arrVolt[i] = fak * LastVolt + (1 - fak) * currentVolt;
                            arrVolt[i] = arrVolt[i] * Math.max(0, Math.min(1, Math.max(
                                2 - (i - lastIndex) * 0.1,
                                2 - (min - i) * 0.1
                            )));
                        }
                        last = current;
                        LastVolt = currentVolt;
                        lastIndex = min;
                    });
                    setData(arr);
                    setVoltData(arrVolt);
                });
            } else {
                let arr = [];
                let voltArr = [];
                for (let i = 0; i < 1440; i++) {
                    arr[i] = 0;
                    voltArr[i]=0;
                }
                setWattHours(0);
                setData(arr);
                setVoltData(voltArr);
            }
        });
    }, [date]);

    const timeAxis = <VictoryAxis
            orientation="bottom"
            label="Tageszeit"
            style={{
                axisLabel: {fontSize: 9, padding: 20},
                ticks: {stroke: "grey", size: 5},
                tickLabels: {fontSize: 6, padding: 5}
            }}
            tickCount={15}
            tickFormat={(t) => {
                let mom = moment().hour(0).minutes(t);
                return mom.format("HH:MM");
            }}
        />;

    return (<div>
        <h3>Tagesansicht</h3>

        <div>
            <input value={moment(date).format("YYYY-MM-DD")} onChange={(val) => setDate(val.target.value)} type="date"/>
        </div>
        <div>
            Gesamten Wattstunden: {wattHours.toFixed(2)}WH -> {(wattHours/1000).toFixed(2)}KWH
        </div>

        <h2>Watt</h2>
        <VictoryChart height={200} domain={{y: [0, props.settings.maxLoadWatt]}}>
            <VictoryArea
                style={{data: {fill: "#c43a31"}}}
                data={testDat}
                labelComponent={<VictoryLabel style={{fontSize: 5}}/>}
                labels={({data, index}) => {
                    return (index % 100 === 0) ? "" + (data[index]._y.toFixed(2)) + "W" : "";
                }}
            />
            {timeAxis}
            <VictoryAxis dependentAxis
                         label="Prod. Watt"
                         style={{
                             axisLabel: {fontSize: 9, padding: 30},
                             ticks: {stroke: "grey", size: 5},
                             tickLabels: {fontSize: 6, padding: 5}
                         }}
                         domain={{y: [0, 200]}}
            />
        </VictoryChart>
        <h2>Battery Voltage</h2>
        <VictoryChart height={200} domain={{y: [props.settings.minBatteryVoltage, props.settings.maxBatteryVoltage]}}>
            <VictoryArea
                style={{data: {fill: "#c43a31"}}}
                data={voltData}
                labelComponent={<VictoryLabel style={{fontSize: 5}}/>}
                labels={({data, index}) => {
                    return (index % 100 === 0) ? "" + (data[index]._y.toFixed(2)) + "V" : "";
                }}
            />
            {timeAxis}
            <VictoryAxis dependentAxis
                         label="Battery Voltage"
                         style={{
                             axisLabel: {fontSize: 9, padding: 30},
                             ticks: {stroke: "grey", size: 5},
                             tickLabels: {fontSize: 6, padding: 5}
                         }}
                         domain={{y: [0, 200]}}
            />
        </VictoryChart>
    </div>);
}

export default DayGraphComponent;