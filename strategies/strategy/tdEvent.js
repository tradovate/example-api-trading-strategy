const TdEvent = {
    DOM:            'dom',
    UserSync:       'usersyncinit',
    Quote:          'quote',
    Chart:          'chart',
    Props:          'props',
    Histogram:      'histogram',
    Clock:          'clock',
    ReplayReset:    'replay/resetEventHandlers',
    NextReplay:     'replay/nextReplayPeriod',
    ReplayDrawStats:'replay/drawStats', //the draw effect
    ReplayComplete: 'replay/complete', //the event that says replay is done
    ProductFound:   'product/found',
}

module.exports = { TdEvent }