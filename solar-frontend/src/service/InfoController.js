import Stomp from "stompjs";

class InfoController {

    static webSocket = null;
    static listeners = [];
    static wsUrl = "";
    static url = "";

    static registerListener(func) {
        this.listeners.push(func);
    }

    static initUrl() {
        this.url = window.location.href;
        let arr = this.url.split("//");
        console.log(arr);
        this.url = arr[0] + "//" + arr[1].split("/")[0];
        if (!this.url.endsWith("/")) {
            this.url += "/";
        }
        if (this.url.startsWith("https")) {
            this.wsUrl = this.url.replace("https", "wss");
        } else {
            this.wsUrl = this.url.replace("http", "ws");
        }
        this.wsUrl += "ws";
        console.log("Url is: " + this.url);
        console.log("WS Url is: " + this.wsUrl);
    }

    static connectWebSocket() {
        let socket = new WebSocket(this.wsUrl);
        let ws = Stomp.over(socket);
        let that = this;
        ws.connect({}, (frame) => {
            console.log("Connected over ws");
            ws.subscribe("/info", (message) => {
                //console.log(message);
                console.log(message);
                let status = JSON.parse(message.body)[0];
                this.listeners.forEach((func) => {
                    func(status);
                })
            });
            that.webSocket = ws;
        }, function (error) {
            console.log("STOMP error " + error);
            that.webSocket = null;
        });
    }

    static fetchInfo() {
        return fetch(this.url + "api/solar/info", {credentials: "include"});
    }

    static fetchSettings() {
        return fetch(this.url + "api/solar/settings", {credentials: "include"});
    }

    static fetchLastData() {
        return fetch(this.url + "api/solar/last", {credentials: "include"});
    }

    static fetchDay(date) {
        return fetch(this.url + "api/solar/day/" + date, {credentials: "include"});
    }

    static fetchYear(year) {
        return fetch(this.url + "api/solar/year/" + year, {credentials: "include"});
    }
}

export default InfoController;
