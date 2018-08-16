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

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    // powerbi.extensibility.visual.test
    import RadarChartData = powerbi.extensibility.visual.test.RadarChartData;
    import RadarChartBuilder = powerbi.extensibility.visual.test.RadarChartBuilder;
    import areColorsEqual = powerbi.extensibility.visual.test.helpers.areColorsEqual;
    import isColorAppliedToElements = powerbi.extensibility.visual.test.helpers.isColorAppliedToElements;
    import getRandomUniqueHexColors = powerbi.extensibility.visual.test.helpers.getRandomUniqueHexColors;
    import getSolidColorStructuralObject = powerbi.extensibility.visual.test.helpers.getSolidColorStructuralObject;

    // powerbi.extensibility.utils.test
    import createVisualHost = powerbi.extensibility.utils.test.mocks.createVisualHost;
    import MockISelectionId = powerbi.extensibility.utils.test.mocks.MockISelectionId;
    import DefaultWaitForRender = powerbi.extensibility.utils.test.DefaultWaitForRender;
    import createColorPalette = powerbi.extensibility.utils.test.mocks.createColorPalette;
    import assertColorsMatch = powerbi.extensibility.utils.test.helpers.color.assertColorsMatch;

    // powerbi.extensibility.utils.chart
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;

    // powerbi.extensibility.utils.color
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;

    // RadarChart1446119667547
    import VisualClass = powerbi.extensibility.visual.RadarChart1446119667547.RadarChart;
    import IRadarChartData = powerbi.extensibility.visual.RadarChart1446119667547.RadarChartData;
    import RadarChartSeries = powerbi.extensibility.visual.RadarChart1446119667547.RadarChartSeries;
    import RadarChartDatapoint = powerbi.extensibility.visual.RadarChart1446119667547.RadarChartDatapoint;

    describe("RadarChart", () => {
        let visualBuilder: RadarChartBuilder,
            defaultDataViewBuilder: RadarChartData,
            dataView: DataView;

        beforeEach(() => {
            let keyId: number = 0;

            visualBuilder = new RadarChartBuilder(1000, 500);
            defaultDataViewBuilder = new RadarChartData();

            dataView = defaultDataViewBuilder.getDataView();

            powerbi.extensibility.utils.test.mocks.createSelectionId = () => {
                return new MockISelectionId(`${++keyId}`);
            };
        });

        describe("DOM tests", () => {
            it("svg element created", () => {
                expect(visualBuilder.mainElement[0]).toBeInDOM();
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
                    const firstClass: string = visualBuilder
                        .mainElement
                        .find("g.chart")
                        .children()
                        .first()
                        .attr("class");

                    const secondClass: string = visualBuilder
                        .mainElement
                        .find("g.chart")
                        .children()
                        .last()
                        .attr("class");

                    expect(firstClass).toBe("chartArea");
                    expect(secondClass).toBe("chartNode");

                    done();
                }, DefaultWaitForRender);
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
                    expect(visualBuilder.legendGroup.children()).toBeInDOM();

                    (dataView.metadata.objects as any).legend.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);
                    expect(visualBuilder.legendGroup.children()).not.toBeInDOM();
                });

                it("show title", () => {
                    (dataView.metadata.objects as any).legend.showTitle = true;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.legendTitle).toBeInDOM();

                    (dataView.metadata.objects as any).legend.showTitle = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.legendTitle).not.toBeInDOM();
                });

                it("title text", () => {
                    (dataView.metadata.objects as any).legend.showTitle = true;
                    (dataView.metadata.objects as any).legend.titleText = titleText;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    const legendTitleText: string = visualBuilder.legendTitle.get(0).firstChild.textContent,
                        legendTitleTitle: string = visualBuilder.legendTitle.children("title").text();

                    expect(legendTitleText).toEqual(titleText);
                    expect(legendTitleTitle).toEqual(titleText);
                });

                it("color", () => {
                    const color: string = "#BBBBCC";

                    (dataView.metadata.objects as any).legend.showTitle = true;
                    (dataView.metadata.objects as any).legend.labelColor = getSolidColorStructuralObject(color);

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    assertColorsMatch(visualBuilder.legendTitle.css("fill"), color);

                    visualBuilder.legendItemText
                        .toArray()
                        .forEach((element: Element) => {
                            assertColorsMatch($(element).css("fill"), color);
                        });
                });

                it("font size", () => {
                    const fontSize: number = 22,
                        expectedFontSize: string = "29.3333px";

                    (dataView.metadata.objects as any).legend.fontSize = fontSize;
                    (dataView.metadata.objects as any).legend.showTitle = true;

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.legendTitle.css("font-size")).toBe(expectedFontSize);

                    visualBuilder.legendItemText
                        .toArray()
                        .forEach((element: Element) => {
                            expect($(element).css("font-size")).toBe(expectedFontSize);
                        });
                });
            });

            describe("Data colors", () => {
                it("color", () => {
                    const colors: string[] = getRandomUniqueHexColors(dataView.categorical.values.length);

                    dataView.categorical.values.forEach((column: DataViewValueColumn, index: number) => {
                        column.source.objects = {
                            dataPoint: {
                                fill: getSolidColorStructuralObject(colors[index])
                            }
                        };
                    });

                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    const polygons: JQuery[] = visualBuilder.chartPolygons
                        .toArray()
                        .map($);

                    colors.forEach((color: string) => {
                        const doPolygonsContainColor: boolean = polygons.some((element: JQuery) => {
                            return areColorsEqual(element.css("fill"), color);
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
                        VisualClass.checkAndUpdateAxis(dataViewTemp, dataViewTemp.categorical.values);
                    }).not.toThrow();
                });

                it("is intersect 1", () => {
                    let retValue = VisualClass.isIntersect(11, 16, 13, 14);
                    expect(retValue).toBe(true);
                });

                it("is intersect 2", () => {
                    let retValue = VisualClass.isIntersect(100, 10, 4, 2);
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
                        .toArray()
                        .map($)
                        .forEach((element: JQuery) => {
                            expect(element.css("fill")).toBe("none");
                            expect(parseFloat(element.css("stroke-width"))).toBeGreaterThan(0);
                        });

                    (dataView.metadata.objects as any).line.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.chartPolygons
                        .toArray()
                        .map($)
                        .forEach((element: JQuery) => {
                            expect(element.css("fill")).not.toBe("none");
                            expect(parseFloat(element.css("stroke-width"))).toBe(0);
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
                    expect(visualBuilder.dataLabelsText).toBeInDOM();

                    (dataView.metadata.objects as any).labels.show = false;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    expect(visualBuilder.dataLabelsText).not.toBeInDOM();
                });

                it("color must be #ABCDEF", () => {
                    const color: string = "#ABCDEF";

                    (dataView.metadata.objects as any).labels.color = getSolidColorStructuralObject(color);
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.dataLabelsText
                        .toArray()
                        .forEach((element: Element) => {
                            assertColorsMatch($(element).css("fill"), color);
                        });
                });

                it("font size must be 29.3333px", () => {
                    const fontSize: number = 22,
                        expectedFontSize: string = "29.3333px";

                    (dataView.metadata.objects as any).labels.fontSize = fontSize;
                    visualBuilder.updateFlushAllD3Transitions(dataView);

                    visualBuilder.dataLabelsText
                        .toArray()
                        .forEach((element: Element) => {
                            expect($(element).css("font-size")).toBe(expectedFontSize);
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
                    const firstPoint = visualBuilder.mainElement.find("circle.chartDot").first(),
                        secondPoint = visualBuilder.mainElement.find("circle.chartDot").last();

                    expect(firstPoint.css("opacity")).toBe("1");
                    expect(secondPoint.css("opacity")).toBe("1");

                    firstPoint.d3Click(
                        parseInt(firstPoint.attr("cx"), 10),
                        parseInt(firstPoint.attr("cy"), 10));

                    expect(firstPoint.css("opacity")).toBe("1");
                    expect(secondPoint.css("opacity")).toBe("0.4");

                    // reset selection
                    firstPoint.d3Click(
                        parseInt(firstPoint.attr("cx"), 10),
                        parseInt(firstPoint.attr("cy"), 10));

                    expect(firstPoint.css("opacity")).toBe("1");
                    expect(secondPoint.css("opacity")).toBe("1");

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
                        firstLegendItem: JQuery = visualBuilder.mainElement.find("circle.legendIcon").first(),
                        secondLegendItem: JQuery = visualBuilder.mainElement.find("circle.legendIcon").last(),
                        firstItemColorBeforeSelection: string = firstLegendItem.css("fill"),
                        secondItemColorBeforeSelection: string = secondLegendItem.css("fill");

                    assertColorsMatch(firstItemColorBeforeSelection, "#123123");

                    secondLegendItem.d3Click(
                        parseInt(secondLegendItem.attr("cx"), 10),
                        parseInt(secondLegendItem.attr("cy"), 10));

                    assertColorsMatch(
                        firstLegendItem.css("fill"),
                        notSelectedColor);

                    assertColorsMatch(
                        secondLegendItem.css("fill"),
                        secondItemColorBeforeSelection);

                    done();
                });
            });

            it("interactivity legend highlights", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    const firstPoint: JQuery = visualBuilder.mainElement.find("circle.chartDot").first(),
                        firstLegendItem: JQuery = visualBuilder.mainElement.find("circle.legendIcon").last();

                    expect(firstPoint.css("opacity")).toBe("1");

                    firstLegendItem.d3Click(
                        parseInt(firstLegendItem.attr("cx"), 10),
                        parseInt(firstLegendItem.attr("cy"), 10));

                    expect(firstPoint.css("opacity")).toBe("0.4");

                    done();
                });
            });
        });

        describe("converter", () => {
            let colors: IColorPalette,
                colorHelper: ColorHelper,
                visualHost: IVisualHost;

            beforeEach(() => {
                colors = createColorPalette();
                colorHelper = new ColorHelper(colors);
                visualHost = createVisualHost();
                dataView.metadata.objects = {
                    labels: {
                        show: true
                    },
                    displaySettings: {
                        minValue: 1000000
                    }
                };
            });

            it("Parse settings", () => {
                (dataView.metadata.objects as any).displaySettings.minValue = 1000000;
                expect(() => {
                    VisualClass.parseSettings(dataView, colorHelper);
                }).not.toThrow();
            });

            it("enumerateObjects", () => {
                expect(() => {
                    visualBuilder.instance.enumerateDataPoint();
                    let settings = VisualClass.parseSettings(dataView, colorHelper);
                    VisualClass.countMinValueForDisplaySettings(-1, settings);
                    VisualClass.countMinValueForDisplaySettings(0, settings);
                    VisualClass.countMinValueForDisplaySettings(1, settings);
                    VisualClass.countMinValueForDisplaySettings(100, settings);
                }).not.toThrow();
            });

            it("arguments are null", () => {
                callConverterAndExpectExceptions(null, null, null, null);
            });

            it("arguments are undefined", () => {
                callConverterAndExpectExceptions(undefined, undefined, undefined, undefined);
            });

            it("dataView is correct", () => {
                callConverterAndExpectExceptions(dataView, colors, colorHelper, visualHost);
            });

            describe("radarChartData", () => {
                let radarChartData: IRadarChartData;

                beforeEach(() => {
                    radarChartData = callConverterAndExpectExceptions(
                        dataView,
                        colors,
                        colorHelper,
                        visualHost);
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
                visualHost: IVisualHost): IRadarChartData {

                let radarChartData: IRadarChartData;

                expect(() => {
                    radarChartData = VisualClass.converter(dataView, colors, colorHelper, visualHost);
                }).not.toThrow();

                return radarChartData;
            }
        });

        describe("Capabilities tests", () => {
            it("all items having displayName should have displayNameKey property", () => {
                jasmine.getJSONFixtures().fixturesPath = "base";

                let jsonData = getJSONFixture("capabilities.json");

                let objectsChecker: Function = (obj) => {
                    for (let property in obj) {
                        let value: any = obj[property];

                        if (value.displayName) {
                            expect(value.displayNameKey).toBeDefined();
                        }

                        if (typeof value === "object") {
                            objectsChecker(value);
                        }
                    }
                };

                objectsChecker(jsonData);
            });
        });

        describe("High contrast mode", () => {
            const backgroundColor: string = "#000000";
            const foregroundColor: string = "#ff00ff";

            let chartPolygons: JQuery[],
                chartDot: JQuery[],
                legendItemText: JQuery[],
                dataLabelsText: JQuery[],
                legendItemCircle: JQuery[];

            beforeEach(() => {
                visualBuilder.visualHost.colorPalette.isHighContrast = true;

                visualBuilder.visualHost.colorPalette.background = { value: backgroundColor };
                visualBuilder.visualHost.colorPalette.foreground = { value: foregroundColor };

                chartPolygons = visualBuilder.chartPolygons.toArray().map($);
                chartDot = visualBuilder.chartDot.toArray().map($);
                legendItemText = visualBuilder.legendItemText.toArray().map($);
                dataLabelsText = visualBuilder.dataLabelsText.toArray().map($);
                legendItemCircle = visualBuilder.legendItemCircle.toArray().map($);
            });

            it("should use high contrast mode colors", (done) => {
                visualBuilder.updateRenderTimeout(dataView, () => {
                    expect(isColorAppliedToElements(chartPolygons, foregroundColor, "fill"));
                    expect(isColorAppliedToElements(chartDot, foregroundColor, "fill"));
                    expect(isColorAppliedToElements(legendItemText, foregroundColor, "color"));
                    expect(isColorAppliedToElements(dataLabelsText, foregroundColor, "color"));
                    expect(isColorAppliedToElements(legendItemCircle, foregroundColor, "fill"));
                    done();
                });
            });
        });

        describe("Boundary values test", () => {
            let colorPalette: IColorPalette,
                colorHelper: ColorHelper,
                polygon: JQuery[],
                chartDot: JQuery[];

            beforeEach(() => {
                colorPalette = createColorPalette();
                colorHelper = new ColorHelper(colorPalette);
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

                it("Should parse settings.displaySettings.minValue with negative values as expected", () => {
                    let settings = VisualClass.parseSettings(dataView, colorHelper);
                    let minimumValue = d3.min(defaultDataViewBuilder.withNegativeValuesY1);
                    expect(settings.displaySettings.minValue).toBe(minimumValue);
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
                    polygon = visualBuilder.chartPolygons.toArray().map($);
                });

                it("Should parse settings.displaySettings.minValue property with 2 or less points in the group as expected", () => {
                    let settings = VisualClass.parseSettings(dataView, colorHelper);
                    let minimumValue = d3.min(defaultDataViewBuilder.onlyTwoValuesY1);
                    expect(settings.displaySettings.minValue).toBe(minimumValue);
                });

                it("Should render a polygon with right points count and bound with a line", (done) => {// area for 2 point is a line
                    const expectedPointCount: number = 2;

                    visualBuilder.updateRenderTimeout(dataView, () => {
                        expect(polygon[0].attr("points-count")).toBe(expectedPointCount.toString());
                        expect(polygon[0].css("fill")).toBe("none");
                        expect(polygon[0].css("stroke")).toBeTruthy();
                        expect(polygon[0].css("stroke-width")).toBeTruthy();
                        done();
                    });
                });
            });

            describe("empty dataset", () => {
                beforeEach(() => {
                    dataView = defaultDataViewBuilder.getDataViewWithBlankData();
                    visualBuilder.update(dataView);

                    polygon = visualBuilder.chartPolygons.toArray().map($);
                    chartDot = visualBuilder.chartDot.toArray().map($);
                });

                it("Should render a polygon with right 0 points count and not to render any dots", (done) => {
                    const expectedPointCount: number = 0;

                    visualBuilder.updateRenderTimeout(dataView, () => {
                        expect(polygon[0].attr("points-count")).toBe(expectedPointCount.toString());
                        expect(chartDot.length).toBe(expectedPointCount);
                        done();
                    });
                });
            });

            describe("dataset with string data", () => {
                beforeEach(() => {
                    dataView = defaultDataViewBuilder.getDataViewWithStringData();
                    visualBuilder.update(dataView);

                    polygon = visualBuilder.chartPolygons.toArray().map($);
                    chartDot = visualBuilder.chartDot.toArray().map($);
                });

                it("Should render a polygon with right 0 points count and not to render any dots", (done) => {
                    const expectedPointCount: number = 0;

                    visualBuilder.updateRenderTimeout(dataView, () => {
                        expect(polygon[0].attr("points-count")).toBe(expectedPointCount.toString());
                        expect(chartDot.length).toBe(expectedPointCount);
                        done();
                    });
                });
            });
        });
    });
}
