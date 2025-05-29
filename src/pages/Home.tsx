import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Home.css";

export default function Home() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const container = document.querySelector('.main-container');
        if (!container) return;

        // ECG-анимация
        const ecgContainer = document.createElement('div');
        ecgContainer.className = 'ecg-animation';

        // Сетка
        const grid = document.createElement('div');
        grid.className = 'ecg-grid';
        ecgContainer.appendChild(grid);

        // Базовая линия
        const line = document.createElement('div');
        line.className = 'ecg-line';
        ecgContainer.appendChild(line);

        // SVG path
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 2000 100");
        svg.setAttribute("preserveAspectRatio", "none");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "ecg-path");
        path.setAttribute("d", `M0,50 
    L100,50 
    L110,20 L115,25 L120,15 L125,30 
    L130,80 L135,75 L140,85 L145,70 
    L150,50 
    L200,50 
    L210,20 L215,25 L220,15 L225,30 
    L230,80 L235,75 L240,85 L245,70 
    L250,50 
    L300,50 
    L310,20 L315,25 L320,15 L325,30 
    L330,80 L335,75 L340,85 L345,70 
    L350,50 
    L400,50 
    L410,20 L415,25 L420,15 L425,30 
    L430,80 L435,75 L440,85 L445,70 
    L450,50 
    L500,50 
    L510,20 L515,25 L520,15 L525,30 
    L530,80 L535,75 L540,85 L545,70 
    L550,50 
    L600,50 
    L610,20 L615,25 L620,15 L625,30 
    L630,80 L635,75 L640,85 L645,70 
    L650,50 
    L700,50 
    L710,20 L715,25 L720,15 L725,30 
    L730,80 L735,75 L740,85 L745,70 
    L750,50 
    L800,50 
    L810,20 L815,25 L820,15 L825,30 
    L830,80 L835,75 L840,85 L845,70 
    L850,50 
    L900,50 
    L910,20 L915,25 L920,15 L925,30 
    L930,80 L935,75 L940,85 L945,70 
    L950,50 
    L1000,50
    L1010,20 L1015,25 L1020,15 L1025,30 
    L1030,80 L1035,75 L1040,85 L1045,70 
    L1050,50 
    L1100,50 
    L1110,20 L1115,25 L1120,15 L1125,30 
    L1130,80 L1135,75 L1140,85 L1145,70 
    L1150,50 
    L1200,50 
    L1210,20 L1215,25 L1220,15 L1225,30 
    L1230,80 L1235,75 L1240,85 L1245,70 
    L1250,50 
    L1300,50 
    L1310,20 L1315,25 L1320,15 L1325,30 
    L1330,80 L1335,75 L1340,85 L1345,70 
    L1350,50 
    L1400,50 
    L1410,20 L1415,25 L1420,15 L1425,30 
    L1430,80 L1435,75 L1440,85 L1445,70 
    L1450,50 
    L1500,50 
    L1510,20 L1515,25 L1520,15 L1525,30 
    L1530,80 L1535,75 L1540,85 L1545,70 
    L1550,50 
    L1600,50 
    L1610,20 L1615,25 L1620,15 L1625,30 
    L1630,80 L1635,75 L1640,85 L1645,70 
    L1650,50 
    L1700,50 
    L1710,20 L1715,25 L1720,15 L1725,30 
    L1730,80 L1735,75 L1740,85 L1745,70 
    L1750,50 
    L1800,50 
    L1810,20 L1815,25 L1820,15 L1825,30 
    L1830,80 L1835,75 L1840,85 L1845,70 
    L1850,50 
    L1900,50 
    L1910,20 L1915,25 L1920,15 L1925,30 
    L1930,80 L1935,75 L1940,85 L1945,70 
    L1950,50 
    L2000,50`);
        svg.appendChild(path);
        ecgContainer.appendChild(svg);

        // Beep
        const beep = document.createElement('div');
        beep.className = 'ecg-beep';
        ecgContainer.appendChild(beep);

        container.appendChild(ecgContainer);

        const timer = setTimeout(() => setLoaded(true), 300);

        return () => {
            clearTimeout(timer);
            if (container.contains(ecgContainer)) {
                container.removeChild(ecgContainer);
            }
        };
    }, []);

    return (
        <>
            <Header />
            <main className="main-container">
                <div className={`main-content ${loaded ? 'loaded' : ''}`}>
                    <div className="main-info">
                        <h1>Advanced</h1>
                        <h2>MRI Analysis Powered by AI</h2>
                        <p>
                            Cutting-edge deep learning technology for
                            precise medical imaging analysis with 98.7% diagnostic accuracy.
                        </p>
                        <Link to='/upload'><button>Get started</button></Link>
                    </div>
                </div>
            </main>
        </>
    );
}