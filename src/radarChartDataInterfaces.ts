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
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import GroupFormattingModelReference = powerbi.visuals.GroupFormattingModelReference;
import FormattingId = powerbi.visuals.FormattingId;

// Chart utils
import {legendInterfaces} from "powerbi-visuals-utils-chartutils";
import LegendData = legendInterfaces.LegendData;

// Formatting utils
import {valueFormatter} from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = valueFormatter.IValueFormatter;

// Tooltips utils
import {TooltipEnabledDataPoint} from "powerbi-visuals-utils-tooltiputils";

// d3
import { Arc as d3Arc, DefaultArcObject as d3DefaultArcObject} from "d3-shape";

export interface RadarChartDatapoint extends TooltipEnabledDataPoint {
    x: number;
    y: number;
    identity: ISelectionId;
    selected: boolean;
    y0?: number;
    color?: string;
    value?: number;
    tooltipInfo?: VisualTooltipDataItem[];
    labelFormatString?: string;
    labelFontSize?: string;
    highlight?: boolean;
    showPoint: boolean;
}

export interface RadarChartAxesLabel {
    x: number;
    y: number;
    color: string;
    labelFormatString: string;
    labelFontSize: string;
}

export interface IRadarChartData {
    legendData: LegendData;
    labels: RadarChartLabelsData;
    yLabels: RadarChartLabel[];
    series: RadarChartSeries[];
}

export interface RadarChartLabel extends d3Arc<any, d3DefaultArcObject> {
    text: string;
    index: number;
    x?: number;
    y?: number;
    angleInDegree?: number;
    xLinkBegin?: number;
    yLinkBegin?: number;
    xLinkEnd?: number;
    yLinkEnd?: number;
    textAnchor?: string;
    maxWidth?: number;
    isLabelHasConflict?: boolean;
    outsidePlacement?: number;
    hide?: boolean;
    color?: string;
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

export interface RadarChartCircularSegment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface IFontReference extends GroupFormattingModelReference {
    fontFamily?: FormattingId;
    bold?: FormattingId;
    italic?: FormattingId;
    underline?: FormattingId;
    fontSize?: FormattingId;
    color?: FormattingId;
}

export interface ILegendReference extends IFontReference {
    show?: FormattingId;
    showTitle?: FormattingId;
    position?: FormattingId;
    titleText?: FormattingId;
}

export interface ILabelsReference extends IFontReference {
    show?: FormattingId;
}

export interface IDataPointReference extends GroupFormattingModelReference {
    fill?: FormattingId;
}

export interface IDisplayReference extends GroupFormattingModelReference {
    axisBeginning?: FormattingId;
}

export interface ILineReference extends GroupFormattingModelReference {
    show?: FormattingId;
}
