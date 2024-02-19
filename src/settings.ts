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
import {legendInterfaces} from "powerbi-visuals-utils-chartutils";
import LegendPosition = legendInterfaces.LegendPosition;

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsSimpleCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsCard = formattingSettings.Cards;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsGroup = formattingSettings.Group;

import { RadarChartSeries } from "./radarChartDataInterfaces";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";

import IEnumMember = powerbi.IEnumMember;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import FormattingId = powerbi.visuals.FormattingId;
import SubSelectableDirectEdit = powerbi.visuals.SubSelectableDirectEdit;
import SubSelectableDirectEditStyle = powerbi.visuals.SubSelectableDirectEditStyle;

interface IEnumMemberWithDisplayNameKey extends IEnumMember{
    key: string;
}

const positionOptions : IEnumMemberWithDisplayNameKey[] = [
    {value : LegendPosition[LegendPosition.Top], displayName : "Top", key: "Visual_Top"}, 
    {value : LegendPosition[LegendPosition.Bottom], displayName : "Bottom", key: "Visual_Bottom"},
    {value : LegendPosition[LegendPosition.Left], displayName : "Left", key: "Visual_Left"}, 
    {value : LegendPosition[LegendPosition.Right], displayName : "Right", key: "Visual_Right"}, 
    {value : LegendPosition[LegendPosition.TopCenter], displayName : "Top Center", key: "Visual_TopCenter"}, 
    {value : LegendPosition[LegendPosition.BottomCenter], displayName : "Bottom Center", key: "Visual_BottomCenter"}, 
    {value : LegendPosition[LegendPosition.LeftCenter], displayName : "Left Center", key: "Visual_LeftCenter"}, 
    {value : LegendPosition[LegendPosition.RightCenter], displayName : "Right Center", key: "Visual_RightCenter"}, 
];

const axisBeginningOptions : IEnumMemberWithDisplayNameKey[] = [
    {value : -1, displayName : "North", key: "Visual_North"}, 
    {value : 1, displayName : "South", key: "Visual_South"}
];

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

export const enum RadarChartObjectNames {
    Legend = "legend",
    LegendTitle = "legendTitle",
    DataPoint = "dataPoint",
    DisplaySettings = "displaySettings",
    Line = "line",
    Labels = "labels"
}

export const TitleEdit: SubSelectableDirectEdit = {
    reference: {
        objectName: "legend",
        propertyName: "titleText"
    },
    style: SubSelectableDirectEditStyle.HorizontalLeft,
}

export const legendReferences: References = {
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

export const labelsReferences: References = {
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

export const dataPointReferences: References = {
    cardUid: "Visual-dataPoint-card",
    groupUid: "dataPoint-group",
    fill: {
        objectName: RadarChartObjectNames.DataPoint,
        propertyName: "fill"
    }
}

export const displayReferences: References = {
    cardUid: "Visual-displaySettings-card",
    groupUid: "displaySettings-group",
    axisBeginning: {
        objectName: RadarChartObjectNames.DisplaySettings,
        propertyName: "axisBeginning"
    }
}

export const linesReferences: References = {
    cardUid: "Visual-line-card",
    groupUid: "line-group",
    show: {
        objectName: RadarChartObjectNames.Line,
        propertyName: "show"
    }
}

class BaseFontCardSettings extends FormattingSettingsSimpleCard {
    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Font",
        displayNameKey: "Visual_Font",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            value: "Arial, sans-serif"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Text Size",
            displayNameKey: "Visual_TextSize",
            value: 8,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 8
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: 60
                }
            }
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "fontBold",
            value: false
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "fontItalic",
            value: false
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: "fontUnderline",
            value: false
        })
    });
}

export class LegendTitleGroup extends FormattingSettingsSimpleCard {
    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayName: "Title",
        displayNameKey: "Visual_Title",
        description: "Display a title for legend symbols",
        descriptionKey: "Visual_Description_Title",
        value: true
    });

    topLevelSlice = this.showTitle;

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "Name",
        displayNameKey: "Visual_Name",
        description: "Title Text",
        descriptionKey: "Visual_Description_Name",
        value: "Axis",
        placeholder: "Title"
    });

    name: string = "legendTitleGroup";
    displayName: string = "Title";
    displayNameKey: string = "Visual_Title";
    slices: FormattingSettingsSlice[] = [this.titleText];
}

export class LegendTextGroup extends BaseFontCardSettings {
    labelColor = new formattingSettings.ColorPicker({
        name: "labelColor",
        displayName: "Color",
        displayNameKey: "Visual_Color",
        value: {value: "black"}
    });

    positionDropdown = new formattingSettings.ItemDropdown({
        name: "position",
        items: positionOptions,
        value: positionOptions[0],
        displayName: "Position",
        displayNameKey: "Visual_Position"
    });

    name: string = "legendTextGroup";
    displayName?: string = "Text";
    displayNameKey?: string = "Visual_Text"
    slices: FormattingSettingsSlice[] = [this.font, this.labelColor, this.positionDropdown];
}

export class LegendSettingsCard extends FormattingSettingsCompositeCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: true
    });

    topLevelSlice = this.show;

    text: LegendTextGroup = new LegendTextGroup();
    title: LegendTitleGroup = new LegendTitleGroup();

    name: string = "legend";
    displayName: string = "Legend";
    displayNameKey: string = "Visual_Legend";
    description: string = "Display Legend Options";
    descriptionKey: string = "Visual_Description_Legend";
    groups: FormattingSettingsGroup[] = [this.title, this.text];
}

export class DataPointSettingsCard extends FormattingSettingsSimpleCard {
    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Fill",
        displayNameKey: "Visual_Fill",
        value: {value: ""}
    })

    name: string = "dataPoint";
    displayName: string =  "Data colors";
    displayNameKey: string = "Visual_DataColors";
    description: string = "Display data color options";
    descriptionKey: string = "Visual_Description_DataColors";
    slices: FormattingSettingsSlice[] = [this.fill];
}

export class LineSettingsCard extends FormattingSettingsSimpleCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Draw Lines",
        displayNameKey: "Visual_DrawLines",
        value: false
    });

    topLevelSlice = this.show;

    lineWidth = new formattingSettings.NumUpDown({
        name: "lineWidth",
        displayName: "Line Width",
        displayNameKey: "Visual_LineWidth",
        value: 5,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 1,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 10,
            }
        }
    });

    name: string = "line";
    displayName: string = "Draw Lines";
    displayNameKey: string = "Visual_DrawLines";
    slices: FormattingSettingsSlice[] = [this.lineWidth]
}

export class DisplaySettingsCard extends FormattingSettingsSimpleCard {
    minValue = new formattingSettings.NumUpDown({
        name: "minValue",
        displayNameKey: "Visual_AxisStart",
        displayName: "Axis shift",
        value: 0
    });

    axisBeginning = new formattingSettings.ItemDropdown({
        name: "axisBeginning",
        displayNameKey: "Visual_AxisStartPosition",
        displayName: "Axis start position",
        items: axisBeginningOptions,
        value: axisBeginningOptions[0],
    });

    name: string = "displaySettings";
    displayName: string = "Display settings";
    displayNameKey: string = "Visual_DisplaySettings";
    slices: FormattingSettingsSlice[] = [this.minValue, this.axisBeginning];
}

export class LabelsSettingsCard extends BaseFontCardSettings {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        displayName: "Show",
        value: true
    });

    topLevelSlice = this.show;

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayNameKey: "Visual_Color",
        displayName: "Color",
        description: "Select color for data labels",
        descriptionKey: "Visual_Description_Color",
        value : {value: "#000"}
    });

    name: string = "labels";
    displayNameKey: string = "Visual_DataLabels";
    displayName: string = "Data Labels";
    description: string = "Display data label options";
    descriptionKey: string = "Visual_Description_DataLabels";
    slices: FormattingSettingsSlice[] = [this.color, this.font];
}

export class RadarChartSettingsModel extends FormattingSettingsModel {
    legend: LegendSettingsCard = new LegendSettingsCard();
    dataPoint: DataPointSettingsCard = new DataPointSettingsCard();
    line: LineSettingsCard = new LineSettingsCard();
    display: DisplaySettingsCard = new DisplaySettingsCard();
    labels: LabelsSettingsCard = new LabelsSettingsCard();

    cards: FormattingSettingsCard[] = [
        this.legend,
        this.dataPoint,
        this.line,
        this.display,
        this.labels
    ]

    setLocalizedOptions(localizationManager: ILocalizationManager): void {
        this.setLocalizedDisplayName(positionOptions, localizationManager);
        this.setLocalizedDisplayName(axisBeginningOptions, localizationManager);
    }   

    public setLocalizedDisplayName(options: IEnumMemberWithDisplayNameKey[], localizationManager: ILocalizationManager): void {
        options.forEach(option => {
            option.displayName = localizationManager.getDisplayName(option.key)
        });
    }

    public populateDataPointSlice(series: RadarChartSeries[]): void {
        this.dataPoint.slices = [];
        for (const dataPoint of series) {
            this.dataPoint.slices.push(
                new formattingSettings.ColorPicker({
                    name: "fill",
                    displayName: dataPoint.name,
                    selector: ColorHelper.normalizeSelector(dataPoint.identity.getSelector(), false),
                    value: { value: dataPoint.fill }
                })
            )
        }
    }

    public setVisibilityOfColorSlices(colorHelper: ColorHelper): void {
        const isVisible: boolean = !colorHelper.isHighContrast;
        this.dataPoint.visible = isVisible;
        this.labels.color.visible = isVisible;
        this.legend.text.labelColor.visible = isVisible;
    }

    public setMinMaxValuesForDisplay(minValue: number): void {
        if (minValue < 0){
            this.display.minValue.options = {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: minValue
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: minValue
                }
            };
            this.display.minValue.value = minValue;
        }
        else {
            this.display.minValue.options = {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: 0
                },
                maxValue: {
                    type: powerbi.visuals.ValidatorType.Max,
                    value: minValue
                }
            };

            if (this.display.minValue.value > minValue) {
                this.display.minValue.value = minValue;
            }
            if (this.display.minValue.value < 0) {
                this.display.minValue.value = 0;
            }
        }
    }
}
