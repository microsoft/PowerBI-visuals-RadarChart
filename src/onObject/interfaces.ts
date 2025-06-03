import powerbi from "powerbi-visuals-api";

import GroupFormattingModelReference = powerbi.visuals.GroupFormattingModelReference;
import FormattingId = powerbi.visuals.FormattingId;

export interface IFontReference extends GroupFormattingModelReference {
    fontFamily: FormattingId;
    bold: FormattingId;
    italic: FormattingId;
    underline: FormattingId;
    fontSize: FormattingId;
    color: FormattingId;
}

export interface ILegendReference extends IFontReference {
    show: FormattingId;
    showTitle: FormattingId;
    position: FormattingId;
    titleText: FormattingId;
}

export interface ILabelsReference extends IFontReference {
    show: FormattingId;
}

export interface IDataPointReference extends GroupFormattingModelReference {
    fill: FormattingId;
}

export interface IDisplayReference extends GroupFormattingModelReference {
    axisBeginning: FormattingId;
}

export interface ILineReference extends GroupFormattingModelReference {
    show: FormattingId;
}

export interface IYAxisLabelsReference extends ILabelsReference {
    precision: FormattingId;
    displayUnits: FormattingId;
    showOverlapping: FormattingId;
    showCustomColor: FormattingId;
}