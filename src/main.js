import "./style.css";
import Papa from "papaparse";
import { defineCustomElements } from "@arcgis/charts-components/loader";
import { convertInlineConfigToLayerConfig } from "@arcgis/charts-components";
import { createModel } from "@arcgis/charts-components/model";

defineCustomElements(window);

document.querySelector("#app").innerHTML = `
  <div>
    <arcgis-chart id="bar-chart"></arcgis-chart>
    <arcgis-chart id="line-chart"></arcgis-chart>
  </div>
`;

async function setupChart() {
  const wbId = "555663";
  const response = await fetch(
    `https://api.digitalearth.africa/waterbodies/waterbody/${wbId}/observations/csv?start_date=1980-01-01&end_date=2025-12-31`
  );
  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  const records = parsed.data;

  const dateField = "date";

  const { iLayer } = await convertInlineConfigToLayerConfig({
    categoryField: dateField,
    categoryType: "date",
    numericFields: Object.keys(records[0]).filter((key) => key !== dateField),
    inlineData: { dataItems: records }
  });

  // Create a Bar Chart
  const barChartModel = await createModel({ iLayer, chartType: "barChart" });
  await barChartModel.setXAxisField("date");
  await barChartModel.setNumericFields(["percent_wet"]);
  await barChartModel.setAggregationType("no_aggregation");

  barChartModel.setTitleText(`Bar chart for waterbody ${wbId}`);

  const barChart = document.querySelector("#bar-chart");
  barChart.model = barChartModel;
  barChart.actionMode = "zoom";

  // Create a Line Chart
  const lineChartModel = await createModel({ iLayer, chartType: "lineChart" });
  await lineChartModel.setXAxisField("date");
  await lineChartModel.setNumericFields(["percent_wet"]);
  await lineChartModel.setAggregationType("no_aggregation");
  await lineChartModel.setNullPolicy("interpolate");

  lineChartModel.setTitleText(`Line chart for waterbody ${wbId}`);

  const lineChart = document.querySelector("#line-chart");
  lineChart.model = lineChartModel;
  lineChart.actionMode = "zoom";
}

setupChart();
