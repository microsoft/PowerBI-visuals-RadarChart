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

module powerbi.extensibility.visual {
    // d3
    import Selection = d3.Selection;
    import UpdateSelection = d3.selection.Update;
    import Arc = d3.svg.arc.Arc;
    import SvgArc = d3.svg.Arc;
    import Linear = d3.scale.Linear;

    // powerbi
    import IDataViewObject = powerbi.DataViewObject;
    import PrimitiveValue = powerbi.PrimitiveValue;
    import IViewport = powerbi.IViewport;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import DataView = powerbi.DataView;
    import DataViewCategorical = powerbi.DataViewCategorical;
    import DataViewValueColumns = powerbi.DataViewValueColumns;
    import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import IDataViewObjects = powerbi.DataViewObjects;
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
    import IVisualSelectionId = powerbi.visuals.ISelectionId;

    // powerbi.extensibility.utils.svg
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    import translate = powerbi.extensibility.utils.svg.translate;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import CreateClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    // powerbi.extensibility.utils.formatting
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    // powerbi.extensibility.utils.interactivity
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;

    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;

    // powerbi.extensibility.utils.color
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;

    // powerbi.extensibility.utils.tooltip
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;

    // powerbi.extensibility.utils.dataview
    import DataViewObject = powerbi.extensibility.utils.dataview.DataViewObject;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

    // powerbi.extensibility.utils.chart
    import LegendModule = powerbi.extensibility.utils.chart.legend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
    import LegendDataModule = powerbi.extensibility.utils.chart.legend.data;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import legendProps = powerbi.extensibility.utils.chart.legend.legendProps;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import ILabelLayout = powerbi.extensibility.utils.chart.dataLabel.ILabelLayout;
    import OutsidePlacement = powerbi.extensibility.utils.chart.dataLabel.OutsidePlacement;
    import OpacityLegendBehavior = powerbi.extensibility.utils.chart.legend.OpacityLegendBehavior;

    export class RadarChart implements IVisual {
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
        private static AxisLabelLinkLongLineSelector: ClassAndSelector = CreateClassAndSelector("axisLongLabelLink");
        private static AxisLabelLinkShortLineSelector: ClassAndSelector = CreateClassAndSelector("axisShortLabelLink");

        private static MaxLineWidth: number = 10;
        private static MinLineWidth: number = 1;

        private static AnimationDuration: number = 100;

        private static Angle0Degree: number = 0;
        private static Angle90Degree: number = 90;
        private static Angle180Degree: number = 180;
        private static Angle270Degree: number = 270;
        private static Angle360Degree: number = 360;
        private static Angle185Degree: number = 185;
        private static Angle170Degree: number = 175;
        private static Angle175Degree: number = 175;
        private static Angle220Degree: number = 220;

        private static PoligonBecomesLinePointsCount: number = 2;

        private static DefaultMargin: IMargin = {
            top: 10,
            bottom: 10,
            right: 50,
            left: 50
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
        private static Scale: number = 0.8;

        private static LabelPositionFactor: number = 1.38;
        private static LabelLinkBeginPositionFactor: number = 1.04;

        private static AreaFillOpacity: number = 0.6;

        private static AxesLabelsFontFamily: string = "sans-serif";

        private static OuterRadiusFactor: number = 2;

        private static TextAnchorStart: string = "start";
        private static TextAnchorEnd: string = "end";

        private static LabelXOffset: number = 0;
        private static LabelYOffset: number = 1.5;

        private static LabelPositionXOffset: number = 9;

        private static DotRadius: number = 5;

        private static PolygonStrokeWidth: number = 0;

        private static MinDomainValue: number = 0;
        private static MaxDomainValue: number = 1;

        private static LabelHorizontalShiftStep: number = 5;
        private static LabelMarginFactor: number = 30;

        private svg: Selection<RadarChartCircularSegment>;
        private segments: Selection<RadarChartCircularSegment>;
        private axis: Selection<RadarChartCircularSegment>;
        private chart: Selection<RadarChartCircularSegment>;

        private mainGroupElement: Selection<RadarChartCircularSegment>;
        private labelGraphicsContext: Selection<RadarChartCircularSegment>;
        private colorPalette: IColorPalette;
        private colorHelper: ColorHelper;
        private viewport: IViewport;
        private viewportAvailable: IViewport;

        private interactivityService: IInteractivityService;
        private behavior: IInteractiveBehavior;
        private visualHost: IVisualHost;

        private tooltipServiceWrapper: ITooltipServiceWrapper;

        private margin: IMargin;
        private legend: ILegend;
        private legendObjectProperties: IDataViewObject;
        private radarChartData: RadarChartData;

        private angle: number;
        private radius: number;

        private get settings(): RadarChartSettings {
            return this.radarChartData && this.radarChartData.settings;
        }

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
                    text: categoryValues[i] as string,
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
        private static fakeValue = "fakevalue";
        public static checkAndUpdateAxis(dataView: DataView, values: DataViewValueColumns) {
            if (dataView.categorical.categories[0].values.length <= 2) {// add  2-3 categories to make it looks like a rhomb
                for (let i: number = dataView.categorical.categories[0].values.length; i < RadarChart.minimumAxisCount; i++) {
                    dataView.categorical.categories[0].values.push(" ");
                    for (let j: number = 0; j < values.length; j++) {
                        values[j].values.push(RadarChart.fakeValue);
                    }
                }
            }
        }
        private static minimumAxisCount: number = 4;
        public static converter(dataView: DataView,
            colorPalette: IColorPalette,
            colorHelper: ColorHelper,
            visualHost: IVisualHost,
            interactivityService?: IInteractivityService): RadarChartData {

            if (!dataView
                || !dataView.categorical
                || !dataView.categorical.categories
                || !(dataView.categorical.categories.length > 0)
                || !dataView.categorical.categories[0]
                || !dataView.categorical.values
                || !(dataView.categorical.values.length > 0)
                || !colorPalette
                || !colorHelper
                || !visualHost) {

                return {
                    legendData: {
                        dataPoints: []
                    },
                    settings: this.parseSettings(dataView, colorHelper),
                    labels: RadarChart.getLabelsData(dataView),
                    series: []
                };
            }
            let catDv: DataViewCategorical = dataView.categorical,
                values: DataViewValueColumns = catDv.values,
                series: RadarChartSeries[] = [],
                grouped: DataViewValueColumnGroup[];
            const settings: RadarChartSettings = this.parseSettings(dataView, colorHelper);
            RadarChart.checkAndUpdateAxis(dataView, values);
            grouped = catDv && catDv.values
                ? catDv.values.grouped()
                : null;
            const fillProp: DataViewObjectPropertyIdentifier = {
                objectName: "dataPoint",
                propertyName: "fill"
            };
            const localColorHelper: ColorHelper = new ColorHelper(colorPalette, fillProp, settings.dataPoint.fill);

            let hasHighlights: boolean = !!(values.length > 0 && values[0].highlights);

            let legendData: LegendData = {
                fontSize: settings.legend.fontSize,
                dataPoints: [],
                title: settings.legend.titleText,
                labelColor: settings.legend.labelColor
            };
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
                        color = localColorHelper.getColorForMeasure(source.objects, queryName);
                    }
                }

                const legendDataPointsColor: string = colorHelper.isHighContrast ? colorHelper.getHighContrastColor("foreground", color) : color;
                legendData.dataPoints.push(<LegendDataPoint>{
                    label: displayName,
                    color: legendDataPointsColor,
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

                    let tooltipInfo: VisualTooltipDataItem[] = tooltipBuilder.createTooltipInfo(
                        catDv,
                        catDv.categories[0].values[k],
                        values[i].values[k],
                        i);
                    let currCatValue = catDv.categories[0].values[k];
                    let labelFormatString: string = valueFormatter.getFormatStringByColumn(catDv.values[i].source),
                        fontSizeInPx: string = PixelConverter.fromPoint(settings.labels.fontSize);

                    let notConvertedValue: PrimitiveValue = values[i].values[k],
                        y: number = notConvertedValue === RadarChart.fakeValue ? 0 : (notConvertedValue !== null ? Number(notConvertedValue) : NaN);
                    if (!isNaN(y)) {
                        dataPoints.push({
                            x: k,
                            y: y,
                            color: color,
                            identity: dataPointIdentity,
                            selected: false,
                            tooltipInfo: tooltipInfo,
                            value: y,
                            labelFormatString: labelFormatString,
                            labelFontSize: fontSizeInPx,
                            highlight: hasHighlights && !!(values[0].highlights[k]),
                            showPoint: currCatValue === " " || notConvertedValue === RadarChart.fakeValue ? false : true
                        });
                    }
                }

                if (dataPoints.length > 0) {
                    if (interactivityService) {
                        interactivityService.applySelectionStateToData(dataPoints, hasHighlights);
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
                series: series
            };
        }

        constructor(options: VisualConstructorOptions) {
            const element: HTMLElement = options.element;

            this.colorPalette = options.host.colorPalette;
            this.colorHelper = new ColorHelper(this.colorPalette);

            if (!this.svg) {
                this.svg = d3.select(element).append("svg");
                this.svg.style("position", "absolute");
            }

            if (!this.margin) {
                this.margin = _.clone(RadarChart.DefaultMargin);
            }

            this.svg.classed(RadarChart.VisualClassName, true);

            this.visualHost = options.host;
            this.interactivityService = createInteractivityService(this.visualHost);
            this.behavior = new RadarChartWebBehavior();

            this.tooltipServiceWrapper = createTooltipServiceWrapper(
                options.host.tooltipService,
                options.element);

            const interactiveBehavior: IInteractiveBehavior = this.colorHelper.isHighContrast ? new OpacityLegendBehavior() : null;
            this.legend = createLegend(
                element,
                false,
                this.interactivityService,
                true,
                LegendPosition.Top,
                interactiveBehavior);

            this.mainGroupElement = this.svg.append("g");

            this.labelGraphicsContext = this.mainGroupElement
                .append("g")
                .classed(RadarChart.LabelGraphicsContextSelector.className, true);

            this.segments = this.mainGroupElement
                .append("g")
                .classed(RadarChart.SegmentsSelector.className, true);

            this.axis = this.mainGroupElement
                .append("g")
                .classed(RadarChart.AxisSelector.className, true);

            this.chart = this.mainGroupElement
                .append("g")
                .classed(RadarChart.ChartSelector.className, true);
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
                this.colorHelper,
                this.visualHost,
                this.interactivityService);

            let categories: PrimitiveValue[] = [],
                series: RadarChartSeries[] = this.radarChartData.series;

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
            this.renderLegend();
            this.updateViewport();

            this.svg.attr({
                "height": this.viewport.height,
                "width": this.viewport.width
            });

            this.mainGroupElement.attr(
                "transform",
                translate(this.viewport.width / 2, this.viewport.height / 2));

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
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisNodeSelector.selectorName)
                .remove();

            this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisLabelSelector.selectorName)
                .remove();

            this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisLabelLinkShortLineSelector.selectorName)
                .remove();

            this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisLabelLinkLongLineSelector.selectorName)
                .remove();

            this.mainGroupElement
                .select(RadarChart.SegmentsSelector.selectorName)
                .selectAll(RadarChart.SegmentNodeSElector.selectorName)
                .remove();

            this.chart
                .selectAll("*")
                .remove();

            this.legend.reset();
            this.legend.drawLegend({ dataPoints: [] }, _.clone(this.viewport));
        }

        private changeAxesLineColorInHighMode(selectionArray: Selection<any>[]): void {
            if (this.colorHelper.isHighContrast) {
                let lineColor: string = this.settings.legend.labelColor;

                selectionArray.forEach((selection) => {
                    selection.style({
                        "stroke": lineColor
                    });
                });
            }
        }

        private drawCircularSegments(values: PrimitiveValue[]): void {
            let axisBeginning: number = this.radarChartData.settings.displaySettings.axisBeginning;
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
                        y1: axisBeginning * levelFactor * (Math.cos(i * angle)),
                        x2: levelFactor * (Math.sin((i + 1) * angle)),
                        y2: axisBeginning * levelFactor * (Math.cos((i + 1) * angle)),
                    });
                }
            }

            let selection: UpdateSelection<RadarChartCircularSegment> = this.mainGroupElement
                .select(RadarChart.SegmentsSelector.selectorName)
                .selectAll(RadarChart.SegmentNodeSElector.selectorName)
                .data(data);

            selection
                .enter()
                .append("svg:line")
                .classed(RadarChart.SegmentNodeSElector.className, true);

            selection
                .attr({
                    "x1": (segment: RadarChartCircularSegment) => segment.x1,
                    "y1": (segment: RadarChartCircularSegment) => segment.y1,
                    "x2": (segment: RadarChartCircularSegment) => segment.x2,
                    "y2": (segment: RadarChartCircularSegment) => segment.y2
                });

            this.changeAxesLineColorInHighMode([selection]);

            selection
                .exit()
                .remove();
        }

        private drawAxes(values: PrimitiveValue[]): void {
            let axisBeginning: number = this.radarChartData.settings.displaySettings.axisBeginning;
            const angle: number = this.angle,
                radius: number = this.radius;

            let selection: Selection<RadarChartCircularSegment> = this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisNodeSelector.selectorName);

            let axexSelection: UpdateSelection<PrimitiveValue> = selection.data(values);

            axexSelection
                .enter()
                .append("svg:line");

            axexSelection
                .attr({
                    "x1": 0,
                    "y1": 0,
                    "x2": (d: PrimitiveValue, i: number) => radius * Math.sin(i * angle),
                    "y2": (d: PrimitiveValue, i: number) => axisBeginning * radius * Math.cos(i * angle)
                })
                .classed(RadarChart.AxisNodeSelector.className, true);

            this.changeAxesLineColorInHighMode([axexSelection]);

            axexSelection
                .exit()
                .remove();
        }

        public static isIntersect(y11: number, y12: number, y21: number, y22: number): boolean {
            if (y11 <= y21 && y21 <= y12) {
                return true;
            }
            if (y11 <= y22 && y22 <= y12) {
                return true;
            }
            if (y22 <= y11 && y11 <= y21) {
                return true;
            }
            if (y22 <= y12 && y12 <= y21) {
                return true;
            }
            return false;
        }

        private shiftText(currentTextY1: number, currentTextY12: number, otherTextY21: number, otherTexty22: number, direction: boolean): number {
            let shift: number = 0;

            if (direction) {
                shift = Math.abs(currentTextY12 - otherTextY21);
            }
            else {
                shift = Math.abs(otherTexty22 - currentTextY1);
            }

            return shift * (direction ? 1 : -1);
        }

        private shiftIntersectText(current: RadarChartLabel, others: RadarChartLabel[], shiftDown: boolean): void {
            let labelSettings: LabelSettings = this.radarChartData.settings.labels;

            let properties: TextProperties = {
                fontFamily: RadarChart.AxesLabelsFontFamily,
                fontSize: PixelConverter.fromPoint(labelSettings.fontSize),
                text: this.radarChartData.labels.formatter.format(current.text)
            };

            let currentTextHeight: number = textMeasurementService.estimateSvgTextHeight(properties);

            for (let i: number = 0; i < others.length; i++) {
                let label: RadarChartLabel = others[i];

                properties.text = label.text;
                let otherTextHeight: number = textMeasurementService.estimateSvgTextHeight(properties);

                let curTextUpperPoint: number = current.y - currentTextHeight;
                let labelTextUpperPoint: number = label.y - otherTextHeight;

                if (RadarChart.isIntersect(current.y, curTextUpperPoint, label.y, labelTextUpperPoint)) {
                    let shift: number = this.shiftText(current.y, curTextUpperPoint, label.y, labelTextUpperPoint, shiftDown);
                    current.y += shift;
                    if (!shiftDown && current.y - 5 < 0 || shiftDown && current.y + currentTextHeight / 2 + 5 > 0) {
                        current.hide = true;
                    }
                }
            }
        }

        private shiftCollidedLabels(labelPoints: RadarChartLabel[]): void {
            // from 0 to 90 shift up by Y
            let maxRadius: number = 0;
            labelPoints.forEach(point => {
                if (Math.abs(point.x) > maxRadius) {
                    maxRadius = Math.abs(point.x);
                }
            });

            let shiftDirrectionIsDown: boolean = this.radarChartData.settings.displaySettings.axisBeginning === 1;

            for (let i: number = 0; i < labelPoints.length; i++) {
                let label: RadarChartLabel = labelPoints[i];

                // from 0 to 90 shift up by Y
                if (label.angleInDegree > RadarChart.Angle0Degree && label.angleInDegree < RadarChart.Angle90Degree) {
                    this.shiftIntersectText(
                        label,
                        labelPoints.filter((l: RadarChartLabel) => l.angleInDegree <= RadarChart.Angle90Degree && l.angleInDegree >= RadarChart.Angle0Degree && l.index < label.index),
                        !shiftDirrectionIsDown
                    );
                }
                // from 180 to 270 shift down by Y
                if (label.angleInDegree > RadarChart.Angle180Degree && label.angleInDegree < RadarChart.Angle270Degree) {
                    this.shiftIntersectText(
                        label,
                        labelPoints.filter((l: RadarChartLabel) => l.angleInDegree < RadarChart.Angle270Degree && l.angleInDegree >= RadarChart.Angle180Degree && l.index < label.index),
                        shiftDirrectionIsDown
                    );
                }

                label.maxWidth = this.viewportAvailable.width - Math.abs(label.x) - RadarChart.LabelMarginFactor;

                let labelDec: RadarChartLabel = labelPoints[labelPoints.length - 1 - i];
                // from 180 to 90 shift down by Y
                if (labelDec.angleInDegree > RadarChart.Angle90Degree && labelDec.angleInDegree < RadarChart.Angle180Degree) {
                    this.shiftIntersectText(
                        labelDec,
                        labelPoints.filter((l: RadarChartLabel) => l.angleInDegree < RadarChart.Angle180Degree && l.angleInDegree > RadarChart.Angle90Degree && l.index > labelDec.index).reverse(),
                        shiftDirrectionIsDown
                    );
                }
                // from 360 to 270 shift up by Y
                if (labelDec.angleInDegree > RadarChart.Angle270Degree && labelDec.angleInDegree < RadarChart.Angle360Degree) {
                    this.shiftIntersectText(
                        labelDec,
                        labelPoints.filter((l: RadarChartLabel) => l.angleInDegree < RadarChart.Angle360Degree && l.angleInDegree > RadarChart.Angle270Degree && l.index > labelDec.index).reverse(),
                        !shiftDirrectionIsDown
                    );
                }

                if (labelDec.angleInDegree < RadarChart.Angle180Degree) {
                    while (labelDec.x * labelDec.x + labelDec.y * labelDec.y < maxRadius * maxRadius) {
                        labelDec.x += RadarChart.LabelHorizontalShiftStep;
                    }
                }

                if (label.angleInDegree > RadarChart.Angle180Degree) {
                    while (label.x * label.x + label.y * label.y < maxRadius * maxRadius) {
                        label.x -= RadarChart.LabelHorizontalShiftStep;
                    }
                }
            }
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

            let axisBeginning: number = this.radarChartData.settings.displaySettings.axisBeginning;

            for (let i: number = 0; i < labelPoints.length; i++) {
                let angleInRadian: number = i * angle,
                    label: RadarChartLabel = labelPoints[i],
                    angleInDegree: number = angleInRadian * RadarChart.Angle180Degree / Math.PI;

                label.angleInDegree = angleInDegree;

                label.x = RadarChart.LabelPositionFactor * radius * Math.sin(angleInRadian);
                label.y = axisBeginning * RadarChart.LabelPositionFactor * radius * Math.cos(angleInRadian);

                label.xLinkBegin = radius * RadarChart.LabelLinkBeginPositionFactor * Math.sin(angleInRadian);
                label.yLinkBegin = axisBeginning * radius * RadarChart.LabelLinkBeginPositionFactor * Math.cos(angleInRadian);

                label.textAnchor = (i * angle) < Math.PI
                    ? RadarChart.TextAnchorStart
                    : RadarChart.TextAnchorEnd;
            }

            this.shiftCollidedLabels(labelPoints as RadarChartLabel[]);

            for (let i: number = 0; i < labelPoints.length; i++) {
                let label: RadarChartLabel = labelPoints[i];
                label.outsidePlacement = OutsidePlacement.Allowed;
                label.xLinkEnd = label.x;
                label.yLinkEnd = label.y;
            }

            this.drawAxesLabels(labelPoints as RadarChartLabel[]);
        }

        private drawAxesLabels(values: RadarChartLabel[], dataViewMetadataColumn?: DataViewMetadataColumn): void {
            let labelSettings: LabelSettings = this.radarChartData.settings.labels;

            let selectionLabelText: d3.Selection<RadarChartLabel> = this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisLabelSelector.selectorName);

            let filteredData: RadarChartLabel[] = values.filter((label: RadarChartLabel) => labelSettings.show && !label.hide);

            let labelsSelection: UpdateSelection<RadarChartLabel> = selectionLabelText.data(filteredData);

            labelsSelection
                .enter()
                .append("svg:text");

            labelsSelection
                .attr({
                    dy: `${RadarChart.LabelYOffset}em`,
                    transform: translate(
                        RadarChart.LabelXOffset,
                        -RadarChart.LabelYOffset * labelSettings.fontSize),
                    x: (label: RadarChartLabel) => {
                        let shift: number = label.textAnchor === RadarChart.TextAnchorStart ? +RadarChart.LabelPositionXOffset : -RadarChart.LabelPositionXOffset;
                        return label.x + shift;
                    },
                    y: (label: RadarChartLabel) => label.y
                })
                .text((label: RadarChartLabel) => {
                    let properties: TextProperties = {
                        fontFamily: RadarChart.AxesLabelsFontFamily,
                        fontSize: PixelConverter.fromPoint(labelSettings.fontSize),
                        text: this.radarChartData.labels.formatter.format(label.text)
                    };

                    return textMeasurementService.getTailoredTextOrDefault(properties, label.maxWidth);
                })
                .style("font-size", () => PixelConverter.fromPoint(labelSettings.fontSize))
                .style("text-anchor", (label: RadarChartLabel) => label.textAnchor)
                .style("fill", () => labelSettings.color)
                .classed(RadarChart.AxisLabelSelector.className, true);

            labelsSelection
                .exit()
                .remove();

            let selectionLongLineLableLink: d3.Selection<RadarChartLabel> = this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisLabelLinkLongLineSelector.selectorName);

            let labelsLongLineLinkSelection: UpdateSelection<RadarChartLabel> = selectionLongLineLableLink.data(filteredData);

            labelsLongLineLinkSelection
                .enter()
                .append("svg:line");

            labelsLongLineLinkSelection
                .attr({
                    x1: (label: RadarChartLabel) => label.xLinkBegin,
                    y1: (label: RadarChartLabel) => label.yLinkBegin,
                    x2: (label: RadarChartLabel) => label.xLinkEnd,
                    y2: (label: RadarChartLabel) => label.yLinkEnd
                })
                .classed(RadarChart.AxisLabelLinkLongLineSelector.className, true);

            labelsLongLineLinkSelection
                .exit()
                .remove();

            let selectionShortLineLableLink: d3.Selection<RadarChartLabel> = this.mainGroupElement
                .select(RadarChart.AxisSelector.selectorName)
                .selectAll(RadarChart.AxisLabelLinkShortLineSelector.selectorName);

            let labelsShortLineLinkSelection: UpdateSelection<RadarChartLabel> = selectionShortLineLableLink.data(filteredData);

            labelsShortLineLinkSelection
                .enter()
                .append("svg:line");

            labelsShortLineLinkSelection
                .attr({
                    x1: (label: RadarChartLabel) => label.xLinkEnd,
                    y1: (label: RadarChartLabel) => label.yLinkEnd,
                    x2: (label: RadarChartLabel) => {
                        let shift: number = label.textAnchor === RadarChart.TextAnchorStart ? +(RadarChart.LabelPositionXOffset - 2) : -(RadarChart.LabelPositionXOffset - 2);
                        return label.xLinkEnd + shift;
                    },
                    y2: (label: RadarChartLabel) => label.yLinkEnd
                })
                .classed(RadarChart.AxisLabelLinkShortLineSelector.className, true);

            this.changeAxesLineColorInHighMode([labelsShortLineLinkSelection, labelsLongLineLinkSelection]);

            labelsShortLineLinkSelection
                .exit()
                .remove();
        }

        private drawChart(series: RadarChartSeries[], duration: number): void {
            let angle: number = this.angle;
            let layers: RadarChartDatapoint[][] = this.getDataPoints(series);
            let yDomain: Linear<number, number> = this.calculateChartDomain(series);
            let axisBeginning: number = this.radarChartData.settings.displaySettings.axisBeginning;
            let calculatePoints = (points) => {
                return points.map((value) => {
                    if (value.showPoint) {
                        let x1: number = yDomain(value.y) * Math.sin(value.x * angle),
                            y1: number = axisBeginning * yDomain(value.y) * Math.cos(value.x * angle);

                        return `${x1},${y1}`;
                    }
                }).join(" ");
            };
            let areasSelection: UpdateSelection<RadarChartDatapoint[]> = this.chart
                .selectAll(RadarChart.ChartAreaSelector.selectorName)
                .data(layers);

            areasSelection
                .enter()
                .append("g")
                .classed(RadarChart.ChartAreaSelector.className, true);

            let polygonSelection: UpdateSelection<RadarChartDatapoint[]> = areasSelection
                .selectAll(RadarChart.ChartPolygonSelector.selectorName)
                .data((dataPoints: RadarChartDatapoint[]) => {
                    if (dataPoints && dataPoints.length > 0) {
                        let points: RadarChartDatapoint[] = [];
                        dataPoints.forEach((point) => {
                            if (point.showPoint) {
                                points.push(point);
                            }
                        });
                        return [points];
                    }
                    return [];
                });

            polygonSelection
                .enter()
                .append("polygon")
                .classed(RadarChart.ChartPolygonSelector.className, true);

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
                .attr("points", calculatePoints)
                .attr("points-count", (dataPoints: RadarChartDatapoint[]) => dataPoints.length);

            let settings: RadarChartSettings = this.radarChartData.settings;
            if (settings.line.show ||
                polygonSelection.attr("points-count") === RadarChart.PoligonBecomesLinePointsCount.toString()
            ) {
                polygonSelection
                    .style("fill", "none")
                    .style("stroke", (dataPoints: RadarChartDatapoint[]) =>
                        dataPoints.length ? this.colorHelper.getHighContrastColor("foreground", dataPoints[0].color) : null)
                    .style("stroke-width", settings.line.lineWidth);
            } else {
                polygonSelection
                    .style("fill", (dataPoints: RadarChartDatapoint[]) => dataPoints.length ? this.colorHelper.getHighContrastColor("foreground", dataPoints[0].color) : null)
                    .style("stroke-width", RadarChart.PolygonStrokeWidth);
            }

            polygonSelection
                .exit()
                .remove();

            areasSelection
                .exit()
                .remove();

            let nodeSelection: UpdateSelection<RadarChartDatapoint[]> = this.chart
                .selectAll(RadarChart.ChartNodeSelector.selectorName)
                .data(layers);

            nodeSelection
                .enter()
                .append("g")
                .classed(RadarChart.ChartNodeSelector.className, true);

            let hasHighlights: boolean = (series.length > 0) && series[0].hasHighlights,
                hasSelection: boolean = this.interactivityService && this.interactivityService.hasSelection();

            let dotsSelection: UpdateSelection<RadarChartDatapoint> = nodeSelection
                .selectAll(RadarChart.ChartDotSelector.selectorName)
                .data((dataPoints: RadarChartDatapoint[]) => {
                    return dataPoints.filter(d => d.y != null && d.showPoint);
                });

            dotsSelection
                .enter()
                .append("svg:circle")
                .classed(RadarChart.ChartDotSelector.className, true);

            dotsSelection.attr("r", RadarChart.DotRadius)
                .attr({
                    "cx": (dataPoint: RadarChartDatapoint) => yDomain(dataPoint.y) * Math.sin(dataPoint.x * angle),
                    "cy": (dataPoint: RadarChartDatapoint) => axisBeginning * yDomain(dataPoint.y) * Math.cos(dataPoint.x * angle)
                })
                .style("fill", (dataPoint: RadarChartDatapoint) => this.colorHelper.getHighContrastColor("foreground", dataPoint.color))
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

            this.tooltipServiceWrapper.addTooltip(
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
                    hasHighlights: hasHighlights
                };

                this.interactivityService.bind(dataPointsToBind, this.behavior, behaviorOptions);
            }
        }

        private calculateChartDomain(series: RadarChartSeries[]): Linear<number, number> {
            let radius: number = this.radius * RadarChart.SegmentFactor,
                dataPointsList: RadarChartDatapoint[] = this.getAllDataPointsList(series);

            let maxValue: number = d3.max(dataPointsList, (dataPoint: RadarChartDatapoint) => {
                return dataPoint.y;
            });

            let minValue: number = this.radarChartData.settings.displaySettings.minValue;

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

        private renderLegend(): void {
            let radarChartData: RadarChartData = this.radarChartData;

            if (!radarChartData.legendData) {
                return;
            }

            const { height, width } = this.viewport,
                legendData: LegendData = radarChartData.legendData;

            if (this.legendObjectProperties) {
                LegendDataModule.update(legendData, this.legendObjectProperties);

                let position: string = this.legendObjectProperties[legendProps.position] as string;

                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
            } else {
                this.legend.changeOrientation(LegendPosition.Top);
            }

            this.legend.drawLegend(legendData, { height, width });
            LegendModule.positionChartArea(this.svg, this.legend);
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
                if (!dataPoint.labelFormatString || dataPoint.labelFormatString.indexOf("%") === -1) {
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

            if (this.colorHelper.isHighContrast)
                this.legendObjectProperties["labelColor"] = {
                    solid: {
                        color: this.colorHelper.getHighContrastColor("foreground", this.settings.legend.labelColor)
                    }
                };
        }

        public static parseSettings(dataView: DataView, colorHelper: ColorHelper): RadarChartSettings {
            let settings: RadarChartSettings = RadarChartSettings.parse<RadarChartSettings>(dataView);
            if (!colorHelper) {
                return settings;
            }

            if (dataView && dataView.categorical) {
                let minValue = d3.min(<number[]>dataView.categorical.values[0].values);
                for (let i: number = 0; i < dataView.categorical.values.length; i++) {
                    let minValueL = d3.min(<number[]>dataView.categorical.values[i].values);
                    if (minValue > minValueL) {
                        minValue = minValueL;
                    }
                }
                RadarChart.countMinValueForDisplaySettings(minValue, settings);
            }

            settings.dataPoint.fill = colorHelper.getHighContrastColor("foreground", settings.dataPoint.fill);
            settings.labels.color = colorHelper.getHighContrastColor("foreground", settings.labels.color);
            settings.legend.labelColor = colorHelper.getHighContrastColor("foreground", settings.legend.labelColor);

            return settings;
        }

        public static countMinValueForDisplaySettings(minValue: any, settings: RadarChartSettings) {
            if (minValue < 0) { // for negative values
                settings.displaySettings.minValue = minValue;
            } else {
                if (settings.displaySettings.minValue > minValue) {
                    settings.displaySettings.minValue = minValue;
                }
                if (settings.displaySettings.minValue < 0) {
                    settings.displaySettings.minValue = 0;
                }
            }
        }

        public enumerateDataPoint(): VisualObjectInstance[] {
            if (!this.radarChartData || !this.radarChartData.series) {
                return;
            }
            let instances: VisualObjectInstance[] = [];

            for (let series of this.radarChartData.series) {
                instances.push({
                    objectName: "dataPoint",
                    displayName: series.name,
                    selector: ColorHelper.normalizeSelector(
                        (series.identity as IVisualSelectionId).getSelector(),
                        false),
                    properties: {
                        fill: {
                            solid: {
                                color: this.colorHelper.isHighContrast ? this.colorHelper.getHighContrastColor("foreground", series.fill) : series.fill
                            }
                        }
                    }
                });
            }
            return instances;
        }

        /**
        * This function returns the values to be displayed in the property pane for each object.
        * Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
        * validation and return other values/defaults
        */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let instances: VisualObjectInstanceEnumeration = null;
            switch (options.objectName) {
                case "dataPoint":
                    return this.enumerateDataPoint();
                default:
                    return RadarChartSettings.enumerateObjectInstances(
                        this.settings || RadarChartSettings.getDefault(),
                        options);
            }
        }

        private updateViewport(): void {
            let legendMargins: IViewport = this.legend.getMargins(),
                legendPosition: LegendPosition;

            legendPosition = LegendPosition[this.legendObjectProperties[legendProps.position] as string];

            switch (legendPosition) {
                case LegendPosition.Top:
                case LegendPosition.TopCenter:
                case LegendPosition.Bottom:
                case LegendPosition.BottomCenter: {
                    this.viewport.height = Math.max(
                        this.viewport.height - legendMargins.height,
                        RadarChart.MinViewport.height);

                    break;
                }
                case LegendPosition.Left:
                case LegendPosition.LeftCenter:
                case LegendPosition.Right:
                case LegendPosition.RightCenter: {
                    this.viewport.width = Math.max(
                        this.viewport.width - legendMargins.width,
                        RadarChart.MinViewport.width);

                    break;
                }
            }
        }

        private parseLineWidth(): void {
            let settings: RadarChartSettings = this.radarChartData.settings;

            settings.line.lineWidth = Math.max(
                RadarChart.MinLineWidth,
                Math.min(RadarChart.MaxLineWidth, settings.line.lineWidth));
        }

        public destroy(): void {
        }
    }
}
