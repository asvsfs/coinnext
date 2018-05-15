class App.TradeChartView extends App.MasterView

  collection: null

  initialize: (options = {})->
    TradingView.onready ()->
      widget = window.tvWidget = new TradingView.widget 
        debug:true
        fullscreen:true
        symbol: 'LTC_BTC'
        interval: '30m'
        container_id: "trade-chart"
        datafeed: new App.DataFeed("http://localhost:5000",@type)
        library_path: "/assets/vendor/charting_library/"
        locale:  'en'
        drawings_access : type:'black', tools: [ { name: "Regression Trend" } ]
        disabled_features: ["use_localstorage_for_settings"]
        enabled_features: ["study_templates"]
        charts_storage_url: 'http://saveload.tradingview.com'
        charts_storage_api_version: "1.1"
        client_id: 'tradingview.com'
        user_id: 'public_user_id'



  getParameterByName : (name) ->
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
    regex = new RegExp("[\\?&]#{name}=([^&#]*)")
    results = regex.exec(location.search)
    if results == null then '' else decodeURIComponent(results[1].replace(/\+/g, ' '))

  render: ()->
    @collection.fetch
      success: ()=>
        @renderChart @collection.toJSON()

  renderChart: (data)->
    return
    # split the data set into ohlc and volume
    ohlc = []
    volume = []
    xAxis = []
    dataLength = data.length
    i = 0
    while i < dataLength
      startTime = new Date(data[i].start_time).getTime()
      ohlc.push [
        startTime # the date
        data[i].open_price # open
        data[i].high_price # high
        data[i].low_price # low
        data[i].close_price # close
      ]
      volume.push [
        startTime # the date
        data[i].volume # the volume
      ]
      i++

    # create the chart
    @$el.highcharts "StockChart",
      rangeSelector:
        enabled: false
      scrollbar:
        enabled: false
      navigator:
        enabled: false

      exporting:
        buttons: [
          printButton:
            enabled: false
          exportButton:
            enabled: false
        ]
      credits:
        enabled: false
        
      yAxis: [
        {
          lineWidth: 0
          gridLineColor: "#ecedef"
        }
        {
          gridLineWidth: 0
          opposite: true
        }
      ]
      xAxis:
        lineColor: "#ecedef"
        type: "time"
        dateTimeLabelFormats:
          millisecond: '%H:%M'
      tooltip:
        shared: true
        shadow: false
        backgroundColor: "#ffffff"
        borderColor: "#d1d5dd"
        formatter: ()->
          s = Highcharts.dateFormat('%b %e %Y %H:%M', this.x) + "<br />"
          s += "<b>Open:</b> " + _.str.toFixed(@points[1].point.open) + "<br />"
          s += "<b>High:</b> " + _.str.toFixed(@points[1].point.high) + "<br />"
          s += "<b>Low:</b> " + _.str.toFixed(@points[1].point.low) + "<br />"
          s += "<b>Close:</b> " + _.str.toFixed(@points[1].point.close) + "<br />"
          s += "<b>Volume:</b> " + _.str.toFixed(@points[0].point.y)            
          return s
      series: [
        {
          type: "column"
          name: "Volume"
          data: volume
          yAxis: 1
          color: "#dddddd"
        }
        {
          type: "candlestick"
          name: "Price"
          data: ohlc
          yAxis: 0
          color: "#3eae5f"
          upColor: "#da4444"
          lineColor: "#3eae5f"
          upLineColor: "#da4444"
          borderWidth: 0
        }
      ]
