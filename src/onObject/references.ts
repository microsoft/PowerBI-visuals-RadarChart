import powerbi from "powerbi-visuals-api";
import SubSelectableDirectEdit = powerbi.visuals.SubSelectableDirectEdit;
import SubSelectableDirectEditStyle = powerbi.visuals.SubSelectableDirectEditStyle;

import { IFontReference, ILegendReference, ILabelsReference, IDataPointReference, IDisplayReference, ILineReference } from "./interfaces";
import { RadarChartObjectNames } from "../settings";

export const TitleEdit: SubSelectableDirectEdit = {
    reference: {
        objectName: RadarChartObjectNames.Legend,
        propertyName: "titleText"
    },
    style: SubSelectableDirectEditStyle.HorizontalLeft,
}
export const visualTitleEditSubSelection = JSON.stringify(TitleEdit);

const createBaseFontReference = (objectName: string, colorName: string): IFontReference => {
    return {
        fontFamily: {
            objectName: objectName,
            propertyName: "fontFamily"
        },
        bold: {
            objectName: objectName,
            propertyName: "fontBold"
        },
        italic: {
            objectName: objectName,
            propertyName: "fontItalic"
        },
        underline: {
            objectName: objectName,
            propertyName: "fontUnderline"
        },
        fontSize: {
            objectName: objectName,
            propertyName: "fontSize"
        },
        color: {
            objectName: objectName,
            propertyName: "color"
        }
        //labelCOlor legend
        //color xlabels
        //y_color ylabels
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
    groupUid: "labels-group",
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
