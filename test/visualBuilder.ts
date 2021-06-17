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

// powerbi.extensibility.utils.test
import { VisualBuilderBase } from "powerbi-visuals-utils-testutils";
import {RadarChart} from "../src/radarChart";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

// RadarChart1446119667547
export class RadarChartBuilder extends VisualBuilderBase<RadarChart> {
    constructor(width: number, height: number) {
        super(width, height, "RadarChart1446119667547");
    }

    protected build(options: VisualConstructorOptions): RadarChart {
        return new RadarChart(options);
    }
    public get instance(): RadarChart {
        return this.visual;
    }
    public get mainElement(): JQuery {
        return this.element.children("svg");
    }

    public get chart(): JQuery {
        return this.mainElement
            .children("g")
            .children("g.chart");
    }

    public get chartAreas(): JQuery {
        return this.chart
            .children("g.chartArea");
    }

    public get chartPolygons(): JQuery {
        return this.chart
            .children("g.chartArea")
            .children("polygon.chartPolygon");
    }

    public get dataLabelsText(): JQuery {
        return this.mainElement
            .children("g")
            .children("g.axis")
            .children("text.axisLabel");
    }

    public get legendGroup(): JQuery {
        return this.element
            .children("svg.legend")
            .children("g#legendGroup");
    }

    public get legendTitle(): JQuery {
        return this.legendGroup.children(".legendTitle");
    }

    public get legendItemText(): JQuery {
        return this.legendGroup
            .children(".legendItem")
            .children("text.legendText");
    }

    public get legendItemCircle(): JQuery {
        return this.legendGroup
            .children(".legendItem")
            .children("circle");
    }

    public get chartNodes(): JQuery {
        return this.mainElement
            .find("g.chartNode");
    }

    public get chartDot(): JQuery {
        return this.mainElement
            .find("g.chartNode")
            .first()
            .children("circle.chartDot");
    }
}
