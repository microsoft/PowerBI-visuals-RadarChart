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

    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import CreateClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    import PixelConverter = jsCommon.PixelConverter;

    import ArcDescriptor = D3.Layout.ArcDescriptor;
    //import NewDataLabelUtils = powerbi.visuals.NewDataLabelUtils;

    export interface RadarChartConstructorOptions {
        animator?: any;//IGenericAnimator;
        svg?: D3.Selection;
        margin?: powerbi.visuals.IMargin;
    }

    export interface RadarChartDatapoint //TODO: extends SelectableDataPoint
     {
        x: number;
        y: number;
        y0?: number;
        color?: string;
        identity: ISelectionId,
        selected?: boolean,
        value?: number;
        tooltipInfo?: any;//TooltipDataItem[];
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
        legendData: powerbi.visuals.LegendData;
        labels: RadarChartLabelsData;
        series: RadarChartSeries[];
        settings: RadarChartSettings;
    }

    export interface RadarChartLabel extends ArcDescriptor {
        text: any;
        x?: number;
        y?: number;
        textAnchor?: string;
        maxWidth?: number;
        isLabelHasConflict?: boolean;
    }

    export interface RadarChartLabelsData {
        labelPoints: RadarChartLabel[];
        formatter: powerbi.visuals.IValueFormatter;
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

    export interface RadarChartBehaviorOptions {
        selection: D3.Selection;
        clearCatcher: D3.Selection;
//        interactivityService: IInteractivityService;
        hasHighlights: boolean;
    }

    export class RadarChart implements IVisual {

        private target: HTMLElement;
        private updateCount: number;


        /** Note: Public for testability */
        public static formatStringProp: DataViewObjectPropertyIdentifier = {
            objectName: 'general',
            propertyName: 'formatString',
        };

        private static Properties: any = {
            legend: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' }
            },
            line: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'line', propertyName: 'show' },
                lineWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'line', propertyName: 'lineWidth' }
            },
            dataPoint: {
                fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' }
            },
            labels: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'show' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
            }
        };

        private static VisualClassName = 'radarChart';
        private static Segments: ClassAndSelector = CreateClassAndSelector('segments');
        private static SegmentNode: ClassAndSelector = CreateClassAndSelector('segmentNode');
        private static Axis: ClassAndSelector = CreateClassAndSelector('axis');
        private static AxisNode: ClassAndSelector = CreateClassAndSelector('axisNode');
        private static AxisLabel: ClassAndSelector = CreateClassAndSelector('axisLabel');
        private static Chart: ClassAndSelector = CreateClassAndSelector('chart');
        private static ChartNode: ClassAndSelector = CreateClassAndSelector('chartNode');
        private static ChartArea: ClassAndSelector = CreateClassAndSelector('chartArea');
        private static ChartPolygon: ClassAndSelector = CreateClassAndSelector('chartPolygon');
        private static ChartDot: ClassAndSelector = CreateClassAndSelector('chartDot');

        private static MaxLineWidth: number = 10;
        private static MinLineWidth: number = 1;
        private static DefaultLineWidth: number = 5;

        private svg: D3.Selection;
        private segments: D3.Selection;
        private axis: D3.Selection;
        private chart: D3.Selection;

        private mainGroupElement: D3.Selection;
        private labelGraphicsContext: D3.Selection;
        private colors: IDataColorPalette;
        private viewport: IViewport;
        private viewportAvailable: IViewport;

     //   private interactivityService: IInteractivityService;
     //   private behavior: IInteractiveBehavior;

        // private animator: IGenericAnimator;
        private margin: powerbi.visuals.IMargin;
      //  private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private radarChartData: RadarChartData;
        private isInteractiveChart: boolean;

        private static DefaultMargin: powerbi.visuals.IMargin = {
            top: 10,
            bottom: 10,
            right: 50,
            left: 50
        };

        private static DefaultLabelSettings: RadarChartLabelSettings = {
            show: true,
            color: '#000',
            fontSize: 8,
        };

        private static ViewportMinWidth = 50;
        private static ViewportMinHeight = 50;

        private static SegmentLevels: number = 5;
        private static SegmentFactor: number = .9;
        private static Radians: number = 2 * Math.PI;
        private static Scale: number = 1;
        public static NodeFillOpacity = 1;
        public static AreaFillOpacity = 0.6;
        public static DimmedAreaFillOpacity = 0.4;
        private angle: number;
        private radius: number;

        public static AxesLabelsFontFamily: string = "sans-serif";

        private static getLabelsData(dataView: DataView): RadarChartLabelsData {
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns ||
                !dataView.metadata.columns[0] ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.categories[0].values) {
                return null;
            }
            let categoryValues = dataView.categorical.categories[0].values;
            /*let formatter = valueFormatter.create({
                format: valueFormatter.getFormatString(dataView.metadata.columns[0], RadarChart.formatStringProp, true),
            });*/

            let labelsData: RadarChartLabelsData = {
                labelPoints: [],
                formatter: null//formatter,
            };
            for (let i: number = 0, iLen: number = categoryValues.length; i < iLen; i++) {
                labelsData.labelPoints.push({
                    text: categoryValues[i],
                    value: null,
                    data: null,
                    startAngle: null,
                    endAngle: null,
                    index: i
                });
            }
            return labelsData;
        }

        public static converter(dataView: DataView, colors: IDataColorPalette//, interactivityService?: IInteractivityService
        	): RadarChartData {
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !(dataView.categorical.categories.length > 0) ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.values ||
                !(dataView.categorical.values.length > 0)) {
                //|| !colors) {
                return {
                    legendData: {
                        dataPoints: []
                    },
                    settings: {
                        showLegend: true,
                        line: true,
                        lineWidth: 4,
                        labels: {
                            show: true,
                            color: '#fff',
                            fontSize: 8,
                        }
                    },
                    labels: RadarChart.getLabelsData(dataView),
                    series: [],
                };
            }

            let catDv: DataViewCategorical = dataView.categorical,
                values: DataViewValueColumns = catDv.values,
                grouped: DataViewValueColumnGroup[] = catDv && catDv.values ? catDv.values.grouped() : null,
                series: RadarChartSeries[] = [],
                colorHelper = null;//new ColorHelper(colors, RadarChart.Properties.dataPoint.fill);

            let hasHighlights: boolean = !!(values.length > 0 && values[0].highlights);
			//LegendData
            let legendData  = {
                fontSize: 8.25,
                dataPoints: [],
                title: ""
            };

            //Parse legend settings
            let settings: RadarChartSettings = RadarChart.parseSettings(dataView);

            for (let i = 0, iLen = values.length; i < iLen; i++) {
                let color = "#000",//colors.getColorByIndex(i).value,
                    serieIdentity: ISelectionId,
                    queryName: string,
                    displayName: string,
                    dataPoints: RadarChartDatapoint[] = [];

                let columnGroup: DataViewValueColumnGroup = grouped
                    && grouped.length > i && grouped[i].values ? grouped[i] : null;

                if (values[i].source) {
                    let source = values[i].source;

                    if (source.queryName) {
                        queryName = source.queryName;
                        serieIdentity = null;//SelectionId.createWithMeasure(queryName);
                    }

                    if (source.displayName) {
                        displayName = source.displayName;
                    }

                    if (source.objects) {
                        let objects: any = source.objects;
                        color = "#000";//colorHelper.getColorForMeasure(objects, queryName);
                    }
                }

                legendData.dataPoints.push({
                    label: displayName,
                    color: color,
                    //icon: LegendIcon.Box,
                    selected: false,
                    identity: serieIdentity
                });

                for (let k = 0, kLen = values[i].values.length; k < kLen; k++) {
                    let dataPointIdentity: ISelectionId = null;/*SelectionIdBuilder
                        .builder()
                        .withMeasure(queryName)
                        .withCategory(catDv.categories[0], k)
                        .withSeries(dataView.categorical.values, columnGroup)
                        .createSelectionId();*/

                    /*let tooltipInfo: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(RadarChart.formatStringProp,
                        catDv,
                        catDv.categories[0].values[k],
                        values[i].values[k],
                        null,
                        null,
                        i);*/

                    let labelFormatString = "";//valueFormatter.getFormatString(catDv.values[i].source, RadarChart.formatStringProp);
                    let fontSizeInPx = "15px";//jsCommon.PixelConverter.fromPoint(settings.labels.fontSize);

                    dataPoints.push({
                        x: k,
                        y: <number>values[i].values[k],
                        color: color,
                        identity: dataPointIdentity,
                        selected: false,
                        tooltipInfo: null,//tooltipInfo,
                        value: <number>values[i].values[k],
                        labelFormatString: labelFormatString,
                        labelFontSize: fontSizeInPx,
                        highlight: hasHighlights && !!(values[0].highlights[k])
                    });
                }

                if (dataPoints.length > 0) {
                    if (interactivityService && !hasHighlights) {
                        interactivityService.applySelectionStateToData(dataPoints);
                    }

                    series.push({
                        fill: color,
                        name: displayName,
                        dataPoints: dataPoints,
                        identity: serieIdentity,
                        hasHighlights: hasHighlights
                    });
                }
            }

            return {
                labels: RadarChart.getLabelsData(dataView),
                legendData: legendData,
                settings: settings,
                series: series,
            };
        }

        private static clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }

        constructor(options: VisualConstructorOptions) {
            const element: HTMLElement = options.element;
            console.clear();
            console.log('Visual constructor', options);
            if (!this.svg) {
                this.svg = d3.select(element).append('svg');
                this.svg.style('position', 'absolute');
            }

            if (!this.margin) {
                this.margin = RadarChart.clone(RadarChart.DefaultMargin);//_.clone(RadarChart.DefaultMargin);
            }

            this.svg.classed(RadarChart.VisualClassName, true);

           // this.interactivityService = powerbi.visuals.createInteractivityService(options.host);
            this.behavior = new RadarChartWebBehavior();
            /*
            this.isInteractiveChart = options.interactivity && options.interactivity.isInteractiveLegend;
            this.legend = createLegend(element,
                this.isInteractiveChart,
                this.interactivityService,
                true,
                LegendPosition.Top);
            this.colors = options.style.colorPalette.dataColors;*/
            this.mainGroupElement = this.svg.append('g');

            this.labelGraphicsContext = this.mainGroupElement
                .append("g");
                //.classed(NewDataLabelUtils.labelGraphicsContextClass.class, true);

            this.segments = this.mainGroupElement
                .append('g')
                .classed(RadarChart.Segments.class, true);

            this.axis = this.mainGroupElement
                .append('g')
                .classed(RadarChart.Axis.class, true);

            this.chart = this.mainGroupElement
                .append('g')
                .classed(RadarChart.Chart.class, true);
        }

        public update(options: VisualUpdateOptions) {
            console.log('Visual update', options);
            if (!options.dataViews || !options.dataViews[0]) {
                this.clear();
                return;
            }

            let dataView = options.dataViews[0];
            this.radarChartData = RadarChart.converter(dataView, this.colors, this.interactivityService);

            let categories: any[] = [],
                series = this.radarChartData.series,
                dataViewMetadataColumn: DataViewMetadataColumn,
                duration = 1000;//AnimatorCommon.GetAnimationDuration(this.animator, options.suppressAnimations);

            if (dataView.categorical &&
                dataView.categorical.categories &&
                dataView.categorical.categories[0] &&
                dataView.categorical.categories[0].values &&
                (series.length > 0)) {
                    categories = dataView.categorical.categories[0].values;
            } else {
                this.clear();
                return;
            }

            if (dataView.metadata && dataView.metadata.columns && dataView.metadata.columns.length > 0) {
                dataViewMetadataColumn = dataView.metadata.columns[0];
            }

            this.viewport = {
                height: options.viewport.height > 0 ? options.viewport.height : 0,
                width: options.viewport.width > 0 ? options.viewport.width : 0
            };

            this.parseLegendProperties(dataView);
            this.parseLineWidth();
            this.renderLegend(this.radarChartData);
            this.updateViewport();

            this.svg
                .attr({
                    'height': this.viewport.height,
                    'width': this.viewport.width
                });

            let mainGroup = this.mainGroupElement;
            mainGroup.attr('transform', radarChartUtils.translate(this.viewport.width / 2, this.viewport.height / 2));

            let labelsFontSize: number = 5;//this.radarChartData.settings.labels.fontSize;

            this.margin.top =    Math.max(RadarChart.DefaultMargin.top, labelsFontSize);
            this.margin.left =   Math.max(RadarChart.DefaultMargin.left, labelsFontSize);
            this.margin.right =  Math.max(RadarChart.DefaultMargin.right, labelsFontSize);
            this.margin.bottom = Math.max(RadarChart.DefaultMargin.bottom, labelsFontSize);

            let width: number = this.viewport.width - this.margin.left - this.margin.right;
            let height: number = this.viewport.height - this.margin.top - this.margin.bottom;

            if ((width < RadarChart.ViewportMinWidth) || (height < RadarChart.ViewportMinHeight)) {
                this.clear();
                return;
            }

            this.viewportAvailable = {
                width: this.viewport.width / 2,
                height: this.viewport.height / 2
            };

            this.angle = RadarChart.Radians / categories.length;
            this.radius = RadarChart.SegmentFactor * RadarChart.Scale * Math.min(width, height) / 2;

            this.drawCircularSegments(categories);
            this.drawAxes(categories);

            this.createAxesLabels();
            this.drawChart(series, duration);
        }

        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }

        private clear(): void {
            this.mainGroupElement.select(RadarChart.Axis.selector).selectAll(RadarChart.AxisNode.selector).remove();
            this.mainGroupElement.select(RadarChart.Axis.selector).selectAll(RadarChart.AxisLabel.selector).remove();
            this.mainGroupElement.select(RadarChart.Segments.selector).selectAll(RadarChart.SegmentNode.selector).remove();
            this.chart.selectAll('*').remove();
        }

        private drawCircularSegments(values: string[]): void {
            let data = [];
            let angle: number = this.angle,
                factor: number = RadarChart.SegmentFactor,
                levels: number = RadarChart.SegmentLevels,
                radius: number = this.radius;

            for (let level: number = 0; level < levels; level++) {
                let levelFactor: number = radius * factor * ((level + 1) / levels);
                for (let i = 0; i <= values.length; i++)
                    data.push({
                        x1: levelFactor * (Math.sin(i * angle)),
                        y1: levelFactor * (Math.cos(i * angle)),
                        x2: levelFactor * (Math.sin((i + 1) * angle)),
                        y2: levelFactor * (Math.cos((i + 1) * angle)),
                    });
            }

            let selection = this.mainGroupElement
                .select(RadarChart.Segments.selector)
                .selectAll(RadarChart.SegmentNode.selector)
                .data(data);

            selection
                .enter()
                .append('svg:line')
                .classed(RadarChart.SegmentNode.class, true);
            selection
                .attr({
                    'x1': item => item.x1,
                    'y1': item => item.y1,
                    'x2': item => item.x2,
                    'y2': item => item.y2,
                });

            selection.exit().remove();
        }

        private drawAxes(values: string[]): void {
            let angle: number = this.angle,
                radius: number = this.radius;

            let selection: D3.Selection = this.mainGroupElement
                .select(RadarChart.Axis.selector)
                .selectAll(RadarChart.AxisNode.selector);

            let axis = selection.data(values);

            axis
                .enter()
                .append('svg:line');
            axis
                .attr({
                    'x1': 0,
                    'y1': 0,
                    'x2': (name, i) => radius * Math.sin(i * angle),
                    'y2': (name, i) => radius * Math.cos(i * angle)
                })
                .classed(RadarChart.AxisNode.class, true);

            axis.exit().remove();
        }

        private getLabelLayout(arc: D3.Svg.Arc, viewport: IViewport): ILabelLayout {
            let labelSettings: RadarChartLabelSettings = this.radarChartData.settings.labels;

            return {
                labelText: (d: RadarChartLabel) => {
                    return d.text;
                    /*let properties: TextProperties = {
                        fontFamily: RadarChart.AxesLabelsFontFamily,
                        fontSize: PixelConverter.fromPoint(labelSettings.fontSize),
                        text: this.radarChartData.labels.formatter.format(d.text)
                    };
                    return TextMeasurementService.getTailoredTextOrDefault(properties, d.maxWidth);*/
                },
                labelLayout: {
                    x: (d: RadarChartLabel) => d.x,
                    y: (d: RadarChartLabel) => d.y,
                },
                filter: (d: RadarChartLabel) => (d != null),
                style: {
                    "font-size": PixelConverter.fromPoint(labelSettings.fontSize),
                    "text-anchor": (d: RadarChartLabel) => d.textAnchor,
                },
            };
        }

        private createAxesLabels(): void {
            if (!this.radarChartData ||
                !this.radarChartData.labels ||
                !this.radarChartData.labels.labelPoints) {
                return;
            }

            let angle: number = this.angle,
                radius = this.radius,
                values = this.radarChartData.labels.labelPoints;

            for (let i: number = 0; i < values.length; i++) {
               let angleInRadian: number = i * angle;
               let label: RadarChartLabel = values[i];
               label.x = 1.1 * radius * Math.sin(angleInRadian);
               label.y = 1.1 * radius * Math.cos(angleInRadian);
               label.textAnchor = (i * angle) < Math.PI ? 'start' : 'end';
               label.maxWidth = this.viewportAvailable.width - Math.abs(label.x);
            }
             let labelArc = d3.svg.arc()
                .innerRadius(d => radius)
                .outerRadius(d => radius * 2);

            let labelLayout = this.getLabelLayout(labelArc, this.viewport);
            /*
            // Hide and reposition labels that overlap
            let dataLabelManager = new DataLabelManager();
            let filteredData = dataLabelManager.hideCollidedLabels(this.viewport, values, labelLayout, true);
            this.drawAxesLabels(<RadarChartLabel[]>filteredData);
            */
        }

        private drawAxesLabels(values: RadarChartLabel[], dataViewMetadataColumn?: DataViewMetadataColumn): void {
            let labelSettings: RadarChartLabelSettings = this.radarChartData.settings.labels;

            let selection: D3.Selection = this.mainGroupElement
                .select(RadarChart.Axis.selector)
                .selectAll(RadarChart.AxisLabel.selector);

            let labels = selection.data(values.filter((d: RadarChartLabel) => labelSettings.show));

            labels
                .enter()
                .append('svg:text');

            labels
                .attr('dy', '1.5em')
                .attr('transform', radarChartUtils.translate(0, -1.5 * labelSettings.fontSize))
                .attr('x', (d: RadarChartLabel) => d.x)
                .attr('y', (d: RadarChartLabel) => d.y)
                .text((d: RadarChartLabel) => {
                    return d.text;
                    /*
                    let properties: TextProperties = {
                        fontFamily: RadarChart.AxesLabelsFontFamily,
                        fontSize: PixelConverter.fromPoint(labelSettings.fontSize),
                        text: this.radarChartData.labels.formatter.format(d.text)
                    };
                    return TextMeasurementService.getTailoredTextOrDefault(properties, d.maxWidth);
                    */
                })
                .style('font-size', (d: RadarChartLabel) => PixelConverter.fromPoint(labelSettings.fontSize))
                .style('text-anchor', (d: RadarChartLabel) => d.textAnchor)
                .style('fill', (d: RadarChartLabel) => labelSettings.color)
                .classed(RadarChart.AxisLabel.class, true);

            labels.exit().remove();
        }

        private drawChart(series: RadarChartSeries[], duration: number): void {
            let angle: number = this.angle,
                dotRadius: number = 5,
                dataPoints: RadarChartDatapoint[][] = this.getDataPoints(series);

            let stack = d3.layout.stack();
            let layers = stack(dataPoints);
            let y: any = this.calculateChartDomain(series);

            let calculatePoints = (points) => {
                return points.map((value) => {
                    let x1: number = y(value.y) * Math.sin(value.x * angle);
                    let y1: number = y(value.y) * Math.cos(value.x * angle);
                    return `${x1},${y1}`;
                }).join(' ');
            };

            let areas = this.chart.selectAll(RadarChart.ChartArea.selector).data(layers);

            areas
                .enter()
                .append('g')
                .classed(RadarChart.ChartArea.class, true);

            let polygon = areas.selectAll(RadarChart.ChartPolygon.selector).data(d => {
                if (d && d.length > 0) {
                    return [d];
                }

                return [];
            });
            polygon
                .enter()
                .append('polygon')
                .classed(RadarChart.ChartPolygon.class, true);

            let settings = this.radarChartData.settings;
            if (settings.line) {
                polygon
                    .style('fill', 'none')
                    .style('stroke', d => d[0].color)
                    .style('stroke-width', settings.lineWidth);
            } else {
                polygon
                    .style('fill', d => d[0].color)
                    .style('stroke-width', 0);
            }

            polygon
                .style('opacity', RadarChart.DimmedAreaFillOpacity)
                .on('mouseover', function (d) {
                    d3.select(this).transition()
                        .duration(duration)
                        .style('opacity', RadarChart.AreaFillOpacity);
                })
                .on('mouseout', function (d) {
                    d3.select(this).transition()
                        .duration(duration)
                        .style('opacity', RadarChart.DimmedAreaFillOpacity);
                })
                .attr('points', calculatePoints);
            polygon.exit().remove();

            areas.exit().remove();
            let selection = this.chart.selectAll(RadarChart.ChartNode.selector).data(layers);

            selection
                .enter()
                .append('g')
                .classed(RadarChart.ChartNode.class, true);

            let hasHighlights: boolean = (series.length > 0) && series[0].hasHighlights;
            let hasSelection: boolean = this.interactivityService && this.interactivityService.hasSelection();

            let dots = selection.selectAll(RadarChart.ChartDot.selector)
                .data((d: RadarChartDatapoint[]) => { return d.filter(d => d.y != null); });

            dots.enter()
                .append('svg:circle')
                .classed(RadarChart.ChartDot.class, true);
            dots.attr('r', dotRadius)
                .attr({
                    'cx': (value) => y(value.y) * Math.sin(value.x * angle),
                    'cy': (value) => y(value.y) * Math.cos(value.x * angle)
                })
                .style('fill', d => d.color)
                .style("opacity", (d: RadarChartDatapoint) => {
                    return radarChartUtils.getFillOpacity(d.selected, d.highlight, !d.highlight && hasSelection, !d.selected && hasHighlights);
                });

            dots.exit().remove();
            //TooltipManager.addTooltip(dots, (tooltipEvent: TooltipEvent) => tooltipEvent.data.tooltipInfo, true);

            selection.exit().remove();

            let behaviorOptions: RadarChartBehaviorOptions = undefined;

            if (this.interactivityService) {
                // Register interactivity
                let dataPointsToBind = this.getAllDataPointsList(series);

                behaviorOptions = {
                    selection: dots,
                    clearCatcher: this.svg,
                    interactivityService: this.interactivityService,
                    hasHighlights: hasHighlights
                };
                this.interactivityService.bind(dataPointsToBind, this.behavior, behaviorOptions);
            }
        }

        public onClearSelection(): void {
            if (this.interactivityService) {
                this.interactivityService.clearSelection();
            }
        }

        private calculateChartDomain(series: RadarChartSeries[]): any {
            let radius: number = this.radius * RadarChart.SegmentFactor,
                dataPointsList: RadarChartDatapoint[] = this.getAllDataPointsList(series);

            let minValue: number = d3.min(dataPointsList, (d) => { return d.y; });
            let maxValue: number = d3.max(dataPointsList, (d) => { return d.y; });

            if (this.isPercentChart(dataPointsList)) {
                minValue = minValue >= 0 ? 0 : -1;
                maxValue = maxValue <= 0 ? 0 : 1;
            }

            let y = d3.scale.linear()
                .domain([minValue, maxValue]).range([0, radius]);

            return y;
        }

        private renderLegend(radarChartData: RadarChartData): void {
            /*
            if (!radarChartData.legendData) {
                return;
            }

            let legendData: LegendData = radarChartData.legendData;

            if (this.legendObjectProperties) {
                LegendData.update(legendData, this.legendObjectProperties);
                let position = <string>this.legendObjectProperties[legendProps.position];

                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
            } else {
                this.legend.changeOrientation(LegendPosition.Top);
            }

            let viewport = this.viewport;
            this.legend.drawLegend(legendData, { height: viewport.height, width: viewport.width });
            Legend.positionChartArea(this.svg, this.legend);
            */
        }

        private getDataPoints(series: RadarChartSeries[]): RadarChartDatapoint[][] {
            let dataPoints: RadarChartDatapoint[][] = [];

            for (let i: number = 0; i < series.length; i++) {
                dataPoints.push(series[i].dataPoints);
            }

            return dataPoints;
        }

        private getAllDataPointsList(series: RadarChartSeries[]): RadarChartDatapoint[] {
            let dataPoints: RadarChartDatapoint[] = [];

            for (let i: number = 0; i < series.length; i++) {
                dataPoints = dataPoints.concat(series[i].dataPoints);
            }

            return dataPoints;
        }

        private isPercentChart(dataPointsList: RadarChartDatapoint[]): boolean {
            for (let i: number = 0; i < dataPointsList.length; i++) {
                if (dataPointsList[i].labelFormatString.indexOf("%") === -1) {
                    return false;
                }
            }

            return true;
        }

        private parseLegendProperties(dataView: DataView): void {
            if (!dataView || !dataView.metadata) {
                this.legendObjectProperties = {};
                return;
            }

            //this.legendObjectProperties = DataViewObjects.getObject(dataView.metadata.objects, "legend", {});
        }

        private static parseSettings(dataView: DataView): RadarChartSettings {
            let objects: DataViewObjects;
            //let powerbi.visuals.DataColorPalette;
            let colors: IDataColorPalette = new powerbi.visuals.DataColorPalette();

            if (!dataView || !dataView.metadata || !dataView.metadata.columns || !dataView.metadata.objects) {
                objects = null;
            } else {
                objects = dataView.metadata.objects;
            }

            return {
                showLegend: true,//DataViewObjects.getValue(objects, RadarChart.Properties.legend.show, true),
                line: true,//DataViewObjects.getValue(objects, RadarChart.Properties.line.show, false),
                lineWidth: 5,//DataViewObjects.getValue(objects, RadarChart.Properties.line.lineWidth, RadarChart.DefaultLineWidth),
                labels: this.parseLabelSettings(objects),
            };
        }

        private static parseLabelSettings(objects: DataViewObjects): RadarChartLabelSettings {
            let settings: RadarChartLabelSettings = <RadarChartLabelSettings>{};
            let defaultSettings: RadarChartLabelSettings = RadarChart.DefaultLabelSettings;
            if (typeof powerbi.visuals.DataColorPalette != undefined) {
                let colors: IDataColorPalette = new powerbi.visuals.DataColorPalette();
            }
            var theme = powerbi.visuals.ThemeManager.getDefaultTheme();

            settings.show = true;//DataViewObjects.getValue(objects, RadarChart.Properties.labels.show, defaultSettings.show);
            settings.fontSize = 5;//DataViewObjects.getValue(objects, RadarChart.Properties.labels.fontSize, defaultSettings.fontSize);

/*
            var ColorHelper
            let colorHelper = new ColorHelper(
                colors,
                RadarChart.Properties.labels.color,
                defaultSettings.color);
            */
            settings.color = "#000";//colorHelper.getColorForMeasure(objects, "");
            return settings;
        }
       /*
        // This function returns the values to be displayed in the property pane for each object.
        // Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
        // validation and return other values/defaults
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let enumeration = new ObjectEnumerationBuilder();
            let settings: RadarChartSettings;

            if (!this.radarChartData || !this.radarChartData.settings) {
                return [];
            }

            settings = this.radarChartData.settings;

            switch (options.objectName) {
                case "legend":
                    enumeration.pushInstance(this.enumerateLegend(settings));
                    break;
                case "dataPoint":
                    this.enumerateDataPoint(enumeration);
                    break;
                case "line":
                    enumeration.pushInstance(this.enumerateLine(settings));
                    break;
                case 'labels':
                    enumeration.pushInstance(this.enumerateDataLabels(enumeration));
                    break;
            }

            return enumeration.complete();
        }

        private enumerateDataLabels(enumeration: ObjectEnumerationBuilder): VisualObjectInstance {
            let settings: RadarChartLabelSettings = this.radarChartData.settings.labels;
            let labels: VisualObjectInstance = {
                objectName: "labels",
                displayName: "labels",
                selector: null,
                properties: {
                    show: settings.show,
                    color: settings.color,
                    fontSize: settings.fontSize,
                }
            };

            return labels;
        }

        private enumerateLegend(settings: RadarChartSettings): VisualObjectInstance {
            let showTitle: boolean = true,
                titleText: string = "",
                legend: VisualObjectInstance,
                labelColor: DataColorPalette,
                fontSize: number = 8,
                position;

            showTitle = DataViewObject.getValue(this.legendObjectProperties, legendProps.showTitle, showTitle);
            titleText = DataViewObject.getValue(this.legendObjectProperties, legendProps.titleText, titleText);
            labelColor = DataViewObject.getValue(this.legendObjectProperties, legendProps.labelColor, labelColor);
            fontSize = DataViewObject.getValue(this.legendObjectProperties, legendProps.fontSize, fontSize);
            position = DataViewObject.getValue(this.legendObjectProperties, legendProps.position, legendPosition.top);

            legend = {
                objectName: "legend",
                displayName: "legend",
                selector: null,
                properties: {
                    show: settings.showLegend,
                    position: position,//LegendPosition[this.legend.getOrientation()],
                    showTitle: showTitle,
                    titleText: titleText,
                    labelColor: labelColor,
                    fontSize: fontSize,
                }
            };

            return legend;
        }

        private enumerateLine(settings: RadarChartSettings): VisualObjectInstance {
            return {
                objectName: RadarChart.Properties.line.show.objectName,
                displayName: 'Draw Lines',
                selector: null,
                properties: {
                    show: settings.line,
                    lineWidth: settings.lineWidth
                }
            };
        }

        private enumerateDataPoint(enumeration: ObjectEnumerationBuilder): void {
            if (!this.radarChartData || !this.radarChartData.series) {
                return;
            }

            let series: RadarChartSeries[] = this.radarChartData.series;

            for (let i: number = 0; i < series.length; i++) {
                let serie = series[i];

                enumeration.pushInstance({
                    objectName: "dataPoint",
                    displayName: serie.name,
                    selector: ColorHelper.normalizeSelector(serie.identity.getSelector(), false),
                    properties: {
                        fill: { solid: { color: serie.fill } }
                    }
                });
            }
        }
        */

        private updateViewport(): void {
            let legendMargins: IViewport = null,//this.legend.getMargins(),
                legendPosition: powerbi.visuals.LegendPosition;

            legendMargins = {
                width: 50,
                height: 50
            };

            legendPosition = powerbi.visuals.LegendPosition.Top;//LegendPosition[<string>this.legendObjectProperties[legendProps.position]];

            switch (legendPosition) {
                case powerbi.visuals.LegendPosition.Top:
                case powerbi.visuals.LegendPosition.TopCenter:
                case powerbi.visuals.LegendPosition.Bottom:
                case powerbi.visuals.LegendPosition.BottomCenter:
                    this.viewport.height = Math.max(this.viewport.height - legendMargins.height, 0);
                    break;

                case powerbi.visuals.LegendPosition.Left:
                case powerbi.visuals.LegendPosition.LeftCenter:
                case powerbi.visuals.LegendPosition.Right:
                case powerbi.visuals.LegendPosition.RightCenter:
                    this.viewport.width = Math.max(this.viewport.width - legendMargins.width, 0);
                    break;
            }
        }

        private parseLineWidth(): void {
            let settings = this.radarChartData.settings;
            settings.lineWidth = Math.max(RadarChart.MinLineWidth, Math.min(RadarChart.MaxLineWidth, settings.lineWidth));
        }
    }

    /**
     * RadarChartBehavior
     */
    export class RadarChartWebBehavior implements IInteractiveBehavior {
        private selection: D3.Selection;
        private interactivityService: IInteractivityService;
        private hasHighlights: boolean;

        public bindEvents(options: RadarChartBehaviorOptions, selectionHandler: ISelectionHandler): void {
            var selection = this.selection = options.selection;
            var clearCatcher = options.clearCatcher;
            this.interactivityService = options.interactivityService;
            this.hasHighlights = options.hasHighlights;

            selection.on('click', function (d: SelectableDataPoint) {
                selectionHandler.handleSelection(d, d3.event.keyCode);
                d3.event.stopPropagation();
            });

            clearCatcher.on('click', function () {
                selectionHandler.handleClearSelection();
            });
        }

        public renderSelection(hasSelection: boolean): void {
            var hasHighlights: boolean = this.hasHighlights;

            this.selection.style("opacity", (d: RadarChartDatapoint) => {
                return radarChartUtils.getFillOpacity(d.selected, d.highlight, !d.highlight && hasSelection, !d.selected && hasHighlights);
            });
        }
    }

    export module radarChartUtils {
        const DimmedOpacity: number = 0.4;
        const DefaultOpacity: number = 1.0;

        export function getFillOpacity(selected: boolean, highlight: boolean, hasSelection: boolean, hasPartialHighlights: boolean): number {
            if ((hasPartialHighlights && !highlight) || (hasSelection && !selected)) {
                return DimmedOpacity;
            }
            return DefaultOpacity;
        }

        export function translate(x: number, y: number): string {
            return 'translate(' + x + ',' + y + ')';
        }
    }

}