class App.DataFeed
  constructor: (@url,@type) -> 
    console.log(@url)
    console.log(@type)
    # @socket = io.connect()
  onReady: (callback) ->
    console.log "onReady"
    setTimeout(()->
        callback(
            supports_search: true,
            supports_group_request: false,
            supports_marks: true,
            exchanges: [
                {value: "SPRDZ", name: "SEPARDAZ", desc: "SEPARDAZ"}
            ],
            symbolsTypes: [
                {name: "crypto", value: ""},
            ],
            supportedResolutions: [ "30"])
    , 0)
    

  resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) ->
    console.log "resolveSymbol"
    func = () ->
      $.ajax({
        method: "POST",
        url: "/symbols",
        data: 
          symbolName: symbolName
      })
      .done((msg)->
        return onSymbolResolvedCallback(msg) if not obj? or obj.length is 0
        onResolveErrorCallback('این مارکت وجود ندارد!')
        )
    func()

  getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) ->
    console.log "getBars"
    func = () ->
      $.ajax({
        method: "POST",
        url: "/history",
        data:
          symbol: symbolInfo.name,
          resolution: "30m",
          from: from,
          to: to,
          marketId: 1
      })
      .done((msg)->
        noData =
          noData:true
        if msg.length == 0
          noData={noData:true}
        onHistoryCallback(msg,noData))
    func()

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) ->
    console.log "subscribeBars"
    func = () ->
      $.ajax({
        method: "POST",
        url: "/currentCandle",
        data:
          step: 1800000
      })
      .done((msg)->
        console.log('get new candle realtime')
        onRealtimeCallback(msg) unless not obj? or obj.length is 0

        setTimeout(func, 3000))
    func()

  unsubscribeBars : (subscriberUID)->
    console.log "unsubscribeBars"

  getServerTime: (callback) ->
    console.log "getServerTime"
  
  
