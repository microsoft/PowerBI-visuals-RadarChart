/*
 *  Power BI Visual CLI
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

module powerbi.extensibility.visual {
    // external libraries
    import Selection = d3.Selection;

    // powerbi.visuals
    import SelectableDataPoint = powerbi.visuals.SelectableDataPoint;
    import IInteractivityService = powerbi.visuals.IInteractivityService;
    import IInteractiveBehavior = powerbi.visuals.IInteractiveBehavior;
    import ISelectionHandler = powerbi.visuals.ISelectionHandler;

    export interface RadarChartBehaviorOptions {
        selection: Selection<SelectableDataPoint>;
        clearCatcher: Selection<any>;
        interactivityService: IInteractivityService;
        hasHighlights: boolean;
    }

    export class RadarChartWebBehavior implements IInteractiveBehavior {
        private selection: Selection<SelectableDataPoint>;
        private interactivityService: IInteractivityService;
        private hasHighlights: boolean;

        public bindEvents(options: RadarChartBehaviorOptions, selectionHandler: ISelectionHandler): void {
            const clearCatcher: Selection<any> = options.clearCatcher;

            this.selection = options.selection;
            this.interactivityService = options.interactivityService;
            this.hasHighlights = options.hasHighlights;

            this.selection.on("click", (dataPoint: SelectableDataPoint) => {
                const mouseEvent: MouseEvent = d3.event as MouseEvent;

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
}
