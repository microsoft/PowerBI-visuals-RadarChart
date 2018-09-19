/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

// d3
import * as d3 from "d3";
import Selection = d3.Selection;

// Interactivity utils
import {interactivityService} from "powerbi-visuals-utils-interactivityutils";
import SelectableDataPoint = interactivityService.SelectableDataPoint;
import IInteractiveBehavior = interactivityService.IInteractiveBehavior;
import ISelectionHandler = interactivityService.ISelectionHandler;

import * as radarChartUtils from "./radarChartUtils";
import {RadarChartDatapoint} from "./radarChartDataInterfaces";

export interface RadarChartBehaviorOptions {
    selection: d3.Selection<d3.BaseType, SelectableDataPoint, any, any>;
    clearCatcher: d3.Selection<d3.BaseType, any, any, any>;
    hasHighlights: boolean;
}

const getEvent = () => require("d3-selection").event;

export class RadarChartWebBehavior implements IInteractiveBehavior {
    private selection: d3.Selection<d3.BaseType, SelectableDataPoint, any, any>;
    private hasHighlights: boolean;

    public bindEvents(options: RadarChartBehaviorOptions, selectionHandler: ISelectionHandler): void {
        const clearCatcher: d3.Selection<d3.BaseType, any, any, any> = options.clearCatcher;

        this.selection = options.selection;
        this.hasHighlights = options.hasHighlights;

        this.selection.on("click", (dataPoint: SelectableDataPoint) => {
            const mouseEvent: MouseEvent = getEvent() as MouseEvent;

            selectionHandler.handleSelection(dataPoint, mouseEvent.ctrlKey);

            mouseEvent.stopPropagation();
        });

        clearCatcher.on("click", () => {
            selectionHandler.handleClearSelection();
        });
    }

    public renderSelection(hasSelection: boolean): void {
        this.selection.style("opacity", (dataPoint: RadarChartDatapoint) => {
            return radarChartUtils.getFillOpacity(
                dataPoint.selected,
                dataPoint.highlight,
                !dataPoint.highlight && hasSelection,
                !dataPoint.selected && this.hasHighlights);
        });
    }
}
