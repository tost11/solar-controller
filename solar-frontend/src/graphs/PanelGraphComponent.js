import * as React from "react";
import InfoController from "../service/InfoController";
import {VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryStack} from 'victory';
import moment from "moment";


class PanelGraphComponent extends React.Component {

    max = 50;
    graphFontSize = 8;

    axisStyle = {
        axisLabel: {fontSize: 13, padding: 30},
        ticks: {stroke: "grey", size: 5},
        tickLabels: {fontSize: 10, padding: 3}
    };

    constructor(props) {
        super(props);
        this.getLabelText = this.getLabelText.bind(this);
        this.timeAxis = this.timeAxis.bind(this);
        this.state = {
            solarVoltageData: null,
            solarAmpereData: null,
            solarWattData: null,
            batteryVoltageData: null,
            consumerVoltageData: null,
            consumerAmpereData: null,
            consumerWattData: null,
            dates: null,
            currentIndex: 0,
            settings: props.settings,
            solarDetailView: false,
            consumerDetailView: false
        };
    }

    componentDidMount() {
        InfoController.fetchLastData().then((res) => {
            let solarVoltageData = [];
            let solarAmpereData = [];
            let solarWattData = [];
            let batteryVoltageData = [];
            let consumerVoltageData = [];
            let consumerAmpereData = [];
            let consumerWattData = [];
            let dates = [];

            for (let i = 0; i < this.max; i++) {
                solarVoltageData.push({x: i, y: 0});
                solarAmpereData.push({x: i, y: 0});
                solarWattData.push({x: i, y: 0});
                batteryVoltageData.push({x: i, y: 0});
                consumerVoltageData.push({x: i, y: 0});
                consumerAmpereData.push({x: i, y: 0});
                consumerWattData.push({x: i, y: 0});
                dates.push(null);
            }
            if (res.status === 200) {
                res.json().then((obj) => {
                    let solarVoltageData = this.state.solarVoltageData;
                    let solarAmpereData = this.state.solarAmpereData;
                    let solarWattData = this.state.solarWattData;
                    let batteryVoltageData = this.state.batteryVoltageData;
                    let consumerVoltageData = this.state.consumerVoltageData;
                    let consumerAmpereData = this.state.consumerAmpereData;
                    let consumerWattData = this.state.consumerWattData;
                    obj.forEach(solarInfo => {
                        this.addToArr(solarInfo, solarVoltageData, solarAmpereData, solarWattData, batteryVoltageData, consumerVoltageData, consumerAmpereData, consumerWattData, dates);
                    });
                    this.setState({
                        solarVoltageData: solarVoltageData,
                        solarAmpereData: solarAmpereData,
                        solarWattData: solarWattData,
                        batteryVoltageData: batteryVoltageData,
                        consumerVoltageData: consumerVoltageData,
                        consumerAmpereData: consumerAmpereData,
                        consumerWattData: consumerWattData,
                        dates: dates
                    });
                });
            }

            this.setState({
                solarVoltageData: solarVoltageData,
                solarAmpereData: solarAmpereData,
                solarWattData: solarWattData,
                batteryVoltageData: batteryVoltageData,
                consumerVoltageData: consumerVoltageData,
                consumerAmpereData: consumerAmpereData,
                consumerWattData: consumerWattData,
                dates: dates
            });

            //register websocket
            InfoController.registerListener((res) => {
                this.addToGraph(res);
            });
        });
    }

    addToArr(solarInfo, solarVoltageData, solarAmpereData, solarWattData, batteryVoltageData, consumerVoltageData, consumerAmpereData, consumerWattData, dates) {
        for (let i = this.max - 2; i >= 0; i--) {
            solarVoltageData[i + 1].y = solarVoltageData[i].y;
            solarAmpereData[i + 1].y = solarAmpereData[i].y;
            solarWattData[i + 1].y = solarWattData[i].y;
            batteryVoltageData[i + 1].y = batteryVoltageData[i].y;
            consumerVoltageData[i + 1].y = consumerVoltageData[i].y;
            consumerAmpereData[i + 1].y = consumerAmpereData[i].y;
            consumerWattData[i + 1].y = consumerWattData[i].y;
            dates[i + 1] = dates[i];
        }
        solarVoltageData[0].y = solarInfo.chargeVolt;
        solarAmpereData[0].y = solarInfo.chargeAmpere;
        solarWattData[0].y = solarInfo.chargeVolt * solarInfo.chargeAmpere;
        batteryVoltageData[0].y = solarInfo.batteryVoltage;
        consumerVoltageData[0].y = solarInfo.dischargeVoltage;
        consumerAmpereData[0].y = solarInfo.dischargeAmperes;
        consumerWattData[0].y = solarInfo.dischargeVoltage * solarInfo.dischargeAmperes;
        dates[0] = solarInfo.date;
    }

    addToGraph(solarInfo) {
        let solarVoltageData = this.state.solarVoltageData;
        let solarAmpereData = this.state.solarAmpereData;
        let solarWattData = this.state.solarWattData;
        let batteryVoltageData = this.state.batteryVoltageData;
        let consumerVoltageData = this.state.consumerVoltageData;
        let consumerAmpereData = this.state.consumerAmpereData;
        let consumerWattData = this.state.consumerWattData;
        let dates = this.state.dates;
        this.addToArr(solarInfo, solarVoltageData, solarAmpereData, solarWattData, batteryVoltageData, consumerVoltageData, consumerAmpereData, consumerWattData, dates);
        this.setState({
            solarVoltageData: solarVoltageData,
            solarAmpereData: solarAmpereData,
            solarWattData: solarWattData,
            batteryVoltageData: batteryVoltageData,
            currentIndex: (this.state.currentIndex + 1) % 5
        });
    }

    getLabelText(data, index, unit, numDigits) {
        return (index % 5 === this.state.currentIndex && data[index].y > 0.1) ? "" + (data[index].y.toFixed(numDigits ? numDigits : 2)) + unit : "";
    }

    solarVoltageArea(color) {
        return <VictoryArea
            style={color ? {data: {fill: color}} : {}}
            data={this.state.solarVoltageData}
            domain={{x: [0, this.max], y: [0, this.state.settings.maxLoadVoltage]}}
            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
            labels={({data, index}) => this.getLabelText(data, index, "V")}
        />
    }

    solarAmpereArea(color) {
        return <VictoryArea
            style={color ? {data: {fill: color}} : {}}
            data={this.state.solarAmpereData}
            domain={{x: [0, this.max], y: [0, this.state.settings.maxLoadAmpere]}}
            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
            labels={({data, index}) => this.getLabelText(data, index, "A")}
        />
    }

    solarWattArea(color) {
        return <VictoryArea
            style={color ? {data: {fill: color}} : {}}
            data={this.state.solarWattData}
            domain={{x: [0, this.max], y: [0, this.state.settings.maxLoadWatt]}}
            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
            labels={({data, index}) => this.getLabelText(data, index, "W", 1)}
        />
    }

    consumerVoltageArea(color) {
        return <VictoryArea
            style={color ? {data: {fill: color}} : {}}
            data={this.state.consumerVoltageData}
            domain={{x: [0, this.max], y: [0, this.state.settings.maxConsumerVoltage]}}
            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
            labels={({data, index}) => this.getLabelText(data, index, "V")}
        />
    }

    consumerAmpereArea(color) {
        return <VictoryArea
            style={color ? {data: {fill: color}} : {}}
            data={this.state.consumerAmpereData}
            domain={{x: [0, this.max], y: [0, this.state.settings.maxConsumerAmpere]}}
            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
            labels={({data, index}) => this.getLabelText(data, index, "A")}
        />
    }

    consumerWattArea(color) {
        return <VictoryArea
            style={color ? {data: {fill: color}} : {}}
            data={this.state.consumerWattData}
            domain={{x: [0, this.max], y: [0, this.state.settings.maxConsumerWatt]}}
            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
            labels={({data, index}) => this.getLabelText(data, index, "W")}
        />
    }

    timeAxis() {
        return <VictoryAxis
            domain={{x: [0, this.max]}}
            tickFormat={t => {
                if (!this.state.dates[t]) {
                    return "";
                }
                let now = moment(new Date()); //todays date
                let end = moment(this.state.dates[t]); // another date
                let min = moment.duration(now.diff(end)).minutes();
                return min <= 0 ? "" : "" + min + " min";
            }}
            style={this.axisStyle}
        />
    }

    render() {
        return <>
            {this.state.solarVoltageData ? <span>
                <span style={{float: "left", "width": "100%", "maxWidth": "800px"}}>
                    <h2> Solar Info <input type="button"
                                           value={this.state.solarDetailView ? "Weniger Anzeigen" : "Mehr Anzeigen"}
                                           onClick={() => this.setState({solarDetailView: !this.state.solarDetailView})}/></h2>
                    {this.state.solarDetailView ?
                        <span>
                            <VictoryChart>
                                {this.solarVoltageArea("#c43a31")}
                                {this.timeAxis()}
                                <VictoryAxis dependentAxis label="Solar Voltage" style={this.axisStyle}/>
                            </VictoryChart>
                            <VictoryChart>
                                {this.solarAmpereArea("#c43a31")}
                                {this.timeAxis()}
                                <VictoryAxis dependentAxis label="Solar Ampere" style={this.axisStyle}/>
                            </VictoryChart>
                            <VictoryChart>
                                {this.solarWattArea("#c43a31")}
                                {this.timeAxis()}
                                <VictoryAxis dependentAxis label="Solar Watt" style={this.axisStyle}/>
                            </VictoryChart>
                        </span> :
                        <span>
                            <VictoryStack>
                                {this.solarAmpereArea()}
                                {this.solarVoltageArea()}
                                {this.solarWattArea()}
                                <VictoryAxis dependentAxis
                                             domain={{
                                                 x: [0, this.max],
                                                 y: [0, this.state.settings.maxLoadWatt + this.state.settings.maxLoadVoltage + this.state.settings.maxLoadAmpere]
                                             }}
                                             label="Prod. Amp., Vol., Watt" tickFormat={t => ""}/>
                                {this.timeAxis()}
                            </VictoryStack>
                        </span>
                    }
                </span>
                <span style={{float: "left", "width": "100%", "maxWidth": "800px"}}>
                    <h2> Consumer Info <input type="button"
                                              value={this.state.consumerDetailView ? "Weniger Anzeigen" : "Mehr Anzeigen"}
                                              onClick={() => this.setState({consumerDetailView: !this.state.consumerDetailView})}/></h2>
                    {this.state.consumerDetailView ?
                        <span>
                            <VictoryChart>
                                {this.consumerVoltageArea("#c43a31")}
                                {this.timeAxis()}
                                <VictoryAxis dependentAxis label="Consumer Voltage" style={this.axisStyle}/>
                            </VictoryChart>
                            <VictoryChart>
                                {this.consumerAmpereArea("#c43a31")}
                                {this.timeAxis()}
                                <VictoryAxis dependentAxis label="Consumed Ampere" style={this.axisStyle}/>
                            </VictoryChart>
                            <VictoryChart>
                                {this.consumerWattArea("#c43a31")}
                                {this.timeAxis()}
                                <VictoryAxis dependentAxis label="Consumed Watt" style={this.axisStyle}/>
                            </VictoryChart>
                        </span> :
                        <span>
                            <VictoryStack>
                                {this.consumerAmpereArea()}
                                {this.consumerWattArea()}
                                <VictoryAxis dependentAxis
                                             domain={{y: [0, this.state.settings.maxConsumerWatt + this.state.settings.maxConsumerAmpere]}}
                                             label="Prod. Amp., Vol., Watt" tickFormat={t => ""}/>
                                {this.timeAxis()}
                            </VictoryStack>
                        </span>
                    }
                </span>
                <span style={{float: "left", "width": "100%", "maxWidth": "800px"}}>
                    <h2>Battery Voltage:</h2>
                    <VictoryChart>
                        <VictoryArea
                            style={{data: {fill: "#c43a31"}}}
                            data={this.state.batteryVoltageData}
                            domain={{
                                x: [0, this.max],
                                y: [this.state.settings.minBatteryVoltage, this.state.settings.maxBatteryVoltage]
                            }}
                            labelComponent={<VictoryLabel style={{fontSize: this.graphFontSize}}/>}
                            labels={({data, index}) => {
                                return (index % 5 === this.state.currentIndex) ? "" + (data[index].y.toFixed(2) + "V") : ""
                            }}
                        />
                        {this.timeAxis()}
                        <VictoryAxis dependentAxis style={this.axisStyle}/>
                    </VictoryChart>
                </span>
            </span> : <div>Loading...</div>}
        </>
    }
}

export default PanelGraphComponent;