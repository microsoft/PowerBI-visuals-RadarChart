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

export const enum RadarChartObjectNames {
    Legend = "legend",
    LegendTitle = "legendTitleGroup",
    DataPoint = "dataPoint",
    DisplaySettings = "displaySettings",
    Line = "line",
    Labels = "labels",
    LabelsX = "xAxisLabelsGroup",
    LabelsY = "yAxisLabelsGroup"
}

class BaseFontCardSettings extends FormattingSettingsSimpleCard {
    font: formattingSettings.FontControl;
    constructor (font_identifier = "") {
        super();
        this.font = new formattingSettings.FontControl({
            name: `${font_identifier}font`,
            displayName: "Font",
            displayNameKey: "Visual_Font",
            fontFamily: new formattingSettings.FontPicker({
                name: `${font_identifier}fontFamily`,
                value: "Arial, sans-serif"
            }),
            fontSize: new formattingSettings.NumUpDown({
                name: `${font_identifier}fontSize`,
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
                name: `${font_identifier}fontBold`,
                value: false
            }),
            italic: new formattingSettings.ToggleSwitch({
                name: `${font_identifier}fontItalic`,
                value: false
            }),
            underline: new formattingSettings.ToggleSwitch({
                name: `${font_identifier}fontUnderline`,
                value: false
            })
        }); 
    }
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

    name: string = RadarChartObjectNames.LegendTitle;
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

    name: string = RadarChartObjectNames.Legend;
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

    name: string = RadarChartObjectNames.DataPoint;
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

    name: string = RadarChartObjectNames.Line;
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

    name: string = RadarChartObjectNames.DisplaySettings;
    displayName: string = "Display settings";
    displayNameKey: string = "Visual_DisplaySettings";
    slices: FormattingSettingsSlice[] = [this.minValue, this.axisBeginning];
}

export class xAxisLabelsSettings extends BaseFontCardSettings {
    public static MinLineLength: number = 0;
    public static MaxLineLength: number = 100;

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

    lineLength = new formattingSettings.Slider({
        name: "lineLength",
        displayNameKey: "Visual_LineLength",
        value: 100,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: xAxisLabelsSettings.MinLineLength
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: xAxisLabelsSettings.MaxLineLength
            }
        }
    })

    name: string = "xAxisLabelsGroup";
    displayName?: string = "X-Axis labels";
    displayNameKey?: string = "Visual_XAxisLabels";
    slices: FormattingSettingsSlice[] = [this.color, this.font, this.lineLength];
}

export class yAxisLabelsSettings extends BaseFontCardSettings {
    showOverlapping = new formattingSettings.ToggleSwitch({
        name: "showOverlapping",
        displayName: "Show overlapping labels",
        displayNameKey: "Visual_Show_Labels_Overlapping",
        description: "Show labels even if they overlap",
        descriptionKey: "Visual_Description_Labels_Overlapping",
        value: true
    });

    show = new formattingSettings.ToggleSwitch({
        name: "y_show",
        displayName: "Show Y-Axis labels",
        value: true
    });

    showCustomColor = new formattingSettings.ToggleSwitch({
        name: "showYLabelCustomColor",
        displayNameKey: "Visual_Show_Custom_Color",
        description: "Use custom color for labels",
        descriptionKey: "Visual_Description_Labels_Custom_Color",
        value: false
    });

    color = new formattingSettings.ColorPicker({
        name: "y_color",
        displayName: "Color",
        displayNameKey: "Visual_Color",
        description: "Select color for data labels",
        descriptionKey: "Visual_Description_Color",
        value : {value: "#000"},
        visible: true
    });

    public displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayName: "Display Units",
        displayNameKey: "Visual_DisplayUnits",
        value: 0,
    });

    public precision = new formattingSettings.NumUpDown({
        name: "precision",
        displayNameKey: "Visual_Precision",
        description: "Number of decimal places to display",
        descriptionKey: "Visual_Description_Precision",
        value: 2,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 0
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 10
            },
        }
    });

    topLevelSlice = this.show;
    name: string = "yAxisLabelsGroup";
    displayName?: string = "Y-Axis labels";
    displayNameKey?: string = "Visual_YAxisLabels";
    slices: FormattingSettingsSlice[] = [this.showOverlapping, this.displayUnits, this.precision, this.showCustomColor, this.color, this.font];
}

export class LabelsSettingsCard extends FormattingSettingsCompositeCard {
    xAxisLabels = new xAxisLabelsSettings();
    yAxisLabels = new yAxisLabelsSettings("y_");

    name: string = RadarChartObjectNames.Labels;
    displayNameKey: string = "Visual_DataLabels";
    displayName: string = "Data Labels";
    description: string = "Display data label options";
    descriptionKey: string = "Visual_Description_DataLabels";
    groups: FormattingSettingsCard[] = [this.xAxisLabels, this.yAxisLabels];
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
        this.labels.xAxisLabels.color.visible = isVisible;
        this.legend.text.labelColor.visible = isVisible;
        this.labels.yAxisLabels.color.visible = isVisible && this.labels.yAxisLabels.showCustomColor.value;
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
