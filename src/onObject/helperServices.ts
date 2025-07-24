import powerbi from "powerbi-visuals-api";

import CustomVisualSubSelection = powerbi.visuals.CustomVisualSubSelection;
import SubSelectionStyles = powerbi.visuals.SubSelectionStyles;
import VisualSubSelectionShortcuts = powerbi.visuals.VisualSubSelectionShortcuts;
import SubSelectionStylesType = powerbi.visuals.SubSelectionStylesType;
import VisualShortcutType = powerbi.visuals.VisualShortcutType;
import NumericTextSubSelectionStyles = powerbi.visuals.NumericTextSubSelectionStyles;
import TextSubSelectionStyles = powerbi.visuals.TextSubSelectionStyles;

import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import { labelsReferences, legendReferences, dataPointReferences, displayReferences, linesReferences, yAxisLabelsReferences } from "./references";
import { IFontReference } from "./interfaces";

export class SubSelectionStylesService {
    private static GetSubselectionStylesForText(objectReference: IFontReference): TextSubSelectionStyles {
        return {
            type: SubSelectionStylesType.Text,
            fontFamily: {
                reference: {
                    ...objectReference.fontFamily
                },
                label: objectReference.fontFamily.propertyName
            },
            bold: {
                reference: {
                    ...objectReference.bold
                },
                label: objectReference.bold.propertyName
            },
            italic: {
                reference: {
                    ...objectReference.italic
                },
                label: objectReference.italic.propertyName
            },
            underline: {
                reference: {
                    ...objectReference.underline
                },
                label: objectReference.underline.propertyName
            },
            fontSize: {
                reference: {
                    ...objectReference.fontSize
                },
                label: objectReference.fontSize.propertyName
            },
            fontColor: {
                reference: {
                    ...objectReference.color
                },
                label: objectReference.color.propertyName
            }
        };
    }

    public static GetLegendStyles(): SubSelectionStyles {
        return SubSelectionStylesService.GetSubselectionStylesForText(legendReferences);
    }

    public static GetLabelsStyles(): SubSelectionStyles {
        return SubSelectionStylesService.GetSubselectionStylesForText(labelsReferences);
    }

    public static GetDataPointStyles(subSelections: CustomVisualSubSelection[], localizationManager: ILocalizationManager): SubSelectionStyles {
        const selector = subSelections[0].customVisualObjects[0].selectionId?.getSelector();
        return {
            type: SubSelectionStylesType.Shape,
            fill: {
                reference: {
                    ...dataPointReferences.fill,
                    selector
                },
                label: localizationManager.getDisplayName("Visual_Fill")
            },
        };
    }

    public static GetYAxisLabelsStyles(): SubSelectionStyles {
        const textStyles: NumericTextSubSelectionStyles = {
            ...SubSelectionStylesService.GetSubselectionStylesForText(yAxisLabelsReferences),
            type: SubSelectionStylesType.NumericText,
            displayUnits: {
                reference: {
                    ...yAxisLabelsReferences.displayUnits
                },
                label: yAxisLabelsReferences.displayUnits.propertyName
            },
            precision: {
                reference: {
                    ...yAxisLabelsReferences.precision
                },
                label: yAxisLabelsReferences.precision.propertyName
            }
        };

        return textStyles;
    }
}

export class SubSelectionShortcutsService {
    public static GetLegendShortcuts(localizationManager: ILocalizationManager): VisualSubSelectionShortcuts{
        return [
            {
                type: VisualShortcutType.Picker,
                ...legendReferences.position,
                label: localizationManager.getDisplayName("Visual_Position")
            },
            {
                type: VisualShortcutType.Toggle,
                ...legendReferences.show,
                disabledLabel: localizationManager.getDisplayName("Visual_OnObject_Delete")
            },
            {
                type: VisualShortcutType.Toggle,
                ...legendReferences.showTitle,
                enabledLabel: localizationManager.getDisplayName("Visual_OnObject_AddTitle")
            },
            {
                type: VisualShortcutType.Divider,
            },
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
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: legendReferences.cardUid, groupUid: legendReferences.groupUid },
                label: localizationManager.getDisplayName("Visual_OnObject_FormatLegend")
            }
        ];
    }
    public static GetLegendTitleShortcuts(localizationManager: ILocalizationManager): VisualSubSelectionShortcuts {
        return [
            {
                type: VisualShortcutType.Toggle,
                ...legendReferences.showTitle,
                disabledLabel: localizationManager.getDisplayName("Visual_OnObject_Delete")
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Reset,
                relatedResetFormattingIds: [
                    legendReferences.showTitle,
                    legendReferences.titleText
                ]
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: legendReferences.cardUid, groupUid: "legendTitle-group" },
                label: localizationManager.getDisplayName("Visual_OnObject_FormatTitle")
            }
        ];
    }
    public static GetLabelsShortcuts(localizationManager: ILocalizationManager): VisualSubSelectionShortcuts {
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
                disabledLabel: localizationManager.getDisplayName("Visual_OnObject_DeleteLabels"),
                enabledLabel: localizationManager.getDisplayName("Visual_OnObject_AddLabels")
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: labelsReferences.cardUid, groupUid: labelsReferences.groupUid },
                label: localizationManager.getDisplayName("Visual_OnObject_FormatLabels")
            }
        ];
    }
    public static GetDataPointShortcuts(subSelections: CustomVisualSubSelection[], localizationManager: ILocalizationManager): VisualSubSelectionShortcuts {
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
                disabledLabel: localizationManager.getDisplayName("Visual_OnObject_DrawPolygons"),
                enabledLabel: localizationManager.getDisplayName("Visual_DrawLines")
            },
            {
                type: VisualShortcutType.Toggle,
                ...labelsReferences.show,
                enabledLabel: localizationManager.getDisplayName("Visual_Show_XAxisLabels")
            },
            {
                type: VisualShortcutType.Toggle,
                ...yAxisLabelsReferences.show,
                enabledLabel: localizationManager.getDisplayName("Visual_Show_YAxisLabels")
            },
            {
                type: VisualShortcutType.Picker,
                ...displayReferences.axisBeginning,
                label: localizationManager.getDisplayName("Visual_AxisStartPosition")
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: dataPointReferences.cardUid },
                label: localizationManager.getDisplayName("Visual_OnObject_FormatColors")
            }
        ];
    }
    public static GetYAxisLabelsShortcuts(localizationManager: ILocalizationManager): VisualSubSelectionShortcuts {
        return [
            {
                type: VisualShortcutType.Toggle,
                ...yAxisLabelsReferences.show,
                disabledLabel: localizationManager.getDisplayName("Visual_OnObject_Delete")
            },
            {
                type: VisualShortcutType.Toggle,
                ...yAxisLabelsReferences.useCustomColor,
                enabledLabel: localizationManager.getDisplayName("Visual_Show_Custom_Color"),
                disabledLabel: localizationManager.getDisplayName("Visual_Disable_Custom_Color"),
            },
                       {
                type: VisualShortcutType.Toggle,
                ...yAxisLabelsReferences.showOverlapping,
                enabledLabel: localizationManager.getDisplayName("Visual_Show_Labels_Overlapping"),
                disabledLabel: localizationManager.getDisplayName("Visual_Hide_Labels_Overlapping"),
            },
            {
                type: VisualShortcutType.Divider,
            },
            {
                type: VisualShortcutType.Reset,
                relatedResetFormattingIds: [
                    yAxisLabelsReferences.bold,
                    yAxisLabelsReferences.fontFamily,
                    yAxisLabelsReferences.fontSize,
                    yAxisLabelsReferences.italic,
                    yAxisLabelsReferences.underline,
                    yAxisLabelsReferences.color,
                    yAxisLabelsReferences.show,
                    yAxisLabelsReferences.showOverlapping,
                    yAxisLabelsReferences.displayUnits,
                    yAxisLabelsReferences.precision,
                    yAxisLabelsReferences.useCustomColor
                ]
            },
            {
                type: VisualShortcutType.Navigate,
                destinationInfo: { cardUid: yAxisLabelsReferences.cardUid, groupUid: yAxisLabelsReferences.groupUid },
                label: localizationManager.getDisplayName("Visual_OnObject_FormatLabels")
            }
        ];
    }
}