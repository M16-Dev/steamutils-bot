import { ServerHistoryEntry } from "./db.ts";
import QuickChart from "quickchart-js";

// deno-lint-ignore no-explicit-any
const qc = QuickChart as any;

const getYMax = (historyMax: number, serverMax: number): number => {
    if (historyMax) {
        const rounded = 1 << (32 - Math.clz32(historyMax));
        if (serverMax)
            return Math.min(rounded, serverMax);
        return rounded;
    }
    return serverMax
}

export async function generateChartBuffer(history: ServerHistoryEntry[], serverMaxPlayers: number): Promise<Uint8Array | null> {
    const chartData = history.map((h) => ({
        x: h.timestamp,
        y: h.players,
    }));

    const historyMax: number = Math.max(...chartData.map((d) => d.y), 0);
    const yMax: number = getYMax(historyMax, serverMaxPlayers);

    const chart = new qc();
    chart.setWidth(500);
    chart.setHeight(250);
    chart.setFormat("png");
    chart.setBackgroundColor("rgba(0,0,0,0)");
    chart.setVersion("4");

    chart.setConfig({
        type: "line",
        data: {
            datasets: [{
                data: chartData,
                borderColor: qc.getGradientFillHelper("horizontal", ["hsl(180, 40%, 40%)", "hsl(180, 50%, 45%)", "hsl(170, 100%, 60%)"]),
                backgroundColor: qc.getGradientFillHelper("horizontal", ["hsla(180, 40%, 20%, 0.2)", "hsla(180, 50%, 25%, 0.2)", "hsla(170, 100%, 40%, 0.2)"]),
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                cubicInterpolationMode: "default",
            }],
        },
        options: {
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: {
                    min: 0,
                    max: yMax,
                    ticks: {
                        stepSize: Math.ceil(yMax / (yMax >= 20 ? 4 : 2)),
                    },
                    grid: {
                        display: false,
                    },
                },
                x: {
                    type: "time",
                    time: {
                        unit: "hour",
                        displayFormats: {
                            hour: "HH:mm",
                        },
                    },
                    grid: {
                        display: false,
                    },
                },
            },
        },
    });

    return await chart.toBinary();
}
