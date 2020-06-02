import React, {useEffect, useState} from 'react';
import './App.css';
import MainComponent from "./MainComponent";
import PanelGraphComponent from "./graphs/PanelGraphComponent";
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import InfoController from "./service/InfoController";
import DayGraphComponent from "./graphs/DayGraphComponent";
import YearGraphComponent from "./graphs/YearGraphComponent";

function App() {

    InfoController.initUrl();

    InfoController.connectWebSocket();

    const [settings, setSettings] = useState(null);

    useEffect(() => {
        InfoController.fetchSettings().then((res) => {
            res.json().then((res2 => {
                setSettings(res2);
            }))
        })
    }, []);

    return (
        <span>{
            settings ?
                <Router>
                    <div>
                        <nav>
                            <ul>
                                <li>
                                    <Link to="/">Home</Link>
                                </li>
                                <li>
                                    <Link to="/actual">Life Daten</Link>
                                </li>
                                <li>
                                    <Link to="/day">Tages Daten</Link>
                                </li>
                                <li>
                                    <Link to="/year">Jahres Daten</Link>
                                </li>
                            </ul>
                        </nav>
                        <Switch>
                            <Route path="/actual">
                                <PanelGraphComponent settings={settings}/>
                            </Route>
                            <Route path="/day">
                                <DayGraphComponent settings={settings}/>
                            </Route>
                            <Route path="/year">
                                <YearGraphComponent settings={settings}/>
                            </Route>
                            <Route path="/">
                                <MainComponent settings={settings}/>
                            </Route>
                        </Switch>
                    </div>
                </Router> :
                <p>Loading</p>
        }
        </span>
    );
}

export default App;
