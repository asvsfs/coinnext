class App.DataFeed
  constructor: (@url,@type) -> 
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
    $.ajax({
      method: "POST",
      url: "#{@url}/currentCandle",
      data:
        step 1800000
    })
    .done((msg)->
      onRealtimeCallback(msg))
    

  getBars: (symbolInfo,resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) ->
    console.log "getBars"

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) ->
    console.log "subscribeBars"
    func = () ->
      $.ajax({
        method: "POST",
        url: "#{@url}/currentCandle",
        data:
          step 1800000
      })
      .done((msg)->
        onRealtimeCallback(msg)
        setTimeout(func, 3000))
    func()

  unsubscribeBars : (subscriberUID)->
    console.log "unsubscribeBars"

  getServerTime: (callback) ->
    console.log "getServerTime"
  
  
