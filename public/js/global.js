function genererGrapheQuantitative(firstUDTime, dt, UDs, masses, currencyAcronym) {
    $(function () {
        $('#graphQ').highcharts({
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Monetary mass evolution from the beginning'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        '(you can zoom with click & drag)' :
                        'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
                minRange: dt*2*1000 // Max zoom = 2 DU
            },
            yAxis: {
                title: {
                    text: 'Currency units (' + currencyAcronym + ')'
                }
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'M (quantitative)',
                pointInterval: dt*1000,
                pointStart: firstUDTime*1000,
                data: masses
            },{
                type: 'line',
                name: 'UD',
                pointInterval: dt*1000,
                pointStart: firstUDTime*1000,
                data: UDs
            }]
        });
    });
};

function genererGrapheRelative(firstUDTime, dt, UDs, masses, currencyAcronym) {
    $(function () {
        $('#graphR').highcharts({
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Monetary mass evolution from the beginning, in UD count'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        '(you can zoom with click & drag)' :
                        'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
                minRange: dt*2*1000 // Max zoom = 2 DU
            },
            yAxis: {
                title: {
                    text: 'UD count'
                }
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'M (relative)',
                pointInterval: dt*1000,
                pointStart: firstUDTime*1000,
                data: masses
            },{
                type: 'line',
                name: 'UD',
                pointInterval: dt*1000,
                pointStart: firstUDTime*1000,
                data: UDs
            }]
        });
    });
};