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
    import Arc = d3.svg.arc.Arc;

    // powerbi.visuals
    import SelectableDataPoint = powerbi.visuals.SelectableDataPoint;
    import VisualTooltipDataItem = powerbi.visuals.VisualTooltipDataItem;
    import LegendData = powerbi.visuals.LegendData;
    import IValueFormatter = powerbi.visuals.IValueFormatter;
    import IInteractivityService = powerbi.visuals.IInteractivityService;

    export interface RadarChartDatapoint extends SelectableDataPoint {
        x: number;
        y: number;
        y0?: number;
        color?: string;
        value?: number;
        tooltipInfo?: VisualTooltipDataItem[];
        labelFormatString?: string;
        labelFontSize?: string;
        highlight?: boolean;
    }

    export interface RadarChartAxesLabel {
        x: number;
        y: number;
        color: string;
        labelFormatString: string;
        labelFontSize: string;
    }

    export interface RadarChartData {
        legendData: LegendData;
        labels: RadarChartLabelsData;
        series: RadarChartSeries[];
        settings: RadarChartSettings;
    }

    export interface RadarChartLabel extends Arc {
        text: any;
        index: number;
        x?: number;
        y?: number;
        textAnchor?: string;
        maxWidth?: number;
        isLabelHasConflict?: boolean;
    }

    export interface RadarChartLabelsData {
        labelPoints: RadarChartLabel[];
        formatter: IValueFormatter;
    }

    export interface RadarChartSeries {
        fill: string;
        name: string;
        dataPoints: RadarChartDatapoint[];
        identity: ISelectionId;
        hasHighlights?: boolean;
    }

    export interface RadarChartSettings {
        showLegend?: boolean;
        line: boolean;
        lineWidth: number;
        labels: RadarChartLabelSettings;
    }

    export interface RadarChartLabelSettings {
        show: boolean;
        color: string;
        fontSize: number;
    }

    export interface RadarChartCircularSegment {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }
}
