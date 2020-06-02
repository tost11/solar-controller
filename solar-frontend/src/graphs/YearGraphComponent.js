import React, {useEffect, useState} from 'react';
import InfoController from "../service/InfoController";
import moment from "moment";
import {Selection, VictoryAxis, VictoryBar, VictoryChart, VictoryLegend, VictoryLine, VictoryTooltip} from "victory";

class MouseFollowTooltip extends React.Component {
    static defaultEvents = [
        {
            target: "data",
            eventHandlers: {
                onMouseOver: evt => {
                    const {x, y} = Selection.getSVGEventCoordinates(evt);
                    return {
                        target: "labels",
                        mutation: () => ({
                            x,
                            y,
                            active: true
                        })
                    };
                },
                onMouseMove: evt => {
                    const {x, y} = Selection.getSVGEventCoordinates(evt);
                    return {
                        target: "labels",
                        mutation: () => ({
                            x,
                            y,
                            active: true
                        })
                    };
                },
                onMouseOut: () => {
                    return {target: "labels", mutation: () => ({active: false})};
                }
            }
        }
    ];

    render() {
        return <VictoryTooltip {...this.props} pointerLength={0}/>;
    }
}

function DayGraphComponent(props) {

    const [testData, setData] = useState(null);
    const [wattHours, setWattHours] = useState(0);
    const [consumedWattHours, setConsumedWattHours] = useState(0);
    const [date, setDate] = useState(2020);
    const [monthData, setMonthData] = useState(null);
    const [month, setMonth] = useState(null);
    const [monthWattHours,setMonthWattHours] = useState(null);
    const [monthConsumedWattHours,setMonthConsumedWattHours] = useState(null);

    useEffect(() => {
        InfoController.fetchYear(date).then((res) => {
            if (res.status === 200) {
                res.json().then((obj) => {
                    setWattHours(obj.wattHours);
                    setConsumedWattHours(obj.consumedWattHours);
                    let arr = [];
                    for (let i = 0; i < obj.days.length; i++) {
                        arr[i] = obj.days[i].wattHours;
                    }
                    let arrConsumed = [];
                    for (let i = 0; i < obj.days.length; i++) {
                        arrConsumed[i] = obj.days[i].consumedWattHours;
                    }
                    setData({arr, arrConsumed, obj});
                    if (moment().year() === date) {
                        setMonth(moment().month() + 1);
                    } else {
                        setMonth(1);
                    }
                });
            } else {
                setWattHours(0);
                setConsumedWattHours(0);
                setData(null);
                setMonth(null);
            }
        });
    }, [date]);

    useEffect(() => {
        if (!testData || !month) {
            return;
        }
        let arr = [];
        let arrConsumed = [];
        let mom = moment(date, "YYYY").month(month - 1);
        let days = mom.daysInMonth();
        console.log("date", mom);
        console.log("days", days);
        console.log("month", month);
        let wattHours = 0;
        let consumedWattHours = 0;
        let start = mom.dayOfYear();
        for (let i = start; i < start + days; i++) {
            arr.push(testData.obj.days[i - 1].wattHours);
            wattHours += testData.obj.days[i - 1].wattHours;
            arrConsumed.push(testData.obj.days[i - 1].consumedWattHours);
            consumedWattHours += testData.obj.days[i - 1].consumedWattHours;
        }
        setMonthData({arr, arrConsumed});
        setMonthWattHours(wattHours);
        setMonthConsumedWattHours(consumedWattHours);
    }, [month, testData, date]);

    const monthAxis = () => {
        return <VictoryAxis
            orientation="bottom"
            style={{
                axisLabel: {fontSize: 9, padding: 20},
                ticks: {stroke: "grey", size: 5},
                tickLabels: {fontSize: 6, padding: 5}
            }}
            tickCount={11}
            tickFormat={(t) => {
                let mom = moment().dayOfYear(t).minutes(0);
                return mom.format("MMM");
            }}
        />
    };

    const wattAxis = (label) => {
        return <VictoryAxis dependentAxis
                            label={label}
                            style={{
                                axisLabel: {fontSize: 9, padding: 30},
                                ticks: {stroke: "grey", size: 5},
                                tickLabels: {fontSize: 6, padding: 5}
                            }}
        />
    };

    return (<div>
        <h2>Jahresbericht</h2>

        <div>
            <select id="Year" value={date} onChange={ev => setDate(parseInt(ev.target.value))}>
                <option value={2019}>2019</option>
                <option value={2020}>2020</option>
                <option value={2021}>2021</option>
            </select>
        </div>
        <div>
            Gesamten Wattstunden: {wattHours.toFixed(2)}WH -> {(wattHours/1000).toFixed(2)}KWH
        </div>

        <div>
            Gesamten Verbrauchte Wattstunden: {consumedWattHours.toFixed(2)}WH -> {(consumedWattHours/100).toFixed(2)}KWH
        </div>

        <span>
            <span style={{float: "left", "width": "100%", "maxWidth": "800px"}}>
                <h3>Produzierte Wattstunden</h3>
                {testData &&
                <VictoryChart domainPadding={10}>
                    <VictoryBar
                        style={{data: {fill: "#c43a31"}, labels: {fontSize: 10}}}
                        data={testData.arr}
                        domain={{x: [0, 366], y: [0, props.settings.maxYearWattHours]}}
                        labels={({datum}) => {
                            return moment(testData.obj.days[datum._x].date).format("DD.MM.YYYY") + "\n" + testData.obj.days[datum._x].wattHours.toFixed(2) + "WH";
                        }}
                        labelComponent={<MouseFollowTooltip/>}
                    />
                    {wattAxis("Tagesproduktion in Watt Stunden")}
                    {monthAxis()}
                </VictoryChart>}
            </span>
            <span style={{float: "left", "width": "100%", "maxWidth": "800px"}}>
                <h3>Verbrauchte Wattstunden</h3>
                {testData &&
                <VictoryChart domainPadding={10}>
                    <VictoryBar
                        style={{data: {fill: "#c43a31"}, labels: {fontSize: 10}}}
                        data={testData.arrConsumed}
                        domain={{x: [0, 366], y: [0, props.settings.maxYearConsumedWattHours]}}
                        labels={({datum}) => {
                            return moment(testData.obj.days[datum._x].date).format("DD.MM.YYYY") + "\n" + testData.obj.days[datum._x].wattHours.toFixed(2) + "WH";
                        }}
                        labelComponent={<MouseFollowTooltip/>}
                    />
                    {wattAxis("Tagelverbrauch in Watt Stunden")}
                    {monthAxis()}
                </VictoryChart>
                }
            </span>
                <span style={{float: "left", "width": "100%", "maxWidth": "800px"}}>
                    {month && monthData &&
                    <span>
                        <h3>Monatliche Produktion vs. Verbrauch</h3>
                        Produkion: {monthWattHours.toFixed(2)}WH -> {(monthWattHours/1000).toFixed(2)}KWH<br/>
                        Verbrauch: {monthConsumedWattHours.toFixed(2)}WH -> {(monthConsumedWattHours/1000).toFixed(2)}KWH
                        <div>
                            <select value={month} id="Monat" onChange={ev => setMonth(parseInt(ev.target.value))}>
                                <option value={1}>Januar</option>
                                <option value={2}>Februar</option>
                                <option value={3}>März</option>
                                <option value={4}>April</option>
                                <option value={5}>Mai</option>
                                <option value={6}>Juni</option>
                                <option value={7}>Juli</option>
                                <option value={8}>August</option>
                                <option value={9}>September</option>
                                <option value={10}>Oktober</option>
                                <option value={11}>November</option>
                                <option value={12}>Dezember</option>
                            </select>
                        </div>
                        <VictoryChart>
                            <VictoryLine
                                style={{
                                    data: {stroke: "#c43a31"},
                                    parent: {border: "1px solid #ccc"}
                                }}
                                domain={{
                                    x: [0, monthData.arr.length - 1],
                                    y: [0, props.settings.maxYearWattHours]
                                }}
                                data={monthData.arr}
                            />
                            <VictoryLine
                                style={{
                                    data: {stroke: "#c43aaa"},
                                    parent: {border: "1px solid #ccc"}
                                }}
                                domain={{
                                    x: [0, monthData.arrConsumed.length - 1],
                                    y: [0, props.settings.maxYearWattHours]
                                }}
                                data={monthData.arrConsumed}
                            />
                            <VictoryLegend x={125} y={50}
                                           orientation="horizontal"
                                           gutter={20}
                                           style={{border: {stroke: "black"}, labels: {fontSize: 8}}}
                                           data={[
                                               {name: "Produktion", symbol: {fill: "#c43a31"}},
                                               {name: "Verbrauch", symbol: {fill: "#c43aaa"}},
                                           ]}
                            />
                            {wattAxis("Angabe in Watt Stunden")}
                            <VictoryAxis
                                orientation="bottom"
                                style={{
                                    axisLabel: {fontSize: 9, padding: 20},
                                    ticks: {stroke: "grey", size: 5},
                                    tickLabels: {fontSize: 6, padding: 5}
                                }}
                                tickFormat={(t) => {
                                    return t + 1;
                                }}
                                tickCount={31}
                                label={"Tage"}
                            />
                                    </VictoryChart>
                                    </span>
                    }
                                    </span>
                                    </span>

    </div>);
}

export default DayGraphComponent;