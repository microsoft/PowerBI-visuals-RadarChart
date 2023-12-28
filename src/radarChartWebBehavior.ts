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
import {
    select as d3Select,
    Selection as d3Selection 
} from "d3-selection";
type Selection<T> = d3Selection<any, T, any, any>;

// Interactivity utils
import { 
    interactivityBaseService,
    interactivitySelectionService as interactivityService 
} from "powerbi-visuals-utils-interactivityutils";
import SelectableDataPoint = interactivityService.SelectableDataPoint;
import IInteractiveBehavior = interactivityBaseService.IInteractiveBehavior;
import ISelectionHandler = interactivityBaseService.ISelectionHandler;
import IBehaviorOptionsCommon = interactivityBaseService.IBehaviorOptions;

type IBehaviorOptions = IBehaviorOptionsCommon<RadarChartDatapoint>;

import * as radarChartUtils from "./radarChartUtils";
import {RadarChartDatapoint} from "./radarChartDataInterfaces";

export interface RadarChartBehaviorOptions extends IBehaviorOptions {
    selection: Selection<RadarChartDatapoint>;
    clearCatcher: Selection<any>;
    hasHighlights: boolean;
}

const getEvent = () => require("d3-selection").event;

export class RadarChartWebBehavior implements IInteractiveBehavior {
    private selection: Selection<RadarChartDatapoint>;
    private hasHighlights: boolean;

    public bindEvents(options: RadarChartBehaviorOptions, selectionHandler: ISelectionHandler): void {
        const clearCatcher: Selection<any> = options.clearCatcher;

        this.selection = options.selection;
        this.hasHighlights = options.hasHighlights;

        this.selection.on("click", (event: PointerEvent, dataPoint: RadarChartDatapoint) => {
            selectionHandler.handleSelection(dataPoint, event.ctrlKey || event.metaKey || event.shiftKey);

            event.stopPropagation();
        });

        this.selection.on("keydown", (event : KeyboardEvent, dataPoint: RadarChartDatapoint) => {
            if(event?.code == "Enter" || event?.code == "Space")
            {
                selectionHandler.handleSelection(
                    dataPoint,
                    event.ctrlKey || event.metaKey || event.shiftKey);
            }
        });

        this.selection.on("contextmenu", (event: PointerEvent, dataPoint: RadarChartDatapoint) => {
            selectionHandler.handleContextMenu(dataPoint,
                {
                    x: event.clientX,
                    y: event.clientY
                }
            );
            event.preventDefault(); 
        })

        clearCatcher.on("click", () => {
            selectionHandler.handleClearSelection();
        });

        clearCatcher.on("contextmenu", (event: PointerEvent) => {
            selectionHandler.handleContextMenu({"selected" : false},
            {
                x: event.clientX,
                y: event.clientY
            });
            event.preventDefault(); 
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

        this.selection.attr("aria-selected",(dataPoint: RadarChartDatapoint) =>{
            return (hasSelection && dataPoint.selected);
        });
    }
}
