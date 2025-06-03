import powerbi from "powerbi-visuals-api";

import ISelectionId = powerbi.visuals.ISelectionId;

import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import CustomVisualSubSelection = powerbi.visuals.CustomVisualSubSelection;
import SubSelectionStyles = powerbi.visuals.SubSelectionStyles;
import VisualSubSelectionShortcuts = powerbi.visuals.VisualSubSelectionShortcuts;
import SubSelectionStylesType = powerbi.visuals.SubSelectionStylesType;
import SubSelectionRegionOutlineFragment = powerbi.visuals.SubSelectionRegionOutlineFragment;

import VisualOnObjectFormatting = powerbi.extensibility.visual.VisualOnObjectFormatting;

import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import { HtmlSubSelectionHelper, SubSelectableObjectNameAttribute } from "powerbi-visuals-utils-onobjectutils";
import { select as d3Select } from "d3-selection";

import { RadarChartObjectNames } from "../settings";
import { SubSelectionStylesService, SubSelectionShortcutsService } from "./helperServices";
import { RadarChartSeries } from "../radarChartDataInterfaces";

export class RadarOnObjectService implements VisualOnObjectFormatting {
    private localizationManager: ILocalizationManager;
    private htmlSubSelectionHelper: HtmlSubSelectionHelper;
    private getOutlines: (selectionId: ISelectionId) => SubSelectionRegionOutlineFragment[];

    constructor(element: HTMLElement, host: IVisualHost, localizationManager: ILocalizationManager, getOutlines: (selectionId: ISelectionId) => SubSelectionRegionOutlineFragment[]) {
        this.localizationManager = localizationManager;
        this.getOutlines = getOutlines;
        this.htmlSubSelectionHelper = HtmlSubSelectionHelper.createHtmlSubselectionHelper({
            hostElement: element,
            subSelectionService: host.subSelectionService,
            selectionIdCallback: (e) => this.selectionIdCallback(e),
            customOutlineCallback: (e) => this.customOutlineCallback(e)
        });
    }

    public setFormatMode(isFormatMode: boolean): void {
        this.htmlSubSelectionHelper.setFormatMode(isFormatMode);
    }

    public updateOutlinesFromSubSelections(subSelections: CustomVisualSubSelection[], clearExistingOutlines?: boolean, suppressRender?: boolean): void {
        this.htmlSubSelectionHelper.updateOutlinesFromSubSelections(subSelections, clearExistingOutlines, suppressRender);
    }

    public getSubSelectables(filter?: SubSelectionStylesType): CustomVisualSubSelection[] | undefined {
        return this.htmlSubSelectionHelper.getAllSubSelectables(filter);
    }

    public getSubSelectionStyles(subSelections: CustomVisualSubSelection[]): SubSelectionStyles | undefined {
        const visualObject = subSelections[0]?.customVisualObjects[0];
        if (visualObject) {
            switch (visualObject.objectName) {
                case RadarChartObjectNames.Legend:
                    return SubSelectionStylesService.GetLegendStyles();
                case RadarChartObjectNames.LabelsX:
                    return SubSelectionStylesService.GetLabelsStyles();
                case RadarChartObjectNames.DataPoint:
                    return SubSelectionStylesService.GetDataPointStyles(subSelections, this.localizationManager);
                case RadarChartObjectNames.LabelsY:
                    return SubSelectionStylesService.GetYAxisLabelsStyles();
            }
        }
    }

    public getSubSelectionShortcuts(subSelections: CustomVisualSubSelection[]): VisualSubSelectionShortcuts | undefined {
        const visualObject = subSelections[0]?.customVisualObjects[0];
        if (visualObject) {
            switch (visualObject.objectName) {
                case RadarChartObjectNames.Legend:
                    return SubSelectionShortcutsService.GetLegendShortcuts(this.localizationManager);
                case RadarChartObjectNames.LegendTitle:
                    return SubSelectionShortcutsService.GetLegendTitleShortcuts(this.localizationManager);
                case RadarChartObjectNames.LabelsX:
                    return SubSelectionShortcutsService.GetLabelsShortcuts(this.localizationManager);
                case RadarChartObjectNames.DataPoint:
                    return SubSelectionShortcutsService.GetDataPointShortcuts(subSelections, this.localizationManager);
                case RadarChartObjectNames.LabelsY:
                    return SubSelectionShortcutsService.GetYAxisLabelsShortcuts(this.localizationManager);
            }
        }
    }

    public selectionIdCallback(e: Element): ISelectionId {
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

    public customOutlineCallback(subSelections: CustomVisualSubSelection): SubSelectionRegionOutlineFragment[] {
        const elementType: string = subSelections.customVisualObjects[0].objectName;

        switch (elementType) {
            case RadarChartObjectNames.DataPoint: {
                const subSelectionIdentity: powerbi.visuals.ISelectionId = subSelections.customVisualObjects[0].selectionId;
                const result = this.getOutlines(subSelectionIdentity);
                return result;
            }
            default:
                return undefined;
        }
    }
}
