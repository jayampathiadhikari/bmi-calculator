import React from 'react'
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
// import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { useEffect } from "react";

export default function Chart({ labelData = [], bmiData = [] }) {

    useEffect(() => {
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        chart.paddingRight = 20;

        let data = [];

        for (let i = 0; i < labelData.length; i++) {
            console.log(i, labelData[i])
            const date = labelData[i].split('/')
            data.push({ date: new Date(date[2], date[0] - 1, date[1]), name: "name" + i, value: bmiData[i] });
        }

        chart.data = data;

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        valueAxis.min = 0;
        valueAxis.max = 50;
        // valueAxis.extraMax = 1;

        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "value";

        const bullet = series.bullets.push(new am4charts.Bullet());
        const square = bullet.createChild(am4core.Circle);
        square.width = 10;
        square.height = 10;
        square.fill = am4core.color("#ffffff")

        series.stroke = am4core.color("#ffffff");
        series.strokeWidth = 3;

        series.tooltipText = "{valueY.value}";
        chart.cursor = new am4charts.XYCursor();

        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(series);
        chart.scrollbarX = scrollbarX;

        createRange(valueAxis, 0, 18.5, am4core.color("#b4dd1e"));
        createRange(valueAxis, 18.5, 25, am4core.color("#3BCC61"));
        createRange(valueAxis, 25, 30, am4core.color("#f6d32b"));
        createRange(valueAxis, 30, 35, am4core.color("#fb7116"));
        createRange(valueAxis, 35, 100, am4core.color("#EC1F26"));

        createRangeLabel(valueAxis, 18.5, 'Underweight', 'top')
        createRangeLabel(valueAxis, 25, 'Healthy', 'top')
        createRangeLabel(valueAxis, 30, 'Overweight', 'top')
        createRangeLabel(valueAxis, 30, 'Obese', 'bottom')
        createRangeLabel(valueAxis, 35, 'Extremely Obese', 'bottom')
        // createRange(valueAxis, 80, 100, am4core.color("#"));

        return function cleanup() {
            if (chart) {
                chart.dispose();
            }
        };
    })

    function createRange(axis, from, to, color) {
        const range = axis.axisRanges.create();
        range.value = from;
        range.endValue = to;
        range.axisFill.fill = color;
        range.axisFill.fillOpacity = 0.8;
        range.label.disabled = true;
    }

    function createRangeLabel(axis, point, label, position){
        const range = axis.axisRanges.create();
        range.value = point;
        range.label.text = label;
        range.label.fill = am4core.color("#111111");
        range.label.inside = true;
        range.label.verticalCenter = position;
    }

    return (
        <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    )
}
