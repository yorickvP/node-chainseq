/* ----------------------------------------------------------------------------
Copyright (c) YorickvP (contact me on github if you want)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * ---------------------------------------------------------------------------*/
function ChainProvider(prototype) {
    if (!prototype) prototype = ChainProvider.prototype
    var o = Object.create(prototype)
    var q = o._queue = []
    o.stop = clearArray.bind(null, q)
    return o }

function clearArray(arr) { // recursively clean out arrays. useful for ending chains
    arr.forEach(function(x) { if (Array.isArray(x)) clearArray(x) })
    arr.length = 0 }

ChainProvider.prototype =
    { _provide: function() {
        if (!this._queue.length) return
        var q = this._queue
        while(Array.isArray(q[0])) {
            if (q[0].length == 0) { // knock out that empty array and try again
                q.shift()
                return this._provide.apply(this) }
            q = q[0] }
        return q.shift() }
    , tap: function(f, nonest, async, args) { // pass nonest to true to make a lightweight tap
        var a
        if (!nonest) a = []
        this._queue.push(
          { f: nonest ? f :
                function() {
                    var t = this._queue
                    this._queue = a
                    f.apply(this, arguments)
                    this._queue = t
                    if(a.length == 0 && t[0] == a) t.shift() } // assert(t[0] == a)?
          , async: async || false
          , arguments: args || [] })
        if (!nonest) this._queue.push(a)
        return this }
     , loop: function(f) { // time to do evil :-)
        var isended = false
        function end() { isended = true }
        return this.tap(function loop() {
            var a = this._queue // save the queue to reuse it for the next iteration
            f.apply(this, [end].concat(Array.prototype.slice.call(arguments))) // [end] + arguments
            this.tap(function() {
                var b = this._queue // temporarily restore the queue to a
                this._queue = a
                if (!isended) loop.call(this, arguments) // I guess you could call it recursion
                this._queue = b }, true) })}}            // and maybe it is.

if (module && module.exports) {
    module.exports = ChainProvider
    module.exports.ChainProvider = ChainProvider }

