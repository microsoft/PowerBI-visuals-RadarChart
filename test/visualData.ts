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
    // powerbi.extensibility.utils.test
    import TestDataViewBuilder = powerbi.extensibility.utils.test.dataViewBuilder.TestDataViewBuilder;

    // powerbi.extensibility.utils.type
    import ValueType = powerbi.extensibility.utils.type.ValueType;

    interface IValuesInDataView {
        valuesY1: any[];
        valuesY2: any[];
    }

    export class RadarChartData extends TestDataViewBuilder {
        public static ColumnCategory: string = "category";
        public static ColumnSales1: string = "sales1";
        public static ColumnSales2: string = "sales2";
        public static DefaultDataFormat: string = "$0,000.00";

        public valuesCategory: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday1", "Tuesday1", "Wednesday1", "Thursday1", "Friday1", "Saturday1", "Sunday1", "Monday2", "Tuesday2", "Wednesday2", "Thursday2", "Friday2", "Saturday2", "Sunday2", "Monday3", "Tuesday3", "Wednesday3", "Thursday3", "Friday3", "Saturday3", "Sunday3"];
        public valuesY1: number[] = [742731.43, 162066.43, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34, 742731.43, 162066.43, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34, 742731.43, 162066.43, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34, 742731.43, 162066.43, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34];
        public valuesY2: number[] = [123455.43, 40566.43, 200457.78, 5000.49, 320000.57, 450000.34, 140832.67, 123455.43, 40566.43, 200457.78, 5000.49, 320000.57, 450000.34, 140832.67, 123455.43, 40566.43, 200457.78, 5000.49, 320000.57, 450000.34, 140832.67, 123455.43, 40566.43, 200457.78, 5000.49, 320000.57, 450000.34, 140832.67];

        public withNegativeValuesCategory: string[] = ["Minus one", "Minus two", "Three"];
        public withNegativeValuesY1: number[] = [-1, -2, 3];
        public withNegativeValuesY2: number[] = [-1, -2, -0.5];

        public onlyTwoValuesCategory: string[] = ["Day 1", "Day 2"];
        public onlyTwoValuesY1: number[] = [-1, -2];
        public onlyTwoValuesY2: number[] = [8, 4];

        public blankCategory: string[] = [];
        public blankValuesY1: number[] = [];
        public blankValuesY2: number[] = [];

        public stringDataCategory: string[] = ["Value1", "Value2"];
        public stringValuesY1: string[] = ["Value1", "Value2"];
        public stringValuesY2: string[] = ["Value 1", "Value 2"];

        public getDataViewWithStringData(): powerbi.DataView {
            return this.getDataView(undefined, this.stringDataCategory, { valuesY1: this.stringValuesY1, valuesY2: this.stringValuesY2 }, "");
        }

        public getDataViewWithBlankData(): powerbi.DataView {
            return this.getDataView(undefined, this.blankCategory, { valuesY1: this.blankValuesY1, valuesY2: this.blankValuesY2 }, "0.00");
        }

        public getDataViewWithNegatives(): powerbi.DataView {
            return this.getDataView(undefined, this.withNegativeValuesCategory, { valuesY1: this.withNegativeValuesY1, valuesY2: this.withNegativeValuesY2 }, "0.00");
        }

        public getDataViewWithOnlyTwoValues(): powerbi.DataView {
            return this.getDataView(undefined, this.onlyTwoValuesCategory, { valuesY1: this.onlyTwoValuesY1, valuesY2: this.onlyTwoValuesY2 }, "0.00");
        }

        public getDataView(columnNames?: string[], valuesCategory?: string[], valuesData?: IValuesInDataView, format?: string): powerbi.DataView {
            return this.createCategoricalDataViewBuilder([
                {
                    source: {
                        displayName: "Day",
                        queryName: RadarChartData.ColumnCategory,
                        type: ValueType.fromDescriptor({ text: true })
                    },
                    values: valuesCategory ? valuesCategory : this.valuesCategory
                }
            ], [
                    {
                        source: {
                            displayName: "Previous week sales",
                            isMeasure: true,
                            format: format ? format : RadarChartData.DefaultDataFormat,
                            queryName: RadarChartData.ColumnSales1,
                            type: ValueType.fromDescriptor({ numeric: true }),
                            objects: { dataPoint: { fill: { solid: { color: "purple" } } } },
                        },
                        values: valuesData && valuesData.valuesY1 ? valuesData.valuesY1 : this.valuesY1
                    },
                    {
                        source: {
                            displayName: "This week sales",
                            isMeasure: true,
                            format: format ? format : RadarChartData.DefaultDataFormat,
                            queryName: RadarChartData.ColumnSales2,
                            type: ValueType.fromDescriptor({ numeric: true })
                        },
                        values: valuesData && valuesData.valuesY2 ? valuesData.valuesY2 : this.valuesY2
                    }
                ], columnNames).build();
        }
    }
}
