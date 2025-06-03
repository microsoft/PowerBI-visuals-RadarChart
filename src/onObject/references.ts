import powerbi from "powerbi-visuals-api";
import SubSelectableDirectEdit = powerbi.visuals.SubSelectableDirectEdit;
import SubSelectableDirectEditStyle = powerbi.visuals.SubSelectableDirectEditStyle;

import { IFontReference, ILegendReference, ILabelsReference, IDataPointReference, IDisplayReference, ILineReference, IYAxisLabelsReference } from "./interfaces";
import { RadarChartObjectNames } from "../settings";

export const TitleEdit: SubSelectableDirectEdit = {
    reference: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "titleText"
    },
    style: SubSelectableDirectEditStyle.HorizontalLeft,
}
export const visualTitleEditSubSelection = JSON.stringify(TitleEdit);

const createBaseFontReference = (objectName: string, colorName: string, prefix: string = ""): IFontReference => {
    return {
        fontFamily: {
            objectName: objectName,
            propertyName: `${prefix}fontFamily`
        },
        bold: {
            objectName: objectName,
            propertyName: `${prefix}fontBold`
        },
        italic: {
            objectName: objectName,
            propertyName: `${prefix}fontItalic`
        },
        underline: {
            objectName: objectName,
            propertyName: `${prefix}fontUnderline`
        },
        fontSize: {
            objectName: objectName,
            propertyName: `${prefix}fontSize`
        },
        color: {
            objectName: objectName,
            propertyName: colorName
        }
    }
}

export const legendReferences: ILegendReference = {
    ...createBaseFontReference(RadarChartObjectNames.Legend, "labelColor"),
    cardUid: "Visual-legend-card",
    groupUid: "legendTextGroup-group",
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
    },
    color: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "labelColor"
    }
}

export const labelsReferences: ILabelsReference = {
    ...createBaseFontReference(RadarChartObjectNames.Labels, "color"),
    cardUid: "Visual-labels-card",
    groupUid: `${RadarChartObjectNames.LabelsX}-group`,
    show: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "show"
    },
    color: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "color"
    }
}

export const dataPointReferences: IDataPointReference = {
    cardUid: "Visual-dataPoint-card",
    groupUid: "dataPoint-group",
    fill: {
        objectName: RadarChartObjectNames.DataPoint,
        propertyName: "fill"
    }
}

export const displayReferences: IDisplayReference = {
    cardUid: "Visual-displaySettings-card",
    groupUid: "displaySettings-group",
    axisBeginning: {
        objectName: RadarChartObjectNames.DisplaySettings,
        propertyName: "axisBeginning"
    }
}

export const linesReferences: ILineReference = {
    cardUid: "Visual-line-card",
    groupUid: "line-group",
    show: {
        objectName: RadarChartObjectNames.Line,
        propertyName: "show"
    }
}

export const yAxisLabelsReferences: IYAxisLabelsReference = {
    ...createBaseFontReference(RadarChartObjectNames.Labels, "y_color", "y_"),
    cardUid: "Visual-labels-card",
    groupUid: `${RadarChartObjectNames.LabelsY}-group`,
    show: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "showY"
    },
    precision: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "precision"
    },
    displayUnits: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "displayUnits"
    },
    showOverlapping: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "showOverlapping"
    },
    showCustomColor: {
        objectName: RadarChartObjectNames.Labels,
        propertyName: "showYLabelCustomColor"
    }
}
