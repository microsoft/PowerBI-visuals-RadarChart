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

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    // powerbi.extensibility.utils.test
    import VisualBuilderBase = powerbi.extensibility.utils.test.VisualBuilderBase;

    // RadarChart1446119667547
    import VisualClass = powerbi.extensibility.visual.RadarChart1446119667547.RadarChart;

    export class RadarChartBuilder extends VisualBuilderBase<VisualClass> {
        constructor(width: number, height: number) {
            super(width, height, "RadarChart1446119667547");
        }

        protected build(options: VisualConstructorOptions): VisualClass {
            return new VisualClass(options);
        }
        public get instance(): VisualClass {
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

        public get chartDot(): JQuery {
            return this.mainElement
                .find("g.chartNode")
                .first()
                .children("circle.chartDot");
        }
    }
}
