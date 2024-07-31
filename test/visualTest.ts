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

import powerbi from "powerbi-visuals-api";

// d3
import { min as d3Min} from "d3-array";

// RadarChart1446119667547
import { RadarChartData } from "./visualData";
import { RadarChartBuilder } from "./visualBuilder";
import { LegendData } from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";
import { isColorAppliedToElements, getRandomUniqueHexColors, getSolidColorStructuralObject, areColorsEqual } from "./helpers/helpers";
import { createVisualHost, MockISelectionId, createColorPalette, assertColorsMatch, MouseEventType, ClickEventType } from "powerbi-visuals-utils-testutils";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { RadarChart } from "../src/radarChart";
import { IRadarChartData, RadarChartSeries, RadarChartDatapoint } from "../src/radarChartDataInterfaces";
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IColorPalette = powerbi.extensibility.IColorPalette;
import ISelectionId = powerbi.extensibility.ISelectionId;
import { d3Click } from "powerbi-visuals-utils-testutils";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { DataPointSettingsCard, DisplaySettingsCard, LabelsSettingsCard, LegendSettingsCard, RadarChartSettingsModel } from "../src/settings";

describe("RadarChart", () => {
    let visualBuilder: RadarChartBuilder,
        defaultDataViewBuilder: RadarChartData,
        dataView: DataView;

    beforeEach(() => {
        visualBuilder = new RadarChartBuilder(1000, 500);
        defaultDataViewBuilder = new RadarChartData();

        dataView = defaultDataViewBuilder.getDataView();
    });

    describe("DOM tests", () => {
        it("svg element created", () => {
            expect(document.body.contains(visualBuilder.mainElement)).toBeTruthy();
        });

        it("update", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.dataLabelsText.length)
                    .toBe(dataView.categorical.categories[0].values.length);

                expect(visualBuilder.chartDot.length)
                    .toBe(dataView.categorical.categories[0].values.length);

                done();
            });
        });

        it("update with bad data-set", (done) => {
            dataView.categorical.values[0].values = [null, "0qqa123", undefined, "value", 1];

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.dataLabelsText.length)
                    .toBe(dataView.categorical.categories[0].values.length);

                expect(visualBuilder.chartDot.length)
                    .toBe(1);

                done();
            });
        });

        it("update with no format value column data", (done) => {
            dataView.categorical.values[0].source.format = null;

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.dataLabelsText.length)
                    .toBe(dataView.categorical.categories[0].values.length);

                expect(visualBuilder.chartDot.length)
                    .toBe(dataView.categorical.categories[0].values.length);

                done();
            });
        });

        it("draw nodes after area", (done) => {
            visualBuilder.update(dataView);

            setTimeout(() => {
                const elements: SVGElement[] = Array.from(visualBuilder.mainElement.querySelectorAll("g.chart > g"));

                const firstClass: string | null = elements[1].classList.item(0);

                const secondClass: string| null = elements[elements.length -1].classList.item(0);

                expect(firstClass).toBe("chartArea");
                expect(secondClass).toBe("chartNode");

                done();
            }, 10);
        });

        describe("selection and deselection", () => {
            const selectionClass: string = "selected";

            it("dataPoint can be selected", () => {
                visualBuilder.updateFlushAllD3Transitions(dataView);
                const dots: HTMLElement[] = Array.from(visualBuilder.chartDotGroup);
                const firstDot: HTMLElement = dots[0],
                    otherDots: HTMLElement[] = dots.slice(1);

                d3Click(firstDot, 1, 1, ClickEventType.Default, 0);

                const firstDotOpacity: string = firstDot.style.getPropertyValue("opacity");
                expect(parseFloat(firstDotOpacity)).toBe(1);

                otherDots.forEach((dot) => {
                    const dotOpacity: string = dot.style.getPropertyValue("opacity");
                    expect(parseFloat(dotOpacity)).toBeLessThan(1);
                });
                
            });

            it("dataPoint can be deselected", () => {
                visualBuilder.updateFlushAllD3Transitions(dataView);
                const dots: HTMLElement[] = Array.from(visualBuilder.chartDotGroup);
                const firstDot: HTMLElement = dots[0],
                    otherDots: HTMLElement[] = dots.slice(1);

                // Select first datapoint
                d3Click(firstDot, 1, 1, ClickEventType.CtrlKey, 0);

                const firstDotOpacity: string = firstDot.style.getPropertyValue("opacity");
                expect(parseFloat(firstDotOpacity)).toBe(1);

                otherDots.forEach((dot) => {
                    const dotOpacity: string = dot.style.getPropertyValue("opacity");
                    expect(parseFloat(dotOpacity)).toBeLessThan(1);
                });

                // Deselect firs datapoint
                d3Click(firstDot, 1, 1, ClickEventType.CtrlKey, 0);
                dots.forEach((dot) => {
                    const dotOpacity: string = dot.style.getPropertyValue("opacity");
                    expect(parseFloat(dotOpacity)).toBe(1);
                });
            });

            it("multi-selection should work with ctrlKey", () => {
                checkMultiselection(ClickEventType.CtrlKey);
            });
    
            it("multi-selection should work with metaKey", () => {
                checkMultiselection(ClickEventType.MetaKey);
            });
    
            it("multi-selection should work with shiftKey", () => {
                checkMultiselection(ClickEventType.ShiftKey);
            });

            function checkMultiselection(eventType: number): void {
                visualBuilder.updateFlushAllD3Transitions(dataView);
                const dots: NodeListOf<HTMLElement> = visualBuilder.chartDotGroup;
    
                const firstDot: HTMLElement = dots[0],
                    secondDot: HTMLElement = dots[1],
                    thirdDot: HTMLElement = dots[2];
    
                d3Click(firstDot, 1, 1, ClickEventType.Default, 0);
                d3Click(secondDot, 1, 1, eventType, 0);
    
                const firstDotOpacity: string = firstDot.style.getPropertyValue("opacity");
                const secondDotOpacity: string = secondDot.style.getPropertyValue("opacity");
                const thirdDotOpacity: string = thirdDot.style.getPropertyValue("opacity");
    
                expect(parseFloat(firstDotOpacity)).toBe(1);
                expect(parseFloat(secondDotOpacity)).toBe(1);
                expect(parseFloat(thirdDotOpacity)).toBeLessThan(1);
            }

        });

    });

    describe("Format settings test", () => {
        const titleText: string = "Power BI";

        describe("Legend", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    legend: {
                        titleText,
                        show: true
                    }
                };
            });

            it("show", () => {
                (dataView.metadata.objects as any).legend.show = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.legendGroup.querySelectorAll("*").forEach((element: Element) => expect(document.body.contains(element)).toBeTruthy());

                (dataView.metadata.objects as any).legend.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.legendGroup.querySelectorAll("*").forEach((element: Element) => expect(document.body.contains(element)).toBeFalsy());
            });

            it("show title", () => {
                (dataView.metadata.objects as any).legend.showTitle = true;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(document.body.contains(visualBuilder.legendTitle)).toBeTruthy();

                (dataView.metadata.objects as any).legend.showTitle = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(document.body.contains(visualBuilder.legendTitle)).toBeFalsy();
            });

            it("title text", () => {
                (dataView.metadata.objects as any).legend.showTitle = true;
                (dataView.metadata.objects as any).legend.titleText = titleText;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const legendTitleTitle: string | null = visualBuilder.legendTitle.querySelector("title").textContent;

                expect(legendTitleTitle).toEqual(titleText);
            });

            it("color", () => {
                const color: string = "#BBBBCC";

                (dataView.metadata.objects as any).legend.showTitle = true;
                (dataView.metadata.objects as any).legend.labelColor = getSolidColorStructuralObject(color);

                visualBuilder.updateFlushAllD3Transitions(dataView);

                assertColorsMatch(visualBuilder.legendTitle.style.getPropertyValue("fill"), color);

                Array.from(visualBuilder.legendItemText)
                    .forEach((element: HTMLElement) => {
                        assertColorsMatch(element.style.getPropertyValue("fill"), color);
                    });
            });

            it("font size", () => {
                const fontSize: number = 22,
                    expectedFontSize: string = "29.3333px";

                (dataView.metadata.objects as any).legend.fontSize = fontSize;
                (dataView.metadata.objects as any).legend.showTitle = true;

                visualBuilder.updateFlushAllD3Transitions(dataView);

                expect(visualBuilder.legendTitle.style.getPropertyValue("font-size")).toBe(expectedFontSize);

                Array.from(visualBuilder.legendItemText)
                    .forEach((element: HTMLElement) => {
                        expect(element.style.getPropertyValue("font-size")).toBe(expectedFontSize);
                    });
            });
        });

        describe("Data colors", () => {
            it("color", () => {
                const colors: string[] = getRandomUniqueHexColors(dataView.categorical.values.length);

                dataView.categorical.values.forEach((column: powerbi.DataViewValueColumn, index: number) => {
                    column.source.objects = {
                        dataPoint: {
                            fill: getSolidColorStructuralObject(colors[index])
                        }
                    };
                });

                visualBuilder.updateFlushAllD3Transitions(dataView);

                const polygons: HTMLElement[] = Array.from(visualBuilder.chartPolygons);

                colors.forEach((color: string) => {
                    const doPolygonsContainColor: boolean = polygons.some((element: HTMLElement) => {
                        return areColorsEqual(element.style.getPropertyValue("fill"), color);
                    });

                    expect(doPolygonsContainColor).toBeTruthy();
                });
            });
        });

        describe("Display settings", () => {
            let dataViewTemp: DataView;
            beforeEach(() => {
                dataViewTemp = defaultDataViewBuilder.getDataView(null, ["Monday"]);
                dataViewTemp.metadata.objects = {
                    line: {
                        show: true
                    }
                };
            });
            it("check and update func", () => {
                expect(() => {
                    RadarChart.checkAndUpdateAxis(dataViewTemp, dataViewTemp.categorical.values);
                }).not.toThrow();
            });

            it("is intersect 1", () => {
                let retValue = RadarChart.isIntersect(11, 16, 13, 14);
                expect(retValue).toBe(true);
            });

            it("is intersect 2", () => {
                let retValue = RadarChart.isIntersect(100, 10, 4, 2);
                expect(retValue).toBe(false);
            });
        });

        describe("Draw lines", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    line: {
                        show: true
                    }
                };
            });

            it("show", () => {
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.chartPolygons
                    .forEach((element: HTMLElement) => {
                        expect(element.style.getPropertyValue("fill")).toBe("none");
                        expect(parseFloat(element.style.getPropertyValue("stroke-width"))).toBeGreaterThan(0);
                    });

                (dataView.metadata.objects as any).line.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.chartPolygons
                    .forEach((element: HTMLElement) => {
                        expect(element.style.getPropertyValue("fill")).not.toBe("none");
                        expect(parseFloat(element.style.getPropertyValue("stroke-width"))).toBe(0);
                    });
            });
        });

        describe("Data labels", () => {
            beforeEach(() => {
                dataView.metadata.objects = {
                    labels: {
                        show: true
                    }
                };
            });

            it("show", () => {
                visualBuilder.updateFlushAllD3Transitions(dataView);
                visualBuilder.dataLabelsText.forEach((element: HTMLElement) => expect(document.body.contains(element)).toBeTruthy());

                (dataView.metadata.objects as any).labels.show = false;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                visualBuilder.dataLabelsText.forEach((element: HTMLElement) => expect(document.body.contains(element)).toBeFalsy());
            });

            it("color must be #ABCDEF", () => {
                const color: string = "#ABCDEF";

                (dataView.metadata.objects as any).labels.color = getSolidColorStructuralObject(color);
                visualBuilder.updateFlushAllD3Transitions(dataView);

                Array.from(visualBuilder.dataLabelsText)
                    .forEach((element: HTMLElement) => {
                        assertColorsMatch(element.style.getPropertyValue("fill"), color);
                    });
            });

            it("font size must be 29.3333px", () => {
                const fontSize: number = 22,
                    expectedFontSize: string = "29.3333px";

                (dataView.metadata.objects as any).labels.fontSize = fontSize;
                visualBuilder.updateFlushAllD3Transitions(dataView);

                Array.from(visualBuilder.dataLabelsText)
                    .forEach((element: HTMLElement) => {
                        expect(element.style.getPropertyValue("font-size")).toBe(expectedFontSize);
                    });
            });
        });

        describe("in visual with small size", () => {
            beforeEach(() => {
                visualBuilder = new RadarChartBuilder(350, 150);
                dataView.metadata.objects = {
                    labels: {
                        show: true
                    }
                };
            });

            it("some labels should be hidden", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    expect(visualBuilder.dataLabelsText.length < dataView.categorical.categories[0].values.length).toBeTruthy();
                    done();
                });
            });
        });
    });

    describe("Highlights tests", () => {
        it("data points highlights", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const allPoints: NodeListOf<HTMLElement> = visualBuilder.chartDotGroup,
                    firstPoint = allPoints[0],
                    secondPoint = allPoints[allPoints.length - 1];

                expect(firstPoint.style.getPropertyValue("opacity")).toBe("1");
                expect(secondPoint.style.getPropertyValue("opacity")).toBe("1");

                d3Click(firstPoint,
                    parseInt(firstPoint.getAttribute("cx"), 10),
                    parseInt(firstPoint.getAttribute("cy"), 10),
                    ClickEventType.Default);

                expect(firstPoint.style.getPropertyValue("opacity")).toBe("1");
                expect(secondPoint.style.getPropertyValue("opacity")).toBe("0.4");

                done();
            });
        });

        it("legend highlights", (done) => {
            dataView.categorical.values[0].source.objects = {
                dataPoint: {
                    fill: getSolidColorStructuralObject("#123123")
                }
            };

            visualBuilder.updateRenderTimeout(dataView, () => {
                const notSelectedColor: string = "#a6a6a6",
                    legendItems: NodeListOf<HTMLElement> = visualBuilder.element.querySelectorAll("path.legendIcon"),
                    firstLegendItem: HTMLElement = legendItems[0],
                    secondLegendItem: HTMLElement = legendItems[legendItems.length - 1],
                    firstItemColorBeforeSelection: string = firstLegendItem.style.getPropertyValue("fill"),
                    secondItemColorBeforeSelection: string = secondLegendItem.style.getPropertyValue("fill");
                assertColorsMatch(firstItemColorBeforeSelection, "#123123");

                d3Click(secondLegendItem,
                    parseInt(secondLegendItem.getAttribute("cx"), 10),
                    parseInt(secondLegendItem.getAttribute("cy"), 10));

                assertColorsMatch(
                    firstLegendItem.style.getPropertyValue("fill"),
                    notSelectedColor);

                assertColorsMatch(
                    secondLegendItem.style.getPropertyValue("fill"),
                    secondItemColorBeforeSelection);

                done();
            });
        });
    });

    describe("converter", () => {
        let colors: IColorPalette,
            colorHelper: ColorHelper,
            visualHost: IVisualHost,
            formattingSettings: RadarChartSettingsModel;

        beforeEach((done) => {
            colors = createColorPalette();
            colorHelper = new ColorHelper(colors);
            visualHost = createVisualHost({});
            dataView.metadata.objects = {
                labels: {
                    show: true
                },
                displaySettings: {
                    minValue: 1000000
                }
            };
            visualBuilder.updateRenderTimeout(dataView, () => {
                visualBuilder.instance.getFormattingModel();
                formattingSettings = visualBuilder.instance.formattingSettings;
                done();
            });
        });
        it("arguments are null", () => {
            callConverterAndExpectExceptions(null, null, null, null, formattingSettings);
        });

        it("arguments are undefined", () => {
            callConverterAndExpectExceptions(undefined, undefined, undefined, undefined, formattingSettings);
        });

        it("dataView is correct", () => {
            callConverterAndExpectExceptions(dataView, colors, colorHelper, visualHost, formattingSettings);
        });

        describe("radarChartData", () => {
            let radarChartData: IRadarChartData;

            beforeEach(() => {
                radarChartData = callConverterAndExpectExceptions(
                    dataView,
                    colors,
                    colorHelper,
                    visualHost,
                    formattingSettings);
            });

            it("radarChart data is defined", () => {
                expect(radarChartData).toBeDefined();
                expect(radarChartData).not.toBeNull();
            });

            it("series is defined", () => {
                const series: RadarChartSeries[] = radarChartData.series;

                expect(series).toBeDefined();
                expect(series).not.toBeNull();
                expect(series.length).toBeGreaterThan(0);
            });

            it("legendData is defined", () => {
                const legendData: LegendData = radarChartData.legendData;

                expect(legendData).toBeDefined();
                expect(legendData).not.toBeNull();
            });

            it("dataPoints is defined", () => {
                radarChartData.series.forEach((series: RadarChartSeries) => {
                    expect(series.dataPoints).toBeDefined();
                    expect(series.dataPoints).not.toBeNull();
                    expect(series.dataPoints.length).toBeGreaterThan(0);
                });
            });

            it("every dataPoint is defined", () => {
                radarChartData.series.forEach((series: RadarChartSeries) => {
                    series.dataPoints.forEach((dataPoint: RadarChartDatapoint) => {
                        expect(dataPoint).toBeDefined();
                        expect(dataPoint).not.toBeNull();
                    });
                });
            });

            it("every dataPoint is defined", () => {
                radarChartData.series.forEach((series: RadarChartSeries) => {
                    series.dataPoints.forEach((dataPoint: RadarChartDatapoint) => {
                        expect(dataPoint).toBeDefined();
                        expect(dataPoint).not.toBeNull();
                    });
                });
            });

            it("every identity of dataPoint is defined", () => {
                radarChartData.series.forEach((series: RadarChartSeries) => {
                    series.dataPoints.forEach((dataPoint: RadarChartDatapoint) => {
                        const identity: ISelectionId = dataPoint.identity;

                        expect(identity).toBeDefined();
                        expect(identity).not.toBeNull();
                    });
                });
            });
        });

        function callConverterAndExpectExceptions(
            dataView: DataView,
            colors: IColorPalette,
            colorHelper: ColorHelper,
            visualHost: IVisualHost,
            formattingSettings: RadarChartSettingsModel): IRadarChartData {

            let radarChartData: IRadarChartData;

            expect(() => {
                radarChartData = RadarChart.converter(dataView, colors, colorHelper, visualHost, formattingSettings);
            }).not.toThrow();

            return radarChartData;
        }
    });

    describe("High contrast mode", () => {
        const backgroundColor: string = "#000000";
        const foregroundColor: string = "#ff00ff";

        beforeEach(() => {
            visualBuilder.visualHost.colorPalette.isHighContrast = true;

            visualBuilder.visualHost.colorPalette.background = { value: backgroundColor };
            visualBuilder.visualHost.colorPalette.foreground = { value: foregroundColor };
        });

        it("should use high contrast mode colors", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(isColorAppliedToElements(visualBuilder.chartPolygons, foregroundColor, "fill"));
                expect(isColorAppliedToElements(visualBuilder.chartDot, foregroundColor, "fill"));
                expect(isColorAppliedToElements(visualBuilder.legendItemText, foregroundColor, "color"));
                expect(isColorAppliedToElements(visualBuilder.dataLabelsText, foregroundColor, "color"));
                expect(isColorAppliedToElements(visualBuilder.legendItemCircle, foregroundColor, "fill"));
                done();
            });
        });

        it("color settings for datapoints and labels should be hidden in high contrast mode", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const dataPointSettings: DataPointSettingsCard = visualBuilder.instance.formattingSettings.dataPoint;
                expect(dataPointSettings.visible).toBeFalse;

                const legendSettings: LegendSettingsCard = visualBuilder.instance.formattingSettings.legend;
                expect(legendSettings.text.visible).toBeTrue;
                expect(legendSettings.text.labelColor.visible).toBeFalse;

                const labelsSettings: LabelsSettingsCard = visualBuilder.instance.formattingSettings.labels;
                expect(labelsSettings.visible).toBeTrue;
                expect(labelsSettings.xAxisLabels.color.visible).toBeFalse;

                done();
            });
        });
    });

    describe("Boundary values test", () => {
        let colorPalette: IColorPalette,
            colorHelper: ColorHelper,
            polygon: NodeListOf<HTMLElement>,
            chartDot: NodeListOf<HTMLElement>,
            formattingServise: FormattingSettingsService;

        beforeEach(() => {
            colorPalette = createColorPalette();
            colorHelper = new ColorHelper(colorPalette);
            formattingServise = new FormattingSettingsService();
        });

        describe("dataset includes negative values", () => {
            beforeEach(() => {
                dataView = defaultDataViewBuilder.getDataViewWithNegatives();
                dataView.metadata.objects = {
                    displaySettings: {
                        minValue: 0
                    }
                };
                visualBuilder.update(dataView);
            });

            it("Should parse settings.displaySettings.minValue with negative values as expected", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    let minimumValue = d3Min(defaultDataViewBuilder.withNegativeValuesY1);
                    expect(visualBuilder.instance.formattingSettings.display.minValue.value).toBe(minimumValue);
                    done();
                });
            });
        });

        describe("dataset includes only 2 values", () => {
            // the area becames a line
            beforeEach(() => {
                dataView = defaultDataViewBuilder.getDataViewWithOnlyTwoValues();
                dataView.metadata.objects = {
                    displaySettings: {
                        minValue: 0
                    }
                };
                visualBuilder.update(dataView);
                polygon = visualBuilder.chartPolygons;
            });

            it("Should parse settings.displaySettings.minValue property with 2 or less points in the group as expected", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    let minimumValue = d3Min(defaultDataViewBuilder.onlyTwoValuesY1);
                    expect(visualBuilder.instance.formattingSettings.display.minValue.value).toBe(minimumValue);
                    done();
                });
            });

            it("Should render a polygon with right points count and bound with a line", (done) => {// area for 2 point is a line
                const expectedPointCount: number = 2;

                visualBuilder.updateRenderTimeout(dataView, () => {
                    expect(polygon[0].getAttribute("points-count")).toBe(expectedPointCount.toString());
                    expect(polygon[0].style.getPropertyValue("fill")).toBe("none");
                    expect(polygon[0].style.getPropertyValue("stroke")).toBeTruthy();
                    expect(polygon[0].style.getPropertyValue("stroke-width")).toBeTruthy();
                    done();
                });
            });
        });

        describe("empty dataset", () => {
            beforeEach(() => {
                dataView = defaultDataViewBuilder.getDataViewWithBlankData();
                visualBuilder.update(dataView);

                polygon = visualBuilder.chartPolygons;
                chartDot = visualBuilder.chartDot;
            });

            it("Should render a polygon with right 0 points count and not to render any dots", (done) => {
                const expectedPointCount: number = 0;

                visualBuilder.updateRenderTimeout(dataView, () => {
                    expect(polygon[0].getAttribute("points-count")).toBe(expectedPointCount.toString());
                    expect(chartDot.length).toBe(expectedPointCount);
                    done();
                });
            });
        });

        describe("dataset with string data", () => {
            beforeEach(() => {
                dataView = defaultDataViewBuilder.getDataViewWithStringData();
                visualBuilder.update(dataView);

                polygon = visualBuilder.chartPolygons;
                chartDot = visualBuilder.chartDot;
            });

            it("Should render a polygon with right 0 points count and not to render any dots", (done) => {
                const expectedPointCount: number = 0;

                visualBuilder.updateRenderTimeout(dataView, () => {
                    expect(polygon[0].getAttribute("points-count")).toBe(expectedPointCount.toString());
                    expect(chartDot.length).toBe(expectedPointCount);
                    done();
                });
            });
        });
    });

    describe("Settings tests:", () => {
        it("display minValue should be set", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const displaySettings: DisplaySettingsCard = visualBuilder.instance.formattingSettings.display;
                visualBuilder.instance.formattingSettings.setMinMaxValuesForDisplay(-1);
                expect(displaySettings.minValue.value).toBe(-1);
                expect(displaySettings.minValue.options?.maxValue?.value).toBe(-1);
                expect(displaySettings.minValue.options?.minValue?.value).toBe(-1);

                visualBuilder.instance.formattingSettings.setMinMaxValuesForDisplay(0);
                expect(displaySettings.minValue.value).toBe(0);
                expect(displaySettings.minValue.options?.maxValue?.value).toBe(0);
                expect(displaySettings.minValue.options?.minValue?.value).toBe(0);

                visualBuilder.instance.formattingSettings.setMinMaxValuesForDisplay(3);
                expect(displaySettings.minValue.value).toBe(0);
                expect(displaySettings.minValue.options?.maxValue?.value).toBe(3);
                expect(displaySettings.minValue.options?.minValue?.value).toBe(0);

                displaySettings.minValue.value = 4;
                visualBuilder.instance.formattingSettings.setMinMaxValuesForDisplay(3);
                expect(displaySettings.minValue.value).toBe(3);
                expect(displaySettings.minValue.options?.maxValue?.value).toBe(3);
                expect(displaySettings.minValue.options?.minValue?.value).toBe(0);
                done();
            });
        });

        it("datapoint settings should be set", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const dataPointSettings: DataPointSettingsCard = visualBuilder.instance.formattingSettings.dataPoint;
                expect(dataPointSettings.slices.length).toBe(dataView.categorical.values.length);

                dataPointSettings.slices.forEach((slice, index) => {
                    expect(slice.displayName).toBe(dataView.categorical?.values[index].source.displayName);
                });
                done();
            });
        });
    });

    describe("Keyboard navigation tests:", () => {

        it("enter toggles the correct column", () => {
            const enterEvent = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
            checkKeyboardSingleSelection(enterEvent);
        });

        it("space toggles the correct dataPoint", () => {
            const spaceEvent = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
            checkKeyboardSingleSelection(spaceEvent);
        });

        it("multiselection should work with ctrlKey", () => {
            const enterEventCtrlKey = new KeyboardEvent("keydown", { code: "Enter", bubbles: true, ctrlKey: true });
            checkKeyboardMultiSelection(enterEventCtrlKey);
        });

        it("multiselection should work with metaKey", () => {
            const enterEventMetaKey = new KeyboardEvent("keydown", { code: "Enter", bubbles: true, metaKey: true });
            checkKeyboardMultiSelection(enterEventMetaKey);
        });

        it("multiselection should work with shiftKey", () => {
            const enterEventShiftKey = new KeyboardEvent("keydown", { code: "Enter", bubbles: true, shiftKey: true });
            checkKeyboardMultiSelection(enterEventShiftKey);
        });

        it("dataPoints can be focused", () => {
            visualBuilder.updateFlushAllD3Transitions(dataView);

            const dataPoints: HTMLElement[] = Array.from(visualBuilder.chartDot);
            const firstDataPoint: HTMLElement = dataPoints[0];

            dataPoints.forEach((dataPoint: HTMLElement) => {
                expect(dataPoint.matches(":focus-visible")).toBeFalse();
            });

            firstDataPoint.focus();
            expect(firstDataPoint.matches(':focus-visible')).toBeTrue();

            const otherdataPoints: HTMLElement[] = dataPoints.slice(1);
            otherdataPoints.forEach((dataPoint: HTMLElement) => {
                expect(dataPoint.matches(":focus-visible")).toBeFalse();
            });

        });

        function checkKeyboardSingleSelection(keyboardSingleSelectionEvent: KeyboardEvent): void {
            visualBuilder.updateFlushAllD3Transitions(dataView);

            const dots: HTMLElement[] = Array.from(visualBuilder.chartDotGroup);
            const firstDot: HTMLElement = dots[0];
            const secondDot: HTMLElement = dots[1];

            firstDot.dispatchEvent(keyboardSingleSelectionEvent);
            expect(firstDot.getAttribute("aria-selected")).toBe("true");

            const otherdots: HTMLElement[] = dots.slice(1);
            otherdots.forEach((dot: HTMLElement) => {
                expect(dot.getAttribute("aria-selected")).toBe("false");
            });

            secondDot.dispatchEvent(keyboardSingleSelectionEvent);
            expect(secondDot.getAttribute("aria-selected")).toBe("true");

            dots.splice(1, 1);
            dots.forEach((dot: HTMLElement) => {
                expect(dot.getAttribute("aria-selected")).toBe("false");}
            );
        }

        function checkKeyboardMultiSelection(keyboardMultiselectionEvent: KeyboardEvent): void {
            visualBuilder.updateFlushAllD3Transitions(dataView);
            const enterEvent = new KeyboardEvent("keydown", { code: "Enter", bubbles: true });
            const dots: HTMLElement[] = Array.from(visualBuilder.chartDotGroup);
            const firstDot: HTMLElement = dots[0];
            const secondDot: HTMLElement = dots[1];

            // select first dot
            firstDot.dispatchEvent(enterEvent);
            const firstDotOpacity: string = firstDot.style.getPropertyValue("opacity");
            // multiselect second dot
            secondDot.dispatchEvent(keyboardMultiselectionEvent);
            const secondDotOpacity: string = secondDot.style.getPropertyValue("opacity");

            expect(firstDot.getAttribute("aria-selected")).toBe("true");
            expect(parseFloat(firstDotOpacity)).toBe(1);

            expect(secondDot.getAttribute("aria-selected")).toBe("true");
            expect(parseFloat(secondDotOpacity)).toBe(1);

            const notSelectedDots: HTMLElement[] = dots.slice(2);
            notSelectedDots.forEach((dot: HTMLElement) => {
                const dotOpacity: string = dot.style.getPropertyValue("opacity");
                expect(parseFloat(dotOpacity)).toBeLessThan(1);
                expect(dot.getAttribute("aria-selected")).toBe("false");
            });
        }
    });
});
