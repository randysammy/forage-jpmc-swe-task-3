import React, { Component } from "react";
import { Table, TableData } from "@finos/perspective";
import { ServerRespond } from "./DataStreamer";
import { DataManipulator } from "./DataManipulator";
import "./Graph.css";

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = (document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown) as PerspectiveViewerElement;

    const schema = {
      price_abc: "float", // use to find ratio
      price_def: "float", //use to find ratio
      ratio: "float", // will be displayed as line in graph
      upper_bound: "float", // mark upper bound of ratio
      lower_bound: "float", // lower bound of ratio on graph
      trigger_alert: "float", //indicator to find momeny bounds are crossed
      timestamp: "date", // x axis value
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute("view", "y_line"); // sets type of graphs et top y line
      elem.setAttribute("row-pivots", '["timestamp"]'); // maps each data point based on time stamp
      elem.setAttribute(
        "columns",
        '["ratio" , "lower_bound", "upper_bound", "trigger_alert"]'
      ); // data points on y axis to track
      elem.setAttribute(
        "aggregates", // handles duplicate data and consoldates them into one
        JSON.stringify({
          price_abc: "avg",
          price_def: "avg",
          ratio: "avg",
          timestamp: "distinct count",
          upper_bound: "avg",
          lower_bound: "avg",
          trigger_alert: "avg",
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update(([
        DataManipulator.generateRow(this.props.data),
      ] as unknown) as TableData);
    }
  }
}

export default Graph;
