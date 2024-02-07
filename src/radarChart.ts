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
import "./../style/radarChart.less";

import powerbi from "powerbi-visuals-api";
import clone from "lodash.clone";

// d3
import { ScaleLinear as d3LinearScale, scaleLinear as d3ScaleLinear} from "d3-scale";
import { min as d3Min, max as d3Max} from "d3-array";
import { arc as d3Arc } from "d3-shape";
import { transition as d3Transition } from "d3-transition";
import {
    select as d3Select,
    Selection as d3Selection 
} from "d3-selection";
type Selection<T> = d3Selection<any, T, any, any>;
d3Select.prototype.transition = d3Transition;

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

// powerbi.extensibility
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisual = powerbi.extensibility.IVisual;
import ISelectionId = powerbi.extensibility.ISelectionId;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import IPoint = powerbi.extensibility.IPoint;

// Svg utils
import * as SvgUtils from "powerbi-visuals-utils-svgutils";
import IMargin = SvgUtils.IMargin;
import translate = SvgUtils.manipulation.translate;
import ClassAndSelector = SvgUtils.CssConstants.ClassAndSelector;
import CreateClassAndSelector = SvgUtils.CssConstants.createClassAndSelector;

// Formatting utils
import * as FormattingUtils from "powerbi-visuals-utils-formattingutils";
import TextProperties = FormattingUtils.interfaces.TextProperties;
import valueFormatter = FormattingUtils.valueFormatter;
import IValueFormatter = FormattingUtils.valueFormatter.IValueFormatter;
import textMeasurementService = FormattingUtils.textMeasurementService;

// On object
import { HtmlSubSelectableClass, HtmlSubSelectionHelper, SubSelectableDisplayNameAttribute, SubSelectableObjectNameAttribute, SubSelectableDirectEdit as SubSelectableDirectEditAttr, SubSelectableTypeAttribute } from "../node_modules/powerbi-visuals-utils-onobjectformatting/src";
import CustomVisualSubSelection = powerbi.visuals.CustomVisualSubSelection;
import SubSelectableDirectEdit = powerbi.visuals.SubSelectableDirectEdit;
import SubSelectableDirectEditStyle = powerbi.visuals.SubSelectableDirectEditStyle;
import SubSelectionShortcutsKey = powerbi.visuals.SubSelectionShortcutsKey;
import SubSelectionStyles = powerbi.visuals.SubSelectionStyles;
import VisualShortcutType = powerbi.visuals.VisualShortcutType;
import VisualSubSelectionShortcuts = powerbi.visuals.VisualSubSelectionShortcuts;
import SubSelectionStylesType = powerbi.visuals.SubSelectionStylesType;
import FormattingId = powerbi.visuals.FormattingId;

// Interactivity utils
import {
    interactivityBaseService,
    interactivitySelectionService as interactivityService
} from "powerbi-visuals-utils-interactivityutils";

import SelectableDataPoint = interactivityService.SelectableDataPoint;
import IInteractiveBehavior = interactivityBaseService.IInteractiveBehavior;
import IInteractivityServiceCommon = interactivityBaseService.IInteractivityService;
import createInteractivityService = interactivityService.createInteractivitySelectionService;

type IInteractivityService = IInteractivityServiceCommon<SelectableDataPoint>;

// Type utils
import { pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";

// Color utils
import { ColorHelper } from "powerbi-visuals-utils-colorutils";

// Tooltips utils
import { ITooltipServiceWrapper, createTooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";

// Dataview utils
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";

// Formatting model utils
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

// Chart utils
import * as ChartUtils from "powerbi-visuals-utils-chartutils";
import LegendModule = ChartUtils.legend;
import ILegend = ChartUtils.legendInterfaces.ILegend;
import LegendData = ChartUtils.legendInterfaces.LegendData;
import LegendDataPoint = ChartUtils.legendInterfaces.LegendDataPoint;
import LegendDataModule = ChartUtils.legendData;
import createLegend = ChartUtils.legend.createLegend;
import LegendPosition = ChartUtils.legendInterfaces.LegendPosition;
import OutsidePlacement = ChartUtils.dataLabelInterfaces.OutsidePlacement;
import OpacityLegendBehavior = ChartUtils.OpacityLegendBehavior;
import { RadarChartWebBehavior, RadarChartBehaviorOptions } from "./radarChartWebBehavior";
import { RadarChartSeries, RadarChartCircularSegment, RadarChartLabel, RadarChartDatapoint, IRadarChartData, RadarChartLabelsData } from "./radarChartDataInterfaces";
import { LabelsSettingsCard, RadarChartSettingsModel } from "./settings";
import * as RadarChartUtils from "./radarChartUtils";
import * as TooltipBuilder from "./tooltipBuilder";

interface References {
    cardUid?: string;
    groupUid?: string;
    font?: FormattingId;
    color?: FormattingId;
    show?: FormattingId;
    fontFamily?: FormattingId;
    bold?: FormattingId;
    italic?: FormattingId;
    underline?: FormattingId;
    fontSize?: FormattingId;
    showTitle?: FormattingId;
    position?: FormattingId;
    titleText?: FormattingId;
    fill?: FormattingId;
    axisBeginning?: FormattingId;
}

const enum RadarChartObjectNames {
    Legend = "legend",
    LegendTitle = "legendTitle",
    DataPoint = "dataPoint",
    DisplaySettings = "displaySettings",
    Line = "line",
    Labels = "labels"
}

const TitleEdit: SubSelectableDirectEdit = {
    reference: {
        objectName: "legend",
        propertyName: "titleText"
    },
    style: SubSelectableDirectEditStyle.Outline,
}

const legendReferences: References = {
    cardUid: "Visual-legend-card",
    groupUid: "legendTextGroup-group",
    fontFamily: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "fontFamily"
    },
    bold: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "fontBold"
    },
    italic: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "fontItalic"
    },
    underline: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "fontUnderline"
    },
    fontSize: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "fontSize"
    },
    color: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "labelColor"
    },
    show: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "show"
    },
    showTitle: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "showTitle"
    },
    titleText: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "titleText"
    },
    position: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "position"
    }
}

const labelsReferences: References = {
    cardUid: "Visual-labels-card",
    groupUid: "labels-group",
    fontFamily: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "fontFamily"
    },
    bold: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "fontBold"
    },
    italic: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "fontItalic"
    },
    underline: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "fontUnderline"
    },
    fontSize: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "fontSize"
    },
    color: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "color"
    },
    show: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "show"
    }
}

const dataPointReferences: References = {
    cardUid: "Visual-dataPoint-card",
    groupUid: "dataPoint-group",
    fill: {
        objectName: RadarChartObjectNames.DataPoint,
        propertyName: "fill"
    }
}

const displayReferences: References = {
    cardUid: "Visual-displaySettings-card",
    groupUid: "displaySettings-group",
    axisBeginning: {
        objectName: RadarChartObjectNames.DisplaySettings,
        propertyName: "axisBeginning"
    }
}

const linesReferences: References = {
    cardUid: "Visual-line-card",
    groupUid: "line-group",
    show: {
        objectName: RadarChartObjectNames.Line,
        propertyName: "show"
    }
}

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

    private root: Selection<any>;
    private svg: Selection<any>;
    private chart: Selection<any>;

    private mainGroupElement: Selection<any>;
    private colorPalette: IColorPalette;
    private colorHelper: ColorHelper;
    private viewport: IViewport;
    private viewportAvailable: IViewport;

    private interactivityService: IInteractivityService;
    private behavior: IInteractiveBehavior;
    private visualHost: IVisualHost;
    private localizationManager: ILocalizationManager;
    private events: IVisualEventService;

    private tooltipServiceWrapper: ITooltipServiceWrapper;

    private margin: IMargin;
    private legend: ILegend;
    private legendObjectProperties: IDataViewObject;
    private radarChartData: IRadarChartData;

    private angle: number;
    private radius: number;

    public formattingSettings: RadarChartSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettingsModel: powerbi.visuals.FormattingModel;

    private subSelectionHelper: HtmlSubSelectionHelper;
    private formatMode: boolean = false;
    private visualTitleEditSubSelection = JSON.stringify(TitleEdit);
    public visualOnObjectFormatting?: powerbi.extensibility.visual.VisualOnObjectFormatting;

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

        const categoryValues: PrimitiveValue[] = dataView.categorical.categories[0].values;

        const formatter: IValueFormatter = valueFormatter.create({
            format: valueFormatter.getFormatStringByColumn(
                dataView.metadata.columns[0],
                true),
        });

        const labelsData: RadarChartLabelsData = {
            labelPoints: [],
            formatter: formatter,
        };

        for (let i: number = 0, iLen: number = categoryValues.length; i < iLen; i++) {
            const radarChartLabel: RadarChartLabel = d3Arc() as RadarChartLabel;
            radarChartLabel.text = categoryValues[i] as string;
            radarChartLabel.startAngle = null;
            radarChartLabel.endAngle = null;
            radarChartLabel.index = i;
            radarChartLabel.padAngle(0);
            radarChartLabel.innerRadius(0);
            radarChartLabel.outerRadius(0);

            labelsData.labelPoints.push(radarChartLabel);
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
    // eslint-disable-next-line max-lines-per-function
    public static converter(dataView: DataView,
        colorPalette: IColorPalette,
        colorHelper: ColorHelper,
        visualHost: IVisualHost,
        settings: RadarChartSettingsModel,
        interactivityService?: IInteractivityService): IRadarChartData {

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
                labels: RadarChart.getLabelsData(dataView),
                series: []
            };
        }
        const catDv: DataViewCategorical = dataView.categorical,
            values: DataViewValueColumns = catDv.values,
            series: RadarChartSeries[] = [];

        RadarChart.checkAndUpdateAxis(dataView, values);
        const grouped: DataViewValueColumnGroup[] = catDv && catDv.values
            ? catDv.values.grouped()
            : null;

        const hasHighlights: boolean = !!(values.length > 0 && values[0].highlights);

        const legendData: LegendData = {
            fontSize: settings.legend.text.font.fontSize.value,
            dataPoints: [],
            title: settings.legend.title.titleText.value,
            labelColor: settings.legend.text.labelColor.value.value,
            fontFamily: settings.legend.text.font.fontFamily.value
        };
        for (let i: number = 0, iLen: number = values.length; i < iLen; i++) {
            let dataPointFillColor: string,
                serieIdentity: ISelectionId,
                queryName: string,
                displayName: string;
            const dataPoints: RadarChartDatapoint[] = [];

            const columnGroup: DataViewValueColumnGroup = grouped && grouped.length > i && grouped[i].values
                ? grouped[i]
                : null;

            if (values[i].source) {
                const source: DataViewMetadataColumn = values[i].source;

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
                    const fillProp: DataViewObjectPropertyIdentifier = {
                        objectName: "dataPoint",
                        propertyName: "fill"
                    };
                    dataPointFillColor = dataViewObjects.getFillColor(source.objects, fillProp);
                }
            }

            const colorFromPalette: string = colorPalette.getColor(i.toString()).value;
            const color: string = dataPointFillColor ?? colorFromPalette;
            const legendDataPointsColor: string = colorHelper.isHighContrast ? colorHelper.getHighContrastColor("foreground", color) : color;
            legendData.dataPoints.push(<LegendDataPoint>{
                label: displayName,
                color: legendDataPointsColor,
                selected: false,
                identity: serieIdentity
            });

            for (let k: number = 0, kLen: number = values[i].values.length; k < kLen; k++) {
                const dataPointIdentity: ISelectionId = visualHost.createSelectionIdBuilder()
                    .withMeasure(queryName)
                    .withCategory(catDv.categories[0], k)
                    .withSeries(dataView.categorical.values, columnGroup)
                    .createSelectionId();

                const tooltipInfo: VisualTooltipDataItem[] = TooltipBuilder.createTooltipInfo(
                    <any>catDv,
                    catDv.categories[0].values[k],
                    values[i].values[k],
                    i);
                const currCatValue = catDv.categories[0].values[k];
                const labelFormatString: string = valueFormatter.getFormatStringByColumn(catDv.values[i].source),
                    fontSizeInPx: string = PixelConverter.fromPoint(settings.labels.font.fontSize.value);

                const notConvertedValue: PrimitiveValue = values[i].values[k],
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

                const radarChartSeries: RadarChartSeries = {
                    fill: color,
                    name: displayName,
                    dataPoints: dataPoints,
                    identity: <any>serieIdentity,
                    hasHighlights: hasHighlights
                };

                series.push(radarChartSeries);
            }
        }

        return {
            labels: RadarChart.getLabelsData(dataView),
            legendData: legendData,
            series: series
        };
    }

    constructor(options: VisualConstructorOptions) {
        const element: HTMLElement = options.element;

        this.colorPalette = options.host.colorPalette;
        this.colorHelper = new ColorHelper(this.colorPalette);
        this.root = d3Select(options.element);

        if (!this.svg) {
            this.svg = d3Select(element).append("svg");
            this.svg.style("position", "absolute");
        }

        if (!this.margin) {
            this.margin = clone(RadarChart.DefaultMargin);
        }

        this.svg.classed(RadarChart.VisualClassName, true);

        this.visualHost = options.host;
        this.localizationManager = this.visualHost.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);

        this.subSelectionHelper = HtmlSubSelectionHelper.createHtmlSubselectionHelper({
            hostElement: options.element,
            subSelectionService: options.host.subSelectionService,
            selectionIdCallback: (e) => this.selectionIdCallback(e),
            customOutlineCallback: (e) => this.customOutlineCallback(e)
        });

        this.interactivityService = createInteractivityService(this.visualHost);
        this.behavior = new RadarChartWebBehavior();
        this.events = options.host.eventService;

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

        this.mainGroupElement
            .append("g")
            .classed(RadarChart.LabelGraphicsContextSelector.className, true);

        this.mainGroupElement
            .append("g")
            .classed(RadarChart.SegmentsSelector.className, true);

        this.mainGroupElement
            .append("g")
            .classed(RadarChart.AxisSelector.className, true);

        this.chart = this.mainGroupElement
            .append("g")
            .classed(RadarChart.ChartSelector.className, true);

        this.visualOnObjectFormatting = {
            getSubSelectionStyles: (subSelections) => this.getSubSelectionStyles(subSelections),
            getSubSelectionShortcuts: (subSelections, filter) => this.getSubSelectionShortcuts(subSelections, filter),
            getSubSelectables: (filter) => this.getSubSelectables(filter)
        };
    }

    public update(options: VisualUpdateOptions): void {
        if (!options.dataViews || !options.dataViews[0]) {
            this.clear();
            return;
        }
        this.events.renderingStarted(options);
        const dataView: DataView = options.dataViews[0];

        this.formatMode = options.formatMode;
        this.formattingSettings = RadarChart.parseSettings(dataView, this.colorHelper, this.formattingSettingsService);
        this.formattingSettings.setLocalizedOptions(this.localizationManager);
        this.legendObjectProperties = RadarChart.parseLegendProperties(dataView, this.colorHelper, this.formattingSettings);

        this.radarChartData = RadarChart.converter(
            dataView,
            this.colorPalette,
            this.colorHelper,
            this.visualHost,
            this.formattingSettings,
            this.interactivityService);

        let categories: PrimitiveValue[] = [];
        const series: RadarChartSeries[] = this.radarChartData.series;

        if (dataView.categorical
            && dataView.categorical.categories
            && dataView.categorical.categories[0]
            && dataView.categorical.categories[0].values
            && (series.length > 0)) {
            this.formattingSettings.setMinMaxValuesForDisplay(this.getMinValue(dataView));

            categories = dataView.categorical.categories[0].values;
        } else {
            this.clear();
            this.events.renderingFinished(options);
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

        this.formattingSettings.populateDataPointSlice(this.radarChartData.series);
        this.formattingSettings.setVisibilityOfColorSlices(this.colorHelper);

        this.renderLegend();
        this.updateViewport();

        this.svg.attr("height", this.viewport.height);
        this.svg.attr("width", this.viewport.width);

        this.mainGroupElement.attr(
            "transform",
            translate(this.viewport.width / 2, this.viewport.height / 2));

        const labelsFontSize: number = this.formattingSettings.labels.font.fontSize.value;

        this.margin.top = Math.max(RadarChart.DefaultMargin.top, labelsFontSize);
        this.margin.left = Math.max(RadarChart.DefaultMargin.left, labelsFontSize);
        this.margin.right = Math.max(RadarChart.DefaultMargin.right, labelsFontSize);
        this.margin.bottom = Math.max(RadarChart.DefaultMargin.bottom, labelsFontSize);

        const width: number = this.viewport.width - this.margin.left - this.margin.right,
            height: number = this.viewport.height - this.margin.top - this.margin.bottom;

        if ((width < RadarChart.MinViewportToRender.width) || (height < RadarChart.MinViewportToRender.height)) {
            this.clear();
            this.events.renderingFinished(options);
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

        this.subSelectionHelper.setFormatMode(options.formatMode);
        const shouldUpdateSubSelection = options.type & (powerbi.VisualUpdateType.Data
            | powerbi.VisualUpdateType.Resize
            | powerbi.VisualUpdateType.FormattingSubSelectionChange);
        if (this.formatMode && shouldUpdateSubSelection) {
            this.subSelectionHelper.updateOutlinesFromSubSelections(options.subSelections, true);
        }

        this.events.renderingFinished(options);
    }

    public getMinValue(dataView: DataView) : number {
        let minValue = d3Min(<number[]>dataView.categorical.values[0].values);
        for (let i: number = 0; i < dataView.categorical.values.length; i++) {
            const minValueL = d3Min(<number[]>dataView.categorical.values[i].values);
            if (minValue > minValueL) {
                minValue = minValueL;
            }
        }
        return minValue;
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public selectionIdCallback(e: Element): powerbi.visuals.ISelectionId {
        const elementType: string = d3Select(e).attr(SubSelectableObjectNameAttribute);

        switch (elementType) {
            case RadarChartObjectNames.DataPoint: {
                const datum = d3Select<Element, RadarChartSeries>(e).datum();
                return datum.identity;
            }
            default:
                return undefined;
        }
    }

    public customOutlineCallback(subSelections: CustomVisualSubSelection): powerbi.visuals.SubSelectionRegionOutlineFragment[] {
        const elementType: string = subSelections.customVisualObjects[0].objectName;
        switch (elementType) {
            case RadarChartObjectNames.DataPoint: {
                const subSelectionIdentity: powerbi.visuals.ISelectionId = subSelections.customVisualObjects[0].selectionId;
                const selectedSeries: RadarChartSeries = this.radarChartData.series.find((series => series.identity.equals(subSelectionIdentity)));
                const result: powerbi.visuals.SubSelectionRegionOutlineFragment[] = [{
                    id: RadarChartObjectNames.DataPoint,
                    outline: {
                        type: powerbi.visuals.SubSelectionOutlineType.Polygon,
                        points: selectedSeries?.dataPoints ? this.calculatePoint(selectedSeries?.dataPoints) : []
                    }
                }]
                return result;
            }
            default:
                return undefined;
        }
    }

    private calculatePoint(dataPoints: RadarChartDatapoint[]): IPoint[] {
        if (dataPoints.length === 0){
            return [];
        }
        const yDomain: d3LinearScale<number, number> = this.calculateChartDomain(this.radarChartData.series);
        const angle: number = this.angle;
        const axisBeginning: number = +this.formattingSettings.display.axisBeginning.value.value;

        let xShift: number = this.viewport.width / 2;
        let yShift: number = this.viewport.height / 2;

        //add x and y shifts depending on the orientation of the legend
        const legendPosition: number = this.legend.getOrientation();
        switch (legendPosition) {
            case LegendPosition.Left:
            case LegendPosition.LeftCenter:
                xShift+=this.legend.getMargins().width;
                break;
            case LegendPosition.Top:
            case LegendPosition.TopCenter:
                yShift+=this.legend.getMargins().height;
                break;
        }
        
        const points: IPoint[] = dataPoints.map((value) => {
            if (value.showPoint) {
                const x1: number = yDomain(value.y) * Math.sin(value.x * angle) + xShift,
                    y1: number = axisBeginning * yDomain(value.y) * Math.cos(value.x * angle) + yShift;

                return {x: x1, y: y1};
            }
        });

        return points;
    }

    private fixSelectionId(customVisualObject: powerbi.visuals.CustomVisualObject) {
        //@ts-ignore
        if (customVisualObject?.selectionId?.dataMap) {
            //@ts-ignore
            if (Object.keys(customVisualObject?.selectionId?.dataMap).length === 0) {
                //@ts-ignore
                customVisualObject.selectionId.dataMap = null;
            }
              //@ts-ignore
            customVisualObject.selectionId.createSelectionId();
        }
    }

    private getSubSelectionStyles(subSelections: CustomVisualSubSelection[]): SubSelectionStyles | undefined {
        const visualObject = subSelections[0]?.customVisualObjects[0];
        if (visualObject) {
            this.fixSelectionId(visualObject);
            switch (visualObject.objectName) {
                case RadarChartObjectNames.Legend:
                    return this.getLegendStyles();
                case RadarChartObjectNames.Labels:
                    return this.getLabelsStyles();
                case RadarChartObjectNames.DataPoint:
                    return this.getDataPointStyles(subSelections);
            }
        }
    }
    private getSubSelectionShortcuts(subSelections: CustomVisualSubSelection[], filter: SubSelectionShortcutsKey | undefined): VisualSubSelectionShortcuts | undefined {
        const visualObject = subSelections[0]?.customVisualObjects[0];
        if (visualObject) {
            this.fixSelectionId(visualObject);
            switch (visualObject.objectName) {
                case RadarChartObjectNames.Legend:
                    return this.getLegendShortcuts();
                case RadarChartObjectNames.LegendTitle:
                    return this.getLegendTitleShortcuts();
                case RadarChartObjectNames.Labels:
                    return this.getLabelsShortcuts();
                case RadarChartObjectNames.DataPoint:
                    return this.getDataPointShortcuts(subSelections);
            }
        }
    }
    private getSubSelectables?(filter?: SubSelectionStylesType): CustomVisualSubSelection[] | undefined {
        return this.subSelectionHelper.getAllSubSelectables(filter);
    }

    private getLegendTitleShortcuts(): VisualSubSelectionShortcuts {
        return [
            {
                type: VisualShortcutType.Reset,
                relatedResetFormattingIds: [
                    legendReferences.showTitle,
                    legendReferences.titleText
                ]
            },
            {
                type: VisualShortcutType.Toggle,
                ...legendReferences.showTitle,
                disabledLabel: "Delete title"
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: legendReferences.cardUid, groupUid: "legendTitleGroup-group" },
                label: "Format title"
            }
        ];
    }
    private getLegendShortcuts(): VisualSubSelectionShortcuts {
        return [
            {
                type: VisualShortcutType.Reset,
                relatedResetFormattingIds: [
                    legendReferences.bold,
                    legendReferences.fontFamily,
                    legendReferences.fontSize,
                    legendReferences.italic,
                    legendReferences.underline,
                    legendReferences.color,
                    legendReferences.showTitle,
                    legendReferences.titleText
                ]
            },
            {
                type: VisualShortcutType.Picker,
                ...legendReferences.position,
                label: "Position"
            },
            {
                type: VisualShortcutType.Toggle,
                ...legendReferences.show,
                disabledLabel: "Delete legend"
            },
            {
                type: VisualShortcutType.Toggle,
                ...legendReferences.showTitle,
                enabledLabel: "Add legend title",
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: legendReferences.cardUid, groupUid: legendReferences.groupUid },
                label: "Format legend"
            }
        ];
    }
    private getLegendStyles(): SubSelectionStyles {
        return {
            type: SubSelectionStylesType.Text,
            fontFamily: {
                reference: {
                    ...legendReferences.fontFamily
                },
                label: legendReferences.fontFamily.propertyName
            },
            bold: {
                reference: {
                    ...legendReferences.bold
                },
                label: legendReferences.bold.propertyName
            },
            italic: {
                reference: {
                    ...legendReferences.italic
                },
                label: legendReferences.italic.propertyName
            },
            underline: {
                reference: {
                    ...legendReferences.underline
                },
                label: legendReferences.underline.propertyName
            },
            fontSize: {
                reference: {
                    ...legendReferences.fontSize
                },
                label: legendReferences.fontSize.propertyName
            },
            fontColor: {
                reference: {
                    ...legendReferences.color
                },
                label: legendReferences.color.propertyName
            }
        };
    }

    private getLabelsShortcuts(): VisualSubSelectionShortcuts {
        return [
            {
                type: VisualShortcutType.Reset,
                relatedResetFormattingIds: [
                    labelsReferences.bold,
                    labelsReferences.fontFamily,
                    labelsReferences.fontSize,
                    labelsReferences.italic,
                    labelsReferences.underline,
                    labelsReferences.color
                ]
            },
            {
                type: VisualShortcutType.Toggle,
                ...labelsReferences.show,
                disabledLabel: "Delete data labels",
                enabledLabel: "Add data labels"
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: labelsReferences.cardUid },
                label: "Format data labels"
            }
        ];
    }
    private getLabelsStyles(): SubSelectionStyles {
        return {
            type: SubSelectionStylesType.Text,
            fontFamily: {
                reference: {
                    ...labelsReferences.fontFamily
                },
                label: labelsReferences.fontFamily.propertyName
            },
            bold: {
                reference: {
                    ...labelsReferences.bold
                },
                label: labelsReferences.bold.propertyName
            },
            italic: {
                reference: {
                    ...labelsReferences.italic
                },
                label: labelsReferences.italic.propertyName
            },
            underline: {
                reference: {
                    ...labelsReferences.underline
                },
                label: labelsReferences.underline.propertyName
            },
            fontSize: {
                reference: {
                    ...labelsReferences.fontSize
                },
                label: labelsReferences.fontSize.propertyName
            },
            fontColor: {
                reference: {
                    ...labelsReferences.color
                },
                label: labelsReferences.color.propertyName
            }
        };
    }

    private getDataPointShortcuts(subSelections: CustomVisualSubSelection[]): VisualSubSelectionShortcuts {
        const selector = subSelections[0].customVisualObjects[0].selectionId?.getSelector();
        return [
            {
                type: VisualShortcutType.Reset,
                relatedResetFormattingIds: [{
                    ...dataPointReferences.fill,
                    selector
                },
                displayReferences.axisBeginning,
                linesReferences.show],
            },
            {
                type: VisualShortcutType.Toggle,
                ...linesReferences.show,
                disabledLabel: "Draw polygons",
                enabledLabel: "Draw lines"
            },
            {
                type: VisualShortcutType.Picker,
                ...displayReferences.axisBeginning,
                label: "Axis start position"
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: dataPointReferences.cardUid },
                label: "Format data colors"
            }
        ];
    }
    private getDataPointStyles(subSelections: CustomVisualSubSelection[]): SubSelectionStyles {
        const selector = subSelections[0].customVisualObjects[0].selectionId?.getSelector();
        return {
            type: SubSelectionStylesType.Shape,
            fill: {
                reference: {
                    ...dataPointReferences.fill,
                    selector
                },
                label: dataPointReferences.fill.propertyName
            },
        };
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
        this.legend.drawLegend({ dataPoints: [] }, clone(this.viewport));
    }

    private changeAxesLineColorInHighMode(selectionArray: Selection<any>[]): void {
        if (this.colorHelper.isHighContrast) {
            const lineColor: string = this.formattingSettings.legend.text.labelColor.value.value;

            selectionArray.forEach((selection) => {
                selection.style("stroke", lineColor);
            });
        }
    }

    private drawCircularSegments(values: PrimitiveValue[]): void {
        const axisBeginning: number = +this.formattingSettings.display.axisBeginning.value.value;
        const data: RadarChartCircularSegment[] = [],
            angle: number = this.angle,
            factor: number = RadarChart.SegmentFactor,
            levels: number = RadarChart.SegmentLevels,
            radius: number = this.radius;

        for (let level: number = 0; level < levels; level++) {
            const levelFactor: number = radius * factor * ((level + 1) / levels);

            for (let i: number = 0; i <= values.length; i++) {
                data.push({
                    x1: levelFactor * (Math.sin(i * angle)),
                    y1: axisBeginning * levelFactor * (Math.cos(i * angle)),
                    x2: levelFactor * (Math.sin((i + 1) * angle)),
                    y2: axisBeginning * levelFactor * (Math.cos((i + 1) * angle)),
                });
            }
        }

        let selection: Selection<RadarChartCircularSegment> = this.mainGroupElement
            .select(RadarChart.SegmentsSelector.selectorName)
            .selectAll(RadarChart.SegmentNodeSElector.selectorName)
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append("svg:line")
            .classed(RadarChart.SegmentNodeSElector.className, true)
            .merge(selection)
            .attr("x1", (segment: RadarChartCircularSegment) => segment.x1)
            .attr("y1", (segment: RadarChartCircularSegment) => segment.y1)
            .attr("x2", (segment: RadarChartCircularSegment) => segment.x2)
            .attr("y2", (segment: RadarChartCircularSegment) => segment.y2);

        this.changeAxesLineColorInHighMode([selection]);
    }

    private drawAxes(values: PrimitiveValue[]): void {
        const axisBeginning: number = +this.formattingSettings.display.axisBeginning.value.value;
        const angle: number = this.angle,
            radius: number = this.radius;

        const selection: Selection<RadarChartCircularSegment> = this.mainGroupElement
            .select(RadarChart.AxisSelector.selectorName)
            .selectAll(RadarChart.AxisNodeSelector.selectorName);

        let axexSelection: Selection<PrimitiveValue> = selection.data(values);

        axexSelection
            .exit()
            .remove();

        axexSelection = axexSelection
            .enter()
            .append("svg:line")
            .classed(RadarChart.AxisNodeSelector.className, true)
            .merge(axexSelection)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d: PrimitiveValue, i: number) => radius * Math.sin(i * angle))
            .attr("y2", (d: PrimitiveValue, i: number) => axisBeginning * radius * Math.cos(i * angle));

        this.changeAxesLineColorInHighMode([axexSelection]);
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
        const labelSettings: LabelsSettingsCard = this.formattingSettings.labels;

        const properties: TextProperties = {
            fontFamily: RadarChart.AxesLabelsFontFamily,
            fontSize: PixelConverter.fromPoint(labelSettings.font.fontSize.value),
            text: this.radarChartData.labels.formatter.format(current.text)
        };

        const currentTextHeight: number = textMeasurementService.estimateSvgTextHeight(properties);

        for (let i: number = 0; i < others.length; i++) {
            const label: RadarChartLabel = others[i];

            properties.text = label.text;
            const otherTextHeight: number = textMeasurementService.estimateSvgTextHeight(properties);

            const curTextUpperPoint: number = current.y - currentTextHeight;
            const labelTextUpperPoint: number = label.y - otherTextHeight;

            if (RadarChart.isIntersect(current.y, curTextUpperPoint, label.y, labelTextUpperPoint)) {
                const shift: number = this.shiftText(current.y, curTextUpperPoint, label.y, labelTextUpperPoint, shiftDown);
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

        const shiftDirrectionIsDown: boolean = this.formattingSettings.display.axisBeginning.value.value === 1;

        for (let i: number = 0; i < labelPoints.length; i++) {
            const label: RadarChartLabel = labelPoints[i];

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

            const labelDec: RadarChartLabel = labelPoints[labelPoints.length - 1 - i];
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

        const angle: number = this.angle,
            radius: number = this.radius,
            labelPoints: RadarChartLabel[] = this.radarChartData.labels.labelPoints;

        const axisBeginning: number = +this.formattingSettings.display.axisBeginning.value.value;

        for (let i: number = 0; i < labelPoints.length; i++) {
            const angleInRadian: number = i * angle,
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
            const label: RadarChartLabel = labelPoints[i];
            label.outsidePlacement = OutsidePlacement.Allowed;
            label.xLinkEnd = label.x;
            label.yLinkEnd = label.y;
        }

        this.drawAxesLabels(labelPoints as RadarChartLabel[]);
    }

    private drawAxesLabels(values: RadarChartLabel[]): void {
        const labelSettings: LabelsSettingsCard = this.formattingSettings.labels;

        const selectionLabelText: Selection<RadarChartLabel> = this.mainGroupElement
            .select(RadarChart.AxisSelector.selectorName)
            .selectAll(RadarChart.AxisLabelSelector.selectorName);

        const filteredData: RadarChartLabel[] = values.filter((label: RadarChartLabel) => labelSettings.show.value && !label.hide);

        let labelsSelection: Selection<RadarChartLabel> = selectionLabelText.data(filteredData);

        labelsSelection
            .exit()
            .remove();

        labelsSelection = labelsSelection
            .enter()
            .append("svg:text")
            .classed(RadarChart.AxisLabelSelector.className, true)
            .merge(labelsSelection)
            .attr("dy", `${RadarChart.LabelYOffset}em`)
            .attr("transform", translate(RadarChart.LabelXOffset, -RadarChart.LabelYOffset * labelSettings.font.fontSize.value))
            .attr("x", (label: RadarChartLabel) => {
                const shift: number = label.textAnchor === RadarChart.TextAnchorStart ? +RadarChart.LabelPositionXOffset : -RadarChart.LabelPositionXOffset;
                return label.x + shift;
            })
            .attr("y", (label: RadarChartLabel) => label.y)
            .text((label: RadarChartLabel) => {
                const properties: TextProperties = {
                    fontFamily: RadarChart.AxesLabelsFontFamily,
                    fontSize: PixelConverter.fromPoint(labelSettings.font.fontSize.value),
                    text: this.radarChartData.labels.formatter.format(label.text)
                };

                return textMeasurementService.getTailoredTextOrDefault(properties, label.maxWidth);
            })
            .style("font-size", () => PixelConverter.fromPoint(labelSettings.font.fontSize.value))
            .style("font-family", () => labelSettings.font.fontFamily.value)
            .style("font-weight", () => labelSettings.font.bold.value ? "bold" : "normal")
            .style("font-style", () => labelSettings.font.italic.value ? "italic" : "normal")
            .style("text-decoration", () => labelSettings.font.underline.value ? "underline" : "none")
            .style("text-anchor", (label: RadarChartLabel) => label.textAnchor)
            .style("fill", () => labelSettings.color.value.value)
            .classed(HtmlSubSelectableClass, this.formatMode && this.formattingSettings.labels.show.value)
            .attr(SubSelectableObjectNameAttribute, RadarChartObjectNames.Labels)
            .attr(SubSelectableDisplayNameAttribute, "Data Labels");

        const selectionLongLineLableLink: Selection<RadarChartLabel> = this.mainGroupElement
            .select(RadarChart.AxisSelector.selectorName)
            .selectAll(RadarChart.AxisLabelLinkLongLineSelector.selectorName);

        let labelsLongLineLinkSelection: Selection<RadarChartLabel> = selectionLongLineLableLink.data(filteredData);

        labelsLongLineLinkSelection
            .exit()
            .remove();

        labelsLongLineLinkSelection = labelsLongLineLinkSelection
            .enter()
            .append("svg:line")
            .classed(RadarChart.AxisLabelLinkLongLineSelector.className, true)
            .merge(labelsLongLineLinkSelection)
            .attr("x1", (label: RadarChartLabel) => label.xLinkBegin)
            .attr("y1", (label: RadarChartLabel) => label.yLinkBegin)
            .attr("x2", (label: RadarChartLabel) => label.xLinkEnd)
            .attr("y2", (label: RadarChartLabel) => label.yLinkEnd);

        const selectionShortLineLableLink: Selection<RadarChartLabel> = this.mainGroupElement
            .select(RadarChart.AxisSelector.selectorName)
            .selectAll(RadarChart.AxisLabelLinkShortLineSelector.selectorName);

        let labelsShortLineLinkSelection: Selection<RadarChartLabel> = selectionShortLineLableLink.data(filteredData);

        labelsShortLineLinkSelection
            .exit()
            .remove();

        labelsShortLineLinkSelection = labelsShortLineLinkSelection
            .enter()
            .append("svg:line")
            .classed(RadarChart.AxisLabelLinkShortLineSelector.className, true)
            .merge(labelsShortLineLinkSelection)
            .attr("x1", (label: RadarChartLabel) => label.xLinkEnd)
            .attr("y1", (label: RadarChartLabel) => label.yLinkEnd)
            .attr("x2", (label: RadarChartLabel) => {
                const shift: number = label.textAnchor === RadarChart.TextAnchorStart ? +(RadarChart.LabelPositionXOffset - 2) : -(RadarChart.LabelPositionXOffset - 2);
                return label.xLinkEnd + shift;
            })
            .attr("y2", (label: RadarChartLabel) => label.yLinkEnd);

        this.changeAxesLineColorInHighMode([labelsShortLineLinkSelection, labelsLongLineLinkSelection]);
    }

    // eslint-disable-next-line max-lines-per-function
    private drawChart(series: RadarChartSeries[], duration: number): void {
        const angle: number = this.angle;
        const layers: RadarChartDatapoint[][] = this.getDataPoints(series);
        const yDomain: d3LinearScale<number, number> = this.calculateChartDomain(series);
        const axisBeginning: number = +this.formattingSettings.display.axisBeginning.value.value;
        const calculatePoints = (points) => {
            return points.map((value) => {
                if (value.showPoint) {
                    const x1: number = yDomain(value.y) * Math.sin(value.x * angle),
                        y1: number = axisBeginning * yDomain(value.y) * Math.cos(value.x * angle);

                    return `${x1},${y1}`;
                }
            }).join(" ");
        };

        let areasSelection: Selection<RadarChartSeries> = this.chart
            .selectAll(RadarChart.ChartAreaSelector.selectorName)
            .data(series);

        areasSelection
            .exit()
            .remove();

        areasSelection = areasSelection
            .enter()
            .append("g")
            .classed(RadarChart.ChartAreaSelector.className, true)
            .merge(areasSelection)
            .attr(SubSelectableObjectNameAttribute, RadarChartObjectNames.DataPoint)
            .attr(SubSelectableDisplayNameAttribute, (series: RadarChartSeries) => series.name)
            .attr(SubSelectableTypeAttribute, powerbi.visuals.SubSelectionStylesType.Shape)
            .classed(HtmlSubSelectableClass, this.formatMode);

        let polygonSelection: Selection<RadarChartDatapoint[]> = areasSelection
            .selectAll(RadarChart.ChartPolygonSelector.selectorName)
            .data((series: RadarChartSeries) => {
                if (series.dataPoints && series.dataPoints.length > 0) {
                    const points: RadarChartDatapoint[] = [];
                    series.dataPoints.forEach((point) => {
                        if (point.showPoint) {
                            points.push(point);
                        }
                    });
                    return [points];
                }
                return [];
            });

        polygonSelection
            .exit()
            .remove();

        polygonSelection = polygonSelection
            .enter()
            .append("polygon")
            .classed(RadarChart.ChartPolygonSelector.className, true)
            .merge(polygonSelection)
            .style("opacity", RadarChartUtils.DimmedOpacity)
            .on("mouseover", function () {
                d3Select(this)
                    .transition()
                    .duration(duration)
                    .style("opacity", RadarChart.AreaFillOpacity);
            })
            .on("mouseout", function () {
                d3Select(this)
                    .transition()
                    .duration(duration)
                    .style("opacity", RadarChartUtils.DimmedOpacity);
            })
            .attr("points", calculatePoints)
            .attr("points-count", (dataPoints: RadarChartDatapoint[]) => dataPoints.length);

        if (this.formattingSettings.line.show.value ||
            polygonSelection.attr("points-count") === RadarChart.PoligonBecomesLinePointsCount.toString()
        ) {
            polygonSelection
                .style("fill", "none")
                .style("stroke", (dataPoints: RadarChartDatapoint[]) =>
                    dataPoints.length ? this.colorHelper.getHighContrastColor("foreground", dataPoints[0].color) : null)
                .style("stroke-width", this.formattingSettings.line.lineWidth.value);
        } else {
            polygonSelection
                .style("fill", (dataPoints: RadarChartDatapoint[]) => dataPoints.length ? this.colorHelper.getHighContrastColor("foreground", dataPoints[0].color) : null)
                .style("stroke-width", RadarChart.PolygonStrokeWidth);
        }

        let nodeSelection: Selection<RadarChartDatapoint[]> = this.chart
            .selectAll(RadarChart.ChartNodeSelector.selectorName)
            .data(layers);

        nodeSelection
            .exit()
            .remove();

        nodeSelection = nodeSelection
            .enter()
            .append("g")
            .classed(RadarChart.ChartNodeSelector.className, true)
            .attr("role", "listbox")
            .merge(nodeSelection);

        const hasHighlights: boolean = (series.length > 0) && series[0].hasHighlights,
            hasSelection: boolean = this.interactivityService && this.interactivityService.hasSelection();

        let dotsSelection: Selection<RadarChartDatapoint> = nodeSelection
            .selectAll(RadarChart.ChartDotSelector.selectorName)
            .data((dataPoints: RadarChartDatapoint[]) => {
                return dataPoints.filter(d => d.y != null && d.showPoint);
            });

        dotsSelection
            .exit()
            .remove();

        dotsSelection = dotsSelection
            .enter()
            .append("svg:circle")
            .classed(RadarChart.ChartDotSelector.className, true)
            .merge(dotsSelection).attr("r", RadarChart.DotRadius)
            .attr("cx", (dataPoint: RadarChartDatapoint) => yDomain(dataPoint.y) * Math.sin(dataPoint.x * angle))
            .attr("cy", (dataPoint: RadarChartDatapoint) => axisBeginning * yDomain(dataPoint.y) * Math.cos(dataPoint.x * angle))
            .style("fill", (dataPoint: RadarChartDatapoint) => this.colorHelper.getHighContrastColor("foreground", dataPoint.color))
            .style("stroke", (dataPoint: RadarChartDatapoint) => this.colorHelper.getHighContrastColor("foreground", dataPoint.color))
            .style("opacity", (dataPoint: RadarChartDatapoint) => {
                return RadarChartUtils.getFillOpacity(
                    dataPoint.selected,
                    dataPoint.highlight,
                    !dataPoint.highlight && hasSelection,
                    !dataPoint.selected && hasHighlights);
            })
            .attr("tabindex", 0)
            .attr("role", "option")
            .attr("aria-selected", "false")
            .attr("aria-label", (dataPoint: RadarChartDatapoint) => this.getDataPointAriaLabel(dataPoint.tooltipInfo));

        this.tooltipServiceWrapper.addTooltip(
            dotsSelection,
            (eventArgs: RadarChartDatapoint) => {
                return eventArgs.tooltipInfo;
            },
            null,
            true);

        if (this.interactivityService) {
            // Register interactivity
            const dataPointsToBind: RadarChartDatapoint[] = this.getAllDataPointsList(series);
            const behaviorOptions: RadarChartBehaviorOptions = {
                selection: dotsSelection,
                clearCatcher: this.svg,
                hasHighlights: hasHighlights,
                behavior: this.behavior,
                dataPoints: dataPointsToBind
            };

            this.interactivityService.bind(behaviorOptions);
        }
    }

    private getDataPointAriaLabel(tooltipInfo: VisualTooltipDataItem[]): string {
        return `${tooltipInfo[0].displayName}:${tooltipInfo[0].value}-${tooltipInfo[1].displayName}:${tooltipInfo[1].value}`;
    }

    private calculateChartDomain(series: RadarChartSeries[]): d3LinearScale<number, number> {
        const radius: number = this.radius * RadarChart.SegmentFactor,
            dataPointsList: RadarChartDatapoint[] = this.getAllDataPointsList(series);

        let maxValue: number = d3Max(dataPointsList, (dataPoint: RadarChartDatapoint) => {
            return dataPoint.y;
        });

        let minValue: number = this.formattingSettings.display.minValue.value;

        if (this.isPercentChart(dataPointsList)) {
            minValue = minValue >= RadarChart.MinDomainValue
                ? RadarChart.MinDomainValue
                : -RadarChart.MaxDomainValue;

            maxValue = maxValue <= RadarChart.MinDomainValue
                ? RadarChart.MinDomainValue
                : RadarChart.MaxDomainValue;
        }
        return d3ScaleLinear()
            .domain([minValue, maxValue])
            .range([RadarChart.MinDomainValue, radius]);
    }

    private renderLegend(): void {
        const radarChartData: IRadarChartData = this.radarChartData;

        if (!radarChartData.legendData) {
            return;
        }

        const { height, width } = this.viewport,
            legendData: LegendData = radarChartData.legendData;

        if (this.legendObjectProperties) {
            LegendDataModule.update(legendData, this.legendObjectProperties);

            const position = this.formattingSettings.legend.text.positionDropdown.value.value;

            if (position) {
                this.legend.changeOrientation(LegendPosition[position]);
            }
        } else {
            this.legend.changeOrientation(LegendPosition.Top);
        }

        this.legend.drawLegend(legendData, { height, width });
        LegendModule.positionChartArea(this.svg, this.legend);

        this.root.selectAll("g#legendGroup text")
            .style("font-weight",  () => this.formattingSettings.legend.text.font.bold.value ? "bold" : "normal")
            .style("font-style",  () => this.formattingSettings.legend.text.font.italic.value ? "italic" : "normal")
            .style("text-decoration", () => this.formattingSettings.legend.text.font.underline.value ? "underline" : "none");

        this.root.select("g#legendGroup")
            .classed(HtmlSubSelectableClass, this.formatMode && this.formattingSettings.legend.show.value)
            .attr(SubSelectableObjectNameAttribute, RadarChartObjectNames.Legend)
            .attr(SubSelectableDisplayNameAttribute, "Legend");

        this.root.select("g#legendGroup .legendTitle")
            .classed(HtmlSubSelectableClass, this.formatMode && this.formattingSettings.legend.show.value && this.formattingSettings.legend.title.showTitle.value)
            .attr(SubSelectableObjectNameAttribute, RadarChartObjectNames.LegendTitle)
            .attr(SubSelectableDisplayNameAttribute, "Title")
            .attr(SubSelectableDirectEditAttr, this.visualTitleEditSubSelection);
    }

    private getDataPoints(seriesList: RadarChartSeries[]): RadarChartDatapoint[][] {
        const dataPoints: RadarChartDatapoint[][] = [];

        for (const series of seriesList) {
            dataPoints.push(series.dataPoints);
        }

        return dataPoints;
    }

    private getAllDataPointsList(seriesList: RadarChartSeries[]): RadarChartDatapoint[] {
        let dataPoints: RadarChartDatapoint[] = [];

        for (const series of seriesList) {
            dataPoints = dataPoints.concat(series.dataPoints);
        }

        return dataPoints;
    }

    private isPercentChart(dataPointsList: RadarChartDatapoint[]): boolean {
        for (const dataPoint of dataPointsList) {
            if (!dataPoint.labelFormatString || dataPoint.labelFormatString.indexOf("%") === -1) {
                return false;
            }
        }

        return true;
    }

    public static parseLegendProperties(dataView: DataView, colorHelper: ColorHelper, formattingSettings: RadarChartSettingsModel): IDataViewObject {
        let legendObjectProperties: IDataViewObject = {};

        if (!dataView || !dataView.metadata) {
            return legendObjectProperties;
        }

        legendObjectProperties = dataViewObjects.getObject(
            dataView.metadata.objects,
            "legend",
            {});

        if (colorHelper.isHighContrast) {
            legendObjectProperties["labelColor"] = {
                solid: {
                    color: colorHelper.getHighContrastColor("foreground", formattingSettings.legend.text.labelColor.value.value)
                }
            };
        }
        
        return legendObjectProperties;
    }

    public static parseSettings(dataView: DataView, colorHelper: ColorHelper, formattingSettingsService: FormattingSettingsService): RadarChartSettingsModel {
        const settings: RadarChartSettingsModel = formattingSettingsService.populateFormattingSettingsModel(RadarChartSettingsModel, dataView);

        if (!colorHelper) {
            return settings;
        }

        settings.dataPoint.fill.value.value = colorHelper.getHighContrastColor("foreground", settings.dataPoint.fill.value.value);
        settings.labels.color.value.value = colorHelper.getHighContrastColor("foreground", settings.labels.color.value.value);
        settings.legend.text.labelColor.value.value = colorHelper.getHighContrastColor("foreground", settings.legend.text.labelColor.value.value);

        return settings;
    }

    private updateViewport(): void {
        const legendMargins: IViewport = this.legend.getMargins();
        const legendPosition = LegendPosition[this.formattingSettings.legend.text.positionDropdown.value.value];

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

    public destroy(): void {
    }
}
