import * as React from "react";
import InfoController from "./service/InfoController";


class MainComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {solarInfo: null};
    }

    componentDidMount() {
        InfoController.fetchInfo().then((res) => {
            console.log(res);
            res.json().then((obj) => {
                this.setState({solarInfo: obj});
            });
        });

        InfoController.registerListener((res) => {
            this.setState({solarInfo: res})
        });
    }


    render() {
        return <body>
        <h2>Solar status</h2>

        {this.state.solarInfo && <span>
            <p>Solar Load: {this.state.solarInfo.chargeVolt}V * {this.state.solarInfo.chargeAmpere}A
                = {(this.state.solarInfo.chargeVolt * this.state.solarInfo.chargeAmpere).toFixed(2)}W </p>
            <p>Battery Voltage: {this.state.solarInfo.batteryVoltage}V</p>
            <p>Battery Loading: {this.state.solarInfo.batteryAmperes}A</p>
            <p>Consumer Power: {this.state.solarInfo.dischargeVoltage}V * {this.state.solarInfo.dischargeAmperes}A
                = {(this.state.solarInfo.dischargeVoltage * this.state.solarInfo.dischargeAmperes).toFixed(2)}W</p>
            <p>Today Watthours: {this.state.solarInfo.wattHoursToday.toFixed(2)}WH -> {(this.state.solarInfo.wattHoursToday / 1000).toFixed(2)}KWH</p>
            <p>Total Watthours: {this.state.solarInfo.totalWattHours.toFixed(2)}WH -> {(this.state.solarInfo.totalWattHours / 1000).toFixed(2)}KWH</p>
            <p>Today Consumed Watthours: {this.state.solarInfo.consumedWattHoursToday.toFixed(2)}WH -> {(this.state.solarInfo.consumedWattHoursToday / 1000).toFixed(2)}KWH</p>
            <p>Total Consumed Watthours: {this.state.solarInfo.totalConsumedWattHours.toFixed(2)}WH -> {(this.state.solarInfo.totalConsumedWattHours / 1000).toFixed(2)}KWH</p>
        </span>}
        </body>
    }
}

export default MainComponent;