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
    import UpdateSelection = d3.selection.Update;
    import Arc = d3.svg.arc.Arc;
    import SvgArc = d3.svg.Arc;
    import Linear = d3.scale.Linear;

    // jsCommon
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import CreateClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    import PixelConverter = jsCommon.PixelConverter;

    // powerbi
    import DataViewObject = powerbi.DataViewObject;
    import DataLabelManager = powerbi.DataLabelManager;
    import PrimitiveValue = powerbi.PrimitiveValue;
    import IViewport = powerbi.IViewport;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import DataView = powerbi.DataView;
    import DataViewCategorical = powerbi.DataViewCategorical;
    import DataViewValueColumns = powerbi.DataViewValueColumns;
    import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import TextProperties = powerbi.TextProperties;
    import TextMeasurementService = powerbi.TextMeasurementService;
    import DataViewObjects = powerbi.DataViewObjects;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import VisualObjectInstance = powerbi.VisualObjectInstance;

    // powerbi.extensibility
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import IVisual = powerbi.extensibility.IVisual;
    import ISelectionId = powerbi.extensibility.ISelectionId;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;

    // powerbi.visuals
    import IMargin = powerbi.visuals.IMargin;
    import IInteractivityService = powerbi.visuals.IInteractivityService;
    import IInteractiveBehavior = powerbi.visuals.IInteractiveBehavior;
    import createInteractivityService = powerbi.visuals.createInteractivityService;
    import ColorHelper = powerbi.visuals.ColorHelper;
    import IVisualSelectionId = powerbi.visuals.ISelectionId;
    import valueFormatter = powerbi.visuals.valueFormatter;
    import IValueFormatter = powerbi.visuals.IValueFormatter;
    import TooltipBuilder = powerbi.visuals.TooltipBuilder;
    import ITooltipService = powerbi.visuals.ITooltipService;
    import VisualTooltipDataItem = powerbi.visuals.VisualTooltipDataItem;
    import TooltipEventArgs = powerbi.visuals.TooltipEventArgs;
    import createTooltipService = powerbi.visuals.createTooltipService;
    import SVGUtil = powerbi.visuals.SVGUtil;
    import LegendData = powerbi.visuals.LegendData;
    import LegendIcon = powerbi.visuals.LegendIcon;
    import ILegend = powerbi.visuals.ILegend;
    import createLegend = powerbi.visuals.createLegend;
    import LegendPosition = powerbi.visuals.LegendPosition;
    import legendProps = powerbi.visuals.legendProps;
    import Legend = powerbi.visuals.Legend;
    import legendPosition = powerbi.visuals.legendPosition;
    import LabelEnabledDataPoint = powerbi.visuals.LabelEnabledDataPoint;
    import ILabelLayout = powerbi.visuals.ILabelLayout;

    export class RadarChart implements IVisual {
        private static formatStringProp: DataViewObjectPropertyIdentifier = {
            objectName: "general",
            propertyName: "formatString",
        };

        private static Properties: any = {
            legend: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "show" }
            },
            line: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: "line", propertyName: "show" },
                lineWidth: <DataViewObjectPropertyIdentifier>{ objectName: "line", propertyName: "lineWidth" }
            },
            dataPoint: {
                fill: <DataViewObjectPropertyIdentifier>{ objectName: "dataPoint", propertyName: "fill" }
            },
            labels: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: "labels", propertyName: "show" },
                color: <DataViewObjectPropertyIdentifier>{ objectName: "labels", propertyName: "color" },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: "labels", propertyName: "fontSize" }
            }
        };

        private static VisualClassName: string = "radarChart";
        private static SegmentsSelector: ClassAndSelector = CreateClassAndSelector("segments");
        private static SegmentNodeSElector: ClassAndSelector = CreateClassAndSelector("segmentNode");
        private static AxisSelector: ClassAndSelector = CreateClassAndSelector("axis");
        private static AxisNodeSelector: ClassAndSelector = CreateClassAndSelector("axisNode");
        private static AxisLabelSelector: ClassAndSelector = CreateClassAndSelector("axisLabel");
        private static ChartSelector: ClassAndSelector = CreateClassAndSelector("chart");
        private static ChartNodeSelector: ClassAndSelector = CreateClassAndSelector("chartNode");
        private static ChartAreaSelector: ClassAndSelector = CreateClassAndSelector("chartArea");
        private static ChartPolygonSelector: ClassAndSelector = CreateClassAndSelector("chartPolygon");
        private static ChartDotSelector: ClassAndSelector = CreateClassAndSelector("chartDot");
        private static LabelGraphicsContextSelector: ClassAndSelector = CreateClassAndSelector("labelGraphicsContext");

        private static MaxLineWidth: number = 10;
        private static MinLineWidth: number = 1;

        private static AnimationDuration: number = 100;

        private static DefaultMargin: IMargin = {
            top: 10,
            bottom: 10,
            right: 50,
            left: 50
        };

        private static DefaultSettings: RadarChartSettings = {
            showLegend: true,
            line: false,
            lineWidth: 5,
            labels: undefined
        };

        private static DefaultLabelSettings: RadarChartLabelSettings = {
            show: true,
            color: "#000",
            fontSize: 8,
        };

        private static MinViewport: IViewport = {
            height: 0,
            width: 0
        };

        private static MinViewportToRender: IViewport = {
            height: 50,
            width: 50
        };

        private static ViewportFactor: number = 2;

        private static SegmentLevels: number = 5;
        private static SegmentFactor: number = .9;
        private static Radians: number = 2 * Math.PI;
        private static Scale: number = 1;

        private static LabelPositionFactor: number = 1.1;

        private static AreaFillOpacity: number = 0.6;

        private static AxesLabelsFontFamily: string = "sans-serif";

        private static DefaultLegendFontSize: number = 8.25;
        private static DefaultLegendTitle: string = "";

        private static LegendFontSize: number = 8;
        private static LegendShowTitle: boolean = true;

        private static OuterRadiusFactor: number = 2;

        private static TextAnchorStart: string = "start";
        private static TextAnchorEnd: string = "end";

        private static LabelXOffset: number = 0;
        private static LabelYOffset: number = 1.5;

        private static DotRadius: number = 5;

        private static PolygonStrokeWidth: number = 0;

        private static MinDomainValue: number = 0;
        private static MaxDomainValue: number = 1;

        private svg: Selection<any>;
        private segments: Selection<any>;
        private axis: Selection<any>;
        private chart: Selection<any>;

        private mainGroupElement: Selection<any>;
        private labelGraphicsContext: Selection<any>;
        private colorPalette: IColorPalette;
        private viewport: IViewport;
        private viewportAvailable: IViewport;

        private interactivityService: IInteractivityService;
        private behavior: IInteractiveBehavior;
        private visualHost: IVisualHost;

        private tooltipService: ITooltipService;

        private margin: IMargin;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private radarChartData: RadarChartData;

        private angle: number;
        private radius: number;

        private static getLabelsData(dataView: DataView): RadarChartLabelsData {
            if (!dataView
                || !dataView.metadata
                || !dataView.metadata.columns
                || !dataView.metadata.columns[0]
                || !dataView.categorical
                || !dataView.categorical.categories
                || !dataView.categorical.categories[0]
                || !dataView.categorical.categories[0].values) {

                return null;
            }

            let categoryValues: PrimitiveValue[] = dataView.categorical.categories[0].values,
                formatter: IValueFormatter;

            formatter = valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(
                    dataView.metadata.columns[0],
                    true),
            });

            let labelsData: RadarChartLabelsData = {
                labelPoints: [],
                formatter: formatter,
            };

            for (let i: number = 0, iLen: number = categoryValues.length; i < iLen; i++) {
                labelsData.labelPoints.push({
                    text: categoryValues[i],
                    startAngle: null,
                    endAngle: null,
                    index: i,
                    innerRadius: 0,
                    outerRadius: 0,
                    padAngle: 0
                });
            }

            return labelsData;
        }

        public static converter(
            dataView: DataView,
            colorPalette: IColorPalette,
            visualHost: IVisualHost,
            interactivityService?: IInteractivityService): RadarChartData {

            if (!dataView
                || !dataView.categorical
                || !dataView.categorical.categories
                || !(dataView.categorical.categories.length > 0)
                || !dataView.categorical.categories[0]
                || !dataView.categorical.values
                || !(dataView.categorical.values.length > 0)
                || !colorPalette) {

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
                            color: "#fff",
                            fontSize: 8,
                        }
                    },
                    labels: RadarChart.getLabelsData(dataView),
                    series: [],
                };
            }

            let catDv: DataViewCategorical = dataView.categorical,
                values: DataViewValueColumns = catDv.values,
                series: RadarChartSeries[] = [],
                grouped: DataViewValueColumnGroup[],
                colorHelper: ColorHelper;

            grouped = catDv && catDv.values
                ? catDv.values.grouped()
                : null;

            colorHelper = new ColorHelper(colorPalette, RadarChart.Properties.dataPoint.fill);

            let hasHighlights: boolean = !!(values.length > 0 && values[0].highlights);

            let legendData: LegendData = {
                fontSize: RadarChart.DefaultLegendFontSize,
                dataPoints: [],
                title: RadarChart.DefaultLegendTitle
            };

            // Parses legend settings
            let settings: RadarChartSettings = RadarChart.parseSettings(dataView, colorPalette);

            for (let i: number = 0, iLen: number = values.length; i < iLen; i++) {
                let color: string = colorPalette.getColor(i.toString()).value,
                    serieIdentity: ISelectionId,
                    queryName: string,
                    displayName: string,
                    dataPoints: RadarChartDatapoint[] = [];

                let columnGroup: DataViewValueColumnGroup = grouped && grouped.length > i && grouped[i].values
                    ? grouped[i]
                    : null;

                if (values[i].source) {
                    let source: DataViewMetadataColumn = values[i].source;

                    if (source.queryName) {
                        queryName = source.queryName;

                        serieIdentity = visualHost.createSelectionIdBuilder()
                            .withMeasure(queryName)
                            .createSelectionId();
                    }

                    if (source.displayName) {
                        displayName = source.displayName;
                    }

                    if (source.objects) {
                        color = colorHelper.getColorForMeasure(source.objects, queryName);
                    }
                }

                legendData.dataPoints.push({
                    label: displayName,
                    color: color,
                    icon: LegendIcon.Box,
                    selected: false,
                    identity: serieIdentity
                });

                for (let k: number = 0, kLen: number = values[i].values.length; k < kLen; k++) {
                    let dataPointIdentity: ISelectionId = visualHost.createSelectionIdBuilder()
                        .withMeasure(queryName)
                        .withCategory(catDv.categories[0], k)
                        .withSeries(dataView.categorical.values, columnGroup)
                        .createSelectionId();

                    let tooltipInfo: VisualTooltipDataItem[] = TooltipBuilder.createTooltipInfo(
                        RadarChart.formatStringProp,
                        catDv,
                        catDv.categories[0].values[k],
                        values[i].values[k],
                        null,
                        null,
                        i);

                    let labelFormatString: string = valueFormatter.getFormatStringByColumn(catDv.values[i].source),
                        fontSizeInPx: string = PixelConverter.fromPoint(settings.labels.fontSize);

                    dataPoints.push({
                        x: k,
                        y: values[i].values[k] as number,
                        color: color,
                        identity: dataPointIdentity,
                        selected: false,
                        tooltipInfo: tooltipInfo,
                        value: values[i].values[k] as number,
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

        constructor(options: VisualConstructorOptions) {
            const element: HTMLElement = options.element;

            if (!this.svg) {
                this.svg = d3.select(element).append("svg");
                this.svg.style("position", "absolute");
            }

            if (!this.margin) {
                this.margin = _.clone(RadarChart.DefaultMargin);
            }

            this.svg.classed(RadarChart.VisualClassName, true);

            this.visualHost = options.host;
            this.interactivityService = createInteractivityService(options.host);
            this.behavior = new RadarChartWebBehavior();

            this.tooltipService = createTooltipService(options.host);

            this.legend = createLegend(
                $(element),
                false,
                this.interactivityService,
                true,
                LegendPosition.Top);

            this.colorPalette = options.host.colorPalette;

            this.mainGroupElement = this.svg.append("g");

            this.labelGraphicsContext = this.mainGroupElement
                .append("g")
                .classed(RadarChart.LabelGraphicsContextSelector.class, true);

            this.segments = this.mainGroupElement
                .append("g")
                .classed(RadarChart.SegmentsSelector.class, true);

            this.axis = this.mainGroupElement
                .append("g")
                .classed(RadarChart.AxisSelector.class, true);

            this.chart = this.mainGroupElement
                .append("g")
                .classed(RadarChart.ChartSelector.class, true);
        }

        public update(options: VisualUpdateOptions): void {
            if (!options.dataViews || !options.dataViews[0]) {
                this.clear();
                return;
            }

            let dataView: DataView = options.dataViews[0];

            this.radarChartData = RadarChart.converter(
                dataView,
                this.colorPalette,
                this.visualHost,
                this.interactivityService);

            let categories: PrimitiveValue[] = [],
                series: RadarChartSeries[] = this.radarChartData.series,
                dataViewMetadataColumn: DataViewMetadataColumn;

            if (dataView.categorical
                && dataView.categorical.categories
                && dataView.categorical.categories[0]
                && dataView.categorical.categories[0].values
                && (series.length > 0)) {

                categories = dataView.categorical.categories[0].values;
            } else {
                this.clear();
                return;
            }

            if (dataView.metadata && dataView.metadata.columns && dataView.metadata.columns.length > 0) {
                dataViewMetadataColumn = dataView.metadata.columns[0];
            }

            this.viewport = {
                height: options.viewport.height > RadarChart.MinViewport.height
                    ? options.viewport.height
                    : RadarChart.MinViewport.height,
                width: options.viewport.width > RadarChart.MinViewport.width
                    ? options.viewport.width
                    : RadarChart.MinViewport.width
            };

            this.parseLegendProperties(dataView);
            this.parseLineWidth();
            this.renderLegend(this.radarChartData);
            this.updateViewport();

            this.svg.attr({
                "height": this.viewport.height,
                "width": this.viewport.width
            });

            this.mainGroupElement.attr(
                "transform",
                SVGUtil.translate(this.viewport.width / 2, this.viewport.height / 2));

            let labelsFontSize: number = this.radarChartData.settings.labels.fontSize;

            this.margin.top = Math.max(RadarChart.DefaultMargin.top, labelsFontSize);
            this.margin.left = Math.max(RadarChart.DefaultMargin.left, labelsFontSize);
            this.margin.right = Math.max(RadarChart.DefaultMargin.right, labelsFontSize);
            this.margin.bottom = Math.max(RadarChart.DefaultMargin.bottom, labelsFontSize);

            let width: number = this.viewport.width - this.margin.left - this.margin.right,
                height: number = this.viewport.height - this.margin.top - this.margin.bottom;

            if ((width < RadarChart.MinViewportToRender.width) || (height < RadarChart.MinViewportToRender.height)) {
                this.clear();
                return;
            }

            this.viewportAvailable = {
                width: this.viewport.width / RadarChart.ViewportFactor,
                height: this.viewport.height / RadarChart.ViewportFactor
            };

            this.angle = RadarChart.Radians / categories.length;
            this.radius = RadarChart.SegmentFactor * RadarChart.Scale * Math.min(width, height) / 2;

            this.drawCircularSegments(categories);
            this.drawAxes(categories);

            this.createAxesLabels();
            this.drawChart(series, RadarChart.AnimationDuration);
        }

        private clear(): void {
            this.mainGroupElement
                .select(RadarChart.AxisSelector.selector)
                .selectAll(RadarChart.AxisNodeSelector.selector)
                .remove();

            this.mainGroupElement
                .select(RadarChart.AxisSelector.selector)
                .selectAll(RadarChart.AxisLabelSelector.selector)
                .remove();

            this.mainGroupElement
                .select(RadarChart.SegmentsSelector.selector)
                .selectAll(RadarChart.SegmentNodeSElector.selector)
                .remove();

            this.chart
                .selectAll("*")
                .remove();
        }

        private drawCircularSegments(values: PrimitiveValue[]): void {
            let data: RadarChartCircularSegment[] = [],
                angle: number = this.angle,
                factor: number = RadarChart.SegmentFactor,
                levels: number = RadarChart.SegmentLevels,
                radius: number = this.radius;

            for (let level: number = 0; level < levels; level++) {
                let levelFactor: number = radius * factor * ((level + 1) / levels);

                for (let i: number = 0; i <= values.length; i++) {
                    data.push({
                        x1: levelFactor * (Math.sin(i * angle)),
                        y1: levelFactor * (Math.cos(i * angle)),
                        x2: levelFactor * (Math.sin((i + 1) * angle)),
                        y2: levelFactor * (Math.cos((i + 1) * angle)),
                    });
                }
            }

            let selection: UpdateSelection<RadarChartCircularSegment> = this.mainGroupElement
                .select(RadarChart.SegmentsSelector.selector)
                .selectAll(RadarChart.SegmentNodeSElector.selector)
                .data(data);

            selection
                .enter()
                .append("svg:line")
                .classed(RadarChart.SegmentNodeSElector.class, true);

            selection
                .attr({
                    "x1": (segment: RadarChartCircularSegment) => segment.x1,
                    "y1": (segment: RadarChartCircularSegment) => segment.y1,
                    "x2": (segment: RadarChartCircularSegment) => segment.x2,
                    "y2": (segment: RadarChartCircularSegment) => segment.y2
                });

            selection
                .exit()
                .remove();
        }

        private drawAxes(values: PrimitiveValue[]): void {
            const angle: number = this.angle,
                radius: number = this.radius;

            let selection: Selection<any> = this.mainGroupElement
                .select(RadarChart.AxisSelector.selector)
                .selectAll(RadarChart.AxisNodeSelector.selector);

            let axexSelection: UpdateSelection<PrimitiveValue> = selection.data(values);

            axexSelection
                .enter()
                .append("svg:line");

            axexSelection
                .attr({
                    "x1": 0,
                    "y1": 0,
                    "x2": (d: PrimitiveValue, i: number) => radius * Math.sin(i * angle),
                    "y2": (d: PrimitiveValue, i: number) => radius * Math.cos(i * angle)
                })
                .classed(RadarChart.AxisNodeSelector.class, true);

            axexSelection
                .exit()
                .remove();
        }

        private getLabelLayout(arc: d3.svg.Arc<Arc>, viewport: IViewport): ILabelLayout {
            let labelSettings: RadarChartLabelSettings = this.radarChartData.settings.labels;

            return {
                labelText: (label: RadarChartLabel) => {
                    let properties: TextProperties = {
                        fontFamily: RadarChart.AxesLabelsFontFamily,
                        fontSize: PixelConverter.fromPoint(labelSettings.fontSize),
                        text: this.radarChartData.labels.formatter.format(label.text)
                    };

                    return TextMeasurementService.getTailoredTextOrDefault(properties, label.maxWidth);
                },
                labelLayout: {
                    x: (label: RadarChartLabel) => label.x,
                    y: (label: RadarChartLabel) => label.y,
                },
                filter: (label: RadarChartLabel) => (label != null),
                style: {
                    "font-size": PixelConverter.fromPoint(labelSettings.fontSize),
                    "text-anchor": (label: RadarChartLabel) => label.textAnchor,
                },
            };
        }

        private createAxesLabels(): void {
            if (!this.radarChartData
                || !this.radarChartData.labels
                || !this.radarChartData.labels.labelPoints) {
                return;
            }

            let angle: number = this.angle,
                radius: number = this.radius,
                labelPoints: RadarChartLabel[] = this.radarChartData.labels.labelPoints;

            for (let i: number = 0; i < labelPoints.length; i++) {
                let angleInRadian: number = i * angle,
                    label: RadarChartLabel = labelPoints[i];

                label.x = RadarChart.LabelPositionFactor * radius * Math.sin(angleInRadian);
                label.y = RadarChart.LabelPositionFactor * radius * Math.cos(angleInRadian);

                label.textAnchor = (i * angle) < Math.PI
                    ? RadarChart.TextAnchorStart
                    : RadarChart.TextAnchorEnd;

                label.maxWidth = this.viewportAvailable.width - Math.abs(label.x);
            }

            let labelArc: SvgArc<Arc> = d3.svg.arc()
                .innerRadius(() => radius)
                .outerRadius(() => radius * RadarChart.OuterRadiusFactor);

            let labelLayout: ILabelLayout = this.getLabelLayout(labelArc, this.viewport);

            // Hide and reposition labels that overlap
            let dataLabelManager: DataLabelManager = new DataLabelManager(),
                filteredData: LabelEnabledDataPoint[] = dataLabelManager.hideCollidedLabels(
                    this.viewport,
                    labelPoints,
                    labelLayout,
                    true);

            this.drawAxesLabels(filteredData as RadarChartLabel[]);
        }

        private drawAxesLabels(values: RadarChartLabel[], dataViewMetadataColumn?: DataViewMetadataColumn): void {
            let labelSettings: RadarChartLabelSettings = this.radarChartData.settings.labels;

            let selection: d3.Selection<RadarChartLabel> = this.mainGroupElement
                .select(RadarChart.AxisSelector.selector)
                .selectAll(RadarChart.AxisLabelSelector.selector);

            let labelsSelection: UpdateSelection<RadarChartLabel> = selection.data(
                values.filter((label: RadarChartLabel) => labelSettings.show));

            labelsSelection
                .enter()
                .append("svg:text");

            labelsSelection
                .attr({
                    dy: `${RadarChart.LabelYOffset}em`,
                    transform: SVGUtil.translate(
                        RadarChart.LabelXOffset,
                        -RadarChart.LabelYOffset * labelSettings.fontSize),
                    x: (label: RadarChartLabel) => label.x,
                    y: (label: RadarChartLabel) => label.y
                })
                .text((label: RadarChartLabel) => {
                    let properties: TextProperties = {
                        fontFamily: RadarChart.AxesLabelsFontFamily,
                        fontSize: PixelConverter.fromPoint(labelSettings.fontSize),
                        text: this.radarChartData.labels.formatter.format(label.text)
                    };

                    return TextMeasurementService.getTailoredTextOrDefault(properties, label.maxWidth);
                })
                .style("font-size", () => PixelConverter.fromPoint(labelSettings.fontSize))
                .style("text-anchor", (label: RadarChartLabel) => label.textAnchor)
                .style("fill", () => labelSettings.color)
                .classed(RadarChart.AxisLabelSelector.class, true);

            labelsSelection
                .exit()
                .remove();
        }

        private drawChart(series: RadarChartSeries[], duration: number): void {
            let angle: number = this.angle,
                dataPoints: RadarChartDatapoint[][] = this.getDataPoints(series),
                layers: RadarChartDatapoint[][] = d3.layout.stack<RadarChartDatapoint>()(dataPoints),
                yDomain: any = this.calculateChartDomain(series);

            let calculatePoints = (points) => {
                return points.map((value) => {
                    let x1: number = yDomain(value.y) * Math.sin(value.x * angle),
                        y1: number = yDomain(value.y) * Math.cos(value.x * angle);

                    return `${x1},${y1}`;
                }).join(" ");
            };

            let areasSelection: UpdateSelection<RadarChartDatapoint[]> = this.chart
                .selectAll(RadarChart.ChartAreaSelector.selector)
                .data(layers);

            areasSelection
                .enter()
                .append("g")
                .classed(RadarChart.ChartAreaSelector.class, true);

            let polygonSelection: UpdateSelection<RadarChartDatapoint[]> = areasSelection
                .selectAll(RadarChart.ChartPolygonSelector.selector)
                .data((dataPoints: RadarChartDatapoint[]) => {
                    if (dataPoints && dataPoints.length > 0) {
                        return [dataPoints];
                    }

                    return [];
                });

            polygonSelection
                .enter()
                .append("polygon")
                .classed(RadarChart.ChartPolygonSelector.class, true);

            let settings: RadarChartSettings = this.radarChartData.settings;

            if (settings.line) {
                polygonSelection
                    .style("fill", "none")
                    .style("stroke", (dataPoints: RadarChartDatapoint[]) => dataPoints[0].color)
                    .style("stroke-width", settings.lineWidth);
            } else {
                polygonSelection
                    .style("fill", (dataPoints: RadarChartDatapoint[]) => dataPoints[0].color)
                    .style("stroke-width", RadarChart.PolygonStrokeWidth);
            }

            polygonSelection
                .style("opacity", radarChartUtils.DimmedOpacity)
                .on("mouseover", function () {
                    d3.select(this)
                        .transition()
                        .duration(duration)
                        .style("opacity", RadarChart.AreaFillOpacity);
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(duration)
                        .style("opacity", radarChartUtils.DimmedOpacity);
                })
                .attr("points", calculatePoints);

            polygonSelection
                .exit()
                .remove();

            areasSelection
                .exit()
                .remove();

            let nodeSelection: UpdateSelection<RadarChartDatapoint[]> = this.chart
                .selectAll(RadarChart.ChartNodeSelector.selector)
                .data(layers);

            nodeSelection
                .enter()
                .append("g")
                .classed(RadarChart.ChartNodeSelector.class, true);

            let hasHighlights: boolean = (series.length > 0) && series[0].hasHighlights,
                hasSelection: boolean = this.interactivityService && this.interactivityService.hasSelection();

            let dotsSelection: UpdateSelection<RadarChartDatapoint> = nodeSelection
                .selectAll(RadarChart.ChartDotSelector.selector)
                .data((dataPoints: RadarChartDatapoint[]) => {
                    return dataPoints.filter(d => d.y != null);
                });

            dotsSelection
                .enter()
                .append("svg:circle")
                .classed(RadarChart.ChartDotSelector.class, true);

            dotsSelection.attr("r", RadarChart.DotRadius)
                .attr({
                    "cx": (dataPoint: RadarChartDatapoint) => yDomain(dataPoint.y) * Math.sin(dataPoint.x * angle),
                    "cy": (dataPoint: RadarChartDatapoint) => yDomain(dataPoint.y) * Math.cos(dataPoint.x * angle)
                })
                .style("fill", (dataPoint: RadarChartDatapoint) => dataPoint.color)
                .style("opacity", (dataPoint: RadarChartDatapoint) => {
                    return radarChartUtils.getFillOpacity(
                        dataPoint.selected,
                        dataPoint.highlight,
                        !dataPoint.highlight && hasSelection,
                        !dataPoint.selected && hasHighlights);
                });

            dotsSelection
                .exit()
                .remove();

            this.tooltipService.addTooltip(
                dotsSelection,
                (eventArgs: TooltipEventArgs<RadarChartDatapoint>) => {
                    return eventArgs.data.tooltipInfo;
                },
                null,
                true);

            nodeSelection
                .exit()
                .remove();

            if (this.interactivityService) {
                // Register interactivity
                let dataPointsToBind: RadarChartDatapoint[] = this.getAllDataPointsList(series),
                    behaviorOptions: RadarChartBehaviorOptions;

                behaviorOptions = {
                    selection: dotsSelection,
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

        private calculateChartDomain(series: RadarChartSeries[]): Linear<number, number> {
            let radius: number = this.radius * RadarChart.SegmentFactor,
                dataPointsList: RadarChartDatapoint[] = this.getAllDataPointsList(series);

            let minValue: number = d3.min(dataPointsList, (dataPoint: RadarChartDatapoint) => {
                return dataPoint.y;
            });

            let maxValue: number = d3.max(dataPointsList, (dataPoint: RadarChartDatapoint) => {
                return dataPoint.y;
            });

            if (this.isPercentChart(dataPointsList)) {
                minValue = minValue >= RadarChart.MinDomainValue
                    ? RadarChart.MinDomainValue
                    : -RadarChart.MaxDomainValue;

                maxValue = maxValue <= RadarChart.MinDomainValue
                    ? RadarChart.MinDomainValue
                    : RadarChart.MaxDomainValue;
            }

            return d3.scale.linear()
                .domain([minValue, maxValue])
                .range([RadarChart.MinDomainValue, radius]);
        }

        private renderLegend(radarChartData: RadarChartData): void {
            if (!radarChartData.legendData) {
                return;
            }

            const { height, width } = this.viewport,
                legendData: LegendData = radarChartData.legendData;

            if (this.legendObjectProperties) {
                LegendData.update(legendData, this.legendObjectProperties);

                let position: string = this.legendObjectProperties[legendProps.position] as string;

                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
            } else {
                this.legend.changeOrientation(LegendPosition.Top);
            }

            this.legend.drawLegend(legendData, { height, width });
            Legend.positionChartArea(this.svg, this.legend);
        }

        private getDataPoints(seriesList: RadarChartSeries[]): RadarChartDatapoint[][] {
            let dataPoints: RadarChartDatapoint[][] = [];

            for (let series of seriesList) {
                dataPoints.push(series.dataPoints);
            }

            return dataPoints;
        }

        private getAllDataPointsList(seriesList: RadarChartSeries[]): RadarChartDatapoint[] {
            let dataPoints: RadarChartDatapoint[] = [];

            for (let series of seriesList) {
                dataPoints = dataPoints.concat(series.dataPoints);
            }

            return dataPoints;
        }

        private isPercentChart(dataPointsList: RadarChartDatapoint[]): boolean {
            for (let dataPoint of dataPointsList) {
                if (dataPoint.labelFormatString.indexOf("%") === -1) {
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

            this.legendObjectProperties = DataViewObjects.getObject(
                dataView.metadata.objects,
                "legend",
                {});
        }

        private static parseSettings(dataView: DataView, colorPalette: IColorPalette): RadarChartSettings {
            let objects: DataViewObjects = null,
                defaultSettings: RadarChartSettings = RadarChart.DefaultSettings;

            if (dataView
                && dataView.metadata
                && dataView.metadata.columns
                && dataView.metadata.objects) {

                objects = dataView.metadata.objects;
            }

            return {
                showLegend: DataViewObjects.getValue(
                    objects,
                    RadarChart.Properties.legend.show,
                    defaultSettings.showLegend),
                line: DataViewObjects.getValue(
                    objects,
                    RadarChart.Properties.line.show,
                    defaultSettings.line),
                lineWidth: DataViewObjects.getValue(
                    objects,
                    RadarChart.Properties.line.lineWidth,
                    defaultSettings.lineWidth),
                labels: this.parseLabelSettings(
                    objects,
                    colorPalette),
            };
        }

        private static parseLabelSettings(objects: DataViewObjects, colorPalette: IColorPalette): RadarChartLabelSettings {
            let settings: RadarChartLabelSettings = <RadarChartLabelSettings>{},
                defaultSettings: RadarChartLabelSettings = RadarChart.DefaultLabelSettings;

            settings.show = DataViewObjects.getValue(
                objects,
                RadarChart.Properties.labels.show,
                defaultSettings.show);

            settings.fontSize = DataViewObjects.getValue(
                objects,
                RadarChart.Properties.labels.fontSize,
                defaultSettings.fontSize);

            let colorHelper: ColorHelper = new ColorHelper(
                colorPalette,
                RadarChart.Properties.labels.color,
                defaultSettings.color);

            settings.color = colorHelper.getColorForMeasure(objects, "");

            return settings;
        }

        /**
         * This function returns the values to be displayed in the property pane for each object.
         * Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
         * validation and return other values/defaults
         * 
         * TODO: We should use SettingsParser instead. Please rewrite it in future versions.
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let instances: VisualObjectInstance[] = [];

            if (this.radarChartData && this.radarChartData.settings) {
                let settings: RadarChartSettings = this.radarChartData.settings;

                switch (options.objectName) {
                    case "legend": {
                        this.enumerateLegend(settings, instances);

                        break;
                    }
                    case "dataPoint": {
                        this.enumerateDataPoint(instances);

                        break;
                    }
                    case "line": {
                        this.enumerateLine(settings, instances);

                        break;
                    }
                    case "labels": {
                        this.enumerateDataLabels(instances);

                        break;
                    }
                }
            }

            return instances;
        }

        private enumerateDataLabels(instances: VisualObjectInstance[]): void {
            let settings: RadarChartLabelSettings = this.radarChartData.settings.labels;

            instances.push({
                objectName: "labels",
                displayName: "labels",
                selector: null,
                properties: {
                    show: settings.show,
                    color: settings.color,
                    fontSize: settings.fontSize,
                }
            });
        }

        private enumerateLegend(settings: RadarChartSettings, instances: VisualObjectInstance[]): void {
            let showTitle: boolean,
                titleText: string,
                legend: VisualObjectInstance,
                labelColor: string,
                fontSize: number,
                position: any; // TODO: Power BI doesn"t support the legend position for now. We will implement legend position when PBI supports it.

            showTitle = DataViewObject.getValue(
                this.legendObjectProperties,
                legendProps.showTitle,
                RadarChart.LegendShowTitle);

            titleText = DataViewObject.getValue(
                this.legendObjectProperties,
                legendProps.titleText,
                "");

            labelColor = DataViewObject.getValue(
                this.legendObjectProperties,
                legendProps.labelColor,
                labelColor);

            fontSize = DataViewObject.getValue(
                this.legendObjectProperties,
                legendProps.fontSize,
                RadarChart.LegendFontSize);

            position = DataViewObject.getValue(
                this.legendObjectProperties,
                legendProps.position,
                legendPosition.top);

            legend = {
                objectName: "legend",
                displayName: "legend",
                selector: null,
                properties: {
                    show: settings.showLegend,
                    position: position,
                    showTitle: showTitle,
                    titleText: titleText,
                    labelColor: labelColor,
                    fontSize: fontSize,
                }
            };

            instances.push(legend);
        }

        private enumerateLine(settings: RadarChartSettings, instances: VisualObjectInstance[]): void {
            instances.push({
                objectName: RadarChart.Properties.line.show.objectName,
                displayName: "Draw Lines",
                selector: null,
                properties: {
                    show: settings.line,
                    lineWidth: settings.lineWidth
                }
            });
        }

        private enumerateDataPoint(instances: VisualObjectInstance[]): void {
            if (!this.radarChartData || !this.radarChartData.series) {
                return;
            }

            for (let series of this.radarChartData.series) {
                instances.push({
                    objectName: "dataPoint",
                    displayName: series.name,
                    selector: ColorHelper.normalizeSelector(
                        (series.identity as IVisualSelectionId).getSelector(),
                        false),
                    properties: {
                        fill: { solid: { color: series.fill } }
                    }
                });
            }
        }

        private updateViewport(): void {
            let legendMargins: IViewport = this.legend.getMargins(),
                legendPosition: LegendPosition;

            legendPosition = LegendPosition[this.legendObjectProperties[legendProps.position] as string];

            switch (legendPosition) {
                case powerbi.visuals.LegendPosition.Top:
                case powerbi.visuals.LegendPosition.TopCenter:
                case powerbi.visuals.LegendPosition.Bottom:
                case powerbi.visuals.LegendPosition.BottomCenter: {
                    this.viewport.height = Math.max(
                        this.viewport.height - legendMargins.height,
                        RadarChart.MinViewport.height);

                    break;
                }
                case powerbi.visuals.LegendPosition.Left:
                case powerbi.visuals.LegendPosition.LeftCenter:
                case powerbi.visuals.LegendPosition.Right:
                case powerbi.visuals.LegendPosition.RightCenter: {
                    this.viewport.width = Math.max(
                        this.viewport.width - legendMargins.width,
                        RadarChart.MinViewport.width);

                    break;
                }
            }
        }

        private parseLineWidth(): void {
            let settings: RadarChartSettings = this.radarChartData.settings;

            settings.lineWidth = Math.max(
                RadarChart.MinLineWidth,
                Math.min(RadarChart.MaxLineWidth, settings.lineWidth));
        }

        public destroy(): void { }
    }
}
